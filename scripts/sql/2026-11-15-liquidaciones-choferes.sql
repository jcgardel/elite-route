-- /equipo/liquidaciones: liquidación semanal de choferes (lunes a domingo).
-- Correr completo en el SQL Editor de Supabase (proyecto eznfourayhypefweazyq).
--
-- Balance = traslados EliteRoute + Uber (solo si Uber le paga a la flota)
--           + reembolsos/bonos − renta semanal − gasolina − gastos − adelantos.
-- Positivo: se le paga al chofer. Negativo: el chofer debe.
--
-- Pago por traslado (el primero que exista):
--   1. reservations.driver_pay
--   2. "Pago al chofer $X" de las notas ("= $X" manda; "$X/h" × horas)
--   3. Regla: Sedan Lite por horas $250/h; Executive por horas $400/h;
--      lo demás 30% sobre el neto (precio − 21%), redondeado hacia abajo de 50 en 50.
-- El equipo nunca ve el precio al cliente: solo el pago al chofer.

begin;

-- Esquema de cada chofer. Sin fila = solo traslados EliteRoute.
create table if not exists privado.esquema_chofer (
  driver_id uuid primary key references public.drivers(id) on delete cascade,
  esquema text not null default 'servicio' check (esquema in ('servicio', 'renta')),
  renta_semanal numeric(10,2) not null default 0 check (renta_semanal >= 0),
  uber_por_flota boolean not null default false,
  actualizado timestamptz not null default now()
);

-- Uber de la semana, gasolina, gastos, adelantos, reembolsos y bonos.
create table if not exists privado.movimientos_chofer (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  semana date not null check (extract(isodow from semana) = 1),
  tipo text not null check (tipo in ('uber', 'reembolso', 'bono', 'gasolina', 'gasto', 'adelanto')),
  concepto text,
  monto numeric(10,2) not null check (monto > 0),
  creado timestamptz not null default now()
);
create unique index if not exists movimientos_chofer_uber on privado.movimientos_chofer (driver_id, semana) where tipo = 'uber';
create index if not exists movimientos_chofer_semana on privado.movimientos_chofer (semana);

-- Semanas ya pagadas (o cobradas) por chofer.
create table if not exists privado.liquidaciones (
  driver_id uuid not null references public.drivers(id) on delete cascade,
  semana date not null check (extract(isodow from semana) = 1),
  monto numeric(10,2) not null,
  pagado_en timestamptz not null default now(),
  primary key (driver_id, semana)
);

revoke all on table privado.esquema_chofer, privado.movimientos_chofer, privado.liquidaciones from public, anon, authenticated;

-- Monto de "Pago al chofer" escrito en las notas, como número.
create or replace function privado.pago_chofer_monto(n text, horas integer)
 returns numeric
 language sql
 immutable
 set search_path to 'pg_catalog', 'privado'
as $f$
  with t as (select privado.pago_chofer(n) v)
  select case
    when v is null then null
    when v ~ '=\s*\$\s?[0-9]' then replace((regexp_match(v, '=\s*\$\s?([0-9][0-9,]*(?:\.[0-9]{2})?)'))[1], ',', '')::numeric
    when v ~* '/\s*h' then case when horas > 0
      then replace((regexp_match(v, '([0-9][0-9,]*(?:\.[0-9]{2})?)'))[1], ',', '')::numeric * horas end
    else replace((regexp_match(v, '([0-9][0-9,]*(?:\.[0-9]{2})?)'))[1], ',', '')::numeric
  end from t
$f$;
revoke all on function privado.pago_chofer_monto(text, integer) from public;

-- Pago al chofer de una reserva y de dónde salió: 'definido', 'nota', 'regla' o null.
create or replace function privado.pago_reserva(r public.reservations)
 returns table(monto numeric, origen text)
 language sql
 stable
 set search_path to 'pg_catalog', 'public', 'privado'
