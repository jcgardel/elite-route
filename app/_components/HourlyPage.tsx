import Link from "next/link";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { calculatePrice } from "@/lib/booking";
import { vehicles, type Category } from "@/lib/vehicles";
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
 * El chofer por horas, con su propia dirección.
 *
 * Era la única de las cuatro intenciones de búsqueda del plan sin página
 * propia: el contenido existía, pero dentro de /tarifas, compitiendo con los
 * traslados al aeropuerto y con las rutas corporativas en la misma página.
 * Quien busca "chofer por horas cdmx" no busca una tabla de todo.
 *
 * Los precios no se escriben a mano: salen de `calculatePrice` con el mismo
 * `serviceType: "hour"` que usa el cotizador, así que la página no puede
 * decir un número y el cotizador otro. Para el servicio por horas los
 * kilómetros y los minutos no entran en la cuenta —la tarifa es por tiempo—,
 * de ahí los ceros.
 */

const cats: Category[] = ["sedan", "executive", "minivan", "suv"];

/** Los bloques que la gente pide de verdad: media mañana, media jornada. */
const BLOCKS = [2, 4] as const;

/** El día completo son diez horas; lo fija `calculatePrice`, no esta página. */
const FULL_DAY_HOURS = 10;

/** Kilómetros incluidos por cada hora contratada. */
const KM_PER_HOUR = 20;

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}

