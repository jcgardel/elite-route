import Link from "next/link";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { calculatePrice } from "@/lib/booking";
import { CATEGORIES, vehicles, type Category } from "@/lib/vehicles";
import { path, type Lang } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";
import { ROUTES, ROUTE_KEYS, routePath, type RouteKey } from "@/lib/routes";
import { LEGS } from "@/lib/distances";
import {
  GOOGLE_PLACE_URL,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  REVIEWS,
  TRANSFERS_PER_YEAR,
  YEARS_OPERATING,
} from "@/lib/social-proof";

/**
 * El hub de aeropuertos: la búsqueda genérica, sin destino.
 *
 * Las trece páginas de ruta contestan "del AICM a Polanco". Nadie contestaba
 * "traslado aeropuerto CDMX" a secas, que es lo que escribe quien acaba de
 * comprar el vuelo y todavía no sabe cómo se llama la colonia del hotel.
 * Esa búsqueda caía en /tarifas —una tabla de todos los servicios— o en la
 * portada.
 *
 * Lo que trae que no existía en ninguna parte del sitio: **la llegada**. En
 * qué terminal, cómo se encuentra uno con el chofer, qué pasa si el vuelo se
 * retrasa y hasta cuándo espera. Eso estaba repartido entre el FAQ de
 * /tarifas, los términos y la letra chica de cada página de ruta.
 *
 * Su tabla tiene UNA FILA POR AEROPUERTO, con los dos sentidos y el tiempo a
 * la ciudad. Es una forma que no está en ninguna otra página: /tarifas va
 * por zona, /transporte-ejecutivo-cdmx por servicio y cada página de ruta es
 * un solo trayecto. Si alguna vez esta tabla se vuelve la de /tarifas, sobra
 * una de las dos.
 *
 * NO se publica ninguna distancia: los km salen de lib/distances.ts, que es
 * server-only, y sólo para calcular. La duración sí se publica, como en las
 * páginas de ruta.
 */

const cats: readonly Category[] = CATEGORIES;

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}

/**
 * Las rutas de aeropuerto agrupadas por aeropuerto.
 *
 * Se agrupa leyendo `airport` del lado español en vez de mantener una lista
 * aparte: así, el día que entre una ruta nueva de aeropuerto aparece aquí
 * sola. Las foráneas quedan fuera porque no salen de una terminal.
 */
const GRUPOS: ReadonlyArray<{ key: string; rutas: RouteKey[] }> = ROUTE_KEYS.filter(
  (k) => ROUTES[k].precioUnico !== true,
).reduce<Array<{ key: string; rutas: RouteKey[] }>>((acc, k) => {
  const nombre = ROUTES[k].es.airport;
  const grupo = acc.find((g) => g.key === nombre);
  if (grupo) grupo.rutas.push(k);
  else acc.push({ key: nombre, rutas: [k] });
  return acc;
}, []);

/** El precio más bajo de un grupo de trayectos, en un sentido. */
function menor(rutas: readonly RouteKey[], salidaDeAeropuerto: boolean) {
  return Math.min(
    ...rutas.flatMap((k) =>
      cats.map((c) => calculatePrice(LEGS[k].km, LEGS[k].min, c, "route", 0, salidaDeAeropuerto)),
    ),
  );
}

/** El rango de minutos de un grupo, que es lo único de la distancia que se publica. */
function minutos(rutas: readonly RouteKey[]) {
  const ms = rutas.map((k) => LEGS[k].min);
  return { min: Math.min(...ms), max: Math.max(...ms) };
}

/** Una fila por aeropuerto, con los dos sentidos y el tiempo a la ciudad. */
function filas(lang: Lang) {
  return GRUPOS.map((g) => ({
    grupo: g,
    // El rótulo sale de la ruta, no de esta página: en inglés el AICM se
    // escribe distinto y no hay por qué tenerlo escrito dos veces.
    nombre: ROUTES[g.rutas[0]][lang].airport,
    desde: menor(g.rutas, true),
    hacia: menor(g.rutas, false),
    ...minutos(g.rutas),
  }));
}

/**
 * El rango que declara el JSON-LD: **exactamente las seis cifras que se ven
 * en la tabla**, no todas las combinaciones de categoría y destino.
 *
 * La regla del sitio es no declarar en el esquema un precio que no esté en
 * la página. Esta tabla publica el punto de partida de cada aeropuerto en la
 * categoría más económica, así que el tope del rango es el mayor de esos
 * seis números, no la High SUV desde Toluca —que sí existe, pero se publica
 * en la página de esa ruta, no aquí—.
 */
