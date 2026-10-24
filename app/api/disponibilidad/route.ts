import { NextResponse } from "next/server";
import { hayHueco, ventanaDeOcupacion } from "@/lib/agenda";
import { getMapsLimiter } from "@/lib/rate-limit";
import { CATEGORIES, type Category } from "@/lib/vehicles";

/**
 * ¿Queda alguna unidad de esta categoría libre a esa hora?
 *
 * Lo consulta el cotizador en cuanto el visitante elige una categoría con
 * flota limitada y ya tiene fecha y hora. Contesta rápido y nunca bloquea
 * una venta por un fallo propio: ante cualquier duda dice que sí hay hueco
 * (ver lib/agenda.ts).
 *
 * El bloqueo DE VERDAD vive en /api/checkout. Esto es para avisar antes,
 * no para proteger: un formulario no obliga a nadie.
 */
export async function POST(req: Request) {
  try {
    const limiter = getMapsLimiter();
    if (limiter) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
      const { success } = await limiter.limit(ip);
      if (!success) return NextResponse.json({ libre: true }, { status: 200 });
    }

    const b = await req.json();
    const category = b.category as Category;
    if (!CATEGORIES.includes(category)) return NextResponse.json({ libre: true });

    const v = ventanaDeOcupacion({
      serviceDate: String(b.serviceDate || ""),
      serviceTime: String(b.serviceTime || ""),
      serviceType: b.serviceType === "hour" || b.serviceType === "day" ? b.serviceType : "route",
      minutes: Number(b.minutes) || 0,
      rentalHours: Number(b.rentalHours) || 0,
      km: Number(b.km) || 0,
      redondo: Boolean(b.redondo),
      horasEspera: Number(b.horasEspera) || 0,
      airportPickup: Boolean(b.airportPickup),
    });
    if (!v) return NextResponse.json({ libre: true });

    const r = await hayHueco(category, v);
    return NextResponse.json(r);
  } catch {
    // Medir disponibilidad es lo menos importante que hace esta ruta.
    return NextResponse.json({ libre: true });
  }
}
