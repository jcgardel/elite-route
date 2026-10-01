import Link from "next/link";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { calculatePrice } from "@/lib/booking";
import { vehicles, type Category } from "@/lib/vehicles";
import { path, type Lang } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";

/**
 * Teotihuacán, con página propia.
 *
 * POR QUÉ EXISTE. Justine Davis pagó **$6,264** por nueve horas a Teotihuacán
 * con comida en La Gruta: la reserva más grande de las cinco primeras. Y el
 * sitio no mencionaba Teotihuacán ni una sola vez, ni "day trip", ni "tour".
 * El producto ya existía —es el servicio por horas— pero se llamaba "Hourly
 * chauffeur service in Mexico City", que no es lo que nadie escribe en Google
 * desde San Francisco.
 *
 * LO QUE VENDE NO ES UN TOUR, y eso es justo el argumento. Ella lo escribió
 * en sus notas: "same car and driver, no guide". Hay un viajero que no quiere
 * un autobús de cuarenta personas con horario fijo; quiere su coche, su
 * chofer y las pirámides a su ritmo. Esta página le habla a ése, y por eso
 * dice con todas sus letras lo que NO incluye.
 *
 * LOS PRECIOS NO SE ESCRIBEN A MANO: salen de `calculatePrice` con el mismo
 * `serviceType: "hour"` que usa el cotizador, así que esta página no puede
 * decir un número y el cotizador otro. El dueño confirmó el 1 de octubre de
 * 2026 que el viaje no lleva tarifa de ruta fija: se cotiza por WhatsApp o se
 * reserva por horas en la categoría que el cliente quiera. Por eso aquí no
 * hay un "precio del viaje", sino la tabla por horas, que sí es real.
 */

const cats: Category[] = ["sedan", "executive", "minivan", "suv"];

/** Las dos duraciones que de verdad cubren el día. La de Justine fueron 9. */
const BLOQUES = [9, 10] as const;

/** Kilómetros incluidos por hora contratada. Lo fija el cotizador. */
const KM_POR_HORA = 20;

/** Las dos categorías con chofer bilingüe. Confirmado por el dueño. */
const BILINGUES: Category[] = ["executive", "suv"];

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}