as $f$
  with x as (
    select coalesce(r.final_price, case when r.status <> 'anticipo_pagado' then nullif(r.amount_paid, 0) end) precio,
           lower(coalesce(r.category, '')) cat
  )
  select case
           when r.driver_pay is not null then r.driver_pay
           when privado.pago_chofer_monto(r.notes, r.rental_hours) is not null then privado.pago_chofer_monto(r.notes, r.rental_hours)
           when r.service_type = 'hour' and r.rental_hours > 0 and (x.cat like '%lite%' or x.cat = 'sedan' or x.cat = 'sedán') then 250 * r.rental_hours
           when r.service_type = 'hour' and r.rental_hours > 0 and x.cat like '%exec%' then 400 * r.rental_hours
           when x.precio > 0 then floor(x.precio * 0.79 * 0.70 / 50) * 50
         end,
         case
           when r.driver_pay is not null then 'definido'
           when privado.pago_chofer_monto(r.notes, r.rental_hours) is not null then 'nota'
           when r.service_type = 'hour' and r.rental_hours > 0 and (x.cat like '%lite%' or x.cat = 'sedan' or x.cat = 'sedán' or x.cat like '%exec%') then 'regla'
           when x.precio > 0 then 'regla'
         end
    from x
$f$;
revoke all on function privado.pago_reserva(public.reservations) from public;

-- Toda la semana (lunes p_semana) en un JSON: un objeto por chofer.
create or replace function public.liquidacion_semana(p_clave text, p_semana date)
 returns jsonb
 language plpgsql
 stable
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
declare
  v_lunes date := p_semana - (extract(isodow from p_semana)::int - 1);
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;

  return coalesce((
    with srv as (
      select r.driver_id, r.folio, r.service_datetime, r.name, r.origin, r.destination, r.category,
             r.service_type, r.rental_hours, r.status, p.monto, p.origen
        from reservations r
        cross join lateral privado.pago_reserva(r) p
       where r.driver_id is not null
         and r.service_datetime >= v_lunes and r.service_datetime < v_lunes + 7
         and r.status <> 'cancelada'
         and (r.status <> 'pendiente_pago' or r.agendado)
    ),
    ch as (
      select d.id from drivers d
       where not d.is_owner
         and (d.id in (select driver_id from srv)
              or d.id in (select driver_id from movimientos_chofer where semana = v_lunes)
              or d.id in (select driver_id from liquidaciones where semana = v_lunes)
              or (d.active and d.id in (select driver_id from esquema_chofer where esquema = 'renta')))
    )
    select jsonb_agg(jsonb_build_object(
             'driver_id', d.id,
             'nombre', d.name,
             'tel', d.phone,
             'esquema', coalesce(e.esquema, 'servicio'),
             'renta_semanal', coalesce(e.renta_semanal, 0),
             'uber_por_flota', coalesce(e.uber_por_flota, false),
             'servicios', coalesce((
               select jsonb_agg(jsonb_build_object(
                        'folio', s.folio, 'fecha', s.service_datetime, 'cliente', s.name,
                        'origen', s.origin, 'destino', s.destination, 'unidad', s.category,
                        'tipo', s.service_type, 'horas', s.rental_hours,
                        'pendiente_pago', s.status = 'pendiente_pago',
                        'pago', s.monto, 'origen_pago', s.origen) order by s.service_datetime)
                 from srv s where s.driver_id = d.id), '[]'::jsonb),
             'movimientos', coalesce((
               select jsonb_agg(jsonb_build_object('id', m.id, 'tipo', m.tipo, 'concepto', m.concepto, 'monto', m.monto) order by m.creado)
                 from movimientos_chofer m where m.driver_id = d.id and m.semana = v_lunes), '[]'::jsonb),
             'pagado', l.monto,
             'pagado_en', l.pagado_en
           ) order by d.name)
      from drivers d
      join ch on ch.id = d.id
      left join esquema_chofer e on e.driver_id = d.id
      left join liquidaciones l on l.driver_id = d.id and l.semana = v_lunes
  ), '[]'::jsonb);
end;
$function$;

-- Choferes para configurar su esquema (sin el dueño).
create or replace function public.choferes_esquema(p_clave text)
 returns table(driver_id uuid, nombre text, tel text, activo boolean, esquema text, renta_semanal numeric, uber_por_flota boolean)
 language plpgsql
 stable
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  return query
  select d.id, d.name, d.phone, d.active, coalesce(e.esquema, 'servicio'), coalesce(e.renta_semanal, 0), coalesce(e.uber_por_flota, false)
    from drivers d left join esquema_chofer e on e.driver_id = d.id
   where not d.is_owner
   order by d.name;
end;
$function$;

