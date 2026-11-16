"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_CHOFER, ESTADOS, WHATSAPP_SEGUIMIENTO, marcarEstadoChofer, portalChofer } from "@/lib/portal-chofer";

/**
 * Guarda el estado del servicio y abre WhatsApp con el aviso para Kevin ya
 * escrito; el chofer sólo le da enviar (y agrega fotos o ubicación ahí).
 */
export async function marcarEstado(formData: FormData) {
  const lang = String(formData.get("lang") || "es");
  const folio = String(formData.get("folio") || "");
  const estado = ESTADOS.find((e) => e.valor === formData.get("estado"));
  const token = (await cookies()).get(COOKIE_CHOFER)?.value || "";
  if (!estado || !(await marcarEstadoChofer(token, folio, estado.valor))) redirect(`/${lang}/chofer#${folio}`);

  const portal = await portalChofer(token);
  const s = portal?.servicios.find((x) => x.folio === folio);
  const texto = [
    `${estado.texto} · ${folio}`,
    s?.cliente ? `Cliente: ${s.cliente}` : "",
    portal?.chofer ? `Chofer: ${portal.chofer}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  redirect(`https://wa.me/${WHATSAPP_SEGUIMIENTO}?text=${encodeURIComponent(texto)}`);
}

export async function salir(formData: FormData) {
  (await cookies()).delete(COOKIE_CHOFER);
  redirect(`/${String(formData.get("lang") || "es")}/chofer`);
}