const TX = {
  es: {
    navRates: "Tarifas",
    navQuote: "Cotizar",
    navQuoteFull: "Cotizar un día a Teotihuacán",
    kicker: "Día completo · Teotihuacán",
    title: "Viaje a Teotihuacán desde la Ciudad de México",
    intro:
      "Un auto y un chofer para todo el día. Te recogen en tu hotel o tu casa, te llevan a las pirámides, esperan mientras las recorres y te traen de vuelta. No es un tour: no hay grupo, no hay horario de nadie más y no hay guía. El ritmo lo pones tú.",

    factHorasValue: "9 a 10 horas",
    factHorasLabel: "lo que suele tomar el día completo",
    factKmValue: `${KM_POR_HORA} km por hora`,
    factKmLabel: "incluidos; el viaje redondo cabe de sobra",
    factPrecioValue: "Precio fijo",
    factPrecioLabel: "IVA incluido, sin cargos sorpresa",

    quesTitle: "Qué es, y qué no",
    esTitle: "Lo que sí incluye",
    es: [
      "El vehículo y el chofer durante todas las horas que contrates, sólo para ti.",
      "La espera mientras visitas la zona arqueológica: el chofer no se va y no cobra aparte por esperar.",
      "Paradas en el camino si las quieres, y una comida en el regreso si te acomoda.",
      "Precio cerrado antes de salir, con IVA, que no se mueve por tráfico.",
    ],
    noTitle: "Lo que no incluye",
    no: [
      "Guía de turistas. El chofer conduce y te cuida la logística; no da el recorrido por las pirámides. Si quieres guía, se contrata en la entrada de la zona.",
      "Las entradas a la zona arqueológica, que se pagan ahí mismo.",
      "La comida y las bebidas.",
    ],

    diaTitle: "Cómo suele ir el día",
    dia: [
      "Salida temprano desde tu dirección: entre las ocho y las nueve de la mañana es lo habitual, para llegar antes del calor y de los autobuses.",
      "Cerca de una hora de carretera hasta la zona arqueológica, al noreste de la ciudad.",
      "El chofer te deja en el acceso y espera. Tú recorres las pirámides el tiempo que quieras.",
      "Comida de regreso. Muchos la hacen en La Gruta, un restaurante dentro de una cueva junto a la zona; se reserva aparte.",
      "Vuelta a tu dirección a media tarde.",
    ],

    precioTitle: "Precio por vehículo",
    colVehicle: "Vehículo",
    colHoras: (h: number) => `${h} horas`,
    precioNota: `Precios finales en pesos con IVA incluido, sacados del mismo tarifario que el cotizador. Cada hora contratada incluye ${KM_POR_HORA} km, así que nueve horas son ${9 * KM_POR_HORA} km: el viaje redondo a Teotihuacán cabe con holgura. Si tu día se alarga, se ajusta en el momento.`,
    bilingueNota:
      "Executive y High SUV son las dos categorías que llevan chofer bilingüe. Sedan y Minivan no.",

    reservarTitle: "Cómo se reserva",
    reservar: [
      "En el cotizador, elige «Por hora», pon tu dirección de recogida, la fecha y las horas que quieras. El precio sale antes de pedirte ningún dato de pago.",
      "Escribe en las notas que vas a Teotihuacán, y si viajas con niños o quieres silla para bebé o asiento elevado.",
      "Si prefieres que lo armemos contigo, escríbenos por WhatsApp y lo cotizamos a mano.",
    ],

    faqTitle: "Preguntas frecuentes",
    faqs: [
      [
        "¿Cuántas horas necesito para Teotihuacán?",
        "Nueve suele ser la medida justa: una hora de ida, el tiempo que quieras en la zona, la comida y el regreso. Con diez vas sobrado si piensas comer con calma o parar en el camino.",
      ],
      [
        "¿Es un tour con guía?",
        "No, y es a propósito. Contratas el auto y el chofer para ti solo: sin grupo, sin horario ajeno y sin guía. Si quieres un guía para el recorrido, se contrata en la entrada de la zona arqueológica.",
      ],
      [
        "¿El chofer espera mientras visito las pirámides?",
        "Sí. Ese es el servicio: las horas que contratas son suyas y tuyas, esté manejando o esperando. No hay un cargo extra por la espera.",
      ],
      [
        "¿Están incluidas las entradas?",
        "No. Las entradas a la zona arqueológica se pagan en el acceso, igual que la comida.",
      ],
      [
        "¿Puedo combinarlo con otra parada?",
        "Sí. Muchos agregan la comida en La Gruta, la Basílica de Guadalupe de regreso o una parada de artesanías. Mientras quepa en las horas contratadas, el chofer te lleva.",
      ],
      [
        "¿Llevan sillas para niños?",
        "Sí, para bebé y asiento elevado para menores. Pídelo al reservar y dinos la edad; te lo confirmamos por WhatsApp antes del día.",
      ],
    ] as ReadonlyArray<readonly [string, string]>,

    ctaTitle: "Arma tu día",
    ctaCopy:
      "Saca el precio en el cotizador con las horas que quieras, o escríbenos y lo vemos contigo.",
    ctaQuote: "Cotizar por horas",
    ctaWhats: "Escribir por WhatsApp",
  },

  en: {
    navRates: "Rates",
    navQuote: "Get a quote",
    navQuoteFull: "Quote a Teotihuacán day trip",
    kicker: "Day trip · Teotihuacán",
    title: "Teotihuacán day trip from Mexico City",
    intro:
      "A car and a chauffeur for the whole day. You are collected at your hotel or your address, driven to the pyramids, waited for while you walk the site, and brought back. It is not a tour: no group, nobody else's schedule, no guide. You set the pace.",

    factHorasValue: "9 to 10 hours",
    factHorasLabel: "what the full day usually takes",
    factKmValue: `${KM_POR_HORA} km per hour`,
    factKmLabel: "included; the round trip fits comfortably",
    factPrecioValue: "Fixed price",
    factPrecioLabel: "VAT included, no surprise charges",

    quesTitle: "What it is, and what it is not",
    esTitle: "What is included",
    es: [
      "The vehicle and the chauffeur for every hour you book, yours alone.",
      "The waiting while you visit the site: the chauffeur stays, and waiting is not charged separately.",
      "Stops along the way if you want them, and lunch on the way back if it suits you.",
      "A price settled before you set off, VAT included, that traffic does not move.",
    ],
    noTitle: "What is not included",
    no: [
      "A guide. The chauffeur drives and handles the logistics; he does not take you around the pyramids. If you want a guide, they are hired at the site entrance.",
      "Entrance tickets to the archaeological site, which are paid there.",
      "Food and drinks.",
    ],

    diaTitle: "How the day usually goes",
    dia: [
      "An early start from your address: between eight and nine in the morning is usual, to arrive ahead of the heat and the coach parties.",
      "About an hour on the road to the site, north-east of the city.",
      "The chauffeur drops you at the entrance and waits. You walk the pyramids for as long as you like.",
      "Lunch on the way back. Many people do it at La Gruta, a restaurant inside a cave beside the site; it is booked separately.",
      "Back at your address in the middle of the afternoon.",
    ],

    precioTitle: "Price by vehicle",
    colVehicle: "Vehicle",
    colHoras: (h: number) => `${h} hours`,
    precioNota: `Final prices in Mexican pesos, VAT included, taken from the same rate book the quote form uses. Every hour you book includes ${KM_POR_HORA} km, so nine hours is ${9 * KM_POR_HORA} km: the round trip to Teotihuacán fits comfortably. If your day runs long, we settle it on the spot.`,
    bilingueNota:
      "Executive and High SUV are the two categories that travel with a bilingual chauffeur. The Sedan and Minivan do not.",

    reservarTitle: "How to book",
    reservar: [
      "In the quote form choose “By the hour”, enter your pickup address, the date and the hours you want. The price appears before you are asked for any payment details.",
      "Write in the notes that you are going to Teotihuacán, and whether you are travelling with children or need an infant or booster seat.",
      "If you would rather we put it together with you, message us on WhatsApp and we quote it by hand.",
    ],

    faqTitle: "Frequently asked",
    faqs: [
      [
        "How many hours do I need for Teotihuacán?",
        "Nine is usually the right size: an hour out, as long as you want at the site, lunch and the drive back. Ten gives you room if you plan to eat slowly or stop on the way.",
      ],
      [
        "Is this a guided tour?",
        "No, and that is the point. You hire the car and the chauffeur for yourself alone: no group, nobody else's timetable, no guide. If you want someone to take you around, guides are hired at the entrance to the site.",
      ],
      [
        "Does the chauffeur wait while I visit the pyramids?",
        "Yes. That is the service: the hours you book are yours whether he is driving or waiting. There is no separate charge for the waiting.",
      ],
      [
        "Are the entrance tickets included?",
        "No. Tickets to the archaeological site are paid at the entrance, as is any food.",
      ],
      [
        "Can I add another stop?",
        "Yes. People often add lunch at La Gruta, the Basilica of Guadalupe on the way back, or a craft stop. As long as it fits inside the hours you booked, the chauffeur takes you.",
      ],
      [
        "Do you have child seats?",
        "Yes, infant seats and booster seats for older children. Ask when you book and tell us the child's age; we confirm it over WhatsApp before the day.",
      ],
    ] as ReadonlyArray<readonly [string, string]>,

    ctaTitle: "Put your day together",
    ctaCopy:
      "Get the price in the quote form with whatever hours you want, or write to us and we work it out with you.",
    ctaQuote: "Quote by the hour",
    ctaWhats: "Message us on WhatsApp",
  },
} as const;

