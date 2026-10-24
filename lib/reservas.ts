import type Stripe from "stripe";
import { getStripe } from "./stripe";

/**
 * REGISTRO CENTRAL DE RESERVAS (Supabase, tabla `reservations`).
 *
 * El 24 de octubre de 2026 se perdió un servicio pagado (Puebla › AICM)
 * porque la reserva sólo existía en Stripe y en un aviso, y nunca llegó a la
 * lista de servicios. Desde entonces cada pago se guarda aquí, con folio, y
 * todo lo demás (lista de choferes, PDF, panel) sale de esta tabla.
 *
 * Se escribe a través de dos funciones de Postgres (`registrar_reserva_stripe`
 * y `cancelar_reserva_stripe`) protegidas con `RESERVAS_TOKEN`. La URL y la
 * llave publicable de Supabase son públicas por diseño; el token es lo único
 * secreto. Si falta, no se rompe nada: se registra el aviso en el log.
 */
const SUPABASE_URL = "https://eznfourayhypefweazyq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jN6hYX5vvk3qI24hzBfkUg_bP_PZAad";

type Resultado = { guardado: boolean; folio?: string | null; motivo?: string };

async function rpc(fn: string, args: Record<string, unknown>): Promise<Resultado> {
  const token = process.env.RESERVAS_TOKEN;
  if (!token) return { guardado: false, motivo: "falta RESERVAS_TOKEN" };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token, ...args }),
  });

  if (!res.ok) throw new Error(`Supabase ${fn} ${res.status}: ${await res.text()}`);
  return { guardado: true, folio: (await res.json()) as string | null };
}

/** "High SUV" ya no existe para clientes: se llama SUV Lux. */
function unidad(m: Stripe.Metadata) {
  const v = String(m.vehicle || m.category || "");
  return /high\s*suv/i.test(v) ? "SUV Lux" : v;
}

/**
 * Los links de pago de Stripe no pasan su metadata a la sesión. Las
 * cotizaciones hechas fuera de la web llevan ahí su folio, así que se lee
 * del link para confirmar ese mismo registro en vez de crear otro.
 */
async function metadataDelLink(session: Stripe.Checkout.Session): Promise<Stripe.Metadata> {
  const link = session.payment_link;
  if (!link) return {};
  if (typeof link !== "string") return link.metadata || {};
  try {
    return (await getStripe().paymentLinks.retrieve(link)).metadata || {};
  } catch {
    return {};
  }
}

/**
 * `pendiente`: la cotización se guarda al generar el link, antes de pagar,
 * para poder darle seguimiento. El pago actualiza ese mismo registro.
 */
export async function registrarReserva(
  session: Stripe.Checkout.Session,
  { pendiente = false }: { pendiente?: boolean } = {},
): Promise<Resultado> {
  const m: Stripe.Metadata = { ...(await metadataDelLink(session)), ...(session.metadata || {}) };
  const pagado = pendiente ? 0 : (session.amount_total ?? 0) / 100;
  const precio = Number(m.priceMxn) || pagado;
  const fecha = m.serviceDate && m.serviceTime ? `${m.serviceDate} ${m.serviceTime}` : "";

  // Si pagó menos que el precio, es anticipo: el resto vence 24 h antes.
  const saldo = Math.max(0, Math.round((precio - pagado) * 100) / 100);
  const anticipo = !pendiente && saldo > 1;
  const vence =
    anticipo && fecha
      ? new Date(new Date(`${m.serviceDate}T${m.serviceTime}:00-06:00`).getTime() - 24 * 3600 * 1000).toISOString()
      : "";

  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "";

  return rpc("registrar_reserva_stripe", {
    p: {
      folio: m.folio || "",
      name: m.fullName || session.customer_details?.name || "",
      phone: m.phone || session.customer_details?.phone || "",
      email: session.customer_details?.email || "",
      origin: m.origin || "",
      destination: m.destination || "",
      category: unidad(m),
      km: m.km || "",
      minutes: m.minutes || "",
      zone: m.zone || "",
      service_datetime: fecha,
      final_price: String(precio),
      service_type: ["route", "hour", "day"].includes(String(m.serviceType)) ? m.serviceType : "",
      rental_hours: m.rentalHours || "",
      source: session.payment_link ? "payment_link" : "web",
      status: pendiente ? "pendiente_pago" : anticipo ? "anticipo_pagado" : "confirmada",
      flight_number: m.flightNumber || "",
      passengers: m.pasajeros || "",
      notes: m.notes || "",
      amount_paid: String(pagado),
      currency: session.currency || "mxn",
      stripe_session_id: session.id,
      stripe_payment_intent: paymentIntent,
      balance_due: String(anticipo ? saldo : 0),
      balance_due_by: vence,
    },
  });
}

/** Cookie con la clave del equipo para /equipo. */
export const COOKIE_EQUIPO = "er_equipo";

/** Una fila de la vista del equipo: sin precios ni montos, a propósito. */
export type ServicioEquipo = {
  folio: string;
  servicio: string | null;
  cliente: string | null;
  telefono: string | null;
  vuelo: string | null;
  origen: string;
  destino: string;
  unidad: string;
  tipo: string | null;
  pasajeros: number | null;
  notas: string | null;
  estado: string;
  chofer: string | null;
};

/**
 * Servicios próximos para /equipo. La clave la valida Postgres
 * (`reservas_equipo`); con una clave mala devuelve null.
 */
export async function reservasEquipo(clave: string): Promise<ServicioEquipo[] | null> {
  if (!clave) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/reservas_equipo`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_clave: clave }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as ServicioEquipo[];
}

/** Reembolso total en Stripe = reserva cancelada en la tabla. */
export async function cancelarReserva(charge: Stripe.Charge): Promise<Resultado> {
  if (!charge.refunded) return { guardado: false, motivo: "reembolso parcial" };
  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!pi) return { guardado: false, motivo: "sin payment_intent" };
  return rpc("cancelar_reserva_stripe", { p_payment_intent: pi });
}