export function airportPriceRange() {
  const visibles = GRUPOS.flatMap((g) => [menor(g.rutas, true), menor(g.rutas, false)]);
  return { low: Math.min(...visibles), high: Math.max(...visibles) };
}

/** La cortesía tras el aterrizaje, en minutos. Está en los términos. */
const CORTESIA = 60;
const EXTENSION = 30;

const TX = {
  es: {
    navRates: "Tarifas",
    navQuote: "Cotizar",
    navQuoteFull: "Cotizar un traslado de aeropuerto",
    kicker: "Traslados de aeropuerto · Ciudad de México",
    title: "Traslados de aeropuerto en Ciudad de México",
    intro:
      "Recogemos y dejamos en los tres aeropuertos que sirven a la ciudad: el AICM, el AIFA y el de Toluca. Das tu número de vuelo al reservar, lo monitoreamos y el chofer ajusta su hora a la del aterrizaje real. El precio se cierra antes de pagar, con IVA, y no cambia porque el vuelo llegue tarde.",

    factAirportsValue: "3 aeropuertos",
    factAirportsLabel: "AICM, AIFA y Toluca, en los dos sentidos",
    factWaitValue: "1 hora de espera",
    factWaitLabel: "sin costo desde que aterriza tu vuelo",
    factPriceValue: "Precio fijo",
    factPriceLabel: "IVA incluido; el retraso del vuelo no lo mueve",

    tableTitle: "Los tres aeropuertos",
    colAirport: "Aeropuerto",
    colFrom: "Desde el aeropuerto",
    colTo: "Hacia el aeropuerto",
    colTime: "Tiempo a la ciudad",
    mins: (a: number, b: number) => (a === b ? `${a} min` : `${a}–${b} min`),
    tableNote:
      "Precios finales en pesos con IVA incluido, en la categoría más económica; suben según la categoría y el destino. La salida DESDE el aeropuerto cuesta más porque incluye el estacionamiento y la espera por retraso del vuelo; el trayecto hacia el aeropuerto no los necesita. Los tiempos son sin tráfico y dependen de la zona a la que vayas: el cotizador da el precio exacto de tu dirección.",

    arriveTitle: "Cómo es la llegada",
    arrive: [
      "Al reservar nos dejas tu número de vuelo y la terminal. Monitoreamos el vuelo: si se adelanta o se retrasa, la hora del chofer se mueve con él, sin costo y sin que tengas que avisar.",
      "El mismo día te confirmamos por WhatsApp el nombre del chofer y el punto de encuentro exacto de tu terminal.",
      "Sales de la sala de llegadas, escribes por WhatsApp y el chofer se acerca al punto acordado. No hay que buscar una fila ni pedir nada por aplicación.",
      "Si viajas con equipaje voluminoso o con más gente de la prevista, dínoslo al reservar: la categoría se elige por maletas, no sólo por pasajeros.",
    ],

    waitTitle: "Espera y retrasos",
    wait: [
      `El retraso del vuelo lo absorbemos entero y sin costo: el reloj de la espera empieza cuando tu avión ATERRIZA, no a la hora que estaba programado.`,
      `Desde ese aterrizaje tienes ${CORTESIA} minutos de cortesía para encontrarte con el chofer. Es tiempo de sobra para migración, aduana y equipaje en un vuelo normal.`,
      `Si sigues dentro del aeropuerto y nos avisas, la espera se extiende ${EXTENSION} minutos más sin costo. Quien avisa llega a ${CORTESIA + EXTENSION} minutos.`,
      `Si pasan los ${CORTESIA} minutos sin contacto, intentamos localizarte por teléfono, WhatsApp y correo. Sólo si no hay respuesta se marca como no presentado y el chofer se retira.`,
      "Fuera del aeropuerto la cortesía es de 30 minutos desde la hora acordada, con el mismo intento de contacto.",
    ],

    bagsTitle: "Cuánto equipaje entra",
    bagsCopy:
      "La categoría se reserva por lo que llevas, no sólo por cuántos son. Estas son las capacidades reales de cada una.",
    colVehicle: "Vehículo",
    colCap: "Capacidad",

    routesTitle: "A dónde te llevamos",
    routesCopy:
      "Cada destino tiene su propia página, con el precio por categoría en los dos sentidos y las preguntas que se repiten en esa ruta.",

    includedTitle: "Qué incluye",
    included: [
      "Chofer profesional y vehículo en condiciones de operar, con seguro vigente y monitoreo GPS.",
      "Monitoreo del vuelo y ajuste de la hora al aterrizaje real, sin costo.",
      "Estacionamiento y espera en terminal, ya incluidos en la tarifa de salida desde aeropuerto.",
      "Precio fijo con IVA: no cambia por tráfico, horario nocturno ni casetas de la ruta cotizada.",
      "Agua de cortesía, cargadores y climatización.",
      "Factura CFDI a solicitud.",
    ],

    faqTitle: "Preguntas frecuentes",
    faqs: [
      [
        "¿Cuánto cuesta un traslado del aeropuerto a la ciudad?",
        "Depende del aeropuerto, del destino y de la categoría. La tabla de arriba trae el punto de partida de cada aeropuerto en la categoría más económica, y cada página de ruta publica el precio por categoría en los dos sentidos. El cotizador da el número exacto con tu dirección real antes de pedirte cualquier dato de pago.",
      ],
      [
        "¿Recogen en Terminal 1 y en Terminal 2 del AICM?",
        "En las dos. Al confirmar nos dices la terminal y coordinamos el punto de encuentro por WhatsApp el mismo día.",
      ],
      [
        "¿Qué pasa si mi vuelo se retrasa?",
        `Nada, y no cuesta más. Monitoreamos el vuelo con el número que nos das al reservar y el chofer llega a la hora del aterrizaje real. La cortesía de ${CORTESIA} minutos empieza cuando el avión toca tierra, no a la hora programada.`,
      ],
      [
        "¿Cuánto tiempo me espera el chofer?",
        `${CORTESIA} minutos desde que aterriza tu vuelo, y ${EXTENSION} más si nos avisas que sigues dentro del aeropuerto: hasta ${CORTESIA + EXTENSION} minutos en total. Si se cumple el plazo sin contacto, te buscamos por teléfono, WhatsApp y correo antes de marcarlo como no presentado.`,
      ],
      [
        "¿Puedo reservar también el regreso al aeropuerto?",
        "Sí, y es lo más común. Son dos servicios: se cotizan y se confirman por separado, cada uno con su hora. El trayecto hacia el aeropuerto cuesta menos porque no lleva el estacionamiento ni la espera en terminal.",
      ],
      [
        "¿Con cuánta anticipación hay que reservar?",
        "Doce horas como mínimo. Para un vuelo de madrugada, varios vehículos o un grupo con mucho equipaje, conviene avisar antes.",
      ],
      [
        "¿Cabe todo mi equipaje?",
        "Revisa la tabla de capacidades de arriba. En Minivan y High SUV el máximo de pasajeros y el de maletas no caben a la vez: con equipaje completo recomendamos cuatro pasajeros. Si dudas, escríbenos y te decimos qué categoría pedir.",
      ],
    ] as ReadonlyArray<readonly [string, string]>,

    trustTitle: "Quién te va a llevar",
    trustRating: `${GOOGLE_REVIEW_COUNT} reseñas en Google`,
    trustSeeAll: "Ver las reseñas en Google",
    trustYears: `+${YEARS_OPERATING} años`,
    trustYearsLabel: "de experiencia en el sector",
    trustVolume: `+${TRANSFERS_PER_YEAR}`,
    trustVolumeLabel: "viajes por año",
    trustPayValue: "Pago con tarjeta",
    trustPayLabel: "procesado por Stripe; la tarjeta no pasa por este sitio",

    ctaTitle: "Reserva tu traslado de aeropuerto",
    ctaCopy:
      "El cotizador calcula el precio exacto con tu dirección real y te deja pagar con tarjeta. Doce horas de anticipación como mínimo.",
    ctaBtn: "Cotizar ahora",

    alsoTitle: "También te puede servir",
    alsoExecutive: "Transporte ejecutivo",
    alsoChauffeur: "Chofer privado",
    alsoRates: "Todas las tarifas",
    alsoCorporate: "Cuentas corporativas",

    footPay: "Pago seguro con",
    footTerms: "Términos",
    footPrivacy: "Aviso de privacidad",
  },

  en: {
    navRates: "Rates",
    navQuote: "Quote",
    navQuoteFull: "Get a quote for an airport transfer",
    kicker: "Airport transfers · Mexico City",
    title: "Mexico City airport transfers",
    intro:
      "We pick up and drop off at the three airports serving the city: AICM, AIFA and Toluca. You give us your flight number when you book, we track it, and the chauffeur moves to match the actual landing time. The price is closed before you pay, VAT included, and a late flight does not change it.",

    factAirportsValue: "3 airports",
    factAirportsLabel: "AICM, AIFA and Toluca, in both directions",
    factWaitValue: "1 hour of waiting",
    factWaitLabel: "free, from the moment your flight lands",
    factPriceValue: "Fixed price",
    factPriceLabel: "VAT included; a delayed flight does not move it",

    tableTitle: "The three airports",
    colAirport: "Airport",
    colFrom: "From the airport",
    colTo: "To the airport",
    colTime: "Time into the city",
    mins: (a: number, b: number) => (a === b ? `${a} min` : `${a}–${b} min`),
    tableNote:
      "Final prices in Mexican pesos, VAT included, in the most affordable category; they rise with the category and the destination. Leaving FROM the airport costs more because it covers parking and waiting for flight delays; the run towards the airport needs neither. Times are without traffic and depend on the area you are heading to: the quote form gives the exact price for your address.",

    arriveTitle: "What arrival looks like",
    arrive: [
      "When you book you leave us your flight number and terminal. We track the flight: if it comes in early or late, the chauffeur's time moves with it, at no cost and without you having to tell us.",
      "On the day we confirm over WhatsApp the chauffeur's name and the exact meeting point for your terminal.",
      "You walk out of arrivals, message on WhatsApp and the chauffeur comes to the agreed point. No queue to find, nothing to order on an app.",
      "If you are travelling with bulky luggage or more people than planned, tell us when you book: the category is chosen by suitcases, not only by passengers.",
    ],

    waitTitle: "Waiting and delays",
    wait: [
      "We absorb the whole flight delay at no cost: the waiting clock starts when your plane LANDS, not at the time it was scheduled to.",
      `From that landing you have ${CORTESIA} courtesy minutes to meet your chauffeur. On an ordinary flight that is ample time for immigration, customs and baggage.`,
      `If you are still inside the airport and let us know, the wait extends by ${EXTENSION} minutes at no cost. Telling us gets you to ${CORTESIA + EXTENSION} minutes.`,
      `If the ${CORTESIA} minutes pass with no contact, we try to reach you by phone, WhatsApp and email. Only if there is no answer is it marked as a no-show and the chauffeur leaves.`,
      "Away from the airport the courtesy is 30 minutes from the agreed time, with the same attempt to reach you.",
    ],

    bagsTitle: "How much luggage fits",
    bagsCopy:
      "The category is booked for what you are carrying, not only for how many of you there are. These are the real capacities.",
    colVehicle: "Vehicle",
    colCap: "Capacity",

    routesTitle: "Where we take you",
    routesCopy:
      "Each destination has its own page, with the price by category in both directions and the questions that come up on that route.",

    includedTitle: "What it covers",
    included: [
      "A professional chauffeur and a roadworthy vehicle, with current insurance and GPS monitoring.",
      "Flight tracking and the pickup time adjusted to the actual landing, at no cost.",
      "Parking and waiting at the terminal, already covered by the airport pickup fare.",
      "Fixed price with VAT: unchanged by traffic, night hours or tolls on the quoted route.",
      "Complimentary water, chargers and climate control.",
      "CFDI invoice on request.",
    ],

    faqTitle: "Frequently asked",
    faqs: [
      [
        "How much is a transfer from the airport into the city?",
        "It depends on the airport, the destination and the category. The table above gives each airport's starting point in the most affordable category, and every route page publishes the price by category in both directions. The quote form gives the exact figure for your real address before asking for any payment details.",
      ],
      [
        "Do you pick up at AICM Terminal 1 and Terminal 2?",
        "At both. When you confirm you tell us the terminal, and we arrange the meeting point over WhatsApp on the day.",
      ],
      [
        "What happens if my flight is delayed?",
        `Nothing, and it costs no more. We track the flight with the number you give us when booking and the chauffeur arrives for the actual landing. The ${CORTESIA}-minute courtesy starts when the plane touches down, not at the scheduled time.`,
      ],
      [
        "How long will the chauffeur wait?",
        `${CORTESIA} minutes from the moment your flight lands, and ${EXTENSION} more if you tell us you are still inside the airport: up to ${CORTESIA + EXTENSION} minutes in all. If the time runs out with no contact, we look for you by phone, WhatsApp and email before marking it as a no-show.`,
      ],
      [
        "Can I book the return to the airport too?",
        "Yes, and most people do. They are two services: quoted and confirmed separately, each with its own time. The run towards the airport costs less because it carries no terminal parking or waiting.",
      ],
      [
        "How far ahead should I book?",
        "Twelve hours minimum. For an early-morning flight, several vehicles or a group with a lot of luggage, earlier is better.",
      ],
      [
        "Will all my luggage fit?",
        "Check the capacity table above. On the Minivan and the High SUV the maximum passengers and the maximum suitcases do not fit at the same time: with full luggage we recommend four passengers. If you are unsure, write to us and we will tell you which category to ask for.",
      ],
    ] as ReadonlyArray<readonly [string, string]>,

    trustTitle: "Who is driving you",
    trustRating: `${GOOGLE_REVIEW_COUNT} reviews on Google`,
    trustSeeAll: "Read the reviews on Google",
    trustYears: `+${YEARS_OPERATING} years`,
    trustYearsLabel: "of experience in the sector",
    trustVolume: `+${TRANSFERS_PER_YEAR}`,
    trustVolumeLabel: "trips a year",
    trustPayValue: "Card payment",
    trustPayLabel: "handled by Stripe; your card never passes through this site",

    ctaTitle: "Book your airport transfer",
    ctaCopy:
      "The quote form works out the exact price from your real address and lets you pay by card. Twelve hours' notice minimum.",
    ctaBtn: "Get a quote",

    alsoTitle: "You may also need",
    alsoExecutive: "Executive transportation",
    alsoChauffeur: "Private chauffeur",
    alsoRates: "All rates",
    alsoCorporate: "Corporate accounts",

    footPay: "Secure payment with",
    footTerms: "Terms",
    footPrivacy: "Privacy notice",
  },
} as const;

