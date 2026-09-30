import type Stripe from "stripe";
import { LEGAL } from "./legal";
import { buildGoogleCalendarUrl, buildIcs, tituloParaOperador, type EventoReserva } from "./calendar";

/**
 * Escapa el texto que escribió el cliente antes de meterlo en un correo.
 *
 * Los avisos se arman concatenando cadenas dentro de HTML, así que cualquier
 * dato que venga del formulario —el nombre, la dirección y ahora las
 * solicitudes extra, que son texto libre— podría cerrar una etiqueta y meter
 * marcado en el correo que abre el dueño. Escapar aquí es más barato que
 * confiar en que ningún cliente escriba un signo de menor que.
 */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * A dónde va el aviso de cada reserva pagada. Lo fijó el dueño el 28 de
 * septiembre de 2026, después de que cuatro reservas reales pasaran sin que
 * nadie se enterara.
 *
 * Son valores por defecto EN EL CÓDIGO, no sólo variables de entorno, a
 * propósito: una variable que falta deja el aviso sin destino y el sistema
 * se calla. Con esto, lo peor que puede pasar es que el aviso llegue al sitio
 * correcto. Las variables siguen mandando si existen, para poder cambiar el
 * destino sin desplegar.
 */
const AVISO_CORREO = LEGAL.correoComercial;
const AVISO_WHATSAPP = LEGAL.whatsapp.replace(/[^0-9]/g, "");

/**
 * La reserva convertida en evento de agenda PARA EL DUEÑO.
 *
 * El traslado de aeropuerto suele ser de madrugada, y lo que de verdad evita
 * un servicio perdido es que la cita entre sola en el teléfono. Por eso el
 * aviso lleva botón y adjunto: el botón para quien usa Google Calendar, el
 * `.ics` para cualquier otro y para el iPhone.
 */
function eventoDeLaReserva(session: Stripe.Checkout.Session): EventoReserva | null {
  const meta = session.metadata || {};
  const fecha = String(meta.serviceDate || "");
  const hora = String(meta.serviceTime || "");
  if (!fecha || !hora) return null;

  const origen = String(meta.origin || "");
  const destino = String(meta.destination || "");
  const minutos = Number(meta.minutes);

  const detalle = [
    `Cliente: ${meta.fullName || "—"}`,
    `Teléfono: ${meta.phone || "—"}`,
    `Vehículo: ${meta.vehicle || meta.category || "—"}`,
    `Servicio: ${meta.serviceLabel || meta.serviceType || "—"}`,
    `Total pagado: ${formatMoney(session.amount_total, session.currency)}`,
    "",
    `Origen: ${origen || "—"}`,
    `Destino: ${destino || "—"}`,
    ...(meta.flightNumber ? [`Vuelo: ${meta.flightNumber}`] : []),
    ...(meta.notes ? ["", `Solicitudes: ${meta.notes}`] : []),
    "",
    `Stripe: ${session.id}`,
  ];

  return {
    titulo: tituloParaOperador(String(meta.fullName || ""), origen, destino),
    detalle,
    lugar: origen,
    fecha,
    hora,
    // La duración real de la ruta cuando se conoce; si el servicio es por
    // horas no hay trayecto que medir y el bloque por defecto sirve.
    minutos: Number.isFinite(minutos) && minutos > 0 ? minutos : undefined,
    // El id de Stripe como UID: si el aviso se reintenta —y ahora se
    // reintenta— el calendario reconoce el mismo evento y no lo duplica.
    uid: `${session.id}@eliteroute.mx`,
    aviso: "Traslado Elite Route",
    recordatorios: [1440, 120],
  };
}

