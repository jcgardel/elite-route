/**
 * Los nombres de aquí son los que ve el cliente en todos lados: tarjetas del
 * cotizador, resumen, mensaje de WhatsApp, cobro en Stripe, correo de
 * confirmación, tabla de tarifas y páginas corporativas. Antes cada página
 * tenía los suyos —/b2b decía "Sedán" y "Ejecutivo" mientras el cotizador
 * decía "Sedan" y "Executive"— y el cliente que comparaba las dos veía dos
 * catálogos distintos.
 *
 * Se escriben en capitalización normal: las tarjetas y las tablas los
 * convierten a mayúsculas con CSS, y así el mismo dato se lee bien en un
 * correo o en el cobro de la tarjeta.
 */
export const tariffs = {
  sedan: {
    name: "Sedan",
    km: 28,
    hour: 400,
    min: 600,
    cap: "1-3 passengers · 2 bags",
    capEs: "1-3 pasajeros · 2 maletas",
    tag: "Nissan · VW",
  },
  executive: {
    name: "Executive",
    km: 55,
    hour: 600,
    min: 800,
    cap: "1-3 passengers · 3 bags",
    capEs: "1-3 pasajeros · 3 maletas",
    tag: "BMW · Mercedes · Tesla",
  },
  minivan: {
    name: "Minivan",
    km: 50,
    hour: 580,
    min: 700,
    cap: "4-6 passengers · 4 bags",
    capEs: "4-6 pasajeros · 4 maletas",
    tag: "Captiva",
  },
  suv: {
    name: "High SUV",
    km: 73.5,
    hour: 900,
    min: 1200,
    cap: "1-6 passengers · 6 bags",
    capEs: "1-6 pasajeros · 6 maletas",
    tag: "Suburban · Escalade",
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

/** Minúsculas y sin acentos, para comparar sin depender de cómo escriba el
 *  nombre Google ("Felipe Ángeles" / "Felipe Angeles") ni el cliente. */
function normalizeAddress(address: string): string {
  return address.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Palabras que identifican un aeropuerto, sea cual sea: el recargo aplica a
 * cualquier aeropuerto y no sólo a los de la ZMVM.
 *
 * No se incluyen nombres que también son de alcaldía, colonia o avenida
 * ("Benito Juárez" es alcaldía; "Adolfo López Mateos" es una avenida enorme en
 * Naucalpan y Santa Fe): esos aeropuertos ya caen con la palabra "aeropuerto"
 * que Google trae en el nombre del lugar, y matcharlos sueltos cobraba el 25%
 * a direcciones que no son aeropuerto.
 */
const AIRPORT_KEYWORDS = [
  "aeropuerto",
  "aeroporto",
  "airport",
  "aerodromo",
  "airfield",
  "air terminal",
  "terminal aerea",
  "terminal 1",
  "terminal 2",
  "terminal 3",
  "terminal 4",
  "aicm",
  "aifa",
  "felipe angeles",
];

/**
 * Siglas IATA que el cliente escribe dentro de una dirección más larga.
 * Sólo van las que no se confunden con abreviatura de ciudad o estado: MEX,
 * GDL, MTY, QRO, MID, VER, OAX, ACA, TAM, DGO y SLP se quedan fuera a
 * propósito ("Méx.", "Ver.", "Oax." aparecen en direcciones normales). Esas
 * siglas sí cuentan cuando el cliente escribe únicamente el código -> EXACT_IATA.
 */
const AIRPORT_CODES =
  /\b(nlu|tlc|cun|sjd|pvr|tij|hmo|cjs|cuu|bjx|zih|hux|mzt|pbc|trc|zcl|mlm|clq|zlo|czm|ctm|vsa|tgz|cul|lmm|agu|ntr)\b/;

/** Cuando el campo trae sólo el código, no hay ambigüedad posible. */
const EXACT_IATA = new Set([
  "mex", "nlu", "tlc", "gdl", "mty", "cun", "qro", "mid", "ver", "oax", "aca",
  "sjd", "pvr", "tij", "hmo", "cjs", "cuu", "bjx", "zih", "hux", "mzt", "pbc",
  "trc", "zcl", "mlm", "clq", "zlo", "czm", "ctm", "vsa", "tgz", "cul", "lmm",
  "agu", "ntr", "tam", "dgo", "slp",
]);

/**
 * Detecta si un texto de dirección corresponde a un aeropuerto — cualquiera,
 * nacional o extranjero — para aplicarle el recargo de estacionamiento y
 * espera por retraso de vuelo.
 */
export function isAirportAddress(address: string): boolean {
  const a = normalizeAddress(address).trim();
  if (!a) return false;
  if (EXACT_IATA.has(a.replace(/[^a-z]/g, ""))) return true;
  if (AIRPORT_KEYWORDS.some((k) => a.includes(k))) return true;
  return AIRPORT_CODES.test(a);
}

type PlaceLike =
  | { name?: string | null; formatted_address?: string | null; types?: string[] | null }
  | null
  | undefined;

/**
 * Detección a partir del lugar que devuelve Google Places, que es la vía
 * confiable: el `formatted_address` del AICM es la dirección de la calle
 * ("Av. Capitán Carlos León S/N, Peñón de los Baños...") y no dice
 * "aeropuerto" por ningún lado — por eso escribir "AICM" no aplicaba el
 * recargo aunque "Terminal 1" sí. Aquí se miran también el tipo de lugar que
 * asigna Google ("airport", válido para cualquier aeropuerto del mundo), el
 * nombre del lugar y lo que el cliente escribió.
 */
export function isAirportPlace(place: PlaceLike, typed = ""): boolean {
  if (place?.types?.includes("airport")) return true;
  return [place?.name, place?.formatted_address, typed].some(
    (text) => typeof text === "string" && isAirportAddress(text),
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
