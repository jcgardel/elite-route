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
 * El catálogo: qué es el transporte ejecutivo aquí y qué se puede contratar.
 *
 * "Transporte ejecutivo CDMX" es la otra búsqueda genérica del sector, y la
 * que peor servida estaba: caía en la portada, que es un cotizador, o en
 * /b2b, que es una cuenta corporativa con crédito y facturación. Quien busca
 * el término todavía no sabe qué tipo de servicio quiere.
 *
 * Por eso esta página NO vende un servicio: los enseña los cuatro, dice lo
 * que cuesta el más barato de cada uno y manda a la página que corresponde.
 * Es el índice del sitio con contenido propio, y es lo que la separa de sus
 * vecinas:
 *   · /b2b        → la empresa que quiere cuenta, crédito y CFDI;
 *   · /chofer-privado-cdmx → la persona que maneja;
 *   · /chofer-por-horas → un solo servicio, el bloque de tiempo;
 *   · /tarifas    → la tabla completa, ruta por ruta.
 * Aquí no se repite ninguna de esas tablas: la de abajo tiene una fila por
 * SERVICIO, no por ruta ni por bloque, y es la única de su tipo en el sitio.
 *
 * NO se publica ninguna distancia. Los km salen de lib/distances.ts, que es
 * server-only, y sólo para calcular: publicarlos junto al precio entrega la
 * tarifa por kilómetro, que es interna.
 */

const cats: readonly Category[] = CATEGORIES;

/** El bloque mínimo y la jornada completa. Los define `calculatePrice`. */
const MIN_BLOCK = 2;
const FULL_DAY_HOURS = 10;

/**
 * La foránea más barata de las que el sitio publica. Se calcula en lugar de
 * escribirse: si algún día entra una ruta más corta, el "desde" la sigue.
 */
const FORANEAS: readonly RouteKey[] = ROUTE_KEYS.filter((k) => ROUTES[k].precioUnico === true);

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}

/** El precio más bajo de un servicio, entre las cuatro categorías. */
function menor(fn: (c: Category) => number) {
  return Math.min(...cats.map(fn));
}

const desdeTraslado = () => menor((c) => calculatePrice(0, 0, c, "route", 0, false));
const desdeHoras = () => menor((c) => calculatePrice(0, 0, c, "hour", MIN_BLOCK));
const desdeDia = () => menor((c) => calculatePrice(0, 0, c, "day", FULL_DAY_HOURS));
const desdeForanea = () =>
  Math.min(
    ...FORANEAS.map((k) => menor((c) => calculatePrice(LEGS[k].km, LEGS[k].min, c, "route", 0, false))),
  );

/** El rango que declara el JSON-LD. Sale de la misma tabla que se ve. */
export function executivePriceRange() {
  const all = [desdeTraslado(), desdeHoras(), desdeDia(), desdeForanea()];
  return { low: Math.min(...all), high: Math.max(...all) };
}

/** Las rutas que salen o llegan a un aeropuerto, en el orden del catálogo. */
const AEROPUERTO: readonly RouteKey[] = ROUTE_KEYS.filter((k) => ROUTES[k].precioUnico !== true);

