import Link from "next/link";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { calculatePrice } from "@/lib/booking";
import { CATEGORIES, vehicles, type Category } from "@/lib/vehicles";
import { path, type Lang } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";
import {
  GOOGLE_PLACE_URL,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  REVIEWS,
  TRANSFERS_PER_YEAR,
  YEARS_OPERATING,
} from "@/lib/social-proof";

/**
 * El chofer privado: la persona, no el catálogo.
 *
 * "Chofer privado CDMX" es una de las dos búsquedas genéricas del sector y
 * hasta ahora caía en la portada, que es un cotizador con muy poco texto:
 * nueve de cada diez píxeles de la primera pantalla son el formulario. Una
 * página que se llama como la búsqueda y que además la contesta gana.
 *
 * Lo que la separa de las que ya existen, y es deliberado:
 *   · /chofer-por-horas vende UN bloque de tiempo y su tabla de bloques;
 *   · /transporte-ejecutivo-cdmx es el catálogo de los cuatro servicios;
 *   · /b2b es la cuenta corporativa, con crédito y facturación;
 *   · aquí se habla del conductor —quién maneja, qué hace mientras esperas,
 *     en qué se diferencia de pedir un auto por aplicación—.
 * Si alguna vez esta página empieza a repetir la tabla de otra, sobra una de
 * las dos.
 *
 * Los precios no se escriben a mano: salen de `calculatePrice`, igual que en
 * el resto del sitio. La columna "desde" es el mínimo de cada categoría —el
 * piso real del tarifario, el mismo que ya publican /tarifas y las páginas
 * de ruta— y la tarifa por hora se deriva del bloque de dos horas, nunca del
 * de una: el mínimo de la categoría es mayor que su hora, así que un bloque
 * de una hora cuesta el mínimo y enseñarlo como "por hora" da el número
 * equivocado.
 *
 * NO se publica ninguna distancia. Una distancia junto a un precio entrega
 * la tarifa por kilómetro, que es interna.
 */

const cats: readonly Category[] = CATEGORIES;

/** El bloque más chico que se puede comprar. De ahí sale la tarifa por hora. */
const MIN_BLOCK = 2;

/** El día completo. Lo define `calculatePrice`, no esta página. */
const FULL_DAY_HOURS = 10;

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}

/** El piso de cada categoría: un traslado corto dentro de la ciudad. */
function desde(cat: Category) {
  return calculatePrice(0, 0, cat, "route", 0, false);
}

/** Lo que cuesta una hora dentro de un bloque. Ver la nota de arriba. */
function porHora(cat: Category) {
  return Math.round(calculatePrice(0, 0, cat, "hour", MIN_BLOCK) / MIN_BLOCK);
}

function porDia(cat: Category) {
  return calculatePrice(0, 0, cat, "day", FULL_DAY_HOURS);
}

/** El rango que declara el JSON-LD. Sale de la misma tabla que se ve. */
export function chauffeurPriceRange() {
  const all = cats.flatMap((c) => [desde(c), porHora(c), porDia(c)]);
  return { low: Math.min(...all), high: Math.max(...all) };
}

