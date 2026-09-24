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
 * La flota: cuál elegir, y cuándo NO elegirla.
 *
 * Esta página NO existe para enseñar fotos. Sólo hay cuatro imágenes de
 * categoría —las mismas que usan /b2b y /transporte-ejecutivo-cdmx— porque
 * el dueño decidió el 22 sep 2026 no publicar ninguna foto por modelo. Una
 * página de flota que sólo repita esas cuatro imágenes y las cuatro
 * capacidades no aporta nada que no esté ya en dos sitios.
 *
 * Lo que sí falta en todo el sitio, y es lo que esta página contesta, es la
 * decisión: con cuánta gente y cuánto equipaje entra cada categoría, para
 * qué sirve, **cuándo conviene no elegirla** y cómo se asigna la unidad el
 * día del servicio. Eso no está en ninguna otra parte.
 *
 * Por eso aquí NO hay tabla de precios: la de /chofer-privado-cdmx ya da
 * traslado, hora y día por categoría, y repetirla convertiría esta página en
 * una copia. Cada categoría enseña UN número —su "desde"— y enlaza a donde
 * vive el resto.
 *
 * Las capacidades y los modelos salen de lib/vehicles.ts, que es la misma
 * fuente del cotizador: no pueden contradecirse.
 */

const cats: readonly Category[] = CATEGORIES;

/** El orden de presentación va de mayor a menor, como en /b2b. */
const ORDEN: readonly Category[] = ["suv", "executive", "minivan", "sedan"];

const FULL_DAY_HOURS = 10;

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}

/** El piso de cada categoría: el único precio que publica esta página. */
function desde(cat: Category) {
  return calculatePrice(0, 0, cat, "route", 0, false);
}

/** El rango que declara el JSON-LD: exactamente los cuatro "desde" visibles. */
export function fleetPriceRange() {
  const visibles = cats.map(desde);
  return { low: Math.min(...visibles), high: Math.max(...visibles) };
}

/**
 * Lo propio de cada categoría: para qué es y cuándo no.
 *
 * El "cuándo no" es deliberado y es lo que hace útil la página. Decirle a
 * alguien que la categoría de arriba no le hace falta cuesta una venta hoy y
 * gana la credibilidad que este sitio lleva meses construyendo a base de no
 * afirmar lo que no puede sostener.
 */
const DETALLE: Record<Category, { forEs: string; forEn: string; notEs: string; notEn: string }> = {
  suv: {
    forEs:
      "Es la que más equipaje admite y la que más se pide para aeropuerto con familia o con equipo. Va cómoda en carretera, así que también es la de las rutas foráneas largas.",
    forEn:
      "It takes the most luggage and is the one most asked for at the airport with family or with equipment. It is comfortable on the motorway, so it is also the one for the long out-of-town routes.",
    notEs:
      "Si van tres personas con poco equipaje, es más auto del que necesitas: la Executive cuesta menos y llega igual de bien.",
    notEn:
      "If there are three of you with little luggage, it is more car than you need: the Executive costs less and gets you there just as well.",
  },
  executive: {
    forEs:
      "Es la de presentación: recoger a un cliente, un directivo que llega de fuera, una cena. Lleva la misma gente que el Sedan pero una maleta más y un vehículo de otra gama.",
    forEn:
      "This is the one for making an impression: collecting a client, an executive flying in, a dinner. It carries the same people as the Sedan but one more suitcase, and in a different class of car.",
    notEs:
      "No sube de categoría por capacidad: si van cuatro personas, esta no es la solución aunque cueste más. Ahí entra la Minivan o la High SUV.",
    notEn:
      "It is not a step up in capacity: if there are four of you, this is not the answer even though it costs more. That is where the Minivan or the High SUV come in.",
  },
  minivan: {
    forEs:
      "Es la de grupo: seis personas sentadas sin apretar, con acceso cómodo y buena altura para subir y bajar. Cuesta menos que la Executive porque es más espacio, no más gama.",
    forEn:
      "This is the group one: six people seated without squeezing, easy access and a good height for getting in and out. It costs less than the Executive because it is more space, not more class.",
    notEs:
      "Seis pasajeros con equipaje completo no caben a la vez. Si van seis y todos con maleta grande, hay que ir a la High SUV o a dos unidades.",
    notEn:
      "Six passengers with full luggage do not fit at the same time. If there are six of you and everyone has a large case, it has to be the High SUV or two vehicles.",
  },
  sedan: {
    forEs:
      "Es la eficiente: una o dos personas, equipaje de mano o una maleta cada uno, dentro de la ciudad. La mayoría de los traslados de trabajo caben aquí.",
    forEn:
      "This is the efficient one: one or two people, hand luggage or a case each, within the city. Most business transfers fit here.",
    notEs:
      "Con tres pasajeros y tres maletas se queda corta, y para un vuelo internacional con equipaje documentado también. Mejor subir una categoría que llegar y no cerrar la cajuela.",
    notEn:
      "With three passengers and three cases it falls short, and the same goes for an international flight with checked bags. Better to go up a category than to arrive and not be able to close the boot.",
  },
};

