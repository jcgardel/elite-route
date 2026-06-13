import type Stripe from "stripe";

function formatMoney(amountTotal: number | null, currency: string | null) {
  const amount = (amountTotal || 0) / 100;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: (currency || "mxn").toUpperCase(),
  }).format(amount);
}

export function buildPaidBookingMessage(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {};

  return [
    "✅ *Pago confirmado · Elite Route*",
    "",
    `Stripe: ${session.id}`,
    `Total pagado: ${formatMoney(session.amount_total, session.currency)}`,
    "",
    "*Cliente*",
    `Nombre: ${meta.fullName || "—"}`,
    `Tel: ${meta.phone || "—"}`,
    "",
    "*Servicio*",
    `Tipo: ${meta.serviceLabel || meta.serviceType || "—"}`,
    `Fecha: ${meta.serviceDate || "—"} ${meta.serviceTime || ""}`.trim(),
    `Origen: ${meta.origin || "—"}`,
    `Destino: ${meta.destination || "—"}`,
    "",
    "*Ruta y unidad*",
    `Vehículo: ${meta.vehicle || meta.category || "—"}`,
    `Zona: ${meta.zone || "—"}`,
    `Distancia: ${meta.km || "—"} km`,
    `Tiempo estimado: ${meta.minutes || "—"} min`,
    meta.urgent === "true" ? "Reserva próxima: cargo de urgencia aplicado" : "",
  ].filter(Boolean).join("\n");
}

async function sendToAutomationWebhook(session: Stripe.Checkout.Session, message: string) {
  const url = process.env.WHATSAPP_NOTIFY_WEBHOOK_URL;
  if (!url) return false;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "checkout.session.completed",
      message,
      sessionId: session.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      customer: session.customer_details,
      booking: session.metadata,
    }),
  });

  if (!response.ok) {
    throw new Error(`Notification webhook failed with ${response.status}`);
  }

  return true;
}

async function sendToWhatsAppCloud(message: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_NOTIFY_TO;
  if (!token || !phoneNumberId || !to) return false;

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: message },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WhatsApp notification failed with ${response.status}: ${body}`);
  }

  return true;
}

export async function sendPaidBookingNotification(session: Stripe.Checkout.Session) {
  const message = buildPaidBookingMessage(session);
  const sentToWebhook = await sendToAutomationWebhook(session, message);
  const sentToWhatsApp = await sendToWhatsAppCloud(message);

  return {
    message,
    sent: sentToWebhook || sentToWhatsApp,
    sentToWebhook,
    sentToWhatsApp,
  };
}