async function sendEmailNotification(session: Stripe.Checkout.Session, message: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_NOTIFY_TO || AVISO_CORREO;
  if (!apiKey) return false;

  const meta = session.metadata || {};
  // Se escapa PRIMERO y se da formato después: al revés, el <strong> que
  // acabamos de poner se convertiría en texto visible.
  const htmlBody = escapeHtml(message)
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  // El calendario. Si la reserva no trae fecha y hora utilizables, el aviso
  // sale igual: perder el botón es molesto, perder el correo entero no.
  const evento = eventoDeLaReserva(session);
  const ics = evento ? buildIcs(evento) : null;
  const googleUrl = evento ? buildGoogleCalendarUrl(evento) : null;

  const botonCalendario = googleUrl
    ? `<div style="margin:18px 0 6px">
         <a href="${googleUrl}" style="display:inline-block;background:#C8A46B;color:#0A0A0A;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;padding:13px 22px;border-radius:2px">Añadir a mi calendario</a>
       </div>
       <p style="margin:0;font-size:12px;color:#777;line-height:1.6">El botón abre Google Calendar. En iPhone o cualquier otra agenda, abre el archivo <strong>reserva.ics</strong> que va adjunto.</p>`
    : "";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Elite Route <notificaciones@eliteroute.mx>",
      to: [to],
      subject: `✅ Pago confirmado · ${meta.fullName || "Cliente"} · ${meta.serviceDate || ""}`.slice(0, 200),
      html: `<pre style="font-family:monospace;font-size:14px;line-height:1.6">${htmlBody}</pre>${botonCalendario}`,
      ...(ics
        ? {
            attachments: [
              {
                filename: "reserva.ics",
                content: Buffer.from(ics, "utf-8").toString("base64"),
                contentType: "text/calendar; charset=utf-8; method=PUBLISH",
              },
            ],
          }
        : {}),
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
    // El vuelo va con el servicio y no al final: es lo que el equipo necesita
    // para monitorear la llegada y ajustar la hora del chofer, y sólo sale en
    // los traslados de aeropuerto.
    ...(meta.flightNumber ? [`✈️ Vuelo: ${meta.flightNumber}`] : []),
    "",
    "*Ruta y unidad*",
    `Vehículo: ${meta.vehicle || meta.category || "—"}`,
    `Zona: ${meta.zone || "—"}`,
    `Distancia: ${meta.km || "—"} km`,
    `Tiempo estimado: ${meta.minutes || "—"} min`,
    // Sólo aparece si el cliente escribió algo: un renglón "Solicitudes: —"
    // en cada aviso enseña a ignorar el renglón, y justo este no conviene
    // que se ignore.
    ...(meta.notes ? ["", "*⚠️ Solicitudes del cliente*", meta.notes] : []),
    // Sin `.filter(Boolean)`: los "" de arriba son los renglones en blanco que
    // separan los bloques, y filtrar por verdadero se los comía todos. El
    // aviso salía como un párrafo apretado de doce renglones seguidos, que es
    // justo lo que no quieres leer a las cuatro de la mañana. Los apartados
    // condicionales ya se omiten solos con el spread de un arreglo vacío, así
    // que el filtro no protegía de nada.
  ].join("\n");
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
  const to = process.env.WHATSAPP_NOTIFY_TO || AVISO_WHATSAPP;
  if (!token || !phoneNumberId) return false;

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

/** Telegram rechaza con 400 cualquier mensaje de más de 4096 caracteres. */
const LIMITE_TELEGRAM = 4096;

/**
 * Recorta por RENGLONES COMPLETOS, nunca a media línea.
 *
 * El texto que se recorta ya viene convertido a HTML, y ahí cortar por el
 * número de caracteres puede partir un `<b>` o un `&amp;` por la mitad.
 * Telegram no perdona eso: responde 400 y se pierde el aviso entero. Perder
 * el último renglón de una nota larguísima es un mal menor sin comparación.
 *
 * Esto es seguro porque el formato en negritas es de un solo renglón (ver
 * `formatearParaTelegram`): ninguna etiqueta cruza un salto de línea.
 */
function recortarPorRenglones(html: string, limite: number) {
  if (html.length <= limite) return html;

  const salida: string[] = [];
  let usado = 0;
  for (const renglon of html.split("\n")) {
    // +1 por el salto de línea, +2 por el "\n…" que cierra el recorte.
    if (usado + renglon.length + 1 > limite - 2) break;
    salida.push(renglon);
    usado += renglon.length + 1;
  }

  return `${salida.join("\n")}\n…`;
}

/**
 * El asterisco se convierte en negrita, pero SÓLO dentro de un mismo renglón.
 *
 * `[^*\n]+` en vez de `[^*]+` no es un detalle de estilo: las solicitudes del
 * cliente son texto libre, y un solo asterisco suelto ahí haría que la
 * negrita se abriera y cruzara varios renglones. Con eso, el recorte de
 * arriba podría dejar un `<b>` sin cerrar y Telegram devolvería 400.
 *
 * Se escapa PRIMERO y se da formato después, igual que en el correo: al revés,
 * el `<b>` que acabamos de poner se convertiría en texto visible.
 */
