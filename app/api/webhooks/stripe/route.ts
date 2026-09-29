import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { sendPaidBookingNotification, sendClientConfirmationEmail } from "@/lib/payment-notifications";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature error:", error);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.info("Elite Route payment completed:", {
      sessionId: session.id,
      amountTotal: session.amount_total,
      customerEmail: session.customer_details?.email,
      metadata: session.metadata,
    });

    const [notificationResult, clientEmailResult] = await Promise.allSettled([
      sendPaidBookingNotification(session),
      sendClientConfirmationEmail(session),
    ]);

    if (notificationResult.status === "fulfilled") {
      console.info("Elite Route operator notification:", {
        sessionId: session.id,
        sent: notificationResult.value.sent,
      });
    } else {
      console.error("Elite Route operator notification error:", notificationResult.reason);
    }

    if (clientEmailResult.status === "fulfilled") {
      console.info("Elite Route client confirmation email sent:", session.customer_details?.email);
    } else {
      console.error("Elite Route client email error:", clientEmailResult.reason);
    }

    /**
     * SI NO SE AVISÓ A NADIE, ESTO NO FUE UN ÉXITO.
     *
     * Antes del 28 de septiembre de 2026 esta ruta contestaba 200 pasara lo
     * que pasara. El único trabajo del webhook es avisar de que entró una
     * reserva; cuando ninguno de los canales lo consigue, devolver 200 es
     * mentirle a Stripe, y su panel enseñaba 0% de error mientras cuatro
     * reservas pagadas se quedaban sin atender.
     *
     * Con un 5xx, Stripe hace dos cosas que aquí valen oro: marca el endpoint
     * en rojo —se ve sin tener que ir a buscarlo— y REINTENTA durante días,
     * así que en cuanto el correo o el WhatsApp vuelvan a funcionar, los
     * avisos pendientes se entregan solos, sin tener que rescatarlos a mano.
     *
     * El cobro no se toca: ya ocurrió y es válido. Lo que se reintenta es el
     * aviso.
     */
    const avisado =
      notificationResult.status === "fulfilled" && notificationResult.value.sent === true;

    if (!avisado) {
      return NextResponse.json(
        { error: "Reserva cobrada pero no se pudo avisar por ningún canal" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
