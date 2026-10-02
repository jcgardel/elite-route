import { NextResponse } from "next/server";
import { getMapsLimiter, getIp } from "@/lib/rate-limit";
import { lookupRouteDistance, RouteLookupError } from "@/lib/distance";
import { calculatePrice, precioHoraExtraRedondo, precioRedondo } from "@/lib/booking";
import { CATEGORIES, isAirportAddress } from "@/lib/vehicles";
import { admiteRedondo, REDONDO_HORAS_CORTESIA } from "@/lib/service-limits";
import type { PrecioPorCategoria, TablasRedondo } from "@/lib/rate-tables";

/**
 * Devuelve la ruta y, con ella, el precio de las cuatro categorías.
 *
 * El precio viaja aquí y no se calcula en el navegador porque calcularlo ahí
 * obligaba a bajar el tarifario completo —costo por kilómetro, tarifa por
 * hora, mínimo y descuentos por tramo— dentro del JavaScript del sitio, al
 * alcance de cualquiera que abriera las herramientas de desarrollo. Se
 * mandan las cuatro de una vez para que cambiar de vehículo sea instantáneo
 * y no dispare otra petición.
 *
 * Esto no es una vía para cobrar: el importe que se le pasa a Stripe lo
 * vuelve a calcular /api/checkout con sus propios datos.
 */
export async function POST(req: Request) {
  const limiter = getMapsLimiter();
  if (limiter) {
    const { success } = await limiter.limit(getIp(req));
    if (!success) {
      return NextResponse.json({ error: "Demasiadas solicitudes, espera un momento" }, { status: 429 });
    }
  }

  try {
    const { origin, destination, airportPickup } = await req.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origen y destino son obligatorios" },
        { status: 400 },
      );
    }

    const { km, minutes } = await lookupRouteDistance(String(origin), String(destination));

    // La misma regla que /api/checkout, letra por letra. El texto del origen
    // no basta: cuando el cliente elige el AICM en el desplegable de Google,
    // el campo se llena con la dirección de la calle ("Av. Capitán Carlos
    // León S/N, Peñón de los Baños…"), que no dice "aeropuerto" por ningún
    // lado. Por eso la interfaz manda además lo que Google confirmó como
    // aeropuerto. Se suma con OR y nunca se resta: la bandera del cliente
    // sólo puede AÑADIR el recargo, así que mentir encarece, no abarata.
    const airport = isAirportAddress(String(origin)) || Boolean(airportPickup);
    const prices = Object.fromEntries(
      CATEGORIES.map((c) => [c, calculatePrice(km, minutes, c, "route", 0, airport)]),
    );

    // El viaje redondo sólo existe en las foráneas, y quien lo decide es la
    // distancia que acaba de medir el servidor —no una bandera del cliente—.
    // Va resuelto en las cuatro categorías para que el selector de horas se
    // mueva sin pedir nada más. /api/checkout lo vuelve a comprobar todo: esto
    // es para pintar, no para cobrar.
    const porCat = (fn: (c: (typeof CATEGORIES)[number]) => number) =>
      Object.fromEntries(CATEGORIES.map((c) => [c, fn(c)])) as PrecioPorCategoria;
    const redondo: TablasRedondo | null = admiteRedondo(km)
      ? {
          base: porCat((c) => precioRedondo(km, minutes, c, REDONDO_HORAS_CORTESIA, airport)),
          horaExtra: porCat(precioHoraExtraRedondo),
        }
      : null;

    return NextResponse.json({ km, minutes, airport, prices, redondo });
  } catch (error) {
    if (error instanceof RouteLookupError) {
      return NextResponse.json(
        { error: error.message, status: error.status },
        { status: error.status === "NO_KEY" ? 500 : 400 },
      );
    }

    return NextResponse.json(
      { error: "Error interno al calcular ruta" },
      { status: 500 },
    );
  }
}
