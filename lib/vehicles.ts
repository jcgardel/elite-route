/**
 * Lo que el navegador SÍ puede saber: cómo se llama cada vehículo, a cuánta
 * gente lleva y cómo se etiqueta un servicio.
 *
 * Existe por una fuga concreta. `lib/booking.ts` guarda el tarifario —el
 * costo por kilómetro de cada categoría, la tarifa por hora, el mínimo y los
 * descuentos por tramo—, y lo importaban cuatro componentes marcados con
 * "use client". Todo lo que un componente de cliente importa se empaqueta y
 * se descarga en el navegador de cada visitante, así que el tarifario
 * completo viajaba en texto plano dentro del JavaScript del sitio: bastaba
 * abrir las herramientas de desarrollo y buscarlo. Es información interna del
 * negocio.
 *
 * Ahora el tarifario vive sólo en el servidor y aquí se queda lo que la
 * interfaz necesita para pintar: nombres, capacidades y etiquetas. Nada de
 * esto permite reconstruir un precio.
 *
 * La regla para mantenerlo así: si un dato sirve para CALCULAR un precio, va
 * en booking.ts; si sólo sirve para MOSTRARLO, va aquí. Los precios ya
 * calculados no son secretos —están publicados en /tarifas— y pueden cruzar
 * al cliente sin problema; lo que no puede cruzar es la fórmula.
 */

export type Category = "sedan" | "executive" | "minivan" | "suv";
export type Zone = "cdmx" | "semi_foraneo" | "foraneo";
export type ServiceType = "route" | "hour" | "day";

/** El orden en el que se ofrecen, de menor a mayor. */
export const CATEGORIES: readonly Category[] = ["sedan", "executive", "minivan", "suv"];

/**
 * Nombre, capacidad y flota de cada categoría. Se escriben una sola vez: la
 * página corporativa los tenía en español ("Sedán", "Ejecutivo") mientras el
 * cotizador los tenía en inglés, y un cliente que comparaba las dos veía dos
 * catálogos distintos.
 */
export const vehicles: Record<Category, { name: string; cap: string; capEs: string; tag: string }> = {
  sedan: {
    name: "Sedan",
    cap: "1-3 passengers · 2 bags",
    capEs: "1-3 pasajeros · 2 maletas",
    tag: "Nissan · VW",
  },
  executive: {
    name: "Executive",
    cap: "1-3 passengers · 3 bags",
    capEs: "1-3 pasajeros · 3 maletas",
    tag: "BMW · Mercedes · Tesla",
  },
  minivan: {
    name: "Minivan",
    cap: "4-6 passengers · 4 bags",
    capEs: "4-6 pasajeros · 4 maletas",
    tag: "Captiva",
  },
  suv: {
    name: "High SUV",
    cap: "1-6 passengers · 6 bags",
    capEs: "1-6 pasajeros · 6 maletas",
    tag: "Suburban · Escalade",
  },
};

/** Clasifica por distancia, no por precio: sólo dice en qué zona cae la ruta. */
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
 *
 * Vive de este lado porque la interfaz la necesita para avisar en pantalla
 * que la salida es de aeropuerto, y porque decir "esto es un aeropuerto" no
 * revela cuánto cuesta. El recargo que se aplica por serlo sí es del
 * servidor.
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