/** Las mismas preguntas que se ven, para que el esquema no invente ninguna. */
export function teotihuacanFaqs(lang: Lang) {
  return TX[lang].faqs;
}

/** El rango de precio real del día, para el `AggregateOffer`. */
export function teotihuacanPriceRange() {
  const todos = BLOQUES.flatMap((h) => cats.map((c) => calculatePrice(0, 0, c, "hour", h, false)));
  return { low: Math.min(...todos), high: Math.max(...todos) };
}

const styles = `
  .tt-root { background:#0A0A0A; color:#ECEAE6; min-height:100vh; font-family:var(--font-barlow),sans-serif; font-weight:300; }
  .tt-nav { max-width:1180px; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .tt-nav a { text-decoration:none; }
  .tt-nav-right { display:flex; align-items:center; gap:14px; }
  .tt-nav-link { font-size:11px; letter-spacing:0.12em; color:#BFC3C8; text-transform:uppercase; white-space:nowrap; }
  .tt-nav-link:hover { color:#fff; }
  .tt-nav-cta { border:1px solid #C8A46B; border-radius:2px; padding:10px 16px; color:#fff; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .tt-nav-cta:hover { background:#C8A46B; color:#0A0A0A; }

  .tt-wrap { max-width:900px; margin:0 auto; padding:16px 28px 100px; }
  .tt-kicker { color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin:34px 0 14px; }
  .tt-title { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(34px,5.4vw,56px); line-height:1.06; margin:0 0 20px; text-wrap:balance; }
  .tt-intro { color:#BFC3C8; font-size:17px; line-height:1.7; max-width:64ch; margin:0; }

  .tt-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; max-width:680px; margin:34px 0 0; }
  .tt-fact { border-top:1px solid rgba(255,255,255,0.32); padding-top:14px; }
  .tt-fact-value { font-family:var(--font-barlow-condensed),sans-serif; font-size:21px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }
  .tt-fact-label { color:#BFC3C8; font-size:12px; line-height:1.4; margin-top:4px; }

  .tt-section { margin-top:64px; }
  .tt-h2 { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(26px,3.4vw,34px); line-height:1.15; margin:0 0 18px; color:#fff; text-wrap:balance; }
  .tt-h3 { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#C8A46B; margin:0 0 12px; }

  /* Las dos columnas de "sí incluye / no incluye" van una al lado de la otra
     a propósito: el valor de esta página es que el "no" se lea igual de
     fuerte que el "sí". Esconder el "no" vendería un tour que no vendemos. */
  .tt-two { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:34px; }
  .tt-list { color:#BFC3C8; font-size:15.5px; line-height:1.7; margin:0; padding-left:20px; }
  .tt-list li { margin-bottom:11px; }
  .tt-list li::marker { color:#C8A46B; }
  .tt-list--no li::marker { color:#6a6a66; }

  .tt-steps { list-style:none; counter-reset:tt; margin:0; padding:0; display:grid; gap:18px; max-width:66ch; }
  .tt-steps li { counter-increment:tt; position:relative; padding-left:44px; color:#BFC3C8; font-size:16px; line-height:1.7; }
  .tt-steps li::before { content:counter(tt); position:absolute; left:0; top:0; width:28px; height:28px; border:1px solid rgba(200,164,107,0.5); border-radius:50%; color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; }

  .tt-table-scroll { overflow-x:auto; }
  .tt-table { width:100%; min-width:420px; border-collapse:collapse; font-size:15px; }
  .tt-table th { text-align:left; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#8B8B87; padding:0 0 12px; border-bottom:1px solid #232323; }
  .tt-table th + th, .tt-table td + td { text-align:right; }
  .tt-table td { border-bottom:1px solid #1a1a1a; padding:14px 0; color:#BFC3C8; font-variant-numeric:tabular-nums; }
  .tt-table td:first-child { color:#fff; }
  .tt-veh-cap { display:block; color:#8B8B87; font-size:12px; margin-top:2px; }
  .tt-veh-bi { display:inline-block; margin-left:8px; font-family:var(--font-barlow-condensed),sans-serif; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#C8A46B; border:1px solid rgba(200,164,107,0.45); border-radius:2px; padding:1px 6px; vertical-align:middle; }
  .tt-note { color:#8B8B87; font-size:13px; line-height:1.65; max-width:66ch; margin:16px 0 0; }

  .tt-faq { border-top:1px solid #232323; padding:22px 0; }
  .tt-faq-q { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:16px; letter-spacing:0.03em; color:#fff; margin:0 0 8px; }
  .tt-faq-a { color:#BFC3C8; font-size:15px; line-height:1.7; max-width:70ch; margin:0; }

  .tt-cta { margin-top:64px; border:1px solid rgba(200,164,107,0.35); border-radius:3px; background:rgba(200,164,107,0.06); padding:30px 28px; }
  .tt-cta-copy { color:#BFC3C8; font-size:15.5px; line-height:1.7; max-width:60ch; margin:0 0 20px; }
  .tt-cta-row { display:flex; gap:12px; flex-wrap:wrap; }
  .tt-btn { border:1px solid #C8A46B; border-radius:2px; padding:13px 22px; font-size:12px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; text-decoration:none; }
  .tt-btn--solid { background:#C8A46B; color:#0A0A0A; }
  .tt-btn--ghost { color:#fff; }
  .tt-btn--ghost:hover { background:rgba(200,164,107,0.14); }

  @media (max-width:640px) {
    .tt-facts { grid-template-columns:1fr; }
    .tt-two { grid-template-columns:1fr; gap:28px; }
    .tt-wrap { padding:12px 20px 80px; }
  }
`;