const TX = {
  es: {
    navRates: "Tarifas",
    navQuote: "Cotizar",
    navQuoteFull: "Cotizar servicio por horas",
    kicker: "Disposición · Ciudad de México",
    title: "Chofer por horas en Ciudad de México",
    intro:
      "Contratas al chofer y al vehículo por un bloque de horas, no por un trayecto. Durante ese tiempo se quedan contigo: esperan afuera de cada reunión, te llevan al siguiente punto y no hay que pedir un servicio nuevo en cada parada. El precio es fijo, con IVA, y no lo mueve el tráfico.",
    factMinValue: "Desde 2 horas",
    factMinLabel: "el mínimo por servicio",
    factKmValue: `${KM_PER_HOUR} km por hora`,
    factKmLabel: "incluidos dentro de la Ciudad de México",
    factPriceValue: "Precio fijo",
    factPriceLabel: "IVA incluido, sin cargos sorpresa",

    tableTitle: "Precio por vehículo",
    colVehicle: "Vehículo",
    colHours: (h: number) => `${h} horas`,
    colDay: `Día completo · ${FULL_DAY_HOURS} h`,
    tableNote: `Precios finales en pesos con IVA incluido. Cada hora contratada incluye ${KM_PER_HOUR} km dentro de la Ciudad de México: cuatro horas son 80 km y el día completo, ${FULL_DAY_HOURS * KM_PER_HOUR} km. Si la ruta se pasa de ahí, el cotizador lo dice antes de cobrar.`,

    howTitle: "Cómo funciona",
    how: [
      "Eliges las horas y el vehículo en el cotizador y ves el precio en pantalla, antes de dar cualquier dato de pago.",
      "Pagas con tarjeta o lo confirmas por WhatsApp. Se necesitan seis horas de anticipación como mínimo.",
      "El chofer llega al punto y a la hora acordados y se queda a tu disposición durante todo el bloque.",
    ],

    forTitle: "Para qué se contrata",
    forList: [
      "Una jornada de reuniones en varios puntos de la ciudad, sin buscar transporte entre una y otra.",
      "Ferias, congresos y eventos donde el estacionamiento es el problema.",
      "Visitas a proveedores o a obra, con paradas que no se pueden calcular de antemano.",
      "Acompañar a un directivo o a un cliente que viene de fuera durante todo el día.",
      "Cenas y eventos sociales, donde nadie quiere manejar de regreso.",
    ],

    includedTitle: "Qué incluye",
    included: [
      "Chofer profesional y vehículo en condiciones de operar, a tu disposición durante las horas contratadas.",
      `${KM_PER_HOUR} km incluidos por cada hora, dentro de la Ciudad de México.`,
      "Precio fijo con IVA: no cambia por tráfico, horario nocturno ni por las paradas que hagas.",
      "Agua de cortesía, cargadores y climatización.",
      "Factura CFDI a solicitud.",
    ],

    faqTitle: "Preguntas frecuentes",
    faqs: [
      [
        "¿Cuál es el mínimo de horas?",
        "Dos horas. A partir de ahí puedes contratar las que necesites; el día completo son diez.",
      ],
      [
        "¿El chofer se queda conmigo entre parada y parada?",
        "Sí. Durante las horas contratadas el chofer y el vehículo quedan a tu disposición: no se van y no hay que pedir otro servicio en cada parada.",
      ],
      [
        "¿Cuántos kilómetros incluye?",
        `Veinte kilómetros por cada hora contratada, dentro de la Ciudad de México. Cuatro horas incluyen 80 km y el día completo, ${FULL_DAY_HOURS * KM_PER_HOUR} km.`,
      ],
      [
        "¿El precio cambia por el tráfico o por la hora?",
        "No. La tarifa es fija y con IVA incluido. Ni el tráfico ni el horario nocturno la mueven mientras no se pasen las horas ni los kilómetros contratados.",
      ],
      [
        "¿Se puede facturar?",
        "Sí, se emite factura CFDI a solicitud. El pago con tarjeta lo procesa Stripe y los datos de la tarjeta no pasan por este sitio.",
      ],
      [
        "¿Con cuánta anticipación hay que reservar?",
        "Seis horas como mínimo. Para un día completo o para varios vehículos, conviene avisar antes.",
      ],
    ] as ReadonlyArray<readonly [string, string]>,

    trustTitle: "Quién te va a llevar",
    trustRating: `${GOOGLE_REVIEW_COUNT} reseñas en Google`,
    trustSeeAll: "Ver las reseñas en Google",
    trustYears: `${YEARS_OPERATING} años`,
    trustYearsLabel: "moviendo ejecutivos en Ciudad de México",
    trustVolume: `+${TRANSFERS_PER_YEAR}`,
    trustVolumeLabel: "traslados al año",
    trustPayValue: "Pago con tarjeta",
    trustPayLabel: "procesado por Stripe; la tarjeta no pasa por este sitio",

    ctaTitle: "Reserva tu servicio por horas",
    ctaCopy:
      "El cotizador calcula el precio exacto según las horas y el vehículo, y te deja pagar con tarjeta.",
    ctaBtn: "Cotizar ahora",

    alsoTitle: "También te puede servir",
    alsoRates: "Todas las tarifas",
    alsoCorporate: "Cuentas corporativas",

    footPay: "Pago seguro con",
    footTerms: "Términos",
    footPrivacy: "Aviso de privacidad",
  },

  en: {
    navRates: "Rates",
    navQuote: "Quote",
    navQuoteFull: "Get a quote for hourly service",
    kicker: "By the hour · Mexico City",
    title: "Hourly chauffeur service in Mexico City",
    intro:
      "You book the chauffeur and the car for a block of hours, not for a single ride. They stay with you the whole time: waiting outside each meeting, taking you to the next stop, with no need to order another car every time. The price is fixed, VAT included, and traffic does not move it.",
    factMinValue: "From 2 hours",
    factMinLabel: "minimum booking",
    factKmValue: `${KM_PER_HOUR} km per hour`,
    factKmLabel: "included within Mexico City",
    factPriceValue: "Fixed price",
    factPriceLabel: "VAT included, no surprise charges",

    tableTitle: "Price by vehicle",
    colVehicle: "Vehicle",
    colHours: (h: number) => `${h} hours`,
    colDay: `Full day · ${FULL_DAY_HOURS} h`,
    tableNote: `Final prices in Mexican pesos, VAT included. Every booked hour covers ${KM_PER_HOUR} km within Mexico City: four hours come to 80 km and a full day to ${FULL_DAY_HOURS * KM_PER_HOUR} km. If the route runs past that, the quote form says so before you pay.`,

    howTitle: "How it works",
    how: [
      "Pick the hours and the vehicle in the quote form and see the price on screen, before handing over any payment details.",
      "Pay by card or confirm over WhatsApp. Six hours' notice minimum.",
      "Your chauffeur arrives at the agreed place and time and stays with you for the whole block.",
    ],

    forTitle: "What people book it for",
    forList: [
      "A day of meetings across the city, without hunting for a ride between them.",
      "Trade shows, conferences and events where parking is the real problem.",
      "Supplier or site visits, with stops you cannot plan in advance.",
      "Hosting an executive or a visiting client for a full day.",
      "Dinners and evening events, when nobody wants to drive back.",
    ],

    includedTitle: "What it covers",
    included: [
      "A professional chauffeur and a roadworthy vehicle, at your disposal for the booked hours.",
      `${KM_PER_HOUR} km included per hour, within Mexico City.`,
      "Fixed price with VAT: unchanged by traffic, night hours or how many stops you make.",
      "Complimentary water, chargers and climate control.",
      "CFDI invoice on request.",
    ],

    faqTitle: "Frequently asked",
    faqs: [
      [
        "What is the minimum booking?",
        "Two hours. Beyond that you book as many as you need; a full day is ten.",
      ],
      [
        "Does the chauffeur wait between stops?",
        "Yes. For the hours you book, the chauffeur and the car are yours: they do not leave and you do not order another car at each stop.",
      ],
      [
        "How many kilometres are included?",
        `Twenty kilometres for every hour booked, within Mexico City. Four hours cover 80 km and a full day ${FULL_DAY_HOURS * KM_PER_HOUR} km.`,
      ],
      [
        "Does the price change with traffic or time of day?",
        "No. The rate is fixed, VAT included. Neither traffic nor night hours move it, as long as you stay within the booked hours and kilometres.",
      ],
      [
        "Can I get an invoice?",
        "Yes, a CFDI invoice on request. Card payments are handled by Stripe and your card details never pass through this site.",
      ],
      [
        "How far ahead should I book?",
        "Six hours minimum. For a full day or several vehicles, earlier is better.",
      ],
    ] as ReadonlyArray<readonly [string, string]>,

    trustTitle: "Who is driving you",
    trustRating: `${GOOGLE_REVIEW_COUNT} reviews on Google`,
    trustSeeAll: "Read the reviews on Google",
    trustYears: `${YEARS_OPERATING} years`,
    trustYearsLabel: "moving executives in Mexico City",
    trustVolume: `+${TRANSFERS_PER_YEAR}`,
    trustVolumeLabel: "transfers a year",
    trustPayValue: "Card payment",
    trustPayLabel: "handled by Stripe; your card never passes through this site",

    ctaTitle: "Book your hourly service",
    ctaCopy:
      "The quote form works out the exact price from the hours and the vehicle, and lets you pay by card.",
    ctaBtn: "Get a quote",

    alsoTitle: "You may also need",
    alsoRates: "All rates",
    alsoCorporate: "Corporate accounts",

    footPay: "Secure payment with",
    footTerms: "Terms",
    footPrivacy: "Privacy notice",
  },
} as const;