/** Las preguntas, para declararlas en JSON-LD sin reescribirlas. */
export function airportFaqs(lang: Lang) {
  return TX[lang].faqs;
}

const styles = `
  .ap-root { background:#0A0A0A; color:#ECEAE6; min-height:100vh; font-family:var(--font-barlow),sans-serif; font-weight:300; }
  .ap-nav { max-width:1180px; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .ap-nav a { text-decoration:none; }
  .ap-nav-right { display:flex; align-items:center; gap:14px; }
  .ap-nav-link { font-size:11px; letter-spacing:0.12em; color:#BFC3C8; text-transform:uppercase; white-space:nowrap; }
  .ap-nav-link:hover { color:#fff; }
  .ap-nav-cta { border:1px solid #C8A46B; border-radius:2px; padding:10px 16px; color:#fff; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .ap-nav-cta:hover { background:#C8A46B; color:#0A0A0A; }

  .ap-wrap { max-width:900px; margin:0 auto; padding:16px 28px 100px; }

  .ap-kicker { color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin:34px 0 14px; }
  .ap-title { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(34px,5.4vw,56px); line-height:1.06; margin:0 0 20px; text-wrap:balance; }
  .ap-intro { color:#BFC3C8; font-size:17px; line-height:1.7; max-width:64ch; margin:0; }

  .ap-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; max-width:700px; margin:34px 0 0; }
  .ap-fact { border-top:1px solid rgba(255,255,255,0.32); padding-top:14px; }
  .ap-fact-value { font-family:var(--font-barlow-condensed),sans-serif; font-size:21px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }
  .ap-fact-label { color:#BFC3C8; font-size:12px; line-height:1.4; margin-top:4px; }

  .ap-section { margin-top:64px; }
  .ap-h2 { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(26px,3.4vw,34px); line-height:1.15; margin:0 0 18px; color:#fff; text-wrap:balance; }
  .ap-p { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0 0 16px; }

  .ap-table-scroll { overflow-x:auto; }
  .ap-table { width:100%; min-width:540px; border-collapse:collapse; font-size:15px; }
  .ap-table th { text-align:left; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#8B8B87; padding:0 0 12px; border-bottom:1px solid #232323; }
  .ap-table th + th, .ap-table td + td { text-align:right; }
  .ap-table td { border-bottom:1px solid #1a1a1a; padding:14px 0; color:#BFC3C8; font-variant-numeric:tabular-nums; }
  .ap-table td:first-child { color:#fff; }
  .ap-veh-cap { display:block; color:#8B8B87; font-size:12px; margin-top:2px; }
  .ap-note { color:#8B8B87; font-size:13px; line-height:1.65; max-width:66ch; margin:16px 0 0; }

  .ap-steps { list-style:none; counter-reset:ap; margin:0; padding:0; display:grid; gap:18px; max-width:66ch; }
  .ap-steps li { counter-increment:ap; position:relative; padding-left:44px; color:#BFC3C8; font-size:16px; line-height:1.7; }
  .ap-steps li::before { content:counter(ap); position:absolute; left:0; top:0; width:28px; height:28px; border:1px solid rgba(200,164,107,0.5); border-radius:50%; color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; }

  .ap-list { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0; padding-left:20px; }
  .ap-list li { margin-bottom:10px; }
  .ap-list li::marker { color:#C8A46B; }

  .ap-routes-group { margin-top:26px; }
  .ap-routes-head { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#8B8B87; margin:0 0 12px; }
  .ap-routes { display:flex; flex-wrap:wrap; gap:9px; }
  .ap-routes a { border:1px solid #232323; padding:10px 13px; color:#BFC3C8; text-decoration:none; font-size:13.5px; line-height:1.35; }
  .ap-routes a:hover { border-color:#C8A46B; color:#fff; }

  .ap-faq { border-top:1px solid #232323; padding:22px 0; }
  .ap-faq-q { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:16px; letter-spacing:0.03em; color:#fff; margin:0 0 8px; }
  .ap-faq-a { color:#BFC3C8; font-size:15px; line-height:1.7; max-width:70ch; margin:0; }

  .ap-trust { margin-top:64px; border:1px solid #232323; }
  .ap-trust-head { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:20px 24px; border-bottom:1px solid #232323; }
  .ap-trust-badge { display:inline-flex; align-items:center; gap:12px; text-decoration:none; }
  .ap-trust-score { font-family:var(--font-cormorant),Georgia,serif; font-size:28px; line-height:1; color:#fff; }
  .ap-trust-stars { color:#C8A46B; font-size:13px; letter-spacing:1px; }
  .ap-trust-count { color:#BFC3C8; font-size:12.5px; }
  .ap-trust-see { margin-left:auto; color:#C8A46B; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .ap-trust-see:hover { color:#fff; }
  .ap-trust-quotes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:#232323; }
  .ap-trust-quote { background:#0A0A0A; padding:22px 24px; display:flex; flex-direction:column; gap:12px; }
  .ap-trust-q { font-family:var(--font-cormorant),Georgia,serif; font-size:19px; line-height:1.45; color:#ECEAE6; margin:0; flex-grow:1; text-wrap:balance; }
  .ap-trust-who { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:13px; letter-spacing:0.05em; color:#8B8B87; }
  .ap-trust-who b { color:#fff; font-weight:600; }
  .ap-trust-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; background:#232323; border-top:1px solid #232323; }
  .ap-trust-fact { background:#0A0A0A; padding:20px 24px; }
  .ap-trust-fact-v { font-family:var(--font-barlow-condensed),sans-serif; font-size:19px; font-weight:700; letter-spacing:0.07em; color:#fff; text-transform:uppercase; }
  .ap-trust-fact-l { color:#8B8B87; font-size:12px; line-height:1.5; margin-top:5px; }

  .ap-cta { margin-top:64px; border:1px solid rgba(200,164,107,0.4); padding:36px 32px; text-align:center; }
  .ap-cta-btn { display:inline-block; margin-top:20px; background:#C8A46B; color:#0A0A0A; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; padding:15px 30px; }
  .ap-cta-btn:hover { background:#d9b67e; }

  .ap-also { display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
  .ap-also a { border:1px solid #232323; padding:11px 14px; color:#BFC3C8; text-decoration:none; font-size:13px; }
  .ap-also a:hover { border-color:#C8A46B; color:#fff; }

  .ap-foot { border-top:1px solid rgba(200,164,107,0.28); margin-top:64px; padding-top:24px; font-size:13px; color:#8B8B87; }
  .ap-foot a { color:#C8A46B; text-decoration:none; }
  .ap-foot-pay { display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:12px; padding-bottom:16px; margin-bottom:16px; border-bottom:1px solid #191919; }
  .ap-stripe-mark { display:inline-block; background:#635BFF; color:#fff; font-weight:700; font-size:12px; padding:2px 8px 3px; border-radius:4px; line-height:1.35; }
  .ap-cardmark { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:10px; letter-spacing:0.12em; color:#8B8B87; border:1px solid #333; border-radius:2px; padding:2px 6px 1px; line-height:1.5; }
  .ap-foot-id { display:flex; flex-direction:column; gap:5px; font-style:normal; line-height:1.6; margin-bottom:18px; }
  .ap-foot-name { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#BFC3C8; }
  .ap-foot-id a { color:#BFC3C8; border-bottom:1px solid rgba(200,164,107,0.3); padding-bottom:1px; }
  .ap-foot-id a:hover { color:#C8A46B; }
  .ap-foot-contact { display:flex; flex-wrap:wrap; gap:6px 18px; }
  .ap-foot-links { display:flex; flex-wrap:wrap; gap:8px 20px; }

  .ap-root a:focus-visible { outline:2px solid #C8A46B; outline-offset:3px; }

  @media (max-width:700px) {
    .ap-nav { padding:16px 14px; gap:10px; }
    .ap-nav .er-brand-tagline { display:none; }
    .ap-nav-link { display:none; }
    .ap-nav-right { gap:8px; }
    .ap-nav-cta { font-size:10px; padding:8px 9px; letter-spacing:0.06em; }
    .ap-wrap { padding:8px 18px 72px; }
    .ap-facts { grid-template-columns:1fr; gap:12px; }
    .ap-section { margin-top:48px; }
    .ap-cta { padding:28px 20px; }
    .ap-trust { margin-top:48px; }
    .ap-trust-head { padding:16px 18px; gap:10px; }
    .ap-trust-see { margin-left:0; flex-basis:100%; }
    .ap-trust-quotes { grid-template-columns:1fr; }
    .ap-trust-quote { padding:18px; }
    .ap-trust-facts { grid-template-columns:1fr; }
    .ap-trust-fact { padding:16px 18px; }
  }
`;

