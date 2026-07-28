/**
 * Consulta de distancia contra Google Distance Matrix.
 *
 * El precio se deriva de los kilómetros, así que la distancia nunca debe
 * tomarse del cliente: el navegador puede enviar cualquier valor. Las rutas
 * de checkout la vuelven a pedir aquí antes de cobrar.
 */

export type RouteDistance = { km: number; minutes: number };

export class RouteLookupError extends Error {
  readonly status: string;

  constructor(message: string, status: string) {
    super(message);
    this.name = "RouteLookupError";
    this.status = status;
  }
}

export function getMapsKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  );
}

export async function lookupRouteDistance(
  origin: string,
  destination: string,
): Promise<RouteDistance> {
  const key = getMapsKey();
  if (!key) {
    throw new RouteLookupError("Falta configurar GOOGLE_MAPS_API_KEY", "NO_KEY");
  }

  const params = new URLSearchParams({ origins: origin, destinations: destination, key });
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`,
  );
  const data = await response.json();

  if (data?.status && data.status !== "OK") {
    console.error("Google Distance Matrix error:", {
      status: data.status,
      errorMessage: data.error_message,
    });
    throw new RouteLookupError(
      data.error_message || "Google rechazó la solicitud de ruta",
      data.status,
    );
  }

  const element = data?.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") {
    console.error("Google route element error:", {
      status: element?.status,
      origin,
      destination,
    });
    throw new RouteLookupError("No se pudo calcular la ruta", element?.status || "UNKNOWN");
  }

  return {
    // Un decimal, igual que la cotización que ve el cliente, para que el
    // total cobrado coincida con el que se le mostró.
    km: Number((element.distance.value / 1000).toFixed(1)),
    minutes: Math.ceil(element.duration.value / 60),
  };
}
