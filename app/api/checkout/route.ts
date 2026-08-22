import { NextResponse } from "next/server";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import { getCheckoutLimiter, getIp } from "@/lib/rate-limit";
import {
  calculatePrice,
  detectZone,
  isAirportAddress,
  serviceTypeLabelEs,
  tariffs,
  type Category,
  type ServiceType,
} from "@/lib/booking";
import { getStripe } from "@/lib/stripe";
import { lookupRouteDistance, RouteLookupError } from "@/lib/distance";

const categories = Object.keys(tariffs) as Category[];
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
    const serviceType = body.serviceType as ServiceType;
    const rentalHours = Number(body.rentalHours);
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const origin = String(body.origin || "").trim();
    const destination = String(body.destination || "").trim();
    const serviceDate = String(body.serviceDate || "").trim();
    const serviceTime = String(body.serviceTime || "").trim();

    // km, minutes y zone se calculan server-side — no se aceptan del cliente
    if (!categories.includes(category) || !serviceTypes.includes(serviceType)) {
      return NextResponse.json({ error: "Datos de cotización inválidos" }, { status: 400 });
    }

    if (!fullName || !phone || !isValidPhoneNumber(phone)) {
      return NextResponse.json({ error: "Datos de contacto inválidos" }, { status: 400 });
    }

    if (!origin || (serviceType === "route" && !destination) || !serviceDate || !serviceTime) {
      return NextResponse.json({ error: "Faltan datos del servicio" }, { status: 400 });
    }

    if (!Number.isFinite(rentalHours) || rentalHours < 2 || rentalHours > 24) {
      return NextResponse.json({ error: "Duración inválida" }, { status: 400 });
    }

    // El recargo de aeropuerto se vuelve a verificar aquí sobre la dirección:
    // el cliente puede detectarlo por el tipo de lugar de Google (que el
    // servidor no ve), pero no puede quitarlo mandando false.
    const airportPickup = isAirportAddress(origin) || Boolean(body.airportPickup);

    const startsAt = new Date(`${serviceDate}T${serviceTime}`);
    const hoursUntilService = (startsAt.getTime() - Date.now()) / 3600000;
    if (!Number.isFinite(hoursUntilService) || hoursUntilService < 6) {
      return NextResponse.json({ error: "El servicio requiere al menos 6 horas de anticipación" }, { status: 400 });
    }

    // La distancia se vuelve a consultar aquí: el precio depende de los km, así
    // que aceptarlos del cliente permitiría cobrarse la tarifa mínima.
    // Para servicios por hora y por día el recorrido es de disposición libre
    // desde el origen, igual que en el paso de cotización.
    const { km, minutes } = await lookupRouteDistance(
      origin,
      serviceType === "route" ? destination : origin,
    );

    // Tope de kilómetros incluidos, también validado en el servidor.
    if (serviceType !== "route") {
      const allowedKm = serviceType === "day" ? 200 : rentalHours * 20;
      if (km > allowedKm) {
        return NextResponse.json(
          { error: `Este servicio incluye hasta ${allowedKm} km. La ruta calculada es de ${km} km.` },
          { status: 400 },
        );
      }
    }

    const zone = detectZone(km);
    const price = calculatePrice(km, minutes, category, serviceType, rentalHours, airportPickup);
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
        airportPickup: String(airportPickup),
        priceMxn: String(price),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Sin distancia confiable no se cobra: mejor pedir que reintente.
    if (error instanceof RouteLookupError) {
      console.error("Checkout route lookup error:", error.status, error.message);
      return NextResponse.json(
        { error: "No pudimos verificar la ruta. Revisa las direcciones e intenta de nuevo." },
        { status: error.status === "NO_KEY" ? 500 : 400 },
      );
    }

    console.error("Stripe checkout error:", error);
    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ error: "Falta configurar STRIPE_SECRET_KEY" }, { status: 500 });
    }
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}
