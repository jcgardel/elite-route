import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { origin, destination } = await req.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origen y destino son obligatorios" },
        { status: 400 },
      );
    }

    const key =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "Falta configurar GOOGLE_MAPS_API_KEY" },
        { status: 500 },
      );
    }

    const params = new URLSearchParams({
      origins: origin,
      destinations: destination,
      key,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`,
    );
    const data = await response.json();
    const element = data?.rows?.[0]?.elements?.[0];

    if (data?.status && data.status !== "OK") {
      console.error("Google Distance Matrix error:", {
        status: data.status,
        errorMessage: data.error_message,
      });

      return NextResponse.json(
        {
          error: data.error_message || "Google rechazó la solicitud de ruta",
          status: data.status,
        },
        { status: 400 },
      );
    }

    if (!element || element.status !== "OK") {
      console.error("Google route element error:", {
        status: element?.status,
        origin,
        destination,
      });

      return NextResponse.json(
        {
          error: "No se pudo calcular la ruta",
          status: element?.status || "UNKNOWN",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      km: element.distance.value / 1000,
      minutes: Math.ceil(element.duration.value / 60),
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno al calcular ruta" },
      { status: 500 },
    );
  }
}
