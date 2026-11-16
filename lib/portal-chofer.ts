import type { EstadoChofer, Gps } from "./estados-chofer";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./reservas";

/**
 * PORTAL DE CHOFERES (/chofer). Cada chofer entra con su link personal
 * (/es/chofer/entrar/<token>) y ve sólo sus servicios: próximos, realizados,
 * lo que se le paga y si ya se le pagó. El token lo valida Postgres
 * (`chofer_portal`, `chofer_estado`); aquí nunca se ve el precio al cliente.
 */
export const COOKIE_CHOFER = "er_chofer";

/** WhatsApp de Kevin, que da seguimiento a los choferes en cada servicio. */
export const WHATSAPP_SEGUIMIENTO = "525551996496";

export { ESTADOS, type EstadoChofer, type Gps } from "./estados-chofer";

export type ServicioChofer = {
  folio: string;
  servicio: string | null;
  cliente: string | null;
  telefono: string | null;
  vuelo: string | null;
  origen: string;
  destino: string;
  unidad: string;
  tipo: string | null;
  horas: number | null;
  pasajeros: number | null;
  notas: string | null;
  /** Pago al chofer capturado en el portal. */
  pago: number | null;
  /** "Pago al chofer $X" de las notas, si no hay monto capturado. */
  pago_texto: string | null;
  pagado: string | null;
  comprobante: string | null;
  estado: EstadoChofer | null;
};

export type PortalChofer = { chofer: string; servicios: ServicioChofer[] };

async function rpc(fn: string, args: Record<string, unknown>) {
  return fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
}

/** Los servicios del chofer, o null si el link no sirve. */
export async function portalChofer(token: string): Promise<PortalChofer | null> {
  if (!token) return null;
  const res = await rpc("chofer_portal", { p_token: token });
  if (!res.ok) return null;
  return (await res.json()) as PortalChofer | null;
}

/**
 * Marca el estado de un servicio del chofer y guarda dónde estaba (evidencia
 * para disputas: llegada, abordaje, dejada). false si el servicio no es suyo.
 */
export async function marcarEstadoChofer(
  token: string,
  folio: string,
  estado: EstadoChofer,
  gps: Gps | null,
): Promise<boolean> {
  if (!token || !folio) return false;
  const res = await rpc("chofer_marcar", {
    p_token: token,
    p_folio: folio,
    p_estado: estado,
    p_lat: gps?.lat ?? null,
    p_lng: gps?.lng ?? null,
    p_precision: gps?.precision ?? null,
  });
  return res.ok && (await res.json()) === true;
}
