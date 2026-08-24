import { buildPaidBookingMessage } from "@/lib/payment-notifications";
import { getStripe } from "@/lib/stripe";
import SuccessClient from "./SuccessClient";

const WHATSAPP_NUMBER = "525543582919";

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export type Booking = {
  folio: string;
  nombre: string;
  fecha: string;
  hora: string;
  servicio: string;
  origen: string;
  destino: string;
  vehiculo: string;
  total: string;
  googleCalendarUrl: string | null;
  icsHref: string | null;
};

/** Formato de fecha para calendario: 20260823T150000 (hora local de CDMX). */
function calendarStamp(fecha: string, hora: string, addHours = 0) {
  const [y, m, d] = fecha.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(hh)) return null;
  const start = new Date(Date.UTC(y, m - 1, d, hh + addHours, mm || 0));
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${start.getUTCFullYear()}${pad(start.getUTCMonth() + 1)}${pad(start.getUTCDate())}` +
    `T${pad(start.getUTCHours())}${pad(start.getUTCMinutes())}00`
  );
}

/**
 * Enlaces de calendario. El traslado al aeropuerto suele ser de madrugada:
 * que la cita entre sola al teléfono vale más que cualquier detalle visual.
 * Las horas van sin zona horaria y con TZID de CDMX, que es como se captura
 * el servicio en el cotizador.
 */
function buildCalendarLinks(booking: Omit<Booking, "googleCalendarUrl" | "icsHref">) {
  const start = calendarStamp(booking.fecha, booking.hora);
  const end = calendarStamp(booking.fecha, booking.hora, 2);
  if (!start || !end) return { googleCalendarUrl: null, icsHref: null };

  const titulo = `Elite Route · ${booking.vehiculo}`;
  const detalle = [
    `Servicio: ${booking.servicio}`,
    `Origen: ${booking.origen}`,
    `Destino: ${booking.destino}`,
    `Folio: ${booking.folio}`,
    "Contacto: +52 55 4358 2919",
  ].join("\n");

  const googleCalendarUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(titulo)}` +
    `&dates=${start}/${end}` +
    "&ctz=America/Mexico_City" +
    `&details=${encodeURIComponent(detalle)}` +
    `&location=${encodeURIComponent(booking.origen)}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Elite Route//Reserva//ES",
    "BEGIN:VEVENT",
    `UID:${booking.folio}@eliteroute.mx`,
    `SUMMARY:${titulo}`,
    `DTSTART;TZID=America/Mexico_City:${start}`,
    `DTEND;TZID=America/Mexico_City:${end}`,
    `LOCATION:${booking.origen.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${detalle.replace(/\n/g, "\\n").replace(/,/g, "\\,")}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Traslado Elite Route mañana",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    googleCalendarUrl,
    icsHref: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
  };
}

async function getSessionUrls(sessionId?: string): Promise<{ whatsAppUrl: string | null; invoiceRequestUrl: string | null; booking: Booking | null }> {
  if (!sessionId) return { whatsAppUrl: null, invoiceRequestUrl: null, booking: null };

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const whatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildPaidBookingMessage(session))}`;
    const meta = session.metadata || {};
    const amount = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: (session.currency || "mxn").toUpperCase(),
    }).format((session.amount_total || 0) / 100);
    const subject = `Solicitud de factura · ${session.id}`;
    const body = [
      "Hola, solicito factura para este servicio de Elite Route.",
      "",
      "Datos del pago:",
      `Stripe: ${session.id}`,
      `Total pagado: ${amount}`,
      "",
      "Datos del servicio:",
      `Cliente: ${meta.fullName || ""}`,
      `Tel: ${meta.phone || ""}`,
      `Tipo: ${meta.serviceLabel || meta.serviceType || ""}`,
      `Fecha: ${meta.serviceDate || ""} ${meta.serviceTime || ""}`.trim(),
      `Origen: ${meta.origin || ""}`,
      `Destino: ${meta.destination || ""}`,
      `Vehículo: ${meta.vehicle || meta.category || ""}`,
      "",
      "Datos fiscales para factura:",
      "RFC:",
      "Razón social:",
      "Régimen fiscal:",
      "Uso CFDI:",
      "Código postal fiscal:",
      "Correo para envío de PDF/XML:",
    ].join("\n");

    const invoiceRequestUrl = `mailto:contabilidad@eliteroute.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const base = {
      folio: session.id.slice(-8).toUpperCase(),
      nombre: String(meta.fullName || "").split(" ")[0] || "",
      fecha: String(meta.serviceDate || ""),
      hora: String(meta.serviceTime || ""),
      servicio: String(meta.serviceLabel || "Traslado"),
      origen: String(meta.origin || ""),
      destino: String(meta.destination || ""),
      vehiculo: String(meta.vehicle || ""),
      total: new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: (session.currency || "mxn").toUpperCase(),
      }).format((session.amount_total || 0) / 100),
    };

    return { whatsAppUrl, invoiceRequestUrl, booking: { ...base, ...buildCalendarLinks(base) } };
  } catch (error) {
    console.error("Could not build session URLs:", error);
    return { whatsAppUrl: null, invoiceRequestUrl: null, booking: null };
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const { whatsAppUrl, invoiceRequestUrl, booking } = await getSessionUrls(sessionId);

  // Sin sesión válida — fallback simple
  if (!whatsAppUrl) {
    return (
      <main className="er-status-page">
        <div>
          <p style={{ color: "#C8A46B", marginBottom: "16px" }}>Pago recibido</p>
          <h1 style={{ fontWeight: 300, marginBottom: "24px" }}>Gracias por tu reserva</h1>
          <a href={`https://wa.me/525543582919?text=${encodeURIComponent("Hola, acabo de realizar un pago en eliteroute.mx y quiero confirmar mi traslado.")}`} target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "#000", padding: "14px 28px", fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Confirmar por WhatsApp
          </a>
        </div>
      </main>
    );
  }

  return <SuccessClient whatsAppUrl={whatsAppUrl} invoiceRequestUrl={invoiceRequestUrl} booking={booking} />;
}
