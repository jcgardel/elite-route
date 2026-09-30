/**
 * Eventos de calendario para una reserva.
 *
 * Existían ya dentro de la página de gracias, para que el CLIENTE se metiera
 * el traslado en su teléfono. El 29 de septiembre de 2026 hizo falta lo mismo
 * para el DUEÑO, en el aviso de cada reserva pagada, y tener dos copias del
 * mismo `.ics` divergiendo era cuestión de tiempo. Así que vive aquí y lo
 * usan los dos.
 *
 * LO QUE CAMBIA ENTRE UNO Y OTRO ES EL TÍTULO, y no es un detalle:
 *
 *   · El cliente tiene UNA reserva. "Elite Route · High SUV" le basta y le
 *     dice quién lo recoge.
 *   · El dueño tiene VARIAS el mismo día. Ese mismo título le llenaría la
 *     agenda de eventos idénticos. El suyo lleva cliente y ruta, que es lo
 *     que se necesita distinguir de un vistazo en la vista de mes, donde
 *     apenas se leen 25 caracteres.
 *
 * Las horas van sin zona y con TZID de CDMX, que es como se captura el
 * servicio en el cotizador.
 */

import { isAirportAddress } from "./vehicles";

/** Formato de fecha para calendario: 20260823T150000 (hora local de CDMX). */
export function calendarStamp(fecha: string, hora: string, addMinutes = 0) {
  const [y, m, d] = fecha.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(hh)) return null;
  const start = new Date(Date.UTC(y, m - 1, d, hh, (mm || 0) + addMinutes));
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${start.getUTCFullYear()}${pad(start.getUTCMonth() + 1)}${pad(start.getUTCDate())}` +
    `T${pad(start.getUTCHours())}${pad(start.getUTCMinutes())}00`
  );
}

/** Lo que el `.ics` necesita saber. Sirve igual al cliente y al dueño. */
export type EventoReserva = {
  titulo: string;
  /** Cada línea del cuerpo del evento. */
  detalle: string[];
  /** Punto de recogida: es lo que abre el mapa desde el teléfono. */
  lugar: string;
  fecha: string;
  hora: string;
  /** Cuánto dura. Si no se sabe, dos horas es un bloque razonable. */
  minutos?: number;
  /** Identificador estable: evita duplicados si el aviso se reintenta. */
  uid: string;
  /** Texto del recordatorio. */
  aviso: string;
  /** Minutos antes de cada recordatorio. */
  recordatorios?: number[];
};

/** Escapa lo que el formato ICS trata como separador. */
function esc(texto: string) {
  return texto.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** El `.ics` completo, listo para adjuntar o descargar. */
export function buildIcs(e: EventoReserva): string | null {
  const start = calendarStamp(e.fecha, e.hora);
  const end = calendarStamp(e.fecha, e.hora, e.minutos && e.minutos > 0 ? e.minutos : 120);
  if (!start || !end) return null;

  const detalle = e.detalle.join("\n");
  const recordatorios = (e.recordatorios ?? [1440]).flatMap((min) => [
    "BEGIN:VALARM",
    `TRIGGER:-PT${min}M`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(e.aviso)}`,
    "END:VALARM",
  ]);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Elite Route//Booking//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `SUMMARY:${esc(e.titulo)}`,
    `DTSTART;TZID=America/Mexico_City:${start}`,
    `DTEND;TZID=America/Mexico_City:${end}`,
    `LOCATION:${esc(e.lugar)}`,
    `DESCRIPTION:${esc(detalle)}`,
    ...recordatorios,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** El enlace de "añadir a Google Calendar", para quien prefiere un clic. */
/**
 * Tope del detalle que viaja DENTRO de la URL de Google Calendar.
 *
 * Las solicitudes del cliente son texto libre y entran aquí enteras, y
 * `encodeURIComponent` triplica el tamaño (cada espacio se vuelve `%20`). Una
 * nota larga convertía este enlace en una URL de decenas de miles de
 * caracteres: rota para Google, rota para el `href` del correo, y por encima
 * del límite de 4096 de un mensaje de Telegram.
 *
 * El `.ics` adjunto NO tiene este tope y sigue llevando el detalle completo:
 * es el que de verdad mete el evento en la agenda. Esta URL es el atajo.
 */
