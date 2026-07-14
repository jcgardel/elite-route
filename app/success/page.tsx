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

  // Sin sesión válida — fallback simple
  if (!whatsAppUrl) {
    return (
      <main style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#fff", textAlign: "center", padding: "24px" }}>
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

  return <SuccessClient whatsAppUrl={whatsAppUrl} invoiceRequestUrl={invoiceRequestUrl} />;
}
