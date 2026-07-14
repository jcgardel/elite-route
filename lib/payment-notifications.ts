import type Stripe from "stripe";

async function sendEmailNotification(session: Stripe.Checkout.Session, message: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_NOTIFY_TO || "jcgd.31@gmail.com";
  if (!apiKey) return false;

  const meta = session.metadata || {};
  const htmlBody = message
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Elite Route <notificaciones@eliteroute.mx>",
      to: [to],
      subject: `✅ Pago confirmado · ${meta.fullName || "Cliente"} · ${meta.serviceDate || ""}`,
      html: `<pre style="font-family:monospace;font-size:14px;line-height:1.6">${htmlBody}</pre>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email notification failed with ${response.status}: ${body}`);
  }

  return true;
}

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

export async function sendClientConfirmationEmail(session: Stripe.Checkout.Session) {
  const apiKey = process.env.RESEND_API_KEY;
  const clientEmail = session.customer_details?.email;
  if (!apiKey || !clientEmail) return false;

  const meta = session.metadata || {};
  const total = formatMoney(session.amount_total, session.currency);
  const vehicle = meta.vehicle || meta.category || "Vehículo ejecutivo";
  const serviceLabel = meta.serviceLabel || "Traslado ejecutivo";
  const dateTime = [meta.serviceDate, meta.serviceTime].filter(Boolean).join(" · ");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#080808;font-family:Arial,sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #2e2e2e;max-width:520px;width:100%">
            <!-- Header -->
            <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #1e1e1e">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8A46B">Elite Route · Ciudad de México</p>
              <h1 style="margin:0;font-size:26px;font-weight:300;color:#ffffff;line-height:1.2">Tu traslado está confirmado</h1>
            </td></tr>
            <!-- Body -->
            <tr><td style="padding:28px 40px">
              <p style="margin:0 0 20px;font-size:14px;color:#BFC3C8;line-height:1.7">
                Hola <strong style="color:#fff">${meta.fullName || "cliente"}</strong>, tu pago fue procesado exitosamente.
                Un agente de Elite Route confirmará disponibilidad y te enviará los detalles del chofer por WhatsApp.
              </p>

              <!-- Detalles del servicio -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #2e2e2e;margin-bottom:20px">
                <tr><td style="padding:14px 18px;border-bottom:1px solid #1e1e1e">
                  <p style="margin:0;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#555">Detalles del servicio</p>
                </td></tr>
                ${dateTime ? `<tr><td style="padding:10px 18px;border-bottom:1px solid #161616;display:flex;justify-content:space-between">
                  <span style="font-size:13px;color:#777">Fecha y hora</span>
                  <span style="font-size:13px;color:#fff;float:right">${dateTime}</span>
                </td></tr>` : ""}
                <tr><td style="padding:10px 18px;border-bottom:1px solid #161616">
                  <span style="font-size:13px;color:#777">Tipo</span>
                  <span style="font-size:13px;color:#fff;float:right">${serviceLabel}</span>
                </td></tr>
                <tr><td style="padding:10px 18px;border-bottom:1px solid #161616">
                  <span style="font-size:13px;color:#777">Origen</span>
                  <span style="font-size:13px;color:#fff;float:right">${meta.origin || "—"}</span>
                </td></tr>
                ${meta.destination && meta.destination !== "Disposición libre" ? `<tr><td style="padding:10px 18px;border-bottom:1px solid #161616">
                  <span style="font-size:13px;color:#777">Destino</span>
                  <span style="font-size:13px;color:#fff;float:right">${meta.destination}</span>
                </td></tr>` : ""}
                <tr><td style="padding:10px 18px;border-bottom:1px solid #161616">
                  <span style="font-size:13px;color:#777">Vehículo</span>
                  <span style="font-size:13px;color:#fff;float:right">${vehicle}</span>
                </td></tr>
                <tr><td style="padding:14px 18px;background:#0a0a0a">
                  <span style="font-size:13px;color:#fff;font-weight:700">Total pagado</span>
                  <span style="font-size:16px;color:#C8A46B;font-weight:700;float:right">${total}</span>
                </td></tr>
              </table>

              <p style="margin:0 0 8px;font-size:12px;color:#555;line-height:1.6">
                Referencia de pago: <span style="color:#888;font-family:monospace">${session.id}</span>
              </p>
              <p style="margin:0;font-size:12px;color:#555;line-height:1.6">
                ¿Necesitas factura CFDI? Escríbenos a
                <a href="mailto:contabilidad@eliteroute.mx" style="color:#C8A46B;text-decoration:none">contabilidad@eliteroute.mx</a>
              </p>
            </td></tr>
            <!-- Footer -->
            <tr><td style="padding:20px 40px;border-top:1px solid #1e1e1e;text-align:center">
              <p style="margin:0;font-size:11px;color:#444;line-height:1.8">
                Elite Route CDMX · <a href="https://eliteroute.mx" style="color:#C8A46B;text-decoration:none">eliteroute.mx</a><br>
                business@eliteroute.mx · +52 55 4358 2919
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Elite Route <notificaciones@eliteroute.mx>",
      to: [clientEmail],
      subject: `Tu traslado está confirmado · Elite Route · ${dateTime}`,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Client email failed with ${response.status}: ${body}`);
  }

  return true;
}

export async function sendPaidBookingNotification(session: Stripe.Checkout.Session) {
  const message = buildPaidBookingMessage(session);
  const [sentToWebhook, sentToWhatsApp, sentToEmail] = await Promise.allSettled([
    sendToAutomationWebhook(session, message),
    sendToWhatsAppCloud(message),
    sendEmailNotification(session, message),
  ]).then(results => results.map(r => r.status === "fulfilled" && r.value === true));

  return {
    message,
    sent: sentToWebhook || sentToWhatsApp || sentToEmail,
    sentToWebhook,
    sentToWhatsApp,
    sentToEmail,
  };
}