const TOPE_DETALLE_URL = 1000;

export function buildGoogleCalendarUrl(e: EventoReserva): string | null {
  const start = calendarStamp(e.fecha, e.hora);
  const end = calendarStamp(e.fecha, e.hora, e.minutos && e.minutos > 0 ? e.minutos : 120);
  if (!start || !end) return null;

  const detalle = e.detalle.join("\n");
  const detalleAcotado =
    detalle.length > TOPE_DETALLE_URL ? `${detalle.slice(0, TOPE_DETALLE_URL)}…` : detalle;

  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(e.titulo)}` +
    `&dates=${start}/${end}` +
    "&ctz=America/Mexico_City" +
    `&details=${encodeURIComponent(detalleAcotado)}` +
    `&location=${encodeURIComponent(e.lugar)}`
  );
}

/**
 * El título que ve el DUEÑO: cliente y ruta.
 *
 * Lo eligió él el 29 de septiembre de 2026 sobre las alternativas que
 * incluían el vehículo. En la vista de mes se leen unos 25 caracteres, y con
 * varios servicios el mismo día lo que hace falta distinguir es a quién
 * recoges y dónde; el vehículo va en el cuerpo del evento.
 */
export function zonaDe(direccion: string): string {
  const dir = direccion.trim();
  if (!dir) return "";
  const n = dir.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  /*
   * 1. Un aeropuerto se nombra por su aeropuerto.
   *
   * Es el caso más frecuente y el que peor sale con la calle: Google devuelve
   * el AICM como "Av. Capitán Carlos León S/N, Peñón de los Baños", que en
   * una agenda no dice absolutamente nada. Se miran patrones propios y NO
   * sólo `isAirportAddress`, porque esa función no conoce el nombre de la
   * calle del AICM — justo el texto que llega cuando el cliente elige la
   * terminal en el autocompletado de Google.
   */
  if (n.includes("aifa") || n.includes("felipe angeles")) return "AIFA";
  if (n.includes("aeropuerto de toluca") || n.includes("toluca airport")) return "Toluca";
  if (n.includes("aicm") || n.includes("benito juarez") || n.includes("capitan carlos leon")) return "AICM";
  if (isAirportAddress(dir)) return "Aeropuerto";

  const partes = dir.split(",").map((x) => x.trim()).filter(Boolean);
  const cortar = (x: string) => (x.length > 24 ? `${x.slice(0, 23)}…` : x);

  /*
   * 2. Fuera de la Ciudad de México manda la CIUDAD; dentro, la COLONIA.
   *
   * Es lo que de verdad distingue en cada caso: un traslado a Tepoztlán se
   * reconoce por "Tepoztlán", no por su colonia "San Jose"; y uno dentro de
   * la ciudad se reconoce por "Polanco" o "Hipódromo", no por "Ciudad de
   * México", que se repetiría en todos. La ciudad se localiza por el código
   * postal que la precede en las direcciones mexicanas.
   */
  const conCp = partes.find((x) => /^\d{4,5}\s+\S/.test(x));
  if (conCp) {
    const ciudad = conCp.replace(/^\d{4,5}\s+/, "").trim();
    const cn = ciudad.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const esLaCapital = cn.includes("ciudad de mexico") || cn === "cdmx" || cn === "mexico city";
    if (!esLaCapital) return cortar(ciudad);
  }

  /*
   * 3. Dentro de la ciudad: la colonia. El primer trozo es la calle cuando
   * trae número; si no lo trae, ya es un nombre de lugar ("Santa Fe",
   * "Polanco") y sirve tal cual.
   */
  const primera = partes[0] || dir;
  if (!/\d/.test(primera)) return cortar(primera);
  const segunda = (partes[1] || "").replace(/^\d{4,5}\s+/, "").trim();
  return cortar(segunda || primera);
}

export function tituloParaOperador(cliente: string, origen: string, destino: string) {
  const nombre = cliente.trim() || "Reserva";
  if (!destino || destino === "Disposición libre") return `${nombre} · ${zonaDe(origen)}`;
  return `${nombre} · ${zonaDe(origen)} → ${zonaDe(destino)}`;
}