const TX = {
  es: {
    navRates: "Tarifas",
    navQuote: "Cotizar",
    navQuoteFull: "Cotizar un chofer privado",
    kicker: "Chofer privado · Ciudad de México",
    title: "Chofer privado en Ciudad de México",
    intro:
      "Un chofer asignado a ti y un vehículo propio de la empresa, para un traslado, para una jornada de reuniones o para el día entero. No es un auto que pasa y se va: el mismo conductor te acompaña durante todo el servicio, espera afuera mientras resuelves y te lleva al siguiente punto. El precio se cierra antes de reservar, con IVA incluido.",

    factSameValue: "El mismo chofer",
    factSameLabel: "durante todo el servicio contratado",
    factSafeValue: "Seguro y GPS",
    factSafeLabel: "en todas las unidades, monitoreo las 24 horas",
    factPriceValue: "Precio fijo",
    factPriceLabel: "IVA incluido, sin cargos sorpresa",

    diffTitle: "En qué se diferencia de pedir un auto por aplicación",
    diffIntro:
      "No es mejor ni peor para todo: es otra cosa. Esto es lo que cambia, y todo se puede comprobar en este sitio antes de pagar.",
    diff: [
      "El conductor es el mismo de principio a fin. No hay un auto distinto en cada parada ni un viaje nuevo que pedir cuando sales de la reunión.",
      "El precio se cierra antes de reservar y no lo mueve el tráfico, la hora ni la demanda del momento.",
      "Las unidades son propias y están aseguradas, con monitoreo GPS las 24 horas.",
      "Se agenda con anticipación —doce horas como mínimo— y queda confirmado por WhatsApp, con el nombre del chofer y el punto de encuentro.",
      "En salidas de aeropuerto monitoreamos el vuelo: si aterriza tarde, la espera ya está incluida en la tarifa.",
      "Se emite factura CFDI a solicitud, a nombre de una persona o de una empresa.",
    ],

    tableTitle: "Lo que cuesta un chofer privado",
    colVehicle: "Vehículo",
    colFrom: "Un traslado, desde",
    colHour: "Por hora",
    colDay: `Día completo · ${FULL_DAY_HOURS} h`,
    tableNote:
      "Precios finales en pesos con IVA incluido. El traslado se cobra por ruta, así que el número de la primera columna es el piso: el cotizador da el precio exacto de tu dirección. El servicio por horas se contrata desde dos horas y la tarifa por hora es la del bloque. Las salidas desde aeropuerto llevan incluido el estacionamiento y la espera por retraso del vuelo.",

    howTitle: "Cómo se contrata",
    how: [
      "Dinos el punto de recogida, el destino o las horas que necesitas, y elige la categoría de vehículo. El precio aparece en pantalla antes de pedirte cualquier dato de pago.",
      "Pagas con tarjeta, transferencia o Mercado Pago, o lo confirmas por WhatsApp. Doce horas de anticipación como mínimo.",
      "El día del servicio te confirmamos el vehículo y el punto de encuentro. El chofer llega a la hora acordada y se queda contigo hasta terminar.",
    ],

    forTitle: "Quién lo contrata",
    forList: [
      "Quien llega de viaje y no quiere resolver transporte cada vez que sale del hotel.",
      "Directivos con una agenda de varios puntos en el mismo día.",
      "Familias que llegan con equipaje y prefieren una camioneta a dos autos.",
      "Quien va a una cena o a un evento y no quiere manejar de regreso.",
      "Quien acompaña a un cliente o a un invitado de fuera y quiere que el traslado no sea el problema.",
    ],

    includedTitle: "Qué incluye",
    included: [
      "Chofer profesional, licenciado y capacitado, y vehículo en condiciones de operar.",
      "Seguro vigente y monitoreo GPS de la unidad las 24 horas.",
      "Precio fijo con IVA: no cambia por tráfico, por horario nocturno ni por las paradas que hagas dentro de lo contratado.",
      "Monitoreo del vuelo y espera sin costo en las salidas desde aeropuerto.",
      "Agua de cortesía, cargadores y climatización.",
      "Factura CFDI a solicitud.",
    ],

    faqTitle: "Preguntas frecuentes",
    faqs: [
      [
        "¿Cuánto cuesta contratar un chofer privado en CDMX?",
        `Un traslado dentro de la ciudad arranca en ${mxn(desde("sedan"))} con IVA en Sedan; el servicio por horas, en ${mxn(porHora("sedan"))} la hora con un mínimo de dos, y el día completo de diez horas, en ${mxn(porDia("sedan"))}. El precio exacto depende de la categoría y de la ruta, y el cotizador lo da en pantalla antes de pedirte datos de pago.`,
      ],
      [
        "¿Es el mismo chofer todo el servicio?",
        "Sí. Se asigna un conductor al servicio y es el mismo de principio a fin: espera entre parada y parada y no hay que pedir un vehículo nuevo cada vez.",
      ],
      [
        "¿Puedo contratarlo sólo para un traslado?",
        "Sí. Un traslado puerta a puerta se cobra por ruta y no tiene mínimo de horas. Si vas a hacer varias paradas, sale mejor el servicio por horas.",
      ],
      [
        "¿Las unidades tienen seguro?",
        "Sí. Todas las unidades circulan con seguro vigente y con monitoreo GPS las 24 horas.",
      ],
      [
        "¿Con cuánta anticipación hay que reservar?",
        "Doce horas como mínimo. Para un día completo o para varios vehículos conviene avisar antes. Si necesitas algo más inmediato, escríbenos por WhatsApp y te decimos si hay unidad disponible.",
      ],
      [
        "¿Qué pasa si no llego a la hora acordada?",
        "En aeropuerto tienes 60 minutos de cortesía desde que aterriza el vuelo, y hasta 30 más si nos avisas que sigues dentro. En cualquier otro punto son 30 minutos desde la hora acordada. Antes de marcar un servicio como no presentado intentamos localizarte por teléfono, WhatsApp y correo.",
      ],
      [
        "¿Cómo se paga y se factura?",
        "Con tarjeta de crédito o débito, nacional o internacional, a través de Stripe o Mercado Pago, o por transferencia bancaria. Se emite factura CFDI a solicitud.",
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

    ctaTitle: "Reserva tu chofer privado",
    ctaCopy:
      "El cotizador calcula el precio exacto con tu dirección real y te deja pagar con tarjeta. Doce horas de anticipación como mínimo.",
    ctaBtn: "Cotizar ahora",

    alsoTitle: "También te puede servir",
    alsoHourly: "Chofer por horas",
    alsoExecutive: "Transporte ejecutivo",
    alsoRates: "Todas las tarifas",
    alsoCorporate: "Cuentas corporativas",

    footPay: "Pago seguro con",
    footTerms: "Términos",
    footPrivacy: "Aviso de privacidad",
  },

  en: {
    navRates: "Rates",
    navQuote: "Quote",
    navQuoteFull: "Get a quote for a private chauffeur",
    kicker: "Private chauffeur · Mexico City",
    title: "Private chauffeur in Mexico City",
    intro:
      "A chauffeur assigned to you and a vehicle the company owns, for a single transfer, a day of meetings or the whole day. It is not a car that drops you and leaves: the same driver stays with you for the entire service, waits outside while you get things done and takes you to the next stop. The price is closed before you book, VAT included.",

    factSameValue: "The same chauffeur",
    factSameLabel: "for the whole booked service",
    factSafeValue: "Insured and GPS",
    factSafeLabel: "on every vehicle, monitored around the clock",
    factPriceValue: "Fixed price",
    factPriceLabel: "VAT included, no surprise charges",

    diffTitle: "How it differs from ordering a car on an app",
    diffIntro:
      "Not better or worse for everything: a different thing. This is what changes, and all of it can be checked on this site before you pay.",
    diff: [
      "The driver is the same from start to finish. No different car at every stop, no new ride to order when you walk out of the meeting.",
      "The price is closed before you book and is not moved by traffic, time of day or how busy the moment is.",
      "The vehicles are our own, insured, and GPS-monitored around the clock.",
      "It is scheduled in advance — twelve hours minimum — and confirmed over WhatsApp, with the chauffeur's name and the meeting point.",
      "On airport pickups we track the flight: if it lands late, the waiting time is already covered by the fare.",
      "A CFDI invoice is issued on request, to a person or to a company.",
    ],

    tableTitle: "What a private chauffeur costs",
    colVehicle: "Vehicle",
    colFrom: "One transfer, from",
    colHour: "Per hour",
    colDay: `Full day · ${FULL_DAY_HOURS} h`,
    tableNote:
      "Final prices in Mexican pesos, VAT included. A transfer is charged by route, so the first column is the floor: the quote form gives the exact price for your address. Hourly service starts at two hours and the per-hour rate is the block rate. Airport pickups already include parking and waiting for flight delays.",

    howTitle: "How to book",
    how: [
      "Tell us the pickup point and the destination, or the hours you need, and pick a vehicle category. The price appears on screen before you hand over any payment details.",
      "Pay by card, bank transfer or Mercado Pago, or confirm over WhatsApp. Twelve hours' notice minimum.",
      "On the day we confirm the vehicle and the meeting point. Your chauffeur arrives at the agreed time and stays with you until the service ends.",
    ],

    forTitle: "Who books it",
    forList: [
      "Travellers who would rather not solve transport every time they leave the hotel.",
      "Executives with several stops on the same day.",
      "Families arriving with luggage who would rather take one van than two cars.",
      "Anyone heading to a dinner or an event who does not want to drive back.",
      "Anyone hosting a client or a visitor and wanting the transport not to be the problem.",
    ],

    includedTitle: "What it covers",
    included: [
      "A licensed, professionally trained chauffeur and a roadworthy vehicle.",
      "Current insurance and 24-hour GPS monitoring on the vehicle.",
      "Fixed price with VAT: unchanged by traffic, night hours or the stops you make within what you booked.",
      "Flight tracking and free waiting on airport pickups.",
      "Complimentary water, chargers and climate control.",
      "CFDI invoice on request.",
    ],

    faqTitle: "Frequently asked",
    faqs: [
      [
        "How much does a private chauffeur cost in Mexico City?",
        `A transfer within the city starts at ${mxn(desde("sedan"))} including VAT in a Sedan; hourly service at ${mxn(porHora("sedan"))} an hour with a two-hour minimum, and a ten-hour full day at ${mxn(porDia("sedan"))}. The exact price depends on the category and the route, and the quote form shows it on screen before asking for any payment details.`,
      ],
      [
        "Is it the same chauffeur for the whole service?",
        "Yes. One driver is assigned to the service and stays for the whole of it: they wait between stops, so there is no new car to order each time.",
      ],
      [
        "Can I book it for a single transfer?",
        "Yes. A door-to-door transfer is charged by route and has no hourly minimum. If you plan several stops, hourly service works out better.",
      ],
      [
        "Are the vehicles insured?",
        "Yes. Every vehicle runs with current insurance and 24-hour GPS monitoring.",
      ],
      [
        "How far ahead should I book?",
        "Twelve hours minimum. For a full day or several vehicles, earlier is better. For anything more immediate, message us on WhatsApp and we will tell you whether a vehicle is free.",
      ],
      [
        "What happens if I am late?",
        "At the airport you have 60 courtesy minutes from the moment the flight lands, and up to 30 more if you tell us you are still inside. Anywhere else it is 30 minutes from the agreed time. Before marking a service as a no-show we try to reach you by phone, WhatsApp and email.",
      ],
      [
        "How do payment and invoicing work?",
        "By credit or debit card, Mexican or international, through Stripe or Mercado Pago, or by bank transfer. A CFDI invoice is issued on request.",
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

    ctaTitle: "Book your private chauffeur",
    ctaCopy:
      "The quote form works out the exact price from your real address and lets you pay by card. Twelve hours' notice minimum.",
    ctaBtn: "Get a quote",

    alsoTitle: "You may also need",
    alsoHourly: "Hourly chauffeur",
    alsoExecutive: "Executive transportation",
    alsoRates: "All rates",
    alsoCorporate: "Corporate accounts",

    footPay: "Secure payment with",
    footTerms: "Terms",
    footPrivacy: "Privacy notice",
  },
} as const;

/** Las preguntas, para que la página las declare en JSON-LD sin reescribirlas.
 *  Un esquema que no coincide con lo visible le cuesta al sitio entero los
 *  resultados enriquecidos. */
export function chauffeurFaqs(lang: Lang) {
  return TX[lang].faqs;
}

/**
 * Prefijo propio, como todos los componentes de este sitio: compartir un
 * bloque de estilos obligaría a que dos páginas no puedan moverse por
 * separado.
 */
const styles = `
  .cf-root { background:#0A0A0A; color:#ECEAE6; min-height:100vh; font-family:var(--font-barlow),sans-serif; font-weight:300; }
  .cf-nav { max-width:1180px; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .cf-nav a { text-decoration:none; }
  .cf-nav-right { display:flex; align-items:center; gap:14px; }
  .cf-nav-link { font-size:11px; letter-spacing:0.12em; color:#BFC3C8; text-transform:uppercase; white-space:nowrap; }
  .cf-nav-link:hover { color:#fff; }
  .cf-nav-cta { border:1px solid #C8A46B; border-radius:2px; padding:10px 16px; color:#fff; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .cf-nav-cta:hover { background:#C8A46B; color:#0A0A0A; }

  .cf-wrap { max-width:900px; margin:0 auto; padding:16px 28px 100px; }

  .cf-kicker { color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin:34px 0 14px; }
  .cf-title { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(34px,5.4vw,56px); line-height:1.06; margin:0 0 20px; text-wrap:balance; }
  .cf-intro { color:#BFC3C8; font-size:17px; line-height:1.7; max-width:64ch; margin:0; }

  .cf-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; max-width:700px; margin:34px 0 0; }
  .cf-fact { border-top:1px solid rgba(255,255,255,0.32); padding-top:14px; }
  .cf-fact-value { font-family:var(--font-barlow-condensed),sans-serif; font-size:21px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }
  .cf-fact-label { color:#BFC3C8; font-size:12px; line-height:1.4; margin-top:4px; }

  .cf-section { margin-top:64px; }
  .cf-h2 { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(26px,3.4vw,34px); line-height:1.15; margin:0 0 18px; color:#fff; text-wrap:balance; }
  .cf-p { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0 0 16px; }

  .cf-table-scroll { overflow-x:auto; }
  .cf-table { width:100%; min-width:520px; border-collapse:collapse; font-size:15px; }
  .cf-table th { text-align:left; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#8B8B87; padding:0 0 12px; border-bottom:1px solid #232323; }
  .cf-table th + th, .cf-table td + td { text-align:right; }
  .cf-table td { border-bottom:1px solid #1a1a1a; padding:14px 0; color:#BFC3C8; font-variant-numeric:tabular-nums; }
  .cf-table td:first-child { color:#fff; }
  .cf-veh-cap { display:block; color:#8B8B87; font-size:12px; margin-top:2px; }
  .cf-note { color:#8B8B87; font-size:13px; line-height:1.65; max-width:66ch; margin:16px 0 0; }

  .cf-steps { list-style:none; counter-reset:cf; margin:0; padding:0; display:grid; gap:18px; max-width:66ch; }
  .cf-steps li { counter-increment:cf; position:relative; padding-left:44px; color:#BFC3C8; font-size:16px; line-height:1.7; }
  .cf-steps li::before { content:counter(cf); position:absolute; left:0; top:0; width:28px; height:28px; border:1px solid rgba(200,164,107,0.5); border-radius:50%; color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; }

  .cf-list { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0; padding-left:20px; }
  .cf-list li { margin-bottom:10px; }
  .cf-list li::marker { color:#C8A46B; }

  .cf-faq { border-top:1px solid #232323; padding:22px 0; }
  .cf-faq-q { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:16px; letter-spacing:0.03em; color:#fff; margin:0 0 8px; }
  .cf-faq-a { color:#BFC3C8; font-size:15px; line-height:1.7; max-width:70ch; margin:0; }

  .cf-trust { margin-top:64px; border:1px solid #232323; }
  .cf-trust-head { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:20px 24px; border-bottom:1px solid #232323; }
  .cf-trust-badge { display:inline-flex; align-items:center; gap:12px; text-decoration:none; }
  .cf-trust-score { font-family:var(--font-cormorant),Georgia,serif; font-size:28px; line-height:1; color:#fff; }
  .cf-trust-stars { color:#C8A46B; font-size:13px; letter-spacing:1px; }
  .cf-trust-count { color:#BFC3C8; font-size:12.5px; }
  .cf-trust-see { margin-left:auto; color:#C8A46B; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .cf-trust-see:hover { color:#fff; }
  .cf-trust-quotes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:#232323; }
  .cf-trust-quote { background:#0A0A0A; padding:22px 24px; display:flex; flex-direction:column; gap:12px; }
  .cf-trust-q { font-family:var(--font-cormorant),Georgia,serif; font-size:19px; line-height:1.45; color:#ECEAE6; margin:0; flex-grow:1; text-wrap:balance; }
  .cf-trust-who { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:13px; letter-spacing:0.05em; color:#8B8B87; }
  .cf-trust-who b { color:#fff; font-weight:600; }
  .cf-trust-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; background:#232323; border-top:1px solid #232323; }
  .cf-trust-fact { background:#0A0A0A; padding:20px 24px; }
  .cf-trust-fact-v { font-family:var(--font-barlow-condensed),sans-serif; font-size:19px; font-weight:700; letter-spacing:0.07em; color:#fff; text-transform:uppercase; }
  .cf-trust-fact-l { color:#8B8B87; font-size:12px; line-height:1.5; margin-top:5px; }

  .cf-cta { margin-top:64px; border:1px solid rgba(200,164,107,0.4); padding:36px 32px; text-align:center; }
  .cf-cta-btn { display:inline-block; margin-top:20px; background:#C8A46B; color:#0A0A0A; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; padding:15px 30px; }
  .cf-cta-btn:hover { background:#d9b67e; }

  .cf-also { display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
  .cf-also a { border:1px solid #232323; padding:11px 14px; color:#BFC3C8; text-decoration:none; font-size:13px; }
  .cf-also a:hover { border-color:#C8A46B; color:#fff; }

  .cf-foot { border-top:1px solid rgba(200,164,107,0.28); margin-top:64px; padding-top:24px; font-size:13px; color:#8B8B87; }
  .cf-foot a { color:#C8A46B; text-decoration:none; }
  .cf-foot-pay { display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:12px; padding-bottom:16px; margin-bottom:16px; border-bottom:1px solid #191919; }
  .cf-stripe-mark { display:inline-block; background:#635BFF; color:#fff; font-weight:700; font-size:12px; padding:2px 8px 3px; border-radius:4px; line-height:1.35; }
  .cf-cardmark { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:10px; letter-spacing:0.12em; color:#8B8B87; border:1px solid #333; border-radius:2px; padding:2px 6px 1px; line-height:1.5; }
  .cf-foot-id { display:flex; flex-direction:column; gap:5px; font-style:normal; line-height:1.6; margin-bottom:18px; }
  .cf-foot-name { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#BFC3C8; }
  .cf-foot-id a { color:#BFC3C8; border-bottom:1px solid rgba(200,164,107,0.3); padding-bottom:1px; }
  .cf-foot-id a:hover { color:#C8A46B; }
  .cf-foot-contact { display:flex; flex-wrap:wrap; gap:6px 18px; }
  .cf-foot-links { display:flex; flex-wrap:wrap; gap:8px 20px; }

  .cf-root a:focus-visible { outline:2px solid #C8A46B; outline-offset:3px; }

  @media (max-width:700px) {
    .cf-nav { padding:16px 14px; gap:10px; }
    .cf-nav .er-brand-tagline { display:none; }
    .cf-nav-link { display:none; }
    .cf-nav-right { gap:8px; }
    .cf-nav-cta { font-size:10px; padding:8px 9px; letter-spacing:0.06em; }
    .cf-wrap { padding:8px 18px 72px; }
    .cf-facts { grid-template-columns:1fr; gap:12px; }
    .cf-section { margin-top:48px; }
    .cf-cta { padding:28px 20px; }
    .cf-trust { margin-top:48px; }
    .cf-trust-head { padding:16px 18px; gap:10px; }
    .cf-trust-see { margin-left:0; flex-basis:100%; }
    .cf-trust-quotes { grid-template-columns:1fr; }
    .cf-trust-quote { padding:18px; }
    .cf-trust-facts { grid-template-columns:1fr; }
    .cf-trust-fact { padding:16px 18px; }
  }
`;

export default function ChauffeurPage({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const home = path(lang, "home");
  const quote = `${home}#quote`;

  return (
    <div className="cf-root">
      <style>{styles}</style>

      <nav className="cf-nav">
        <Link href={home} aria-label="Elite Route">
          <BrandMark size={17} compact={14} />
        </Link>
        <div className="cf-nav-right">
          <Link href={path(lang, "rates")} className="cf-nav-link">{t.navRates}</Link>
          <Link href={quote} className="cf-nav-cta" aria-label={t.navQuoteFull}>{t.navQuote}</Link>
          <LangToggle lang={lang} page="chauffeur" />
        </div>
      </nav>

      <main className="cf-wrap">
        <p className="cf-kicker">{t.kicker}</p>
        <h1 className="cf-title">{t.title}</h1>
        <p className="cf-intro">{t.intro}</p>

        <div className="cf-facts">
          <div className="cf-fact">
            <div className="cf-fact-value">{t.factSameValue}</div>
            <div className="cf-fact-label">{t.factSameLabel}</div>
          </div>
          <div className="cf-fact">
            <div className="cf-fact-value">{t.factSafeValue}</div>
            <div className="cf-fact-label">{t.factSafeLabel}</div>
          </div>
          <div className="cf-fact">
            <div className="cf-fact-value">{t.factPriceValue}</div>
            <div className="cf-fact-label">{t.factPriceLabel}</div>
          </div>
        </div>

        <section className="cf-section">
          <h2 className="cf-h2">{t.diffTitle}</h2>
          <p className="cf-p">{t.diffIntro}</p>
          <ul className="cf-list">
            {t.diff.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>

        <section className="cf-section">
          <h2 className="cf-h2">{t.tableTitle}</h2>
          <div className="cf-table-scroll">
            <table className="cf-table">
              <thead>
                <tr>
                  <th>{t.colVehicle}</th>
                  <th>{t.colFrom}</th>
                  <th>{t.colHour}</th>
                  <th>{t.colDay}</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((cat) => {
                  const nota = lang === "es" ? vehicles[cat].noteEs : vehicles[cat].note;
                  return (
                    <tr key={cat}>
                      <td>
                        {vehicles[cat].name}
                        <span className="cf-veh-cap">
                          {lang === "es" ? vehicles[cat].capEs : vehicles[cat].cap}
                        </span>
                        {nota && <span className="cf-veh-cap">{nota}</span>}
                      </td>
                      <td>{mxn(desde(cat))}</td>
                      <td>{mxn(porHora(cat))}</td>
                      <td>{mxn(porDia(cat))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="cf-note">{t.tableNote}</p>
        </section>

        <section className="cf-section">
          <h2 className="cf-h2">{t.howTitle}</h2>
          <ol className="cf-steps">
            {t.how.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </section>

        <section className="cf-section">
          <h2 className="cf-h2">{t.forTitle}</h2>
          <ul className="cf-list">
            {t.forList.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>

        <section className="cf-section">
          <h2 className="cf-h2">{t.includedTitle}</h2>
          <ul className="cf-list">
            {t.included.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>

        <section className="cf-trust" aria-label={t.trustTitle}>
          <div className="cf-trust-head">
            <a className="cf-trust-badge" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.5 5.4C39.9 37 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
              </svg>
              <span className="cf-trust-score">{GOOGLE_RATING}</span>
              <span>
                <span className="cf-trust-stars">★★★★★</span>
                <br />
                <span className="cf-trust-count">{t.trustRating}</span>
              </span>
            </a>
            <a className="cf-trust-see" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              {t.trustSeeAll} →
            </a>
          </div>

          <div className="cf-trust-quotes">
            {REVIEWS.slice(0, 2).map((r) => (
              <figure className="cf-trust-quote" key={r.name}>
                <blockquote className="cf-trust-q">“{r.quote}”</blockquote>
                <figcaption className="cf-trust-who">
                  <b>{r.name}</b> · Google
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="cf-trust-facts">
            <div className="cf-trust-fact">
              <div className="cf-trust-fact-v">{t.trustYears}</div>
              <div className="cf-trust-fact-l">{t.trustYearsLabel}</div>
            </div>
            <div className="cf-trust-fact">
              <div className="cf-trust-fact-v">{t.trustVolume}</div>
              <div className="cf-trust-fact-l">{t.trustVolumeLabel}</div>
            </div>
            <div className="cf-trust-fact">
              <div className="cf-trust-fact-v">{t.trustPayValue}</div>
              <div className="cf-trust-fact-l">{t.trustPayLabel}</div>
            </div>
          </div>
        </section>

        <section className="cf-section">
          <h2 className="cf-h2">{t.faqTitle}</h2>
          {t.faqs.map(([q, a]) => (
            <div className="cf-faq" key={q}>
              <p className="cf-faq-q">{q}</p>
              <p className="cf-faq-a">{a}</p>
            </div>
          ))}
        </section>

        <div className="cf-cta">
          <h2 className="cf-h2" style={{ marginBottom: 12 }}>{t.ctaTitle}</h2>
          <p className="cf-p" style={{ margin: "0 auto", maxWidth: "52ch" }}>{t.ctaCopy}</p>
          <Link href={quote} className="cf-cta-btn">{t.ctaBtn}</Link>
        </div>

        <section className="cf-section">
          <h2 className="cf-h2">{t.alsoTitle}</h2>
          <div className="cf-also">
            <Link href={path(lang, "hourly")}>{t.alsoHourly}</Link>
            <Link href={path(lang, "executive")}>{t.alsoExecutive}</Link>
            <Link href={path(lang, "rates")}>{t.alsoRates}</Link>
            <Link href={path(lang, "corporate")}>{t.alsoCorporate}</Link>
          </div>
        </section>

        <footer className="cf-foot">
          <p className="cf-foot-pay">
            <span>{t.footPay}</span>
            <span className="cf-stripe-mark">stripe</span>
            <span className="cf-cardmark">VISA</span>
            <span className="cf-cardmark">MASTERCARD</span>
            <span className="cf-cardmark">AMEX</span>
          </p>

          {/* Sin domicilio: es la casa del dueño. Ver el pie de HomeClient. */}
          <address className="cf-foot-id">
            <span className="cf-foot-name">{LEGAL.responsable}</span>
            <span className="cf-foot-contact">
              <a href={LEGAL.whatsappUrl} target="_blank" rel="noopener noreferrer">{LEGAL.whatsapp}</a>
              <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>
            </span>
          </address>

          <div className="cf-foot-links">
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
