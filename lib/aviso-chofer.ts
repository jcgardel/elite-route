import "server-only";
import type { ServicioEquipo } from "./reservas";
import { enviarPlantilla, whatsappConfigurado } from "./whatsapp";

/**
 * AVISO AL CHOFER POR WHATSAPP al asignarle un servicio en /equipo.
 *
 * Sale del número de Elite Route con una plantilla aprobada por Meta, porque
 * casi nunca hay una conversación abierta de 24 h con el chofer. Mientras la
 * plantilla no esté aprobada (`WA_PLANTILLA_CHOFER` vacía) no se manda nada y
 * /equipo sigue funcionando como siempre (el botón de mandar por WhatsApp).
 *
 * La plantilla debe tener 6 variables, en este orden:
 *   {{1}} nombre del chofer   {{2}} folio      {{3}} fecha y hora
 *   {{4}} origen              {{5}} destino    {{6}} unidad y pasajeros
 */
export async function avisarChofer(chofer: string, tel: string, s: ServicioEquipo) {
  const plantilla = process.env.WA_PLANTILLA_CHOFER;
  if (!plantilla || !tel || !whatsappConfigurado()) return false;

  const fecha = s.servicio
    ? new Intl.DateTimeFormat("es-MX", {
        timeZone: "UTC", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
      }).format(new Date(`${s.servicio.slice(0, 16)}Z`)) // ya viene en hora de CDMX
    : "por confirmar";

  // Meta rechaza variables vacías o con saltos de línea.
  const limpio = (v: string | null | undefined) => (v || "—").replace(/\s+/g, " ").trim() || "—";

  await enviarPlantilla(tel, plantilla, [
    limpio(chofer.split(" ")[0]),
    limpio(s.folio),
    limpio(fecha),
    limpio(s.origen),
    limpio(s.destino),
    limpio(`${s.unidad}${s.pasajeros ? ` · ${s.pasajeros} pax` : ""}`),
  ]);
  return true;
}