/**
 * Las mismas reglas visuales que la página de ruta, con su propio prefijo.
 * Cada componente de este sitio lleva su bloque de estilos; compartir uno
 * obligaría a que dos páginas no puedan moverse por separado.
 */
const styles = `
  .hp-root { background:#0A0A0A; color:#ECEAE6; min-height:100vh; font-family:var(--font-barlow),sans-serif; font-weight:300; }
  .hp-nav { max-width:1180px; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .hp-nav a { text-decoration:none; }
  .hp-nav-right { display:flex; align-items:center; gap:14px; }
  .hp-nav-link { font-size:11px; letter-spacing:0.12em; color:#BFC3C8; text-transform:uppercase; white-space:nowrap; }
  .hp-nav-link:hover { color:#fff; }
  .hp-nav-cta { border:1px solid #C8A46B; border-radius:2px; padding:10px 16px; color:#fff; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .hp-nav-cta:hover { background:#C8A46B; color:#0A0A0A; }

  .hp-wrap { max-width:900px; margin:0 auto; padding:16px 28px 100px; }

  .hp-kicker { color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin:34px 0 14px; }
  .hp-title { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(34px,5.4vw,56px); line-height:1.06; margin:0 0 20px; text-wrap:balance; }
  .hp-intro { color:#BFC3C8; font-size:17px; line-height:1.7; max-width:64ch; margin:0; }

  .hp-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; max-width:660px; margin:34px 0 0; }
  .hp-fact { border-top:1px solid rgba(255,255,255,0.32); padding-top:14px; }
  .hp-fact-value { font-family:var(--font-barlow-condensed),sans-serif; font-size:21px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }
  .hp-fact-label { color:#BFC3C8; font-size:12px; line-height:1.4; margin-top:4px; }

  .hp-section { margin-top:64px; }
  .hp-h2 { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(26px,3.4vw,34px); line-height:1.15; margin:0 0 18px; color:#fff; text-wrap:balance; }
  .hp-p { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0 0 16px; }

  .hp-table-scroll { overflow-x:auto; }
  .hp-table { width:100%; min-width:480px; border-collapse:collapse; font-size:15px; }
  .hp-table th { text-align:left; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#8B8B87; padding:0 0 12px; border-bottom:1px solid #232323; }
  .hp-table th + th, .hp-table td + td { text-align:right; }
  .hp-table td { border-bottom:1px solid #1a1a1a; padding:14px 0; color:#BFC3C8; font-variant-numeric:tabular-nums; }
  .hp-table td:first-child { color:#fff; }
  .hp-veh-cap { display:block; color:#8B8B87; font-size:12px; margin-top:2px; }
  .hp-note { color:#8B8B87; font-size:13px; line-height:1.65; max-width:66ch; margin:16px 0 0; }

  .hp-steps { list-style:none; counter-reset:hp; margin:0; padding:0; display:grid; gap:18px; max-width:66ch; }
  .hp-steps li { counter-increment:hp; position:relative; padding-left:44px; color:#BFC3C8; font-size:16px; line-height:1.7; }
  .hp-steps li::before { content:counter(hp); position:absolute; left:0; top:0; width:28px; height:28px; border:1px solid rgba(200,164,107,0.5); border-radius:50%; color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; }

  .hp-list { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0; padding-left:20px; }
  .hp-list li { margin-bottom:10px; }
  .hp-list li::marker { color:#C8A46B; }

  .hp-faq { border-top:1px solid #232323; padding:22px 0; }
  .hp-faq-q { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:16px; letter-spacing:0.03em; color:#fff; margin:0 0 8px; }
  .hp-faq-a { color:#BFC3C8; font-size:15px; line-height:1.7; max-width:70ch; margin:0; }

  .hp-trust { margin-top:64px; border:1px solid #232323; }
  .hp-trust-head { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:20px 24px; border-bottom:1px solid #232323; }
  .hp-trust-badge { display:inline-flex; align-items:center; gap:12px; text-decoration:none; }
  .hp-trust-score { font-family:var(--font-cormorant),Georgia,serif; font-size:28px; line-height:1; color:#fff; }
  .hp-trust-stars { color:#C8A46B; font-size:13px; letter-spacing:1px; }
  .hp-trust-count { color:#BFC3C8; font-size:12.5px; }
  .hp-trust-see { margin-left:auto; color:#C8A46B; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .hp-trust-see:hover { color:#fff; }
  .hp-trust-quotes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:#232323; }
  .hp-trust-quote { background:#0A0A0A; padding:22px 24px; display:flex; flex-direction:column; gap:12px; }
  .hp-trust-q { font-family:var(--font-cormorant),Georgia,serif; font-size:19px; line-height:1.45; color:#ECEAE6; margin:0; flex-grow:1; text-wrap:balance; }
  .hp-trust-who { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:13px; letter-spacing:0.05em; color:#8B8B87; }
  .hp-trust-who b { color:#fff; font-weight:600; }
  .hp-trust-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; background:#232323; border-top:1px solid #232323; }
  .hp-trust-fact { background:#0A0A0A; padding:20px 24px; }
  .hp-trust-fact-v { font-family:var(--font-barlow-condensed),sans-serif; font-size:19px; font-weight:700; letter-spacing:0.07em; color:#fff; text-transform:uppercase; }
  .hp-trust-fact-l { color:#8B8B87; font-size:12px; line-height:1.5; margin-top:5px; }

  .hp-cta { margin-top:64px; border:1px solid rgba(200,164,107,0.4); padding:36px 32px; text-align:center; }
  .hp-cta-btn { display:inline-block; margin-top:20px; background:#C8A46B; color:#0A0A0A; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; padding:15px 30px; }
  .hp-cta-btn:hover { background:#d9b67e; }

  .hp-also { display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
  .hp-also a { border:1px solid #232323; padding:11px 14px; color:#BFC3C8; text-decoration:none; font-size:13px; }
  .hp-also a:hover { border-color:#C8A46B; color:#fff; }

  .hp-foot { border-top:1px solid rgba(200,164,107,0.28); margin-top:64px; padding-top:24px; font-size:13px; color:#8B8B87; }
  .hp-foot a { color:#C8A46B; text-decoration:none; }
  .hp-foot-pay { display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:12px; padding-bottom:16px; margin-bottom:16px; border-bottom:1px solid #191919; }
  .hp-stripe-mark { display:inline-block; background:#635BFF; color:#fff; font-weight:700; font-size:12px; padding:2px 8px 3px; border-radius:4px; line-height:1.35; }
  .hp-cardmark { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:10px; letter-spacing:0.12em; color:#8B8B87; border:1px solid #333; border-radius:2px; padding:2px 6px 1px; line-height:1.5; }
  .hp-foot-id { display:flex; flex-direction:column; gap:5px; font-style:normal; line-height:1.6; margin-bottom:18px; }
  .hp-foot-name { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#BFC3C8; }
  .hp-foot-id a { color:#BFC3C8; border-bottom:1px solid rgba(200,164,107,0.3); padding-bottom:1px; }
  .hp-foot-id a:hover { color:#C8A46B; }
  .hp-foot-contact { display:flex; flex-wrap:wrap; gap:6px 18px; }
  .hp-foot-links { display:flex; flex-wrap:wrap; gap:8px 20px; }

  .hp-root a:focus-visible { outline:2px solid #C8A46B; outline-offset:3px; }

  @media (max-width:700px) {
    .hp-nav { padding:16px 14px; gap:10px; }
    .hp-nav .er-brand-tagline { display:none; }
    .hp-nav-link { display:none; }
    .hp-nav-right { gap:8px; }
    .hp-nav-cta { font-size:10px; padding:8px 9px; letter-spacing:0.06em; }
    .hp-wrap { padding:8px 18px 72px; }
    .hp-facts { grid-template-columns:1fr; gap:12px; }
    .hp-section { margin-top:48px; }
    .hp-cta { padding:28px 20px; }
    .hp-trust { margin-top:48px; }
    .hp-trust-head { padding:16px 18px; gap:10px; }
    .hp-trust-see { margin-left:0; flex-basis:100%; }
    .hp-trust-quotes { grid-template-columns:1fr; }
    .hp-trust-quote { padding:18px; }
    .hp-trust-facts { grid-template-columns:1fr; }
    .hp-trust-fact { padding:16px 18px; }
  }
`;