function formatearParaTelegram(message: string) {
  return escapeHtml(message).replace(/\*([^*\n]+)\*/g, "<b>$1</b>");
}

/**
 * Telegram: el segundo canal de aviso, elegido el 29 de septiembre de 2026.
 *
 * POR QUÉ NO ES WHATSAPP, que era lo que el dueño quería. Meta no permite que
 * un número esté a la vez en la app de WhatsApp y en la Cloud API: al
 * registrarlo en la API, deja de funcionar en el teléfono. El +52 55 4358 2919
 * está en todos los botones del sitio y es por donde le escriben los clientes,
 * así que no puede sacrificarse como remitente del bot, y montar la API exigía
 * dar de alta un número nuevo sólo para eso. Encima, un mensaje que inicia el
 * negocio fuera de la ventana de 24 h no admite texto libre: obliga a una
 * plantilla aprobada por Meta, y una reserva no cabe en huecos de plantilla.
 * Telegram no cobra por mensaje, no pide aprobación y admite el aviso entero.
 *
 * SIN DESTINO POR DEFECTO, al revés que el correo y el WhatsApp. Un `chat_id`
 * es un número opaco que no se puede adivinar; inventarle un respaldo sólo
 * serviría para mandarle la reserva de un cliente a un desconocido. Si falta
 * la variable, este canal se declara "sin configurar" y los demás responden.
 */
async function sendToTelegram(session: Stripe.Checkout.Session, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  // El mismo botón de calendario que lleva el correo. Si la reserva no trae
  // fecha y hora utilizables, el aviso sale igual: perder el enlace es
  // molesto, perder el aviso no.
  const evento = eventoDeLaReserva(session);
  const googleUrl = evento ? buildGoogleCalendarUrl(evento) : null;
  const enlace = googleUrl ? `\n\n<a href="${googleUrl}">📅 Añadir a mi calendario</a>` : "";

  /**
   * Red de seguridad: si el botón no cabe, se cae el botón, nunca la reserva.
   *
   * Hoy no se dispara. La URL de Google lleva dentro el detalle del servicio,
   * y como `buildGoogleCalendarUrl` le puso tope, ni con la nota más larga
   * pasa de unos 1 800 caracteres. Esto está aquí porque ese tope y este
   * límite viven en archivos distintos: el día que alguien suba
   * `TOPE_DETALLE_URL`, Telegram empezaría a rechazar avisos con un 400 y
   * nadie relacionaría una cosa con la otra. Un aviso sin atajo a la agenda
   * sirve; uno rechazado por pasarse de 4096 caracteres no sirve de nada.
   */
  const sufijo = enlace.length <= LIMITE_TELEGRAM / 2 ? enlace : "";

  const cuerpo = recortarPorRenglones(
    formatearParaTelegram(message),
    LIMITE_TELEGRAM - sufijo.length,
  );

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `${cuerpo}${sufijo}`,
      parse_mode: "HTML",
      // Sin esto, el enlace del calendario abre una tarjeta de vista previa
      // enorme que tapa la reserva en la pantalla del teléfono.
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    // El cuerpo de Telegram trae un `description` que dice exactamente qué
    // pasó ("chat not found", "can't parse entities"...). Es justo el dato
    // que faltó en septiembre para poder arreglar los canales caídos.
    const body = await response.text();
    throw new Error(`Telegram notification failed with ${response.status}: ${body}`);
  }

  return true;
}