const TX = {
  es: {
    navRates: "Tarifas",
    navQuote: "Cotizar",
    navQuoteFull: "Cotizar un traslado",
    kicker: "Flota · Ciudad de México",
    title: "Nuestra flota: qué vehículo elegir",
    intro:
      "Cuatro categorías, todas con unidades propias de Elite Route. La reserva se hace por categoría, no por modelo, y la diferencia entre una y otra no es sólo cuánta gente cabe: también cuántas maletas entran a la vez, que es lo que de verdad decide. Esta página dice para qué sirve cada una y cuándo conviene no elegirla.",

    factCatsValue: "4 categorías",
    factCatsLabel: "de Sedan a High SUV, todas propias",
    factSafeValue: "Seguro y GPS",
    factSafeLabel: "en todas las unidades, monitoreo las 24 horas",
    factBookValue: "Se reserva por categoría",
    factBookLabel: "marca y modelo se asignan según disponibilidad",

    forLabel: "Para qué es",
    notLabel: "Cuándo no elegirla",
    fromLabel: "Desde",
    orEquivalent: "o equivalente",
    seePrices: "Ver todos sus precios",
    alt: (n: string) => `Categoría ${n} de la flota de Elite Route`,

    capTitle: "Cuántos caben de verdad",
    capCopy:
      "El máximo de pasajeros y el de maletas no siempre caben a la vez. Esta es la lectura honesta de cada categoría.",
    colVehicle: "Vehículo",
    colPax: "Pasajeros",
    colBags: "Maletas",
    colReal: "Con equipaje completo",
    realFull: "sin restricción",

    assignTitle: "Cómo se asigna la unidad",
    assign: [
      "Reservas una categoría y recibes esa categoría. La marca, el modelo y el color se asignan el día del servicio según la disponibilidad y lo que pida el traslado.",
      "Por eso en cada categoría verás los modelos seguidos de «o equivalente»: son ejemplos de lo que opera en esa categoría, no una promesa de un auto concreto.",
      "Si tu servicio necesita un modelo o un color determinado —una boda, un evento con protocolo—, escríbenos por WhatsApp antes de reservar y te decimos si es posible.",
      "Si van más personas de las que entran en una unidad, se cotizan dos: el cotizador corporativo permite varios servicios en la misma solicitud.",
    ],

    allTitle: "Lo que llevan todas",
    all: [
      "Seguro vigente y monitoreo GPS de la unidad las 24 horas.",
      "Chofer profesional, licenciado y capacitado.",
      "Agua de cortesía, cargadores y climatización.",
      "Precio fijo con IVA, cerrado antes de reservar.",
      "Factura CFDI a solicitud.",
    ],

    faqTitle: "Preguntas frecuentes",
    faqs: [
      [
        "¿Puedo elegir marca y modelo?",
        "La reserva es por categoría, no por modelo: marca, modelo y color se asignan según la disponibilidad del día. Si tu servicio necesita algo concreto, escríbenos por WhatsApp antes de reservar y te decimos si es posible.",
      ],
      [
        "¿Cuántas maletas entran de verdad?",
        "Dos en Sedan, tres en Executive, cuatro en Minivan y seis en High SUV. En Minivan y High SUV el máximo de pasajeros y el de maletas no caben a la vez: con equipaje completo recomendamos cuatro pasajeros.",
      ],
      [
        "¿Los autos son propios o subcontratados?",
        "Son unidades propias de Elite Route, con seguro vigente y monitoreo GPS las 24 horas.",
      ],
      [
        "Somos más de seis, ¿qué hacemos?",
        "Se cotizan dos unidades. Para grupos, eventos o varias salidas a la vez, el cotizador corporativo permite meter todos los servicios en una sola solicitud.",
      ],
      [
        "¿Cuál me conviene para el aeropuerto?",
        "Cuenta las maletas antes que las personas. Una o dos personas con una maleta cada una van bien en Sedan; tres con equipaje documentado, en Executive; cuatro o más, en Minivan o High SUV según cuánto lleven.",
      ],
      [
        "¿El precio depende de la categoría?",
        "Sí. Cada categoría tiene su propia tarifa, y el precio del traslado depende además de la ruta. El cotizador da el número exacto en pantalla antes de pedirte cualquier dato de pago.",
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

    ctaTitle: "¿Ya sabes cuál necesitas?",
    ctaCopy:
      "El cotizador calcula el precio exacto de tu ruta en la categoría que elijas, antes de pedirte cualquier dato de pago.",
    ctaBtn: "Cotizar ahora",

    alsoTitle: "También te puede servir",
    alsoChauffeur: "Chofer privado",
    alsoAirport: "Traslados de aeropuerto",
    alsoRates: "Todas las tarifas",
    alsoCorporate: "Cuentas corporativas",

    footPay: "Pago seguro con",
    footTerms: "Términos",
    footPrivacy: "Aviso de privacidad",
  },

  en: {
    navRates: "Rates",
    navQuote: "Quote",
    navQuoteFull: "Get a quote for a transfer",
    kicker: "Fleet · Mexico City",
    title: "Our fleet: which vehicle to choose",
    intro:
      "Four categories, every vehicle owned by Elite Route. You book a category, not a model, and the difference between them is not only how many people fit: it is how many suitcases fit at the same time, which is what actually decides. This page says what each one is for and when you are better off not choosing it.",

    factCatsValue: "4 categories",
    factCatsLabel: "from Sedan to High SUV, all our own",
    factSafeValue: "Insured and GPS",
    factSafeLabel: "on every vehicle, monitored around the clock",
    factBookValue: "Booked by category",
    factBookLabel: "make and model assigned by availability",

    forLabel: "What it is for",
    notLabel: "When not to choose it",
    fromLabel: "From",
    orEquivalent: "or equivalent",
    seePrices: "See all its prices",
    alt: (n: string) => `${n} category in the Elite Route fleet`,

    capTitle: "How many really fit",
    capCopy:
      "The maximum number of passengers and the maximum number of suitcases do not always fit at the same time. This is the honest reading of each category.",
    colVehicle: "Vehicle",
    colPax: "Passengers",
    colBags: "Suitcases",
    colReal: "With full luggage",
    realFull: "no restriction",

    assignTitle: "How the vehicle is assigned",
    assign: [
      "You book a category and you get that category. Make, model and colour are assigned on the day according to availability and what the service calls for.",
      "That is why each category lists models followed by “or equivalent”: they are examples of what runs in that category, not a promise of one particular car.",
      "If your service needs a specific model or colour — a wedding, an event with protocol — message us on WhatsApp before booking and we will tell you whether it is possible.",
      "If there are more of you than fit in one vehicle, two are quoted: the corporate quote form takes several services in a single request.",
    ],

    allTitle: "What every vehicle carries",
    all: [
      "Current insurance and 24-hour GPS monitoring.",
      "A licensed, professionally trained chauffeur.",
      "Complimentary water, chargers and climate control.",
      "A fixed price with VAT, closed before you book.",
      "CFDI invoice on request.",
    ],

    faqTitle: "Frequently asked",
    faqs: [
      [
        "Can I choose the make and model?",
        "The booking is by category, not by model: make, model and colour are assigned according to that day's availability. If your service needs something specific, message us on WhatsApp before booking and we will tell you whether it is possible.",
      ],
      [
        "How many suitcases really fit?",
        "Two in the Sedan, three in the Executive, four in the Minivan and six in the High SUV. On the Minivan and the High SUV the maximum passengers and the maximum cases do not fit at the same time: with full luggage we recommend four passengers.",
      ],
      [
        "Are the cars your own or subcontracted?",
        "They are Elite Route's own vehicles, with current insurance and 24-hour GPS monitoring.",
      ],
      [
        "There are more than six of us — what now?",
        "Two vehicles are quoted. For groups, events or several departures at once, the corporate quote form takes all the services in a single request.",
      ],
      [
        "Which one suits the airport?",
        "Count the suitcases before the people. One or two people with a case each are fine in a Sedan; three with checked bags, in an Executive; four or more, in a Minivan or a High SUV depending on how much they are carrying.",
      ],
      [
        "Does the price depend on the category?",
        "Yes. Each category has its own rate, and the transfer price also depends on the route. The quote form shows the exact figure on screen before asking for any payment details.",
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

    ctaTitle: "Know which one you need?",
    ctaCopy:
      "The quote form works out the exact price of your route in the category you pick, before asking for any payment details.",
    ctaBtn: "Get a quote",

    alsoTitle: "You may also need",
    alsoChauffeur: "Private chauffeur",
    alsoAirport: "Airport transfers",
    alsoRates: "All rates",
    alsoCorporate: "Corporate accounts",

    footPay: "Secure payment with",
    footTerms: "Terms",
    footPrivacy: "Privacy notice",
  },
} as const;

/** Las preguntas, para declararlas en JSON-LD sin reescribirlas. */
export function fleetFaqs(lang: Lang) {
  return TX[lang].faqs;
}

const styles = `
  .fl-root { background:#0A0A0A; color:#ECEAE6; min-height:100vh; font-family:var(--font-barlow),sans-serif; font-weight:300; }
  .fl-nav { max-width:1180px; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .fl-nav a { text-decoration:none; }
  .fl-nav-right { display:flex; align-items:center; gap:14px; }
  .fl-nav-link { font-size:11px; letter-spacing:0.12em; color:#BFC3C8; text-transform:uppercase; white-space:nowrap; }
  .fl-nav-link:hover { color:#fff; }
  .fl-nav-cta { border:1px solid #C8A46B; border-radius:2px; padding:10px 16px; color:#fff; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .fl-nav-cta:hover { background:#C8A46B; color:#0A0A0A; }

  .fl-wrap { max-width:900px; margin:0 auto; padding:16px 28px 100px; }

  .fl-kicker { color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin:34px 0 14px; }
  .fl-title { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(34px,5.4vw,56px); line-height:1.06; margin:0 0 20px; text-wrap:balance; }
  .fl-intro { color:#BFC3C8; font-size:17px; line-height:1.7; max-width:64ch; margin:0; }

  .fl-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; max-width:720px; margin:34px 0 0; }
  .fl-fact { border-top:1px solid rgba(255,255,255,0.32); padding-top:14px; }
  .fl-fact-value { font-family:var(--font-barlow-condensed),sans-serif; font-size:21px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }
  .fl-fact-label { color:#BFC3C8; font-size:12px; line-height:1.4; margin-top:4px; }

  .fl-section { margin-top:64px; }
  .fl-h2 { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(26px,3.4vw,34px); line-height:1.15; margin:0 0 18px; color:#fff; text-wrap:balance; }
  .fl-p { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0 0 16px; }

  /* Cada categoría es una ficha entera, no una tarjeta de catálogo: la foto
     arriba y debajo lo que de verdad decide la elección. */
  .fl-cat { margin-top:56px; border-top:1px solid #232323; padding-top:34px; }
  .fl-cat img { display:block; width:100%; height:auto; aspect-ratio:16 / 9; object-fit:cover; border:1px solid #232323; }
  .fl-cat-head { display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; margin:22px 0 4px; }
  .fl-cat-name { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(26px,3.4vw,34px); line-height:1.1; color:#fff; margin:0; }
  .fl-cat-from { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:13px; letter-spacing:0.12em; text-transform:uppercase; color:#C8A46B; white-space:nowrap; }
  .fl-cat-models { color:#8B8B87; font-size:13.5px; letter-spacing:0.03em; margin:0 0 4px; }
  .fl-cat-cap { color:#BFC3C8; font-size:14px; margin:0; }
  .fl-cat-note { color:#6f6f6c; font-size:12.5px; line-height:1.7; margin:6px 0 0; }
  .fl-cat-block { margin-top:20px; }
  .fl-cat-label { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#8B8B87; margin:0 0 6px; }
  .fl-cat-text { color:#BFC3C8; font-size:15.5px; line-height:1.75; max-width:68ch; margin:0; }
  .fl-cat-link { display:inline-block; margin-top:18px; color:#C8A46B; text-decoration:none; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; border-bottom:1px solid rgba(200,164,107,0.35); padding-bottom:2px; }
  .fl-cat-link:hover { color:#fff; border-bottom-color:#fff; }

  .fl-table-scroll { overflow-x:auto; }
  .fl-table { width:100%; min-width:520px; border-collapse:collapse; font-size:15px; }
  .fl-table th { text-align:left; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#8B8B87; padding:0 0 12px; border-bottom:1px solid #232323; }
  .fl-table th + th, .fl-table td + td { text-align:right; }
  .fl-table td { border-bottom:1px solid #1a1a1a; padding:14px 0; color:#BFC3C8; font-variant-numeric:tabular-nums; }
  .fl-table td:first-child { color:#fff; }

  .fl-steps { list-style:none; counter-reset:fl; margin:0; padding:0; display:grid; gap:18px; max-width:66ch; }
  .fl-steps li { counter-increment:fl; position:relative; padding-left:44px; color:#BFC3C8; font-size:16px; line-height:1.7; }
  .fl-steps li::before { content:counter(fl); position:absolute; left:0; top:0; width:28px; height:28px; border:1px solid rgba(200,164,107,0.5); border-radius:50%; color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; }

  .fl-list { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0; padding-left:20px; }
  .fl-list li { margin-bottom:10px; }
  .fl-list li::marker { color:#C8A46B; }

  .fl-faq { border-top:1px solid #232323; padding:22px 0; }
  .fl-faq-q { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:16px; letter-spacing:0.03em; color:#fff; margin:0 0 8px; }
  .fl-faq-a { color:#BFC3C8; font-size:15px; line-height:1.7; max-width:70ch; margin:0; }

  .fl-trust { margin-top:64px; border:1px solid #232323; }
  .fl-trust-head { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:20px 24px; border-bottom:1px solid #232323; }
  .fl-trust-badge { display:inline-flex; align-items:center; gap:12px; text-decoration:none; }
  .fl-trust-score { font-family:var(--font-cormorant),Georgia,serif; font-size:28px; line-height:1; color:#fff; }
  .fl-trust-stars { color:#C8A46B; font-size:13px; letter-spacing:1px; }
  .fl-trust-count { color:#BFC3C8; font-size:12.5px; }
  .fl-trust-see { margin-left:auto; color:#C8A46B; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .fl-trust-see:hover { color:#fff; }
  .fl-trust-quotes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:#232323; }
  .fl-trust-quote { background:#0A0A0A; padding:22px 24px; display:flex; flex-direction:column; gap:12px; }
  .fl-trust-q { font-family:var(--font-cormorant),Georgia,serif; font-size:19px; line-height:1.45; color:#ECEAE6; margin:0; flex-grow:1; text-wrap:balance; }
  .fl-trust-who { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:13px; letter-spacing:0.05em; color:#8B8B87; }
  .fl-trust-who b { color:#fff; font-weight:600; }
  .fl-trust-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; background:#232323; border-top:1px solid #232323; }
  .fl-trust-fact { background:#0A0A0A; padding:20px 24px; }
  .fl-trust-fact-v { font-family:var(--font-barlow-condensed),sans-serif; font-size:19px; font-weight:700; letter-spacing:0.07em; color:#fff; text-transform:uppercase; }
  .fl-trust-fact-l { color:#8B8B87; font-size:12px; line-height:1.5; margin-top:5px; }

  .fl-cta { margin-top:64px; border:1px solid rgba(200,164,107,0.4); padding:36px 32px; text-align:center; }
  .fl-cta-btn { display:inline-block; margin-top:20px; background:#C8A46B; color:#0A0A0A; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; padding:15px 30px; }
  .fl-cta-btn:hover { background:#d9b67e; }

  .fl-also { display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
  .fl-also a { border:1px solid #232323; padding:11px 14px; color:#BFC3C8; text-decoration:none; font-size:13px; }
  .fl-also a:hover { border-color:#C8A46B; color:#fff; }

  .fl-foot { border-top:1px solid rgba(200,164,107,0.28); margin-top:64px; padding-top:24px; font-size:13px; color:#8B8B87; }
  .fl-foot a { color:#C8A46B; text-decoration:none; }
  .fl-foot-pay { display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:12px; padding-bottom:16px; margin-bottom:16px; border-bottom:1px solid #191919; }
  .fl-stripe-mark { display:inline-block; background:#635BFF; color:#fff; font-weight:700; font-size:12px; padding:2px 8px 3px; border-radius:4px; line-height:1.35; }
  .fl-cardmark { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:10px; letter-spacing:0.12em; color:#8B8B87; border:1px solid #333; border-radius:2px; padding:2px 6px 1px; line-height:1.5; }
  .fl-foot-id { display:flex; flex-direction:column; gap:5px; font-style:normal; line-height:1.6; margin-bottom:18px; }
  .fl-foot-name { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#BFC3C8; }
  .fl-foot-id a { color:#BFC3C8; border-bottom:1px solid rgba(200,164,107,0.3); padding-bottom:1px; }
  .fl-foot-id a:hover { color:#C8A46B; }
  .fl-foot-contact { display:flex; flex-wrap:wrap; gap:6px 18px; }
  .fl-foot-links { display:flex; flex-wrap:wrap; gap:8px 20px; }

  .fl-root a:focus-visible { outline:2px solid #C8A46B; outline-offset:3px; }

  @media (max-width:700px) {
    .fl-nav { padding:16px 14px; gap:10px; }
    .fl-nav .er-brand-tagline { display:none; }
    .fl-nav-link { display:none; }
    .fl-nav-right { gap:8px; }
    .fl-nav-cta { font-size:10px; padding:8px 9px; letter-spacing:0.06em; }
    .fl-wrap { padding:8px 18px 72px; }
    .fl-facts { grid-template-columns:1fr; gap:12px; }
    .fl-section { margin-top:48px; }
    .fl-cat { margin-top:44px; padding-top:28px; }
    .fl-cta { padding:28px 20px; }
    .fl-trust { margin-top:48px; }
    .fl-trust-head { padding:16px 18px; gap:10px; }
    .fl-trust-see { margin-left:0; flex-basis:100%; }
    .fl-trust-quotes { grid-template-columns:1fr; }
    .fl-trust-quote { padding:18px; }
    .fl-trust-facts { grid-template-columns:1fr; }
    .fl-trust-fact { padding:16px 18px; }
  }
`;

export default function FleetPage({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const home = path(lang, "home");
  const quote = `${home}#quote`;
  const es = lang === "es";

  return (
    <div className="fl-root">
      <style>{styles}</style>

      <nav className="fl-nav">
        <Link href={home} aria-label="Elite Route">
          <BrandMark size={17} compact={14} />
        </Link>
        <div className="fl-nav-right">
          <Link href={path(lang, "rates")} className="fl-nav-link">{t.navRates}</Link>
          <Link href={quote} className="fl-nav-cta" aria-label={t.navQuoteFull}>{t.navQuote}</Link>
          <LangToggle lang={lang} page="fleet" />
        </div>
      </nav>

      <main className="fl-wrap">
        <p className="fl-kicker">{t.kicker}</p>
        <h1 className="fl-title">{t.title}</h1>
        <p className="fl-intro">{t.intro}</p>

        <div className="fl-facts">
          <div className="fl-fact">
            <div className="fl-fact-value">{t.factCatsValue}</div>
            <div className="fl-fact-label">{t.factCatsLabel}</div>
          </div>
          <div className="fl-fact">
            <div className="fl-fact-value">{t.factSafeValue}</div>
            <div className="fl-fact-label">{t.factSafeLabel}</div>
          </div>
          <div className="fl-fact">
            <div className="fl-fact-value">{t.factBookValue}</div>
            <div className="fl-fact-label">{t.factBookLabel}</div>
          </div>
        </div>

        {/* Una ficha por categoría. Las imágenes son las cuatro de categoría
            que ya usa /b2b; no hay fotos por modelo, por instrucción del
            dueño. Lo que esta página aporta está debajo de la foto. */}
        {ORDEN.map((k) => {
          const v = vehicles[k];
          const d = DETALLE[k];
          const nota = es ? v.noteEs : v.note;
          return (
            <section className="fl-cat" key={k}>
              <img
                src={`/flota/${k === "suv" ? "high-suv" : k}.webp`}
                alt={t.alt(v.name)}
                width={1400}
                height={788}
                loading="lazy"
              />
              <div className="fl-cat-head">
                <h2 className="fl-cat-name">{v.name}</h2>
                <span className="fl-cat-from">{t.fromLabel} {mxn(desde(k))}</span>
              </div>
              <p className="fl-cat-models">{v.tag} {t.orEquivalent}</p>
              <p className="fl-cat-cap">{es ? v.capEs : v.cap}</p>
              {nota && <p className="fl-cat-note">{nota}</p>}

              <div className="fl-cat-block">
                <p className="fl-cat-label">{t.forLabel}</p>
                <p className="fl-cat-text">{es ? d.forEs : d.forEn}</p>
              </div>
              <div className="fl-cat-block">
                <p className="fl-cat-label">{t.notLabel}</p>
                <p className="fl-cat-text">{es ? d.notEs : d.notEn}</p>
              </div>

              <Link href={path(lang, "chauffeur")} className="fl-cat-link">{t.seePrices} →</Link>
            </section>
          );
        })}

        <section className="fl-section">
          <h2 className="fl-h2">{t.capTitle}</h2>
          <p className="fl-p">{t.capCopy}</p>
          <div className="fl-table-scroll">
            <table className="fl-table">
              <thead>
                <tr>
                  <th>{t.colVehicle}</th>
                  <th>{t.colPax}</th>
                  <th>{t.colBags}</th>
                  <th>{t.colReal}</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((k) => {
                  const v = vehicles[k];
                  // La capacidad viene escrita ("1-6 pasajeros · 4 maletas"):
                  // se parte para poder enseñar pasajeros y maletas en
                  // columnas propias sin volver a escribir el dato.
                  const [pax, bags] = (es ? v.capEs : v.cap).split("·").map((x) => x.trim());
                  const nota = es ? v.noteEs : v.note;
                  return (
                    <tr key={k}>
                      <td>{v.name}</td>
                      <td>{pax}</td>
                      <td>{bags}</td>
                      <td>{nota ? nota : t.realFull}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="fl-section">
          <h2 className="fl-h2">{t.assignTitle}</h2>
          <ol className="fl-steps">
            {t.assign.map((x) => <li key={x}>{x}</li>)}
          </ol>
        </section>

        <section className="fl-section">
          <h2 className="fl-h2">{t.allTitle}</h2>
          <ul className="fl-list">
            {t.all.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </section>

        <section className="fl-trust" aria-label={t.trustTitle}>
          <div className="fl-trust-head">
            <a className="fl-trust-badge" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.5 5.4C39.9 37 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
              </svg>
              <span className="fl-trust-score">{GOOGLE_RATING}</span>
              <span>
                <span className="fl-trust-stars">★★★★★</span>
                <br />
                <span className="fl-trust-count">{t.trustRating}</span>
              </span>
            </a>
            <a className="fl-trust-see" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              {t.trustSeeAll} →
            </a>
          </div>

          <div className="fl-trust-quotes">
            {REVIEWS.slice(0, 2).map((r) => (
              <figure className="fl-trust-quote" key={r.name}>
                <blockquote className="fl-trust-q">“{r.quote}”</blockquote>
                <figcaption className="fl-trust-who">
                  <b>{r.name}</b> · Google
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="fl-trust-facts">
            <div className="fl-trust-fact">
              <div className="fl-trust-fact-v">{t.trustYears}</div>
              <div className="fl-trust-fact-l">{t.trustYearsLabel}</div>
            </div>
            <div className="fl-trust-fact">
              <div className="fl-trust-fact-v">{t.trustVolume}</div>
              <div className="fl-trust-fact-l">{t.trustVolumeLabel}</div>
            </div>
            <div className="fl-trust-fact">
              <div className="fl-trust-fact-v">{t.trustPayValue}</div>
              <div className="fl-trust-fact-l">{t.trustPayLabel}</div>
            </div>
          </div>
        </section>

        <section className="fl-section">
          <h2 className="fl-h2">{t.faqTitle}</h2>
          {t.faqs.map(([q, a]) => (
            <div className="fl-faq" key={q}>
              <p className="fl-faq-q">{q}</p>
              <p className="fl-faq-a">{a}</p>
            </div>
          ))}
        </section>

        <div className="fl-cta">
          <h2 className="fl-h2" style={{ marginBottom: 12 }}>{t.ctaTitle}</h2>
          <p className="fl-p" style={{ margin: "0 auto", maxWidth: "52ch" }}>{t.ctaCopy}</p>
          <Link href={quote} className="fl-cta-btn">{t.ctaBtn}</Link>
        </div>

        <section className="fl-section">
          <h2 className="fl-h2">{t.alsoTitle}</h2>
          <div className="fl-also">
            <Link href={path(lang, "chauffeur")}>{t.alsoChauffeur}</Link>
            <Link href={path(lang, "airport")}>{t.alsoAirport}</Link>
            <Link href={path(lang, "rates")}>{t.alsoRates}</Link>
            <Link href={path(lang, "corporate")}>{t.alsoCorporate}</Link>
          </div>
        </section>

        <footer className="fl-foot">
          <p className="fl-foot-pay">
            <span>{t.footPay}</span>
            <span className="fl-stripe-mark">stripe</span>
            <span className="fl-cardmark">VISA</span>
            <span className="fl-cardmark">MASTERCARD</span>
            <span className="fl-cardmark">AMEX</span>
          </p>

          {/* Sin domicilio: es la casa del dueño. Ver el pie de HomeClient. */}
          <address className="fl-foot-id">
            <span className="fl-foot-name">{LEGAL.responsable}</span>
            <span className="fl-foot-contact">
              <a href={LEGAL.whatsappUrl} target="_blank" rel="noopener noreferrer">{LEGAL.whatsapp}</a>
              <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>
            </span>
          </address>

          <div className="fl-foot-links">
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
