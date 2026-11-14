-- /equipo: pago al chofer + imagen del servicio para el chofer.
-- Correr completo en el SQL Editor de Supabase (proyecto eznfourayhypefweazyq).
--
-- 1. privado.pago_chofer: el último "Pago al chofer $X" de las notas (el más
--    reciente manda), sin "(30% sobre neto)" ni "(decidido por ...)".
-- 2. privado.imagenes_chofer: la imagen ya hecha del servicio (la que dice
--    abajo "Pago al chofer"), una por folio, subida desde /equipo.
-- 3. reservas_equipo devuelve además pago_chofer e imagen_chofer (sí/no).
-- 4. subir_imagen_chofer / imagen_chofer: subir y leer la imagen con la clave
--    del equipo, igual que asignar_chofer.

begin;

create or replace function privado.pago_chofer(n text)
 returns text
 language sql
 immutable
 set search_path to 'pg_catalog'
as $f$
  select m[1] from regexp_matches(n,
    'pago al (?:chofer|conductor)[^$|.]{0,30}(\$\s?[0-9][0-9,]*(?:\.[0-9]{2})?(?:\s*/\s*h(?:ora)?)?(?:\s*\((?![^)]*(?:neto|cezar|sobre))[^)]*\))?)',
    'gi') with ordinality t(m, k)
  order by k desc limit 1
$f$;
revoke all on function privado.pago_chofer(text) from public;

create table if not exists privado.imagenes_chofer (
  folio text primary key references public.reservations(folio) on update cascade on delete cascade,
  tipo text not null check (tipo in ('image/jpeg', 'image/png', 'image/webp')),
  datos bytea not null check (octet_length(datos) <= 3 * 1024 * 1024),
  subida timestamptz not null default now()
);
revoke all on table privado.imagenes_chofer from public, anon, authenticated;

create or replace function privado.clave_equipo_ok(p_clave text)
 returns boolean
 language sql
 stable
 security definer
 set search_path to 'privado', 'extensions', 'pg_temp'
as $f$
  select p_clave is not null and h is not null and extensions.crypt(lower(trim(p_clave)), h) = h
    from (select (select valor from privado.config where clave = 'clave_equipo_hash') h) x
$f$;
revoke all on function privado.clave_equipo_ok(text) from public;

drop function public.reservas_equipo(text);
create function public.reservas_equipo(p_clave text)
 returns table(folio text, servicio timestamp without time zone, cliente text, telefono text, vuelo text, origen text, destino text, unidad text, tipo text, pasajeros integer, notas text, estado text, chofer text, chofer_tel text, pago_chofer text, imagen_chofer boolean)
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
         exists (select 1 from privado.imagenes_chofer i where i.folio = r.folio)
    from public.reservations r
   where (r.status in ('confirmada', 'anticipo_pagado', 'chofer_asignado')
          or (r.status = 'pendiente_pago' and r.agendado))
     and (r.service_datetime is null
          or r.service_datetime >= (now() at time zone 'America/Mexico_City') - interval '3 hours')
   order by r.service_datetime nulls last, r.folio;
end;
$function$;
revoke all on function public.reservas_equipo(text) from public;
grant execute on function public.reservas_equipo(text) to anon, authenticated, service_role;

-- Sube (o reemplaza) la imagen de un servicio; base64 vacío la quita.
create or replace function public.subir_imagen_chofer(p_clave text, p_folio text, p_tipo text, p_base64 text)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  if not exists (select 1 from public.reservations where folio = p_folio) then
    return false;
  end if;
  if coalesce(p_base64, '') = '' then
    delete from privado.imagenes_chofer where folio = p_folio;
    return true;
  end if;
  insert into privado.imagenes_chofer (folio, tipo, datos)
  values (p_folio, p_tipo, decode(p_base64, 'base64'))
  on conflict (folio) do update set tipo = excluded.tipo, datos = excluded.datos, subida = now();
  return true;
end;
$function$;
revoke all on function public.subir_imagen_chofer(text, text, text, text) from public;
grant execute on function public.subir_imagen_chofer(text, text, text, text) to anon, authenticated, service_role;

create or replace function public.imagen_chofer(p_clave text, p_folio text)
 returns table(tipo text, base64 text)
 language plpgsql
 security definer
 set search_path to 'public', 'privado', 'extensions', 'pg_temp'
as $function$
begin
  if not privado.clave_equipo_ok(p_clave) then
    raise exception 'no autorizado';
  end if;
  return query
  select i.tipo, encode(i.datos, 'base64') from privado.imagenes_chofer i where i.folio = p_folio;
end;
$function$;
revoke all on function public.imagen_chofer(text, text) from public;
grant execute on function public.imagen_chofer(text, text) to anon, authenticated, service_role;

commit;
