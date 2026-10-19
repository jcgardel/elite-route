import "server-only";
import type Stripe from "stripe";
import { GA_ID } from "./analytics";

/**
 * LA CONVERSIÓN SE MANDA DESDE EL SERVIDOR, NO DESDE LA PÁGINA DE GRACIAS.
 *
 * POR QUÉ SE MOVIÓ (19 oct 2026). El embudo estaba instrumentado entero y
 * GA4 recibía los siete eventos previos —cotización iniciada, precio
 * mostrado, pago iniciado…— pero `reserva_pagada` NO aparecía entre los
 * eventos recibidos en 28 días, con 22 reservas pagadas por el cotizador en
 * ese periodo. No era un fallo de código: el evento está en el bundle, GA4
 * carga en /success y la página monta bien la reserva.
 *
 * El motivo es estructural: el evento del cliente depende de que la persona
 * VUELVA al sitio después de pagar. Stripe redirige, pero quien cierra la
 * pestaña en la pantalla de "pago correcto" —cosa habitual en móvil y con
 * monederos— nunca dispara nada. Se perdía la única señal que une una página
 * con una venta.
 *
 * El webhook, en cambio, siempre corre: es el que manda el correo a
 * contabilidad, y Stripe lo reintenta durante días si falla.
 *
 * EXACTAMENTE UNA VEZ POR RESERVA. El disparo del cliente se quitó al meter
 * esto. GA4 no deduplica eventos personalizados por `transaction_id` como sí
 * hace con `purchase`, así que tener los dos contaría cada venta dos veces.
 *
 * NUNCA PUEDE TUMBAR UNA RESERVA. Se llama sin esperar el resultado y traga
 * cualquier error: medir es lo menos importante que ocurre en este webhook.
 */
const MP = "https://www.google-analytics.com/mp/collect";

export async function enviarConversionGa4(session: Stripe.Checkout.Session) {
  const apiSecret = process.env.GA4_API_SECRET;
  const meta = session.metadata || {};
  // Sin secreto o sin identificador no hay a dónde mandarlo. No es un error:
  // el sitio funciona igual, simplemente no se mide.
  if (!apiSecret || !GA_ID) return { sent: false, reason: "sin configurar" };

  // El identificador del navegador viaja en la metadata desde el checkout.
  // Si no lo hay —bloqueador, cookies rechazadas— se manda igual con uno
  // sintético: la venta se cuenta, aunque sin origen. Perder el importe es
  // peor que perder la atribución.
  const clientId = meta.gaClientId || `${Date.now()}.${session.id.slice(-10)}`;

  const params: Record<string, unknown> = {
    transaction_id: meta.folio || session.id,
    value: (session.amount_total ?? 0) / 100,
    currency: (session.currency || "mxn").toUpperCase(),
    vehiculo: meta.vehicle || meta.categoria || "",
    servicio: meta.serviceLabel || meta.serviceType || "",
    idioma: meta.lang || "",
    // Sin `session_id` GA4 abre una sesión nueva y la venta se queda sin
    // fuente. Con él, se pega al recorrido que de verdad trajo a la persona.
    ...(meta.gaSessionId ? { session_id: meta.gaSessionId } : {}),
    engagement_time_msec: 1,
  };

  try {
    const res = await fetch(
      `${MP}?measurement_id=${encodeURIComponent(GA_ID)}&api_secret=${encodeURIComponent(apiSecret)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          non_personalized_ads: true,
          events: [{ name: "reserva_pagada", params }],
        }),
      },
    );
    // El endpoint contesta 204 sin cuerpo aunque el evento esté mal formado:
    // para depurar de verdad hay que usar /debug/mp/collect a mano.
    return { sent: res.ok, status: res.status };
  } catch (error) {
    console.error("Elite Route GA4 conversion error:", error);
    return { sent: false, reason: "error de red" };
  }
}
