import { NextResponse } from "next/server";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import { getCheckoutLimiter, getIp } from "@/lib/rate-limit";
import {
  calculatePrice,
  precioRedondo,
  detectZone,
  isAirportAddress,
  serviceTypeLabelEs,
  vehicles,
  CATEGORIES,
  type Category,
  type ServiceType,
} from "@/lib/booking";
import { getStripe } from "@/lib/stripe";
import { DEFAULT_LANG, isLang, path } from "@/lib/i18n";
import { MIN_ADVANCE_HOURS, NOTAS_MAX, VUELO_MAX, esVueloValido } from "@/lib/booking-form";
import { lookupRouteDistance, RouteLookupError } from "@/lib/distance";
import {
  HORAS_DIA_COMPLETO,
  kmIncluidos,
  admiteRedondo,
  REDONDO_HORAS_CORTESIA,
  REDONDO_HORAS_MAX,
} from "@/lib/service-limits";

const categories = CATEGORIES;
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
    // Solicitudes extra del cliente. Opcional y sin validar contra nada: es
    // texto libre a propósito. Se recorta aquí y no sólo en el navegador
    // porque el límite del formulario no obliga a nadie que llame a la API
    // directamente, y de aquí sale hacia Stripe, el correo y WhatsApp.
    const notes = String(body.notes || "").trim().slice(0, NOTAS_MAX);
    // Viaje redondo foráneo. Se lee aquí y se valida más abajo, cuando ya se
    // conocen los kilómetros que midió el servidor.
    const quiereRedondo = Boolean(body.redondo);
    const horasEspera = Number(body.horasEspera);
    const flightNumber = String(body.flightNumber || "").trim().toUpperCase().slice(0, VUELO_MAX);

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

    // La LLEGADA a una terminal se mira aparte y NO toca el precio: el
    // recargo cubre estacionamiento y espera al salir del aeropuerto, y un
    // traslado hacia allá no los necesita. Sirve sólo para exigir el vuelo.
    const airportDropoff =
      serviceType === "route" && (isAirportAddress(destination) || Boolean(body.airportDropoff));

    // Sin número de vuelo no se puede monitorear el vuelo, que es lo que el
    // sitio promete en el hero, en el FAQ y en las páginas de ruta. Se
    // comprueba también aquí porque la validación del navegador no obliga a
    // quien llame a la API directamente.
    if ((airportPickup || airportDropoff) && !esVueloValido(flightNumber)) {
      return NextResponse.json(
        { error: "El número de vuelo es obligatorio en traslados de aeropuerto" },
        { status: 400 },
      );
    }

    const startsAt = new Date(`${serviceDate}T${serviceTime}`);
    const hoursUntilService = (startsAt.getTime() - Date.now()) / 3600000;
    if (!Number.isFinite(hoursUntilService) || hoursUntilService < MIN_ADVANCE_HOURS) {
      return NextResponse.json({ error: `El servicio requiere al menos ${MIN_ADVANCE_HOURS} horas de anticipación` }, { status: 400 });
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
      const allowedKm = kmIncluidos(serviceType === "day" ? HORAS_DIA_COMPLETO : rentalHours);
      if (km > allowedKm) {
        return NextResponse.json(
          { error: `Este servicio incluye hasta ${allowedKm} km. La ruta calculada es de ${km} km.` },
          { status: 400 },
        );
      }
    }

    // EL VIAJE REDONDO, validado contra los kilómetros del servidor.
    //
    // Se RECHAZA en vez de caer al traslado sencillo, y la dirección importa:
    // caer al sencillo cobraría la mitad del servicio a quien cree haber
    // reservado ida y vuelta, y eso se descubre con el chofer ya en la puerta.
    // Un 400 se descubre antes de pagar.
    if (quiereRedondo) {
      if (serviceType !== "route") {
        return NextResponse.json(
          { error: "El viaje redondo sólo aplica a traslados" },
          { status: 400 },
        );
      }
      if (!admiteRedondo(km)) {
        return NextResponse.json(
          { error: "El viaje redondo sólo aplica a destinos foráneos" },
          { status: 400 },
        );
      }
      if (
        !Number.isInteger(horasEspera) ||
        horasEspera < REDONDO_HORAS_CORTESIA ||
        horasEspera > REDONDO_HORAS_MAX
      ) {
        return NextResponse.json(
          { error: `La espera debe ser de entre ${REDONDO_HORAS_CORTESIA} y ${REDONDO_HORAS_MAX} horas` },
          { status: 400 },
        );
      }
    }

    const zone = detectZone(km);
    const price = quiereRedondo
      ? precioRedondo(km, minutes, category, horasEspera, airportPickup)
      : calculatePrice(km, minutes, category, serviceType, rentalHours, airportPickup);
    if (price <= 0) {
      return NextResponse.json({ error: "No se pudo calcular el total" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    // Stripe devuelve al cliente al idioma en el que reservó. Si el cuerpo no
    // trae idioma —una petición vieja o manipulada— cae al de por defecto en
    // lugar de fallar: nadie debe perder un pago por esto.
    const lang = isLang(String(body.lang)) ? (body.lang as "en" | "es") : DEFAULT_LANG;
    const vehicle = vehicles[category].name;
    // EL NOMBRE DEL SERVICIO LO DICE TODO, y no es cosmético: esta cadena es
    // la que viaja a Stripe, al correo del cliente, al aviso de Telegram y al
    // de WhatsApp. Si un redondo llega rotulado "Traslado punto a punto", el
    // chofer deja al pasajero y se va. Lleva las horas dentro por lo mismo:
    // saber que espera no basta, hay que saber cuánto.
    const serviceLabel = quiereRedondo
      ? `Viaje redondo foráneo · ${horasEspera} h de espera`
      : serviceTypeLabelEs(serviceType, rentalHours);

    const stripe = getStripe();
    /** Todo lo que hace falta para operar el servicio, en un solo sitio. */
    const reserva = {
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
      airportDropoff: String(airportDropoff),
      redondo: String(quiereRedondo),
      horasEspera: quiereRedondo ? String(horasEspera) : "",
      flightNumber: trimMetadata(flightNumber),
      notes: trimMetadata(notes),
      priceMxn: String(price),
    };

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
      success_url: `${appUrl}${path(lang, "success")}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${path(lang, "cancel")}`,
      // La MISMA reserva se guarda en DOS sitios de Stripe, y no es
      // duplicar por duplicar: la sesión de Checkout y el cobro son objetos
      // distintos, y la pantalla de "Pagos" —que es donde se mira cuando
      // entra dinero— sólo enseña la del cobro. Sin `payment_intent_data`
      // hay que ir a Desarrolladores → Eventos y leer un JSON para saber qué
      // reservó el cliente. Eso es exactamente lo que pasó el 28 de
      // septiembre de 2026 con cuatro reservas reales.
      payment_intent_data: { metadata: reserva },
      metadata: reserva,
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