/** Las preguntas, expuestas para que la página pueda declararlas en JSON-LD
 *  sin volver a escribirlas: si el esquema y lo que se ve no coinciden,
 *  Google retira los resultados enriquecidos de todo el sitio. */
export function hourlyFaqs(lang: Lang) {
  return TX[lang].faqs;
}

/** El precio de un bloque de horas. Lo usa la página y el JSON-LD. */
export function hourlyPrice(cat: Category, hours: number) {
  return calculatePrice(0, 0, cat, hours === FULL_DAY_HOURS ? "day" : "hour", hours);
}

export function hourlyPriceRange() {
  const all = cats.flatMap((cat) => [
    ...BLOCKS.map((h) => hourlyPrice(cat, h)),
    hourlyPrice(cat, FULL_DAY_HOURS),
  ]);
  return { low: Math.min(...all), high: Math.max(...all) };
}

export default function HourlyPage({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const home = path(lang, "home");
  const quote = `${home}#quote`;

  return (
    <div className="hp-root">
      <style>{styles}</style>

      <nav className="hp-nav">
        <Link href={home} aria-label="Elite Route">
          <BrandMark size={17} compact={14} />
        </Link>
        <div className="hp-nav-right">
          <Link href={path(lang, "rates")} className="hp-nav-link">{t.navRates}</Link>
          <Link href={quote} className="hp-nav-cta" aria-label={t.navQuoteFull}>{t.navQuote}</Link>
          <LangToggle lang={lang} page="hourly" />
        </div>
      </nav>

      <main className="hp-wrap">
        <p className="hp-kicker">{t.kicker}</p>
        <h1 className="hp-title">{t.title}</h1>
        <p className="hp-intro">{t.intro}</p>

        <div className="hp-facts">
          <div className="hp-fact">
            <div className="hp-fact-value">{t.factMinValue}</div>
            <div className="hp-fact-label">{t.factMinLabel}</div>
          </div>
          <div className="hp-fact">
            <div className="hp-fact-value">{t.factKmValue}</div>
            <div className="hp-fact-label">{t.factKmLabel}</div>
          </div>
          <div className="hp-fact">
            <div className="hp-fact-value">{t.factPriceValue}</div>
            <div className="hp-fact-label">{t.factPriceLabel}</div>
          </div>
        </div>

        <section className="hp-section">
          <h2 className="hp-h2">{t.tableTitle}</h2>
          <div className="hp-table-scroll">
            <table className="hp-table">
              <thead>
                <tr>
                  <th>{t.colVehicle}</th>
                  {BLOCKS.map((h) => <th key={h}>{t.colHours(h)}</th>)}
                  <th>{t.colDay}</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((cat) => (
                  <tr key={cat}>
                    <td>
                      {vehicles[cat].name}
                      <span className="hp-veh-cap">
                        {lang === "es" ? vehicles[cat].capEs : vehicles[cat].cap}
                      </span>
                    </td>
                    {BLOCKS.map((h) => <td key={h}>{mxn(hourlyPrice(cat, h))}</td>)}
                    <td>{mxn(hourlyPrice(cat, FULL_DAY_HOURS))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hp-note">{t.tableNote}</p>
        </section>

        <section className="hp-section">
          <h2 className="hp-h2">{t.howTitle}</h2>
          <ol className="hp-steps">
            {t.how.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </section>

        <section className="hp-section">
          <h2 className="hp-h2">{t.forTitle}</h2>
          <ul className="hp-list">
            {t.forList.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>

        <section className="hp-section">
          <h2 className="hp-h2">{t.includedTitle}</h2>
          <ul className="hp-list">
            {t.included.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>

        <section className="hp-trust" aria-label={t.trustTitle}>
          <div className="hp-trust-head">
            <a className="hp-trust-badge" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.5 5.4C39.9 37 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
              </svg>
              <span className="hp-trust-score">{GOOGLE_RATING}</span>
              <span>
                <span className="hp-trust-stars">★★★★★</span>
                <br />
                <span className="hp-trust-count">{t.trustRating}</span>
              </span>
            </a>
            <a className="hp-trust-see" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              {t.trustSeeAll} →
            </a>
          </div>

          <div className="hp-trust-quotes">
            {REVIEWS.slice(0, 2).map((r) => (
              <figure className="hp-trust-quote" key={r.name}>
                <blockquote className="hp-trust-q">“{r.quote}”</blockquote>
                <figcaption className="hp-trust-who">
                  <b>{r.name}</b> · Google
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="hp-trust-facts">
            <div className="hp-trust-fact">
              <div className="hp-trust-fact-v">{t.trustYears}</div>
              <div className="hp-trust-fact-l">{t.trustYearsLabel}</div>
            </div>
            <div className="hp-trust-fact">
              <div className="hp-trust-fact-v">{t.trustVolume}</div>
              <div className="hp-trust-fact-l">{t.trustVolumeLabel}</div>
            </div>
            <div className="hp-trust-fact">
              <div className="hp-trust-fact-v">{t.trustPayValue}</div>
              <div className="hp-trust-fact-l">{t.trustPayLabel}</div>
            </div>
          </div>
        </section>

        <section className="hp-section">
          <h2 className="hp-h2">{t.faqTitle}</h2>
          {t.faqs.map(([q, a]) => (
            <div className="hp-faq" key={q}>
              <p className="hp-faq-q">{q}</p>
              <p className="hp-faq-a">{a}</p>
            </div>
          ))}
        </section>

        <div className="hp-cta">
          <h2 className="hp-h2" style={{ marginBottom: 12 }}>{t.ctaTitle}</h2>
          <p className="hp-p" style={{ margin: "0 auto", maxWidth: "52ch" }}>{t.ctaCopy}</p>
          <Link href={quote} className="hp-cta-btn">{t.ctaBtn}</Link>
        </div>

        <section className="hp-section">
          <h2 className="hp-h2">{t.alsoTitle}</h2>
          <div className="hp-also">
            <Link href={path(lang, "rates")}>{t.alsoRates}</Link>
            <Link href={path(lang, "corporate")}>{t.alsoCorporate}</Link>
          </div>
        </section>

        <footer className="hp-foot">
          <p className="hp-foot-pay">
            <span>{t.footPay}</span>
            <span className="hp-stripe-mark">stripe</span>
            <span className="hp-cardmark">VISA</span>
            <span className="hp-cardmark">MASTERCARD</span>
            <span className="hp-cardmark">AMEX</span>
          </p>

          <address className="hp-foot-id">
            <span className="hp-foot-name">{LEGAL.responsable}</span>
            <span>{LEGAL.domicilio}</span>
            <span className="hp-foot-contact">
              <a href={LEGAL.whatsappUrl} target="_blank" rel="noopener noreferrer">{LEGAL.whatsapp}</a>
              <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>
            </span>
          </address>

          <div className="hp-foot-links">
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
