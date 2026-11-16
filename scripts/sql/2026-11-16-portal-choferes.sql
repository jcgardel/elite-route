-- Portal de choferes (/chofer): cada chofer entra con su link personal y ve
-- sólo sus servicios, lo que se le paga y si ya se le pagó. Marca "En camino",
-- "Pasajero a bordo" y "Terminado", que también se ven en /equipo.
-- Correr completo en el SQL Editor de Supabase (proyecto eznfourayhypefweazyq).

begin;

-- 1. Estado del servicio que marca el chofer + comprobante de su pago.
alter table public.reservations
  add column if not exists driver_status text
    check (driver_status in ('en_camino', 'a_bordo', 'terminado')),
  add column if not exists driver_status_at timestamptz,
  add column if not exists driver_payment_ref text;

-- 2. Link personal de cada chofer (token largo; no se expone por la API).
create table if not exists privado.accesos_chofer (
  driver_id uuid primary key references public.drivers(id) on delete cascade,
  token text not null unique default encode(extensions.gen_random_bytes(18), 'hex'),
  creado timestamptz not null default now()
);
revoke all on table privado.accesos_chofer from public, anon, authenticated;

insert into privado.accesos_chofer (driver_id)
select id from public.drivers on conflict do nothing;

-- Los choferes nuevos (los crea link_reservation_driver) reciben su link solos.
create or replace function privado.alta_acceso_chofer()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'privado', 'extensions', 'pg_temp'
as $f$
begin
  insert into privado.accesos_chofer (driver_id) values (new.id) on conflict do nothing;
  return new;
end
$f$;
revoke all on function privado.alta_acceso_chofer() from public;

drop trigger if exists drivers_alta_acceso on public.drivers;
create trigger drivers_alta_acceso after insert on public.drivers
  for each row execute function privado.alta_acceso_chofer();

create or replace function privado.chofer_por_token(p_token text)
 returns uuid
 language sql
 stable
 security definer
 set search_path to 'privado', 'pg_temp'
as $f$
  select a.driver_id
    from privado.accesos_chofer a
    join public.drivers d on d.id = a.driver_id and d.active
   where length(coalesce(p_token, '')) >= 32 and a.token = p_token
$f$;
revoke all on function privado.chofer_por_token(text) from public;

-- 3. Servicios del chofer: próximos y de los últimos 45 días. Sin precio al
--    cliente; sólo su pago. Notas filtradas igual que en /equipo.
create or replace function public.chofer_portal(p_token text)
 returns json
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'pg_temp'
as $f$
declare
  v_id uuid := privado.chofer_por_token(p_token);
begin
  if v_id is null then
    return null;
  end if;

  return json_build_object(
    'chofer', (select name from public.drivers where id = v_id),
    'servicios', coalesce((
      select json_agg(x order by x.servicio nulls last, x.folio)
        from (
          select r.folio, r.service_datetime as servicio, r.name as cliente, r.phone as telefono,
                 r.flight_number as vuelo, r.origin as origen, r.destination as destino,
                 r.category as unidad, r.service_type as tipo, r.rental_hours as horas,
                 r.passengers as pasajeros, privado.nota_chofer(r.notes) as notas,
                 r.driver_pay as pago, privado.pago_chofer(r.notes) as pago_texto,
                 r.driver_paid_at as pagado, r.driver_payment_ref as comprobante,
                 r.driver_status as estado
            from public.reservations r
           where r.driver_id = v_id
             and r.status <> 'cancelada'
             and (r.service_datetime is null
                  or r.service_datetime >= (now() at time zone 'America/Mexico_City') - interval '45 days')
        ) x
    ), '[]'::json)
  );
end
$f$;
revoke all on function public.chofer_portal(text) from public;
grant execute on function public.chofer_portal(text) to anon, authenticated;

create or replace function public.chofer_estado(p_token text, p_folio text, p_estado text)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'pg_temp'
as $f$
declare
  v_id uuid := privado.chofer_por_token(p_token);
  v_folio text;
begin
  if v_id is null or p_estado not in ('en_camino', 'a_bordo', 'terminado') then
    return false;
  end if;
  update public.reservations
     set driver_status = p_estado, driver_status_at = now()
   where folio = p_folio and driver_id = v_id and status <> 'cancelada'
  returning folio into v_folio;
  return v_folio is not null;
end
$f$;
revoke all on function public.chofer_estado(text, text, text) from public;
grant execute on function public.chofer_estado(text, text, text) to anon, authenticated;

-- 4. /equipo ve el estado que marcó el chofer.
drop function public.reservas_equipo(text);
create function public.reservas_equipo(p_clave text)
 returns table(folio text, servicio timestamp without time zone, cliente text, telefono text, vuelo text, origen text, destino text, unidad text, tipo text, pasajeros integer, notas text, estado text, chofer text, chofer_tel text, pago_chofer text, imagen_chofer boolean, estado_chofer text, estado_chofer_at timestamptz)
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;

  return query
  select r.folio, r.service_datetime, r.name, r.phone, r.flight_number,
         r.origin, r.destination, r.category, r.service_type, r.passengers,
         privado.nota_chofer(r.notes),
         case r.status when 'anticipo_pagado' then 'Anticipo'
                       when 'pendiente_pago' then 'Pendiente de pago'
                       else 'Pagado' end,
         r.driver_name, r.driver_phone,
         privado.pago_chofer(r.notes),
         exists (select 1 from privado.imagenes_chofer i where i.folio = r.folio),
         r.driver_status, r.driver_status_at
    from public.reservations r
   where (r.status in ('confirmada', 'anticipo_pagado', 'chofer_asignado')
          or (r.status = 'pendiente_pago' and r.agendado))
     and (r.service_datetime is null
          or r.service_datetime >= (now() at time zone 'America/Mexico_City') - interval '3 hours')
   order by r.service_datetime nulls last, r.folio;
end;
$function$;
revoke all on function public.reservas_equipo(text) from public;
grant execute on function public.reservas_equipo(text) to anon, authenticated;

-- 5. Servicios de Itzel sin teléfono (Blacklane) quedaban sin chofer ligado.
update public.reservations r
   set driver_id = d.id
  from public.drivers d
 where r.driver_id is null and r.driver_name is not null
   and lower(r.driver_name) in ('itzel', 'itzel sanchez', 'itzel sánchez')
   and d.phone = '5541301651';

commit;
