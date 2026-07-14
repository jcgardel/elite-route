import { NextResponse } from "next/server";
import {
  calculatePrice,
  detectZone,
  isAirportAddress,
  tariffs,
  type Category,
} from "@/lib/booking";
import { getStripe } from "@/lib/stripe";
import { getCheckoutLimiter, getIp } from "@/lib/rate-limit";

const categories = Object.keys(tariffs) as Category[];

function hoursUntil(fecha: string, hora: string) {
  return (new Date(`${fecha}T${hora}`).getTime() - Date.now()) / 3600000;
}

export async function POST(req: Request) {
  const limiter = getCheckoutLimiter();
  if (limiter) {
    const { success } = await limiter.limit(getIp(req));
    if (!success) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const empresa = body.empresa ?? {};
    const rawServices = Array.isArray(body.services) ? body.services : [];

    if (!empresa.nombre?.trim() || !rawServices.length) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const lineItems = [];

    for (let i = 0; i < rawServices.length; i++) {
      const s = rawServices[i];
      const fecha    = String(s.fecha    || "").trim();
      const hora     = String(s.hora     || "").trim();
      const origen   = String(s.origen   || "").trim();
      const destino  = String(s.destino  || "").trim();
      const vehiculo = String(s.vehiculo || "sedan") as Category;
      const km       = Number(s.km)      || 0;
      const minutes  = Number(s.minutes) || 0;

      if (!fecha || !hora || !origen || !destino) {
        return NextResponse.json({ error: `Servicio ${i + 1}: faltan datos` }, { status: 400 });
      }
      if (!categories.includes(vehiculo)) {
        return NextResponse.json({ error: `Servicio ${i + 1}: categoría inválida` }, { status: 400 });
      }

      const h = hoursUntil(fecha, hora);
      if (!Number.isFinite(h) || h < 4) {
        return NextResponse.json(
          { error: `Servicio ${i + 1} (${fecha} ${hora}): requiere al menos 4 horas de anticipación` },
          { status: 400 }
        );
      }

      const airportPickup = isAirportAddress(origen);
      const zone   = detectZone(km);
      const urgent = h <= 6;
      const total  = km > 0
        ? calculatePrice(km, minutes, vehiculo, zone, urgent, "route", 0, airportPickup)
        : Math.round(tariffs[vehiculo].min * (airportPickup ? 1.25 : 1) * 1.16);

      const vName = tariffs[vehiculo].name;
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "mxn",
          unit_amount: total * 100,
          product_data: {
            name: `Elite Route B2B · ${vName}`,
            description: `${fecha} ${hora} · ${origen.slice(0, 60)} → ${destino.slice(0, 60)}`,
          },
        },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

    // Metadata compatible con buildPaidBookingMessage — usa primer servicio para resumen
    const first = rawServices[0];
    const firstVehiculo = String(first.vehiculo || "sedan") as Category;
    const firstH = hoursUntil(String(first.fecha || ""), String(first.hora || ""));

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "if_required",
      phone_number_collection: { enabled: true },
      line_items: lineItems,
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/b2b/cotizar`,
      metadata: {
        tipo:          "b2b",
        fullName:      empresa.nombre.slice(0, 200),
        phone:         (empresa.telefono  || "").slice(0, 50),
        empresa:       empresa.nombre.slice(0, 200),
        rfc:           (empresa.rfc        || "").slice(0, 100),
        responsable:   (empresa.responsable || "").slice(0, 200),
        correoEmpresa: (empresa.correo     || "").slice(0, 200),
        servicios:     String(rawServices.length),
        serviceLabel:  rawServices.length === 1
                         ? "Traslado corporativo"
                         : `${rawServices.length} traslados corporativos`,
        serviceDate:   String(first.fecha   || ""),
        serviceTime:   String(first.hora    || ""),
        origin:        String(first.origen  || "").slice(0, 200),
        destination:   String(first.destino || "").slice(0, 200),
        vehicle:       tariffs[firstVehiculo]?.name || firstVehiculo,
        category:      firstVehiculo,
        km:            String(Number(first.km)      || 0),
        minutes:       String(Number(first.minutes) || 0),
        zone:          detectZone(Number(first.km) || 0),
        urgent:        String(Number.isFinite(firstH) && firstH <= 6),
        airportPickup: String(isAirportAddress(String(first.origen || ""))),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("B2B checkout error:", error);
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}