create or replace function public.configurar_chofer(p_clave text, p_driver uuid, p_esquema text, p_renta numeric, p_uber_flota boolean)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  insert into esquema_chofer (driver_id, esquema, renta_semanal, uber_por_flota)
  values (p_driver, case when p_esquema = 'renta' then 'renta' else 'servicio' end,
          case when p_esquema = 'renta' then greatest(coalesce(p_renta, 0), 0) else 0 end,
          p_esquema = 'renta' and coalesce(p_uber_flota, false))
  on conflict (driver_id) do update
     set esquema = excluded.esquema, renta_semanal = excluded.renta_semanal,
         uber_por_flota = excluded.uber_por_flota, actualizado = now();
  return true;
end;
$function$;

-- Uber de la semana: uno por chofer; 0 o vacío lo quita.
create or replace function public.guardar_uber(p_clave text, p_driver uuid, p_semana date, p_monto numeric)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
declare
  v_lunes date := p_semana - (extract(isodow from p_semana)::int - 1);
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  if coalesce(p_monto, 0) <= 0 then
    delete from movimientos_chofer where driver_id = p_driver and semana = v_lunes and tipo = 'uber';
  else
    insert into movimientos_chofer (driver_id, semana, tipo, concepto, monto)
    values (p_driver, v_lunes, 'uber', 'Uber', round(p_monto, 2))
    on conflict (driver_id, semana) where tipo = 'uber' do update set monto = excluded.monto, creado = now();
  end if;
  return true;
end;
$function$;

create or replace function public.agregar_movimiento(p_clave text, p_driver uuid, p_semana date, p_tipo text, p_concepto text, p_monto numeric)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  if p_tipo = 'uber' or coalesce(p_monto, 0) <= 0 then
    return false;
  end if;
  insert into movimientos_chofer (driver_id, semana, tipo, concepto, monto)
  values (p_driver, p_semana - (extract(isodow from p_semana)::int - 1), p_tipo,
          nullif(left(trim(coalesce(p_concepto, '')), 80), ''), round(p_monto, 2));
  return true;
end;
$function$;

create or replace function public.borrar_movimiento(p_clave text, p_id uuid)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  delete from movimientos_chofer where id = p_id;
  return found;
end;
$function$;

-- Marca la semana como pagada (monto = balance de ese momento) y los traslados
-- con driver_paid_at. p_monto null la desmarca.
create or replace function public.marcar_liquidacion(p_clave text, p_driver uuid, p_semana date, p_monto numeric)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
declare
  v_lunes date := p_semana - (extract(isodow from p_semana)::int - 1);
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  if p_monto is null then
    delete from liquidaciones where driver_id = p_driver and semana = v_lunes;
  else
    insert into liquidaciones (driver_id, semana, monto) values (p_driver, v_lunes, round(p_monto, 2))
    on conflict (driver_id, semana) do update set monto = excluded.monto, pagado_en = now();
  end if;
  update reservations
     set driver_paid_at = case when p_monto is null then null else now() end
   where driver_id = p_driver
     and service_datetime >= v_lunes and service_datetime < v_lunes + 7
     and status <> 'cancelada';
  return true;
end;
$function$;

do $g$
declare f text;
begin
  foreach f in array array[
    'liquidacion_semana(text, date)',
    'choferes_esquema(text)',
    'configurar_chofer(text, uuid, text, numeric, boolean)',
    'guardar_uber(text, uuid, date, numeric)',
    'agregar_movimiento(text, uuid, date, text, text, numeric)',
    'borrar_movimiento(text, uuid)',
    'marcar_liquidacion(text, uuid, date, numeric)'
  ] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated, service_role', f);
  end loop;
end
$g$;

commit;

-- Pago definitivo de un traslado desde /equipo/liquidaciones (0 o vacío lo quita y vuelve a la regla).
create or replace function public.definir_pago_chofer(p_clave text, p_folio text, p_monto numeric)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  update reservations
     set driver_pay = case when coalesce(p_monto, 0) > 0 then round(p_monto, 2) end, updated_at = now()
   where folio = p_folio and status <> 'cancelada';
  return found;
end;
$function$;
revoke all on function public.definir_pago_chofer(text, text, numeric) from public;
grant execute on function public.definir_pago_chofer(text, text, numeric) to anon, authenticated, service_role;
