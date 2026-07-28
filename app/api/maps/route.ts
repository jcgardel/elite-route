import { NextResponse } from "next/server";
import { getMapsLimiter, getIp } from "@/lib/rate-limit";
import { lookupRouteDistance, RouteLookupError } from "@/lib/distance";

export async function POST(req: Request) {
  const limiter = getMapsLimiter();
  if (limiter) {
    const { success } = await limiter.limit(getIp(req));
    if (!success) {
      return NextResponse.json({ error: "Demasiadas solicitudes, espera un momento" }, { status: 429 });
    }
  }

  try {
    const { origin, destination } = await req.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origen y destino son obligatorios" },
        { status: 400 },
      );
    }

    const { km, minutes } = await lookupRouteDistance(String(origin), String(destination));
    return NextResponse.json({ km, minutes });
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
