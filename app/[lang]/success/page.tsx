import { notFound } from "next/navigation";
import { buildPaidBookingMessage } from "@/lib/payment-notifications";
import { getStripe } from "@/lib/stripe";
import SuccessClient, { type Booking } from "../../_components/SuccessClient";
import { isLang, LANGS, type Lang } from "@/lib/i18n";

/** La etiqueta del evento de calendario y el aviso previo van en el idioma
 *  del cliente: acaban en SU teléfono, no en el nuestro. */
const CAL = {
  es: { service: "Servicio", from: "Origen", to: "Destino", ref: "Folio", contact: "Contacto", alarm: "Traslado Elite Route mañana" },
  en: { service: "Service", from: "Pickup", to: "Destination", ref: "Ref.", contact: "Contact", alarm: "Elite Route transfer tomorrow" },
} as const;

const WHATSAPP_NUMBER = "525543582919";

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

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
function buildCalendarLinks(booking: Omit<Booking, "googleCalendarUrl" | "icsHref">, lang: Lang) {
  const start = calendarStamp(booking.fecha, booking.hora);
  const end = calendarStamp(booking.fecha, booking.hora, 2);
  if (!start || !end) return { googleCalendarUrl: null, icsHref: null };

  const c = CAL[lang];
  const titulo = `Elite Route · ${booking.vehiculo}`;
  const detalle = [
    `${c.service}: ${booking.servicio}`,
    `${c.from}: ${booking.origen}`,
    `${c.to}: ${booking.destino}`,
    `${c.ref}: ${booking.folio}`,
    `${c.contact}: +52 55 4358 2919`,
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
    `PRODID:-//Elite Route//Booking//${lang.toUpperCase()}`,
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
    `DESCRIPTION:${c.alarm}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    googleCalendarUrl,
    icsHref: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
  };
}

async function getSessionUrls(sessionId: string | undefined, lang: Lang): Promise<{ whatsAppUrl: string | null; invoiceRequestUrl: string | null; booking: Booking | null }> {
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
    // El correo de factura se queda SIEMPRE en español: lo lee contabilidad
    // de Elite Route, no el cliente. Mismo criterio que el cotizador B2B.
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
      servicio: String(meta.serviceLabel || (lang === "es" ? "Traslado" : "Transfer")),
      origen: String(meta.origin || ""),
      destino: String(meta.destination || ""),
      vehiculo: String(meta.vehicle || ""),
      total: new Intl.NumberFormat(lang === "es" ? "es-MX" : "en-US", {
        style: "currency",
        currency: (session.currency || "mxn").toUpperCase(),
      }).format((session.amount_total || 0) / 100),
    };

    return { whatsAppUrl, invoiceRequestUrl, booking: { ...base, ...buildCalendarLinks(base, lang) } };
  } catch (error) {
    console.error("Could not build session URLs:", error);
    return { whatsAppUrl: null, invoiceRequestUrl: null, booking: null };
  }
}

const FALLBACK = {
  es: {
    kicker: "Pago recibido",
    title: "Gracias por tu reserva",
    wa: "Confirmar por WhatsApp",
    msg: "Hola, acabo de realizar un pago en eliteroute.mx y quiero confirmar mi traslado.",
  },
  en: {
    kicker: "Payment received",
    title: "Thank you for your booking",
    wa: "Confirm on WhatsApp",
    msg: "Hello, I just paid on eliteroute.mx and I would like to confirm my transfer.",
  },
} as const;

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const { session_id: sessionId } = await searchParams;
  const { whatsAppUrl, invoiceRequestUrl, booking } = await getSessionUrls(sessionId, lang);

  // Sin sesión válida — fallback simple
  if (!whatsAppUrl) {
    const f = FALLBACK[lang];
    return (
      <main className="er-status-page">
        <div>
          <p style={{ color: "#C8A46B", marginBottom: "16px" }}>{f.kicker}</p>
          <h1 style={{ fontWeight: 300, marginBottom: "24px" }}>{f.title}</h1>
          <a href={`https://wa.me/525543582919?text=${encodeURIComponent(f.msg)}`} target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "#000", padding: "14px 28px", fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            {f.wa}
          </a>
        </div>
      </main>
    );
  }

  return <SuccessClient whatsAppUrl={whatsAppUrl} invoiceRequestUrl={invoiceRequestUrl} booking={booking} lang={lang} />;
}
