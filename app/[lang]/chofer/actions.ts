"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_CHOFER,
  ESTADOS,
  WHATSAPP_SEGUIMIENTO,
  marcarEstadoChofer,
  portalChofer,
  type Gps,
} from "@/lib/portal-chofer";

function gpsValido(gps: Gps | null): Gps | null {
  if (!gps) return null;
  const { lat, lng, precision } = gps;
  if (![lat, lng, precision].every(Number.isFinite) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng, precision };
}

/**
 * Guarda el estado del servicio con la ubicación del teléfono y devuelve el
 * link de WhatsApp con el aviso para Kevin ya escrito; el chofer sólo le da
 * enviar. null si el servicio no es suyo o el link ya no sirve.
 */
export async function marcarEstado(folio: string, estado: string, gps: Gps | null): Promise<string | null> {
  const e = ESTADOS.find((x) => x.valor === estado);
  const token = (await cookies()).get(COOKIE_CHOFER)?.value || "";
  const punto = gpsValido(gps);
  if (!e || !(await marcarEstadoChofer(token, folio, e.valor, punto))) return null;

  const portal = await portalChofer(token);
  const s = portal?.servicios.find((x) => x.folio === folio);
  const texto = [
    `${e.texto} · ${folio}`,
    s?.cliente ? `Cliente: ${s.cliente}` : "",
    portal?.chofer ? `Chofer: ${portal.chofer}` : "",
    punto ? `Ubicación: https://maps.google.com/?q=${punto.lat.toFixed(6)},${punto.lng.toFixed(6)}` : "Sin ubicación GPS",
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${WHATSAPP_SEGUIMIENTO}?text=${encodeURIComponent(texto)}`;
}

export async function salir(formData: FormData) {
  (await cookies()).delete(COOKIE_CHOFER);
  redirect(`/${String(formData.get("lang") || "es")}/chofer`);
}
