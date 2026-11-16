-- Panel de choferes (/equipo/liquidaciones) solo para Cezar.
-- Correr completo en el SQL Editor de Supabase (proyecto eznfourayhypefweazyq).
--
-- 1. Clave propia del dueño (privado.config 'clave_admin_hash'), distinta de
--    la del equipo: Itzel, Kevin y Zuleyma entran a /equipo, pero los pagos,
--    rentas, Uber y gasolina de los choferes solo los ve Cezar.
-- 2. Todas las funciones de liquidaciones piden la clave del dueño.
-- 3. Comprobante de pago por semana y por servicio.
-- 4. Pendientes de semanas anteriores (servicios realizados sin pagar).
--
-- La clave NO va en este archivo. Para ponerla o cambiarla:
--   delete from privado.config where clave = 'clave_admin_hash';
--   insert into privado.config (clave, valor)
--   values ('clave_admin_hash', extensions.crypt(lower('LA-CLAVE'), extensions.gen_salt('bf')));

begin;

create or replace function privado.clave_admin_ok(p_clave text)
 returns boolean
 language sql
 stable
 security definer
 set search_path to 'privado', 'extensions', 'pg_temp'
as $f$
  select p_clave is not null and h is not null and extensions.crypt(lower(trim(p_clave)), h) = h
    from (select (select valor from privado.config where clave = 'clave_admin_hash') h) x
$f$;
revoke all on function privado.clave_admin_ok(text) from public;

-- 2. Las funciones de liquidaciones pasan a la clave del dueño.
do $do$
declare
  f regprocedure;
begin
  foreach f in array array[
    'public.marcar_liquidacion(text,uuid,date,numeric)',
    'public.configurar_chofer(text,uuid,text,numeric,boolean)',
    'public.choferes_esquema(text)',
    'public.guardar_uber(text,uuid,date,numeric)',
    'public.agregar_movimiento(text,uuid,date,text,text,numeric)',
    'public.borrar_movimiento(text,uuid)',
    'public.definir_pago_chofer(text,text,numeric)'
  ]::regprocedure[] loop
    execute replace(pg_get_functiondef(f), 'privado.clave_equipo_ok(p_clave)', 'privado.clave_admin_ok(p_clave)');
  end loop;
end
$do$;

-- 3. Comprobante.
alter table privado.liquidaciones add column if not exists comprobante text;

create or replace function public.comprobante_liquidacion(p_clave text, p_driver uuid, p_semana date, p_ref text)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $f$
declare
  v_lunes date := p_semana - (extract(isodow from p_semana)::int - 1);
  v_ref text := nullif(left(trim(coalesce(p_ref, '')), 80), '');
begin
  if not privado.clave_admin_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  update privado.liquidaciones set comprobante = v_ref where driver_id = p_driver and semana = v_lunes;
  update public.reservations
     set driver_payment_ref = coalesce(v_ref, driver_payment_ref)
   where driver_id = p_driver
     and service_datetime >= v_lunes and service_datetime < v_lunes + 7
     and status <> 'cancelada'
     and driver_paid_at is not null;
  return true;
end
$f$;
revoke all on function public.comprobante_liquidacion(text, uuid, date, text) from public;
grant execute on function public.comprobante_liquidacion(text, uuid, date, text) to anon, authenticated;

-- La semana con pagado/comprobante por servicio y comprobante de la semana.
create or replace function public.liquidacion_semana(p_clave text, p_semana date)
 returns jsonb
 language plpgsql
 stable security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
declare
  v_lunes date := p_semana - (extract(isodow from p_semana)::int - 1);
begin
  if not privado.clave_admin_ok(p_clave) then
    raise exception 'no autorizado';
  end if;

  return coalesce((
    with srv as (
      select r.driver_id, r.folio, r.service_datetime, r.name, r.origin, r.destination, r.category,
             r.service_type, r.rental_hours, r.status, r.driver_paid_at, r.driver_payment_ref, p.monto, p.origen
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
              or (d.active and d.id in (select driver_id from esquema_chofer where esquema in ('renta', 'venta'))))
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
                        'pago', s.monto, 'origen_pago', s.origen,
                        'pagado', s.driver_paid_at, 'comprobante', s.driver_payment_ref) order by s.service_datetime)
                 from srv s where s.driver_id = d.id), '[]'::jsonb),
             'movimientos', coalesce((
               select jsonb_agg(jsonb_build_object('id', m.id, 'tipo', m.tipo, 'concepto', m.concepto, 'monto', m.monto) order by m.creado)
                 from movimientos_chofer m where m.driver_id = d.id and m.semana = v_lunes), '[]'::jsonb),
             'pagado', l.monto,
             'pagado_en', l.pagado_en,
             'comprobante', l.comprobante
           ) order by d.name)
      from drivers d
      join ch on ch.id = d.id
      left join esquema_chofer e on e.driver_id = d.id
      left join liquidaciones l on l.driver_id = d.id and l.semana = v_lunes
  ), '[]'::jsonb);
end;
$function$;

-- 4. Servicios ya realizados antes de esa semana que no se han pagado.
create or replace function public.pendientes_choferes(p_clave text, p_antes date)
 returns jsonb
 language plpgsql
 stable security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $f$
begin
  if not privado.clave_admin_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  return coalesce((
    select jsonb_agg(x order by x.nombre)
      from (
        select d.id as driver_id, d.name as nombre, count(*) as servicios,
               sum(p.monto) as total, count(*) filter (where p.monto is null) as sin_pago,
               min(r.service_datetime)::date as desde,
               jsonb_agg(jsonb_build_object('folio', r.folio, 'fecha', r.service_datetime, 'cliente', r.name,
                                            'pago', p.monto) order by r.service_datetime) as detalle
          from reservations r
          join drivers d on d.id = r.driver_id and not d.is_owner
          cross join lateral privado.pago_reserva(r) p
         where r.service_datetime < p_antes
           and r.service_datetime >= p_antes - 60
           and r.driver_paid_at is null
           and r.status <> 'cancelada'
           and (r.status <> 'pendiente_pago' or r.agendado)
           and not exists (select 1 from liquidaciones l
                            where l.driver_id = r.driver_id
                              and l.semana = (r.service_datetime::date - (extract(isodow from r.service_datetime)::int - 1)))
         group by d.id, d.name
      ) x
  ), '[]'::jsonb);
end
$f$;
revoke all on function public.pendientes_choferes(text, date) from public;
grant execute on function public.pendientes_choferes(text, date) to anon, authenticated;

commit;