const TX = {
  es: {
    navRates: "Tarifas",
    navQuote: "Cotizar",
    navQuoteFull: "Cotizar transporte ejecutivo",
    kicker: "Transporte ejecutivo · Ciudad de México",
    title: "Transporte ejecutivo en Ciudad de México",
    intro:
      "Traslados con chofer para quien viaja por trabajo: del aeropuerto a la oficina, una jornada completa de reuniones, el día entero a disposición o una salida de la ciudad. Flota propia, unidades aseguradas con monitoreo GPS y un precio cerrado con IVA antes de reservar. Esta página enseña los cuatro servicios y lo que cuesta el más económico de cada uno.",

    factServicesValue: "4 servicios",
    factServicesLabel: "traslado, por horas, día completo y foráneo",
    factFleetValue: "Flota propia",
    factFleetLabel: "unidades aseguradas, con monitoreo GPS las 24 horas",
    factInvoiceValue: "Factura CFDI",
    factInvoiceLabel: "a persona o a empresa, a solicitud",

    tableTitle: "Los cuatro servicios",
    colService: "Servicio",
    colFrom: "Desde",
    colHow: "Se cobra",
    svcTransfer: "Traslado al aeropuerto o punto a punto",
    svcTransferHow: "por ruta",
    svcHourly: `Servicio por horas · mínimo ${MIN_BLOCK} h`,
    svcHourlyHow: `por bloque de ${MIN_BLOCK} horas`,
    svcDay: `Día completo · ${FULL_DAY_HOURS} h`,
    svcDayHow: "por jornada",
    svcIntercity: "Ruta foránea desde la Ciudad de México",
    svcIntercityHow: "precio cerrado, casetas incluidas",
    tableNote:
      "Precios finales en pesos con IVA incluido. Cada cifra es la de la categoría más económica para ese servicio; el precio sube según la categoría y, en los traslados, según la ruta. El cotizador da el número exacto en pantalla antes de pedirte cualquier dato de pago. Las salidas desde aeropuerto llevan incluido el estacionamiento y la espera por retraso del vuelo.",

    fleetTitle: "Las cuatro categorías",
    fleetCopy:
      "La reserva se hace por categoría. Marca, modelo y color se asignan según la disponibilidad y lo que pida el servicio.",
    fleetAlt: (n: string) => `Categoría ${n} de la flota de Elite Route`,
    fleetMore: "Cuál elegir, y cuándo no",
    orEquivalent: "o equivalente",

    routesTitle: "Rutas con precio publicado",
    routesCopy:
      "Cada una tiene su propia página, con el precio por categoría en los dos sentidos y las preguntas que se repiten en esa ruta.",
    routesAirport: "Desde y hacia los aeropuertos",
    routesIntercity: "Rutas foráneas",

    whyTitle: "Qué lo distingue de un traslado cualquiera",
    why: [
      "Precio cerrado con IVA antes de reservar: no lo mueve el tráfico, el horario ni la demanda del momento.",
      "Unidades propias y aseguradas, con monitoreo GPS las 24 horas.",
      "El mismo chofer durante todo el servicio contratado.",
      "Monitoreo del vuelo en las salidas de aeropuerto, con la espera ya incluida en la tarifa.",
      "Factura CFDI a solicitud y pago con tarjeta, Mercado Pago o transferencia bancaria.",
      "Reserva con doce horas de anticipación como mínimo, confirmada por WhatsApp.",
    ],

    faqTitle: "Preguntas frecuentes",
    faqs: [
      [
        "¿Qué incluye el transporte ejecutivo?",
        "Chofer profesional y vehículo de la categoría reservada, con seguro vigente y monitoreo GPS. El precio es fijo y con IVA: cubre combustible, casetas de la ruta cotizada y, en salidas de aeropuerto, el estacionamiento y la espera por retraso del vuelo. Se emite factura CFDI a solicitud.",
      ],
      [
        "¿Cuánto cuesta el transporte ejecutivo en CDMX?",
        `Un traslado dentro de la ciudad arranca en ${mxn(desdeTraslado())} con IVA, el bloque de ${MIN_BLOCK} horas en ${mxn(desdeHoras())}, el día completo de ${FULL_DAY_HOURS} horas en ${mxn(desdeDia())} y la ruta foránea más corta en ${mxn(desdeForanea())}. Son las cifras de la categoría más económica; el cotizador da el precio exacto según la categoría y la ruta.`,
      ],
      [
        "¿Cuál me conviene, el traslado o el servicio por horas?",
        "Si vas de un punto a otro y no necesitas que el chofer espere, el traslado sale más barato. Si vas a hacer varias paradas o no sabes a qué hora terminas, conviene el servicio por horas: el chofer y el vehículo se quedan contigo.",
      ],
      [
        "¿Hay servicio fuera de la Ciudad de México?",
        "Sí. Publicamos precio cerrado a Cuernavaca, Puebla, Querétaro y San Miguel de Allende, con casetas y combustible incluidos. Para otros destinos, escríbenos y lo cotizamos.",
      ],
      [
        "¿Se puede facturar y pagar a nombre de una empresa?",
        "Sí. Se emite factura CFDI y se acepta pago con tarjeta nacional o internacional, Mercado Pago o transferencia bancaria. Para volumen recurrente y términos de crédito, la cuenta corporativa tiene su propia página.",
      ],
      [
        "¿Con cuánta anticipación hay que reservar?",
        "Doce horas como mínimo. Para un día completo, una ruta foránea o varios vehículos conviene avisar antes.",
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

    ctaTitle: "Cotiza tu servicio",
    ctaCopy:
      "El cotizador calcula el precio exacto con tu dirección real y te deja pagar con tarjeta. Doce horas de anticipación como mínimo.",
    ctaBtn: "Cotizar ahora",

    alsoTitle: "También te puede servir",
    alsoAirport: "Traslados de aeropuerto",
    alsoFleet: "La flota",
    alsoChauffeur: "Chofer privado",
    alsoHourly: "Chofer por horas",
    alsoRates: "Todas las tarifas",
    alsoCorporate: "Cuentas corporativas",

    footPay: "Pago seguro con",
    footTerms: "Términos",
    footPrivacy: "Aviso de privacidad",
  },

  en: {
    navRates: "Rates",
    navQuote: "Quote",
    navQuoteFull: "Get a quote for executive transportation",
    kicker: "Executive transportation · Mexico City",
    title: "Executive transportation in Mexico City",
    intro:
      "Chauffeured ground transport for people travelling on business: airport to office, a full day of meetings, a whole day on call, or a run out of the city. Our own fleet, insured vehicles with GPS monitoring, and a closed price including VAT before you book. This page lays out the four services and what the cheapest version of each one costs.",

    factServicesValue: "4 services",
    factServicesLabel: "transfer, hourly, full day and out-of-town",
    factFleetValue: "Our own fleet",
    factFleetLabel: "insured vehicles, GPS-monitored around the clock",
    factInvoiceValue: "CFDI invoice",
    factInvoiceLabel: "to a person or a company, on request",

    tableTitle: "The four services",
    colService: "Service",
    colFrom: "From",
    colHow: "Charged",
    svcTransfer: "Airport or point-to-point transfer",
    svcTransferHow: "by route",
    svcHourly: `Hourly service · ${MIN_BLOCK} h minimum`,
    svcHourlyHow: `per ${MIN_BLOCK}-hour block`,
    svcDay: `Full day · ${FULL_DAY_HOURS} h`,
    svcDayHow: "per day",
    svcIntercity: "Out-of-town route from Mexico City",
    svcIntercityHow: "closed price, tolls included",
    tableNote:
      "Final prices in Mexican pesos, VAT included. Each figure is for the most affordable category in that service; the price rises with the category and, on transfers, with the route. The quote form shows the exact number on screen before asking for any payment details. Airport pickups already include parking and waiting for flight delays.",

    fleetTitle: "The four categories",
    fleetCopy:
      "Bookings are made by category. Make, model and colour are assigned according to availability and what the service calls for.",
    fleetAlt: (n: string) => `${n} category in the Elite Route fleet`,
    fleetMore: "Which one to choose, and when not to",
    orEquivalent: "or equivalent",

    routesTitle: "Routes with a published price",
    routesCopy:
      "Each one has its own page, with the price by category in both directions and the questions that come up on that route.",
    routesAirport: "To and from the airports",
    routesIntercity: "Out-of-town routes",

    whyTitle: "What sets it apart from an ordinary ride",
    why: [
      "A closed price with VAT before you book: unmoved by traffic, time of day or how busy the moment is.",
      "Our own insured vehicles, GPS-monitored around the clock.",
      "The same chauffeur for the whole booked service.",
      "Flight tracking on airport pickups, with the waiting time already covered by the fare.",
      "CFDI invoice on request, and payment by card, Mercado Pago or bank transfer.",
      "Booked twelve hours ahead at the minimum, confirmed over WhatsApp.",
    ],

    faqTitle: "Frequently asked",
    faqs: [
      [
        "What does executive transportation include?",
        "A professional chauffeur and a vehicle in the category you booked, with current insurance and GPS monitoring. The price is fixed and includes VAT: it covers fuel, tolls on the quoted route and, on airport pickups, parking and waiting for flight delays. A CFDI invoice is issued on request.",
      ],
      [
        "How much does executive transportation cost in Mexico City?",
        `A transfer within the city starts at ${mxn(desdeTraslado())} including VAT, a ${MIN_BLOCK}-hour block at ${mxn(desdeHoras())}, a ${FULL_DAY_HOURS}-hour full day at ${mxn(desdeDia())} and the shortest out-of-town route at ${mxn(desdeForanea())}. Those are the figures for the most affordable category; the quote form gives the exact price for the category and the route.`,
      ],
      [
        "Which suits me better, a transfer or hourly service?",
        "If you are going from one point to another and do not need the chauffeur to wait, a transfer is cheaper. If you have several stops or do not know when you will finish, hourly service is the one: the chauffeur and the car stay with you.",
      ],
      [
        "Do you operate outside Mexico City?",
        "Yes. We publish a closed price to Cuernavaca, Puebla, Querétaro and San Miguel de Allende, with tolls and fuel included. For other destinations, write to us and we will quote it.",
      ],
      [
        "Can you invoice and take payment in a company's name?",
        "Yes. A CFDI invoice is issued, and we take Mexican or international cards, Mercado Pago and bank transfers. For recurring volume and credit terms, the corporate account has a page of its own.",
      ],
      [
        "How far ahead should I book?",
        "Twelve hours minimum. For a full day, an out-of-town route or several vehicles, earlier is better.",
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

    ctaTitle: "Get your service quoted",
    ctaCopy:
      "The quote form works out the exact price from your real address and lets you pay by card. Twelve hours' notice minimum.",
    ctaBtn: "Get a quote",

    alsoTitle: "You may also need",
    alsoAirport: "Airport transfers",
    alsoFleet: "The fleet",
    alsoChauffeur: "Private chauffeur",
    alsoHourly: "Hourly chauffeur",
    alsoRates: "All rates",
    alsoCorporate: "Corporate accounts",

    footPay: "Secure payment with",
    footTerms: "Terms",
    footPrivacy: "Privacy notice",
  },
} as const;

/** Las preguntas, para declararlas en JSON-LD sin reescribirlas. */
export function executiveFaqs(lang: Lang) {
  return TX[lang].faqs;
}

const styles = `
  .ex-root { background:#0A0A0A; color:#ECEAE6; min-height:100vh; font-family:var(--font-barlow),sans-serif; font-weight:300; }
  .ex-nav { max-width:1180px; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .ex-nav a { text-decoration:none; }
  .ex-nav-right { display:flex; align-items:center; gap:14px; }
  .ex-nav-link { font-size:11px; letter-spacing:0.12em; color:#BFC3C8; text-transform:uppercase; white-space:nowrap; }
  .ex-nav-link:hover { color:#fff; }
  .ex-nav-cta { border:1px solid #C8A46B; border-radius:2px; padding:10px 16px; color:#fff; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .ex-nav-cta:hover { background:#C8A46B; color:#0A0A0A; }

  .ex-wrap { max-width:900px; margin:0 auto; padding:16px 28px 100px; }

  .ex-kicker { color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin:34px 0 14px; }
  .ex-title { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(34px,5.4vw,56px); line-height:1.06; margin:0 0 20px; text-wrap:balance; }
  .ex-intro { color:#BFC3C8; font-size:17px; line-height:1.7; max-width:64ch; margin:0; }

  .ex-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; max-width:700px; margin:34px 0 0; }
  .ex-fact { border-top:1px solid rgba(255,255,255,0.32); padding-top:14px; }
  .ex-fact-value { font-family:var(--font-barlow-condensed),sans-serif; font-size:21px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }
  .ex-fact-label { color:#BFC3C8; font-size:12px; line-height:1.4; margin-top:4px; }

  .ex-section { margin-top:64px; }
  .ex-h2 { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(26px,3.4vw,34px); line-height:1.15; margin:0 0 18px; color:#fff; text-wrap:balance; }
  .ex-p { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0 0 16px; }

  .ex-table-scroll { overflow-x:auto; }
  .ex-table { width:100%; min-width:520px; border-collapse:collapse; font-size:15px; }
  .ex-table th { text-align:left; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#8B8B87; padding:0 0 12px; border-bottom:1px solid #232323; }
  .ex-table td { border-bottom:1px solid #1a1a1a; padding:14px 0; color:#BFC3C8; font-variant-numeric:tabular-nums; }
  .ex-table td:first-child { color:#fff; }
  .ex-table th:nth-child(2), .ex-table td:nth-child(2) { text-align:right; white-space:nowrap; }
  .ex-table th:last-child, .ex-table td:last-child { text-align:right; color:#8B8B87; }
  .ex-table a { color:#fff; text-decoration:none; border-bottom:1px solid rgba(200,164,107,0.45); }
  .ex-table a:hover { color:#C8A46B; }
  .ex-note { color:#8B8B87; font-size:13px; line-height:1.65; max-width:66ch; margin:16px 0 0; }

  .ex-fleet-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:22px; margin-top:22px; }
  .ex-fleet-card { border:1px solid #232323; background:#080808; }
  .ex-fleet-card img { display:block; width:100%; height:auto; aspect-ratio:16 / 9; object-fit:cover; }
  .ex-fleet-meta { padding:18px 20px 22px; }
  .ex-fleet-name { font-family:var(--font-cormorant),Georgia,serif; font-size:24px; color:#fff; }
  .ex-fleet-cap { color:#8B8B87; font-size:13px; letter-spacing:0.03em; margin-top:6px; }
  .ex-fleet-note { color:#6f6f6c; font-size:12px; line-height:1.7; margin-top:8px; }

  .ex-routes-group { margin-top:26px; }
  .ex-routes-head { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#8B8B87; margin:0 0 12px; }
  .ex-routes { display:flex; flex-wrap:wrap; gap:9px; }
  .ex-routes a { border:1px solid #232323; padding:10px 13px; color:#BFC3C8; text-decoration:none; font-size:13.5px; line-height:1.35; }
  .ex-routes a:hover { border-color:#C8A46B; color:#fff; }

  .ex-list { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0; padding-left:20px; }
  .ex-list li { margin-bottom:10px; }
  .ex-list li::marker { color:#C8A46B; }

  .ex-faq { border-top:1px solid #232323; padding:22px 0; }
  .ex-faq-q { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:16px; letter-spacing:0.03em; color:#fff; margin:0 0 8px; }
  .ex-faq-a { color:#BFC3C8; font-size:15px; line-height:1.7; max-width:70ch; margin:0; }

  .ex-trust { margin-top:64px; border:1px solid #232323; }
  .ex-trust-head { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:20px 24px; border-bottom:1px solid #232323; }
  .ex-trust-badge { display:inline-flex; align-items:center; gap:12px; text-decoration:none; }
  .ex-trust-score { font-family:var(--font-cormorant),Georgia,serif; font-size:28px; line-height:1; color:#fff; }
  .ex-trust-stars { color:#C8A46B; font-size:13px; letter-spacing:1px; }
  .ex-trust-count { color:#BFC3C8; font-size:12.5px; }
  .ex-trust-see { margin-left:auto; color:#C8A46B; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .ex-trust-see:hover { color:#fff; }
  .ex-trust-quotes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:#232323; }
  .ex-trust-quote { background:#0A0A0A; padding:22px 24px; display:flex; flex-direction:column; gap:12px; }
  .ex-trust-q { font-family:var(--font-cormorant),Georgia,serif; font-size:19px; line-height:1.45; color:#ECEAE6; margin:0; flex-grow:1; text-wrap:balance; }
  .ex-trust-who { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:13px; letter-spacing:0.05em; color:#8B8B87; }
  .ex-trust-who b { color:#fff; font-weight:600; }
  .ex-trust-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; background:#232323; border-top:1px solid #232323; }
  .ex-trust-fact { background:#0A0A0A; padding:20px 24px; }
  .ex-trust-fact-v { font-family:var(--font-barlow-condensed),sans-serif; font-size:19px; font-weight:700; letter-spacing:0.07em; color:#fff; text-transform:uppercase; }
  .ex-trust-fact-l { color:#8B8B87; font-size:12px; line-height:1.5; margin-top:5px; }

  .ex-cta { margin-top:64px; border:1px solid rgba(200,164,107,0.4); padding:36px 32px; text-align:center; }
  .ex-cta-btn { display:inline-block; margin-top:20px; background:#C8A46B; color:#0A0A0A; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; padding:15px 30px; }
  .ex-cta-btn:hover { background:#d9b67e; }

  .ex-also { display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
  .ex-also a { border:1px solid #232323; padding:11px 14px; color:#BFC3C8; text-decoration:none; font-size:13px; }
  .ex-also a:hover { border-color:#C8A46B; color:#fff; }

  .ex-foot { border-top:1px solid rgba(200,164,107,0.28); margin-top:64px; padding-top:24px; font-size:13px; color:#8B8B87; }
  .ex-foot a { color:#C8A46B; text-decoration:none; }
  .ex-foot-pay { display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:12px; padding-bottom:16px; margin-bottom:16px; border-bottom:1px solid #191919; }
  .ex-stripe-mark { display:inline-block; background:#635BFF; color:#fff; font-weight:700; font-size:12px; padding:2px 8px 3px; border-radius:4px; line-height:1.35; }
  .ex-cardmark { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:10px; letter-spacing:0.12em; color:#8B8B87; border:1px solid #333; border-radius:2px; padding:2px 6px 1px; line-height:1.5; }
  .ex-foot-id { display:flex; flex-direction:column; gap:5px; font-style:normal; line-height:1.6; margin-bottom:18px; }
  .ex-foot-name { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#BFC3C8; }
  .ex-foot-id a { color:#BFC3C8; border-bottom:1px solid rgba(200,164,107,0.3); padding-bottom:1px; }
  .ex-foot-id a:hover { color:#C8A46B; }
  .ex-foot-contact { display:flex; flex-wrap:wrap; gap:6px 18px; }
  .ex-foot-links { display:flex; flex-wrap:wrap; gap:8px 20px; }

  .ex-root a:focus-visible { outline:2px solid #C8A46B; outline-offset:3px; }

  @media (max-width:700px) {
    .ex-nav { padding:16px 14px; gap:10px; }
    .ex-nav .er-brand-tagline { display:none; }
    .ex-nav-link { display:none; }
    .ex-nav-right { gap:8px; }
    .ex-nav-cta { font-size:10px; padding:8px 9px; letter-spacing:0.06em; }
    .ex-wrap { padding:8px 18px 72px; }
    .ex-facts { grid-template-columns:1fr; gap:12px; }
    .ex-section { margin-top:48px; }
    .ex-fleet-grid { grid-template-columns:1fr; gap:16px; }
    .ex-cta { padding:28px 20px; }
    .ex-trust { margin-top:48px; }
    .ex-trust-head { padding:16px 18px; gap:10px; }
    .ex-trust-see { margin-left:0; flex-basis:100%; }
    .ex-trust-quotes { grid-template-columns:1fr; }
    .ex-trust-quote { padding:18px; }
    .ex-trust-facts { grid-template-columns:1fr; }
    .ex-trust-fact { padding:16px 18px; }
  }
`;

export default function ExecutivePage({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const home = path(lang, "home");
  const quote = `${home}#quote`;
  const rates = path(lang, "rates");
  const hourly = path(lang, "hourly");

  // Una fila por servicio. El enlace va sólo donde hay una página dedicada;
  // las foráneas viven en la lista de rutas que está justo debajo.
  const servicios: Array<{ name: string; href?: string; from: number; how: string }> = [
    { name: t.svcTransfer, href: path(lang, "airport"), from: desdeTraslado(), how: t.svcTransferHow },
    { name: t.svcHourly, href: hourly, from: desdeHoras(), how: t.svcHourlyHow },
    { name: t.svcDay, href: hourly, from: desdeDia(), how: t.svcDayHow },
    { name: t.svcIntercity, from: desdeForanea(), how: t.svcIntercityHow },
  ];

  return (
    <div className="ex-root">
      <style>{styles}</style>

      <nav className="ex-nav">
        <Link href={home} aria-label="Elite Route">
          <BrandMark size={17} compact={14} />
        </Link>
        <div className="ex-nav-right">
          <Link href={rates} className="ex-nav-link">{t.navRates}</Link>
          <Link href={quote} className="ex-nav-cta" aria-label={t.navQuoteFull}>{t.navQuote}</Link>
          <LangToggle lang={lang} page="executive" />
        </div>
      </nav>

      <main className="ex-wrap">
        <p className="ex-kicker">{t.kicker}</p>
        <h1 className="ex-title">{t.title}</h1>
        <p className="ex-intro">{t.intro}</p>

        <div className="ex-facts">
          <div className="ex-fact">
            <div className="ex-fact-value">{t.factServicesValue}</div>
            <div className="ex-fact-label">{t.factServicesLabel}</div>
          </div>
          <div className="ex-fact">
            <div className="ex-fact-value">{t.factFleetValue}</div>
            <div className="ex-fact-label">{t.factFleetLabel}</div>
          </div>
          <div className="ex-fact">
            <div className="ex-fact-value">{t.factInvoiceValue}</div>
            <div className="ex-fact-label">{t.factInvoiceLabel}</div>
          </div>
        </div>

        <section className="ex-section">
          <h2 className="ex-h2">{t.tableTitle}</h2>
          <div className="ex-table-scroll">
            <table className="ex-table">
              <thead>
                <tr>
                  <th>{t.colService}</th>
                  <th>{t.colFrom}</th>
                  <th>{t.colHow}</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((s) => (
                  <tr key={s.name}>
                    <td>{s.href ? <Link href={s.href}>{s.name}</Link> : s.name}</td>
                    <td>{mxn(s.from)}</td>
                    <td>{s.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ex-note">{t.tableNote}</p>
        </section>

        {/* Las mismas cuatro imágenes de categoría que usa /b2b, leídas de la
            misma fuente: nombres y capacidades salen de lib/vehicles.ts, así
            que las dos páginas no pueden contradecirse. Sin fotos por
            modelo, por instrucción del dueño. */}
        <section className="ex-section">
          <h2 className="ex-h2">{t.fleetTitle}</h2>
          <p className="ex-p">{t.fleetCopy}</p>
          <div className="ex-fleet-grid">
            {(["suv", "executive", "minivan", "sedan"] as const).map((k) => {
              const v = vehicles[k];
              const nota = lang === "es" ? v.noteEs : v.note;
              return (
                <div className="ex-fleet-card" key={k}>
                  <img
                    src={`/flota/${k === "suv" ? "high-suv" : k}.webp`}
                    alt={t.fleetAlt(v.name)}
                    width={1400}
                    height={788}
                    loading="lazy"
                  />
                  <div className="ex-fleet-meta">
                    <div className="ex-fleet-name">{v.name}</div>
                    <div className="ex-fleet-cap">{v.tag} {t.orEquivalent}</div>
                    <div className="ex-fleet-cap">{lang === "es" ? v.capEs : v.cap}</div>
                    {nota && <div className="ex-fleet-note">{nota}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Aquí se ven las cuatro categorías; la página de flota dice cuál
              elegir y cuándo no, que es la parte que no cabe en un listado. */}
          <p className="ex-note" style={{ marginTop: 20 }}>
            <Link href={path(lang, "fleet")} style={{ color: "#C8A46B" }}>{t.fleetMore} →</Link>
          </p>
        </section>

        <section className="ex-section">
          <h2 className="ex-h2">{t.routesTitle}</h2>
          <p className="ex-p">{t.routesCopy}</p>

          <div className="ex-routes-group">
            <p className="ex-routes-head">{t.routesAirport}</p>
            <div className="ex-routes">
              {AEROPUERTO.map((k) => (
                <Link key={k} href={routePath(lang, k)}>{ROUTES[k][lang].title}</Link>
              ))}
            </div>
          </div>

          <div className="ex-routes-group">
            <p className="ex-routes-head">{t.routesIntercity}</p>
            <div className="ex-routes">
              {FORANEAS.map((k) => (
                <Link key={k} href={routePath(lang, k)}>{ROUTES[k][lang].title}</Link>
              ))}
            </div>
          </div>
        </section>

        <section className="ex-section">
          <h2 className="ex-h2">{t.whyTitle}</h2>
          <ul className="ex-list">
            {t.why.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>

        <section className="ex-trust" aria-label={t.trustTitle}>
          <div className="ex-trust-head">
            <a className="ex-trust-badge" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.5 5.4C39.9 37 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
              </svg>
              <span className="ex-trust-score">{GOOGLE_RATING}</span>
              <span>
                <span className="ex-trust-stars">★★★★★</span>
                <br />
                <span className="ex-trust-count">{t.trustRating}</span>
              </span>
            </a>
            <a className="ex-trust-see" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              {t.trustSeeAll} →
            </a>
          </div>

          <div className="ex-trust-quotes">
            {REVIEWS.slice(0, 2).map((r) => (
              <figure className="ex-trust-quote" key={r.name}>
                <blockquote className="ex-trust-q">“{r.quote}”</blockquote>
                <figcaption className="ex-trust-who">
                  <b>{r.name}</b> · Google
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="ex-trust-facts">
            <div className="ex-trust-fact">
              <div className="ex-trust-fact-v">{t.trustYears}</div>
              <div className="ex-trust-fact-l">{t.trustYearsLabel}</div>
            </div>
            <div className="ex-trust-fact">
              <div className="ex-trust-fact-v">{t.trustVolume}</div>
              <div className="ex-trust-fact-l">{t.trustVolumeLabel}</div>
            </div>
            <div className="ex-trust-fact">
              <div className="ex-trust-fact-v">{t.trustPayValue}</div>
              <div className="ex-trust-fact-l">{t.trustPayLabel}</div>
            </div>
          </div>
        </section>

        <section className="ex-section">
          <h2 className="ex-h2">{t.faqTitle}</h2>
          {t.faqs.map(([q, a]) => (
            <div className="ex-faq" key={q}>
              <p className="ex-faq-q">{q}</p>
              <p className="ex-faq-a">{a}</p>
            </div>
          ))}
        </section>

        <div className="ex-cta">
          <h2 className="ex-h2" style={{ marginBottom: 12 }}>{t.ctaTitle}</h2>
          <p className="ex-p" style={{ margin: "0 auto", maxWidth: "52ch" }}>{t.ctaCopy}</p>
          <Link href={quote} className="ex-cta-btn">{t.ctaBtn}</Link>
        </div>

        <section className="ex-section">
          <h2 className="ex-h2">{t.alsoTitle}</h2>
          <div className="ex-also">
            <Link href={path(lang, "airport")}>{t.alsoAirport}</Link>
            <Link href={path(lang, "fleet")}>{t.alsoFleet}</Link>
            <Link href={path(lang, "chauffeur")}>{t.alsoChauffeur}</Link>
            <Link href={hourly}>{t.alsoHourly}</Link>
            <Link href={rates}>{t.alsoRates}</Link>
            <Link href={path(lang, "corporate")}>{t.alsoCorporate}</Link>
          </div>
        </section>

        <footer className="ex-foot">
          <p className="ex-foot-pay">
            <span>{t.footPay}</span>
            <span className="ex-stripe-mark">stripe</span>
            <span className="ex-cardmark">VISA</span>
            <span className="ex-cardmark">MASTERCARD</span>
            <span className="ex-cardmark">AMEX</span>
          </p>

          {/* Sin domicilio: es la casa del dueño. Ver el pie de HomeClient. */}
          <address className="ex-foot-id">
            <span className="ex-foot-name">{LEGAL.responsable}</span>
            <span className="ex-foot-contact">
              <a href={LEGAL.whatsappUrl} target="_blank" rel="noopener noreferrer">{LEGAL.whatsapp}</a>
              <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>
            </span>
          </address>

          <div className="ex-foot-links">
            <Link href={rates}>{t.alsoRates}</Link>
            <Link href={path(lang, "terms")}>{t.footTerms}</Link>
            <Link href={path(lang, "privacy")}>{t.footPrivacy}</Link>
            <Link href={home}>eliteroute.mx</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
