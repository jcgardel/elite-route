import Image from "next/image";
import Link from "next/link";
import { buildPaidBookingMessage } from "@/lib/payment-notifications";
import { getStripe } from "@/lib/stripe";

const WHATSAPP_NUMBER = "525543582919";

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

async function getSessionUrls(sessionId?: string): Promise<{ whatsAppUrl: string | null; invoiceRequestUrl: string | null }> {
  if (!sessionId) return { whatsAppUrl: null, invoiceRequestUrl: null };

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
    return { whatsAppUrl, invoiceRequestUrl };
  } catch (error) {
    console.error("Could not build session URLs:", error);
    return { whatsAppUrl: null, invoiceRequestUrl: null };
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const { whatsAppUrl, invoiceRequestUrl } = await getSessionUrls(sessionId);

  return (
    <main className="er-status-page er-status-success">
      <section className="er-status-panel">
        <Image src="/elite-route-logo.jpg" alt="Elite Route" width={152} height={152} className="er-status-logo" />
        <p className="er-status-kicker">Secure payment received</p>
        <h1>Your booking request is paid.</h1>
        <p>
          Send the payment confirmation and route details to Elite Route on WhatsApp so the team can
          validate availability and finalize your ride.
        </p>
        {whatsAppUrl ? (
          <a href={whatsAppUrl} className="er-status-link er-status-link-wa">
            Send confirmation by WhatsApp
          </a>
        ) : (
          <Link href="/" className="er-status-link">Back to quote</Link>
        )}
        {invoiceRequestUrl ? (
          <a href={invoiceRequestUrl} className="er-status-invoice-link">
            Optional: request invoice
          </a>
        ) : null}
      </section>
    </main>
  );
}
