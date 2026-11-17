-- Aplicada en Supabase (proyecto eliteroute) el 2026-11-16 como migración
-- `solicitudes_whatsapp`. Se guarda aquí como referencia.
--
-- Clics en "Reservar por WhatsApp" desde la web. Van en tabla aparte de
-- reservations a propósito: no son servicios confirmados, y meterlos ahí
-- los mandaría a la lista de choferes, la agenda y la secuencia de folios.
create table public.solicitudes_whatsapp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  phone text,
  service_type text,
  rental_hours int,
  origin text,
  destination text,
  service_datetime timestamp,
  category text,
  km numeric,
  minutes numeric,
  zone text,
  flight_number text,
  passengers int,
  notes text,
  quoted_price numeric,
  lang text,
  atendida boolean not null default false,
  reservation_folio text
);

alter table public.solicitudes_whatsapp enable row level security;
-- Sin políticas: nadie la lee ni escribe con la llave pública. Sólo entra
-- por la función de abajo (con RESERVAS_TOKEN) y se consulta en el panel.

create index solicitudes_whatsapp_created_at_idx on public.solicitudes_whatsapp (created_at desc);

create or replace function public.registrar_solicitud_whatsapp(p_token text, p jsonb)
returns uuid
language plpgsql
security definer
set search_path to 'public', 'privado', 'pg_temp'
as $$
declare
  v_id uuid;
begin
  if p_token is null or p_token <> (select valor from privado.config where clave = 'reservas_token') then
    raise exception 'no autorizado';
  end if;

  insert into public.solicitudes_whatsapp (
    name, phone, service_type, rental_hours, origin, destination, service_datetime,
    category, km, minutes, zone, flight_number, passengers, notes, quoted_price, lang
  ) values (
    left(nullif(p->>'name', ''), 200),
    left(nullif(p->>'phone', ''), 40),
    nullif(p->>'service_type', ''),
    nullif(p->>'rental_hours', '')::int,
    left(nullif(p->>'origin', ''), 500),
    left(nullif(p->>'destination', ''), 500),
    nullif(p->>'service_datetime', '')::timestamp,
    left(nullif(p->>'category', ''), 60),
    nullif(p->>'km', '')::numeric,
    nullif(p->>'minutes', '')::numeric,
    left(nullif(p->>'zone', ''), 60),
    left(nullif(p->>'flight_number', ''), 20),
    nullif(p->>'passengers', '')::int,
    left(nullif(p->>'notes', ''), 1000),
    nullif(p->>'quoted_price', '')::numeric,
    left(nullif(p->>'lang', ''), 5)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.registrar_solicitud_whatsapp(text, jsonb) from public;
grant execute on function public.registrar_solicitud_whatsapp(text, jsonb) to anon, authenticated;