export default function TeotihuacanPage({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const home = path(lang, "home");
  const quote = `${home}#quote`;
  const whats = `https://wa.me/${LEGAL.whatsapp.replace(/[^0-9]/g, "")}`;

  return (
    <div className="tt-root">
      <style>{styles}</style>

      <nav className="tt-nav">
        <Link href={home} aria-label="Elite Route">
          <BrandMark size={17} compact={14} />
        </Link>
        <div className="tt-nav-right">
          <Link href={path(lang, "rates")} className="tt-nav-link">{t.navRates}</Link>
          <Link href={quote} className="tt-nav-cta" aria-label={t.navQuoteFull}>{t.navQuote}</Link>
          <LangToggle lang={lang} page="teotihuacan" />
        </div>
      </nav>

      <main className="tt-wrap">
        <p className="tt-kicker">{t.kicker}</p>
        <h1 className="tt-title">{t.title}</h1>
        <p className="tt-intro">{t.intro}</p>

        <div className="tt-facts">
          <div className="tt-fact">
            <div className="tt-fact-value">{t.factHorasValue}</div>
            <div className="tt-fact-label">{t.factHorasLabel}</div>
          </div>
          <div className="tt-fact">
            <div className="tt-fact-value">{t.factKmValue}</div>
            <div className="tt-fact-label">{t.factKmLabel}</div>
          </div>
          <div className="tt-fact">
            <div className="tt-fact-value">{t.factPrecioValue}</div>
            <div className="tt-fact-label">{t.factPrecioLabel}</div>
          </div>
        </div>

        <section className="tt-section">
          <h2 className="tt-h2">{t.quesTitle}</h2>
          <div className="tt-two">
            <div>
              <h3 className="tt-h3">{t.esTitle}</h3>
              <ul className="tt-list">
                {t.es.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="tt-h3">{t.noTitle}</h3>
              <ul className="tt-list tt-list--no">
                {t.no.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="tt-section">
          <h2 className="tt-h2">{t.diaTitle}</h2>
          <ol className="tt-steps">
            {t.dia.map((x) => <li key={x}>{x}</li>)}
          </ol>
        </section>

        <section className="tt-section">
          <h2 className="tt-h2">{t.precioTitle}</h2>
          <div className="tt-table-scroll">
            <table className="tt-table">
              <thead>
                <tr>
                  <th>{t.colVehicle}</th>
                  {BLOQUES.map((h) => <th key={h}>{t.colHoras(h)}</th>)}
                </tr>
              </thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c}>
                    <td>
                      {vehicles[c].name}
                      {BILINGUES.includes(c) && (
                        <span className="tt-veh-bi">{lang === "es" ? "Bilingüe" : "Bilingual"}</span>
                      )}
                      <span className="tt-veh-cap">
                        {lang === "es" ? vehicles[c].capEs : vehicles[c].cap}
                      </span>
                    </td>
                    {BLOQUES.map((h) => (
                      <td key={h}>{mxn(calculatePrice(0, 0, c, "hour", h, false))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tt-note">{t.precioNota}</p>
          <p className="tt-note">{t.bilingueNota}</p>
        </section>

        <section className="tt-section">
          <h2 className="tt-h2">{t.reservarTitle}</h2>
          <ol className="tt-steps">
            {t.reservar.map((x) => <li key={x}>{x}</li>)}
          </ol>
        </section>

        <section className="tt-section">
          <h2 className="tt-h2">{t.faqTitle}</h2>
          {t.faqs.map(([q, a]) => (
            <div className="tt-faq" key={q}>
              <p className="tt-faq-q">{q}</p>
              <p className="tt-faq-a">{a}</p>
            </div>
          ))}
        </section>

        <section className="tt-cta">
          <h2 className="tt-h2">{t.ctaTitle}</h2>
          <p className="tt-cta-copy">{t.ctaCopy}</p>
          <div className="tt-cta-row">
            <Link href={quote} className="tt-btn tt-btn--solid">{t.ctaQuote}</Link>
            <a href={whats} target="_blank" rel="noopener noreferrer" className="tt-btn tt-btn--ghost">
              {t.ctaWhats}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
