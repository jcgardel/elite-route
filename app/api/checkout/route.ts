import { NextResponse } from "next/server";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import { getCheckoutLimiter, getIp } from "@/lib/rate-limit";
import {
  calculatePrice,
  serviceTypeLabelEs,
  tariffs,
  type Category,
  type ServiceType,
  type Zone,
} from "@/lib/booking";
import { getStripe } from "@/lib/stripe";

const categories = Object.keys(tariffs) as Category[];
const zones: Zone[] = ["cdmx", "semi_foraneo", "foraneo"];
const serviceTypes: ServiceType[] = ["route", "hour", "day"];

function trimMetadata(value: string) {
  return value.slice(0, 500);
}

export async function POST(req: Request) {
  const limiter = getCheckoutLimiter();
  if (limiter) {
    const { success } = await limiter.limit(getIp(req));
    if (!success) {
      return NextResponse.json({ error: "Demasiadas solicitudes, espera un momento" }, { status: 429 });
    }
  }

  try {
    const body = await req.json();
    const category = body.category as Category;
    const zone = body.zone as Zone;
    const serviceType = body.serviceType as ServiceType;
    const rentalHours = Number(body.rentalHours);
    const km = Number(body.km);
    const minutes = Number(body.minutes);
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const origin = String(body.origin || "").trim();
    const destination = String(body.destination || "").trim();
    const serviceDate = String(body.serviceDate || "").trim();
    const serviceTime = String(body.serviceTime || "").trim();

    if (!categories.includes(category) || !zones.includes(zone) || !serviceTypes.includes(serviceType)) {
      return NextResponse.json({ error: "Datos de cotización inválidos" }, { status: 400 });
    }

    if (!fullName || !phone || !isValidPhoneNumber(phone)) {
      return NextResponse.json({ error: "Datos de contacto inválidos" }, { status: 400 });
    }

    if (!origin || (serviceType === "route" && !destination) || !serviceDate || !serviceTime) {
      return NextResponse.json({ error: "Faltan datos del servicio" }, { status: 400 });
    }

    if (!Number.isFinite(km) || !Number.isFinite(minutes) || km < 0 || minutes < 0) {
      return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
    }

    if (!Number.isFinite(rentalHours) || rentalHours < 2 || rentalHours > 24) {
      return NextResponse.json({ error: "Duración inválida" }, { status: 400 });
    }

    const startsAt = new Date(`${serviceDate}T${serviceTime}`);
    const hoursUntilService = (startsAt.getTime() - Date.now()) / 3600000;
    if (!Number.isFinite(hoursUntilService) || hoursUntilService < 2) {
      return NextResponse.json({ error: "El servicio requiere al menos 2 horas de anticipación" }, { status: 400 });
    }

    const urgent = hoursUntilService <= 6;
    const price = calculatePrice(km, minutes, category, zone, urgent, serviceType, rentalHours);
    if (price <= 0) {
      return NextResponse.json({ error: "No se pudo calcular el total" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const vehicle = tariffs[category].name;
    const serviceLabel = serviceTypeLabelEs(serviceType, rentalHours);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "if_required",
      phone_number_collection: { enabled: true },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: price * 100,
            product_data: {
              name: `Elite Route · ${vehicle}`,
              description: `${serviceLabel} · ${serviceDate} ${serviceTime}`,
            },
          },
        },
      ],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      metadata: {
        fullName: trimMetadata(fullName),
        phone: trimMetadata(phone),
        serviceType,
        serviceLabel: trimMetadata(serviceLabel),
        serviceDate,
        serviceTime,
        origin: trimMetadata(origin),
        destination: trimMetadata(serviceType === "route" ? destination : "Disposición libre"),
        vehicle,
        category,
        zone,
        km: String(km),
        minutes: String(minutes),
        urgent: String(urgent),
        priceMxn: String(price),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ error: "Falta configurar STRIPE_SECRET_KEY" }, { status: 500 });
    }
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}
