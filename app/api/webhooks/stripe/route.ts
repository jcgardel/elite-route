import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { sendPaidBookingNotification } from "@/lib/payment-notifications";
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

    try {
      const notification = await sendPaidBookingNotification(session);
      console.info("Elite Route payment notification:", {
        sessionId: session.id,
        sent: notification.sent,
        sentToWebhook: notification.sentToWebhook,
        sentToWhatsApp: notification.sentToWhatsApp,
      });
    } catch (error) {
      console.error("Elite Route payment notification error:", error);
    }
  }

  return NextResponse.json({ received: true });
}