export default function AirportPage({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const home = path(lang, "home");
  const quote = `${home}#quote`;
  const aeropuertos = filas(lang);

  return (
    <div className="ap-root">
      <style>{styles}</style>

      <nav className="ap-nav">
        <Link href={home} aria-label="Elite Route">
          <BrandMark size={17} compact={14} />
        </Link>
        <div className="ap-nav-right">
          <Link href={path(lang, "rates")} className="ap-nav-link">{t.navRates}</Link>
          <Link href={quote} className="ap-nav-cta" aria-label={t.navQuoteFull}>{t.navQuote}</Link>
          <LangToggle lang={lang} page="airport" />
        </div>
      </nav>

      <main className="ap-wrap">
        <p className="ap-kicker">{t.kicker}</p>
        <h1 className="ap-title">{t.title}</h1>
        <p className="ap-intro">{t.intro}</p>

        <div className="ap-facts">
          <div className="ap-fact">
            <div className="ap-fact-value">{t.factAirportsValue}</div>
            <div className="ap-fact-label">{t.factAirportsLabel}</div>
          </div>
          <div className="ap-fact">
            <div className="ap-fact-value">{t.factWaitValue}</div>
            <div className="ap-fact-label">{t.factWaitLabel}</div>
          </div>
          <div className="ap-fact">
            <div className="ap-fact-value">{t.factPriceValue}</div>
            <div className="ap-fact-label">{t.factPriceLabel}</div>
          </div>
        </div>

        <section className="ap-section">
          <h2 className="ap-h2">{t.tableTitle}</h2>
          <div className="ap-table-scroll">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>{t.colAirport}</th>
                  <th>{t.colFrom}</th>
                  <th>{t.colTo}</th>
                  <th>{t.colTime}</th>
                </tr>
              </thead>
              <tbody>
                {aeropuertos.map((a) => (
                  <tr key={a.grupo.key}>
                    <td>{a.nombre}</td>
                    <td>{mxn(a.desde)}</td>
                    <td>{mxn(a.hacia)}</td>
                    <td>{t.mins(a.min, a.max)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ap-note">{t.tableNote}</p>
        </section>

        <section className="ap-section">
          <h2 className="ap-h2">{t.arriveTitle}</h2>
          <ol className="ap-steps">
            {t.arrive.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </section>

        <section className="ap-section">
          <h2 className="ap-h2">{t.waitTitle}</h2>
          <ul className="ap-list">
            {t.wait.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>

        <section className="ap-section">
          <h2 className="ap-h2">{t.bagsTitle}</h2>
          <p className="ap-p">{t.bagsCopy}</p>
          <div className="ap-table-scroll">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>{t.colVehicle}</th>
                  <th>{t.colCap}</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((cat) => {
                  const nota = lang === "es" ? vehicles[cat].noteEs : vehicles[cat].note;
                  return (
                    <tr key={cat}>
                      <td>{vehicles[cat].name}</td>
                      <td>
                        {lang === "es" ? vehicles[cat].capEs : vehicles[cat].cap}
                        {nota && <span className="ap-veh-cap">{nota}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ap-section">
          <h2 className="ap-h2">{t.routesTitle}</h2>
          <p className="ap-p">{t.routesCopy}</p>
          {aeropuertos.map((a) => (
            <div className="ap-routes-group" key={a.grupo.key}>
              <p className="ap-routes-head">{a.nombre}</p>
              <div className="ap-routes">
                {a.grupo.rutas.map((k) => (
                  <Link key={k} href={routePath(lang, k)}>{ROUTES[k][lang].zone}</Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="ap-section">
          <h2 className="ap-h2">{t.includedTitle}</h2>
          <ul className="ap-list">
            {t.included.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>

        <section className="ap-trust" aria-label={t.trustTitle}>
          <div className="ap-trust-head">
            <a className="ap-trust-badge" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.5 5.4C39.9 37 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
              </svg>
              <span className="ap-trust-score">{GOOGLE_RATING}</span>
              <span>
                <span className="ap-trust-stars">★★★★★</span>
                <br />
                <span className="ap-trust-count">{t.trustRating}</span>
              </span>
            </a>
            <a className="ap-trust-see" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              {t.trustSeeAll} →
            </a>
          </div>

          <div className="ap-trust-quotes">
            {REVIEWS.slice(0, 2).map((r) => (
              <figure className="ap-trust-quote" key={r.name}>
                <blockquote className="ap-trust-q">“{r.quote}”</blockquote>
                <figcaption className="ap-trust-who">
                  <b>{r.name}</b> · Google
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="ap-trust-facts">
            <div className="ap-trust-fact">
              <div className="ap-trust-fact-v">{t.trustYears}</div>
              <div className="ap-trust-fact-l">{t.trustYearsLabel}</div>
            </div>
            <div className="ap-trust-fact">
              <div className="ap-trust-fact-v">{t.trustVolume}</div>
              <div className="ap-trust-fact-l">{t.trustVolumeLabel}</div>
            </div>
            <div className="ap-trust-fact">
              <div className="ap-trust-fact-v">{t.trustPayValue}</div>
              <div className="ap-trust-fact-l">{t.trustPayLabel}</div>
            </div>
          </div>
        </section>

        <section className="ap-section">
          <h2 className="ap-h2">{t.faqTitle}</h2>
          {t.faqs.map(([q, a]) => (
            <div className="ap-faq" key={q}>
              <p className="ap-faq-q">{q}</p>
              <p className="ap-faq-a">{a}</p>
            </div>
          ))}
        </section>

        <div className="ap-cta">
          <h2 className="ap-h2" style={{ marginBottom: 12 }}>{t.ctaTitle}</h2>
          <p className="ap-p" style={{ margin: "0 auto", maxWidth: "52ch" }}>{t.ctaCopy}</p>
          <Link href={quote} className="ap-cta-btn">{t.ctaBtn}</Link>
        </div>

        <section className="ap-section">
          <h2 className="ap-h2">{t.alsoTitle}</h2>
          <div className="ap-also">
            <Link href={path(lang, "executive")}>{t.alsoExecutive}</Link>
            <Link href={path(lang, "chauffeur")}>{t.alsoChauffeur}</Link>
            <Link href={path(lang, "rates")}>{t.alsoRates}</Link>
            <Link href={path(lang, "corporate")}>{t.alsoCorporate}</Link>
          </div>
        </section>

        <footer className="ap-foot">
          <p className="ap-foot-pay">
            <span>{t.footPay}</span>
            <span className="ap-stripe-mark">stripe</span>
            <span className="ap-cardmark">VISA</span>
            <span className="ap-cardmark">MASTERCARD</span>
            <span className="ap-cardmark">AMEX</span>
          </p>

          {/* Sin domicilio: es la casa del dueño. Ver el pie de HomeClient. */}
          <address className="ap-foot-id">
            <span className="ap-foot-name">{LEGAL.responsable}</span>
            <span className="ap-foot-contact">
              <a href={LEGAL.whatsappUrl} target="_blank" rel="noopener noreferrer">{LEGAL.whatsapp}</a>
              <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>
            </span>
          </address>

          <div className="ap-foot-links">
            <Link href={path(lang, "rates")}>{t.alsoRates}</Link>
            <Link href={path(lang, "terms")}>{t.footTerms}</Link>
            <Link href={path(lang, "privacy")}>{t.footPrivacy}</Link>
            <Link href={home}>eliteroute.mx</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
