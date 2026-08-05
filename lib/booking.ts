export const tariffs = {
  sedan: {
    name: "Sedan",
    km: 28,
    hour: 400,
    min: 600,
    cap: "1-3 passengers · 2 bags",
    capEs: "1-3 pasajeros · 2 maletas",
    tag: "Executive",
  },
  executive: {
    name: "Executive",
    km: 55,
    hour: 600,
    min: 800,
    cap: "1-3 passengers · 3 bags",
    capEs: "1-3 pasajeros · 3 maletas",
    tag: "Premium",
  },
  minivan: {
    name: "Minivan",
    km: 50,
    hour: 580,
    min: 700,
    cap: "4-6 passengers · 4 bags",
    capEs: "4-6 pasajeros · 4 maletas",
    tag: "Group",
  },
  suv: {
    name: "HIGH SUV",
    km: 73.5,
    hour: 900,
    min: 1200,
    cap: "1-6 passengers · 6 bags",
    capEs: "1-6 pasajeros · 6 maletas",
    tag: "Suburban",
  },
};

export type Category = keyof typeof tariffs;
export type Zone = "cdmx" | "semi_foraneo" | "foraneo";
export type ServiceType = "route" | "hour" | "day";

export function detectZone(km: number): Zone {
  if (km > 90) return "foraneo";
  if (km > 40) return "semi_foraneo";
  return "cdmx";
}

export function zoneLabel(z: Zone) {
  return z === "cdmx" ? "Mexico City" : z === "semi_foraneo" ? "AIFA / Toluca" : "Out-of-town";
}

export function zoneLabelEs(z: Zone) {
  return z === "cdmx" ? "CDMX" : z === "semi_foraneo" ? "AIFA / Toluca" : "Foráneo";
}

export function serviceTypeLabel(serviceType: ServiceType, rentalHours: number) {
  if (serviceType === "hour") return `Hourly ride (${rentalHours} hrs)`;
  if (serviceType === "day") return "Full day (10 hrs)";
  return "Point-to-point transfer";
}

export function serviceTypeLabelEs(serviceType: ServiceType, rentalHours: number) {
  if (serviceType === "hour") return `Por horas (${rentalHours} hrs)`;
  if (serviceType === "day") return "Por día (10 hrs)";
  return "Traslado por ruta";
}

/**
 * Detecta si una dirección corresponde a AICM T1/T2, AIFA o Aeropuerto de Toluca.
 * Solo aplica recargo a aeropuertos de la ZMVM — no a aeropuertos foráneos (GDL, MTY, etc.).
 * El cotizador B2B usa la misma lógica con recargo 23%; el cotizador online usa 25%.
 */
export function isAirportAddress(address: string): boolean {
  const a = address.toLowerCase();
  return (
    a.includes("aeropuerto internacional benito ju") || // AICM T1/T2
    a.includes("terminal 1") ||
    a.includes("terminal 2") ||
    a.includes("aicm") ||
    a.includes("aifa") ||
    a.includes("felipe ángeles") ||
    a.includes("felipe angeles") ||
    a.includes("aeropuerto internacional de toluca") ||
    a.includes("adolfo lópez mateos") ||
    a.includes("adolfo lopez mateos")
  );
}

/**
 * Profundidad del descuento en los tramos medio (25-90 km) y largo (90 km+)
 * por categoría. Sedan se queda con el descuento original; Executive,
 * Minivan y HIGH SUV llevan uno más profundo para foráneos largos (AIFA,
 * Toluca, Querétaro, Acapulco, etc.) — decisión explícita del negocio, no
 * se derivan unas de otras.
 */
const kmDiscount: Record<Category, { mid: number; far: number }> = {
  sedan: { mid: 0.65, far: 0.50 }, // -35% / -50%
  executive: { mid: 0.58, far: 0.42 }, // -42% / -58%
  minivan: { mid: 0.58, far: 0.42 },
  suv: { mid: 0.58, far: 0.42 },
};

/**
 * Costo del tramo por kilómetro con descuento escalonado, como una tabla
 * de ISR: cada tramo de distancia paga su propia tarifa, no la tarifa
 * completa aplicada retroactivamente a todo el viaje. Así un viaje más
 * largo nunca puede salir más barato que uno más corto.
 *   0-25 km   → tarifa plena
 *   25-90 km  → ese tramo con el descuento "mid" de la categoría
 *   90 km+    → ese tramo con el descuento "far" de la categoría
 */
function kmCost(km: number, ratePerKm: number, category: Category): number {
  const { mid, far } = kmDiscount[category];
  const corta = Math.min(km, 25);
  const media = Math.max(0, Math.min(km, 90) - 25);
  const larga = Math.max(0, km - 90);
  return corta * ratePerKm + media * ratePerKm * mid + larga * ratePerKm * far;
}

export function calculatePrice(
  km: number,
  minutes: number,
  category: Category,
  serviceType: ServiceType,
  rentalHours: number,
  airport = false,
) {
  const tariff = tariffs[category];
  let base = 0;

  if (serviceType === "hour") {
    base = Math.max(rentalHours * tariff.hour, tariff.min);
  } else if (serviceType === "day") {
    base = Math.max(10 * tariff.hour, tariff.min);
  } else {
    const hours = Math.ceil((minutes / 60) * 2) / 2;
    base = Math.max(kmCost(km, tariff.km, category), hours * tariff.hour, tariff.min);
  }

  if (airport) base *= 1.25;
  return Math.round(base * 1.16);
}