export async function sendClientConfirmationEmail(session: Stripe.Checkout.Session) {
  const apiKey = process.env.RESEND_API_KEY;
  const clientEmail = session.customer_details?.email;
  if (!apiKey || !clientEmail) return false;

  const meta = session.metadata || {};
  const total = formatMoney(session.amount_total, session.currency);
  // Todo lo que se interpola en el HTML de abajo pasa por escapeHtml: son
  // datos que escribió el cliente en el formulario.
  const vehicle = escapeHtml(meta.vehicle || meta.category || "Vehículo ejecutivo");
  const serviceLabel = escapeHtml(meta.serviceLabel || "Traslado ejecutivo");
  const dateTime = escapeHtml([meta.serviceDate, meta.serviceTime].filter(Boolean).join(" · "));
  const clientName = escapeHtml(meta.fullName || "cliente");
  const originText = escapeHtml(meta.origin || "—");
  const destinationText = escapeHtml(meta.destination || "");
  const notesText = escapeHtml(meta.notes || "");
  const flightText = escapeHtml(meta.flightNumber || "");

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
                Hola <strong style="color:#fff">${clientName}</strong>, tu pago fue procesado exitosamente.
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
                  <span style="font-size:13px;color:#fff;float:right">${originText}</span>
                </td></tr>
                ${destinationText && destinationText !== "Disposición libre" ? `<tr><td style="padding:10px 18px;border-bottom:1px solid #161616">
                  <span style="font-size:13px;color:#777">Destino</span>
                  <span style="font-size:13px;color:#fff;float:right">${destinationText}</span>
                </td></tr>` : ""}
                ${flightText ? `<tr><td style="padding:10px 18px;border-bottom:1px solid #161616">
                  <span style="font-size:13px;color:#777">Vuelo</span>
                  <span style="font-size:13px;color:#fff;float:right">${flightText}</span>
                </td></tr>` : ""}
                <tr><td style="padding:10px 18px;border-bottom:1px solid #161616">
                  <span style="font-size:13px;color:#777">Vehículo</span>
                  <span style="font-size:13px;color:#fff;float:right">${vehicle}</span>
                </td></tr>
                ${notesText ? `<tr><td style="padding:12px 18px;border-bottom:1px solid #161616">
                  <p style="margin:0 0 4px;font-size:13px;color:#777">Tus solicitudes</p>
                  <p style="margin:0;font-size:13px;color:#fff;line-height:1.6">${notesText}</p>
                  <p style="margin:6px 0 0;font-size:11px;color:#555;line-height:1.5">Te confirmamos por WhatsApp si algo cambia el precio.</p>
                </td></tr>` : ""}
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
  // El orden de `canales` tiene que seguir al de `resultados`: es lo que hace
  // que un fallo salga en los registros con el nombre del canal correcto.
  const canales = ["webhook", "whatsapp", "email", "telegram"] as const;
  const resultados = await Promise.allSettled([
    sendToAutomationWebhook(session, message),
    sendToWhatsAppCloud(message),
    sendEmailNotification(session, message),
    sendToTelegram(session, message),
  ]);

  /**
   * POR QUÉ SE GUARDAN LOS MOTIVOS Y NO SÓLO SÍ/NO.
   *
   * Hasta el 28 de septiembre de 2026 esto colapsaba los tres resultados a
   * tres booleanos y tiraba la excepción. Consecuencia real: cuatro reservas
   * pagadas —dos de ellas de un cliente que llegaba en tres días— pasaron sin
   * que nadie se enterara, y no quedó ni un rastro de por qué. Stripe marcaba
   * 200 OK, así que desde su panel todo se veía perfecto.
   *
   * El motivo del fallo es lo único que permite arreglarlo: "el dominio no
   * está verificado en Resend" y "falta la variable de WhatsApp" se atienden
   * de formas distintas, y sin el texto del error no se distinguen.
   */
  const fallos: string[] = [];
  const estado = resultados.map((r, i) => {
    if (r.status === "fulfilled" && r.value === true) return true;
    if (r.status === "rejected") {
      fallos.push(`${canales[i]}: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`);
    } else {
      fallos.push(`${canales[i]}: sin configurar`);
    }
    return false;
  });

  const [sentToWebhook, sentToWhatsApp, sentToEmail, sentToTelegram] = estado;
  const sent = sentToWebhook || sentToWhatsApp || sentToEmail || sentToTelegram;

  if (!sent) {
    // Ruidoso a propósito: este console.error es lo que hace visible en los
    // registros que una reserva cobrada se quedó sin avisar.
    console.error("Elite Route · RESERVA PAGADA SIN AVISAR", {
      sessionId: session.id,
      cliente: session.metadata?.fullName,
      fecha: session.metadata?.serviceDate,
      fallos,
    });
  }

  return { message, sent, sentToWebhook, sentToWhatsApp, sentToEmail, sentToTelegram, fallos };
}
