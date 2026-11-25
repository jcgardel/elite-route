import Link from "next/link";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { path, type Lang } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";
import {
  GOOGLE_PLACE_URL,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  TRANSFERS_PER_YEAR,
  YEARS_OPERATING,
} from "@/lib/social-proof";
import { REDONDO_HORAS_CORTESIA } from "@/lib/service-limits";

/**
 * Nosotros / About (nov 2026).
 *
 * SÓLO DATOS QUE EL SITIO YA SOSTIENE: años y viajes salen de
 * lib/social-proof.ts, la calificación de Google también, y cada promesa de
 * "cómo trabajamos" es una política que ya está en los términos o en el
 * cotizador. No lleva nombres de personas, fotos de equipo ni domicilio: el
 * domicilio es la casa del dueño y se decidió no publicarlo fuera del aviso
 * de privacidad (ver app/[lang]/page.tsx).
 */

const TX = {
  es: {
    navQuote: "Cotizar",
    kicker: "Nosotros · Transporte ejecutivo en CDMX",
    title: "Sobre Elite Route",
    lede:
      `Elite Route es una empresa de transporte privado con chofer con base en la Ciudad de México. Desde hace más de ${YEARS_OPERATING} años movemos a viajeros, ejecutivos y empresas entre aeropuertos, oficinas, hoteles y destinos del centro del país, con flota propia y precio fijo con IVA incluido.`,
    stats: [
      [`+${YEARS_OPERATING}`, "años en el sector"],
      [`+${TRANSFERS_PER_YEAR.toLocaleString("es-MX")}`, "viajes al año"],
      [GOOGLE_RATING, `en Google · ${GOOGLE_REVIEW_COUNT} reseñas`],
      ["4", "categorías de vehículo"],
    ],
    howTitle: "Cómo trabajamos",
    how: [
      ["Precio fijo antes de reservar", "El cotizador te da el precio final con IVA antes de pedirte cualquier dato de pago. Lo que ves es lo que pagas."],
      ["Seguimiento de tu vuelo", "Monitoreamos tu llegada y el chofer te espera hasta 60 minutos desde el aterrizaje real, sin costo."],
      ["Vehículos asegurados con GPS", "Todas las unidades tienen seguro vigente y monitoreo GPS las 24 horas."],
      ["Conductores profesionales", "Choferes capacitados y con trato ejecutivo; en Executive y SUV Lux, chofer bilingüe."],
      ["Atención directa", "Hablas con nosotros por WhatsApp y recibes los datos de tu chofer y tu unidad antes del servicio."],
    ],
    whatTitle: "Qué hacemos",
    what: [
      ["Traslados de aeropuerto", "AICM, AIFA y Toluca, desde y hacia cualquier punto de la ciudad.", "airport"],
      ["Chofer por horas", "El auto y el chofer a tu disposición dentro de la Ciudad de México.", "hourly"],
      ["Rutas foráneas", `Puebla, Cuernavaca, Querétaro, Valle de Bravo y más, con precio publicado; en varias, viaje redondo con ${REDONDO_HORAS_CORTESIA} horas de espera incluidas.`, "rates"],
      ["Empresas", "Cuentas corporativas, eventos, delegaciones y factura electrónica CFDI.", "corporate"],
    ] as ReadonlyArray<readonly [string, string, "airport" | "hourly" | "rates" | "corporate"]>,
    reviews: "Ver reseñas en Google",
    contactTitle: "Hablemos",
    contactCopy: "Cotiza en línea en un minuto o escríbenos y lo resolvemos contigo.",
    ctaQuote: "Cotizar traslado",
    ctaWhats: "Escribir por WhatsApp",
    city: "Ciudad de México",
    motto: "We move your level.",
  },
  en: {
    navQuote: "Get a quote",
    kicker: "About us · Executive transportation in Mexico City",
    title: "About Elite Route",
    lede:
      `Elite Route is a private chauffeur company based in Mexico City. For more than ${YEARS_OPERATING} years we have driven travellers, executives and companies between airports, offices, hotels and destinations across central Mexico, with our own fleet and fixed prices, VAT included.`,
    stats: [
      [`+${YEARS_OPERATING}`, "years in the business"],
      [`+${TRANSFERS_PER_YEAR.toLocaleString("en-US")}`, "trips a year"],
      [GOOGLE_RATING, `on Google · ${GOOGLE_REVIEW_COUNT} reviews`],
      ["4", "vehicle categories"],
    ],
    howTitle: "How we work",
    how: [
      ["A fixed price before you book", "The quote form shows the final price, VAT included, before asking for any payment details. What you see is what you pay."],
      ["Flight tracking", "We track your arrival and the chauffeur waits up to 60 minutes from actual landing, free of charge."],
      ["Insured, GPS-tracked vehicles", "Every vehicle carries current insurance and 24-hour GPS monitoring."],
      ["Professional chauffeurs", "Trained chauffeurs used to executive travel; bilingual in the Executive and SUV Lux categories."],
      ["Direct attention", "You talk to us on WhatsApp and receive your chauffeur's and vehicle's details before the service."],
    ],
    whatTitle: "What we do",
    what: [
      ["Airport transfers", "AICM, AIFA and Toluca, to and from anywhere in the city.", "airport"],
      ["Hourly chauffeur", "The car and chauffeur at your disposal within Mexico City.", "hourly"],
      ["Out-of-town routes", `Puebla, Cuernavaca, Querétaro, Valle de Bravo and more, with published prices; on several, round trips with ${REDONDO_HORAS_CORTESIA} hours of waiting included.`, "rates"],
      ["Companies", "Corporate accounts, events, delegations and CFDI e-invoicing.", "corporate"],
    ] as ReadonlyArray<readonly [string, string, "airport" | "hourly" | "rates" | "corporate"]>,
    reviews: "Read the reviews on Google",
    contactTitle: "Let's talk",
    contactCopy: "Get a quote online in a minute, or message us and we will sort it out with you.",
    ctaQuote: "Quote my transfer",
    ctaWhats: "Message us on WhatsApp",
    city: "Mexico City",
    motto: "We move your level.",
  },
} as const;

const styles = `
  .ab-root { --bg:#080D12; --bg2:#10171D; --card:#192127; --tx:#F7F7F5; --tx2:#B8BEC3; --line:#343C43; --gold:#C8A76E; --gold-btn:#D5B57A;
    --serif:var(--font-cormorant), Georgia, serif; --sans:var(--font-manrope), system-ui, sans-serif;
    background:var(--bg); color:var(--tx); min-height:100vh; font-family:var(--sans); -webkit-font-smoothing:antialiased; }
  .ab-root * { box-sizing:border-box; }
  .ab-nav { position:sticky; top:0; z-index:20; background:rgba(8,13,18,0.85); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--line); }
  .ab-nav-in { max-width:1180px; margin:0 auto; padding:0 28px; height:72px; display:flex; align-items:center; justify-content:space-between; gap:14px; }
  .ab-nav a { text-decoration:none; }
  .ab-nav-right { display:flex; align-items:center; gap:12px; }
  .ab-nav-cta { white-space:nowrap; display:inline-flex; align-items:center; min-height:44px; padding:0 18px; border-radius:10px; background:var(--gold-btn); color:#14181C; font-size:14px; font-weight:700; }
  .ab-wrap { max-width:1180px; margin:0 auto; padding:0 28px 110px; }
  .ab-hero { padding:84px 0 56px; max-width:820px; }
  .ab-kicker { color:var(--tx2); font-size:12px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; margin:0 0 18px; }
  .ab-title { font-family:var(--serif); font-weight:400; font-size:clamp(40px, 5.4vw, 68px); line-height:1.02; margin:0 0 24px; text-wrap:balance; }
  .ab-lede { color:var(--tx2); font-size:18px; line-height:1.7; margin:0; max-width:680px; }
  .ab-stats { list-style:none; margin:0; padding:26px 0; display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
  .ab-stat { padding:0 22px; }
  .ab-stat + .ab-stat { border-left:1px solid var(--line); }
  .ab-stat-v { font-family:var(--serif); font-size:44px; line-height:1; }
  .ab-stat-l { color:var(--tx2); font-size:13.5px; margin-top:8px; line-height:1.4; }
  .ab-sec { margin-top:96px; }
  .ab-h2 { font-family:var(--serif); font-weight:400; font-size:clamp(32px, 3.4vw, 44px); line-height:1.08; margin:0 0 30px; }
  .ab-how { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:0 48px; }
  .ab-how li { border-top:1px solid var(--line); padding:22px 0; }
  .ab-how-t { font-size:16px; font-weight:700; margin:0 0 6px; }
  .ab-how-c { color:var(--tx2); font-size:15px; line-height:1.65; margin:0; }
  .ab-what { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:16px; }
  .ab-what a { display:flex; flex-direction:column; gap:10px; height:100%; padding:22px; border:1px solid var(--line); border-radius:16px; background:var(--card); color:var(--tx); text-decoration:none; transition:border-color 0.18s ease; }
  .ab-what a:hover { border-color:#4A535B; }
  .ab-what-t { font-family:var(--serif); font-size:24px; }
  .ab-what-c { color:var(--tx2); font-size:14px; line-height:1.6; flex:1; }
  .ab-what-go { font-size:13.5px; font-weight:600; }
  .ab-reviews { display:inline-flex; align-items:center; gap:10px; min-height:44px; margin-top:28px; padding:0 16px; border:1px solid var(--line); border-radius:10px; color:var(--tx); text-decoration:none; font-size:14px; }
  .ab-reviews span { color:#F4B400; letter-spacing:2px; }
  .ab-contact { margin-top:96px; border:1px solid var(--line); border-radius:20px; background:linear-gradient(120deg, var(--bg2), var(--card)); padding:48px; display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); gap:32px; align-items:center; }
  .ab-contact p { color:var(--tx2); font-size:16px; line-height:1.65; margin:0 0 24px; }
  .ab-btns { display:flex; flex-wrap:wrap; gap:12px; }
  .ab-btn { display:inline-flex; align-items:center; min-height:52px; padding:0 22px; border-radius:12px; font-size:15px; font-weight:700; text-decoration:none; }
  .ab-btn--gold { background:var(--gold-btn); color:#14181C; }
  .ab-btn--line { border:1px solid #5A636B; color:var(--tx); font-weight:600; }
  .ab-data { list-style:none; margin:0; padding:0; display:grid; gap:14px; font-size:15px; }
  .ab-data a { color:var(--tx); text-decoration:none; border-bottom:1px solid var(--line); }
  .ab-data span { display:block; color:var(--tx2); font-size:12px; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:4px; }
  .ab-motto { margin-top:72px; font-family:var(--serif); font-size:28px; color:var(--tx2); text-align:center; }
  .ab-root a:focus-visible { outline:2px solid var(--gold); outline-offset:3px; border-radius:8px; }
  @media (max-width:980px) {
    .ab-stats { grid-template-columns:1fr 1fr; row-gap:22px; }
    .ab-stat:nth-child(3) { border-left:none; }
    .ab-what { grid-template-columns:1fr 1fr; }
    .ab-contact { grid-template-columns:1fr; }
  }
  @media (max-width:640px) {
    .ab-nav-in { padding:0 16px; height:64px; }
    .ab-nav .er-brand-tagline { display:none; }
    .ab-nav .lt-globe { display:none; }
    .ab-nav-right { gap:8px; }
    .ab-nav-cta { padding:0 12px; font-size:13px; white-space:nowrap; }
    .ab-wrap { padding:0 20px 90px; }
    .ab-hero { padding:52px 0 40px; }
    .ab-lede { font-size:16px; }
    .ab-stat { padding:0 14px; }
    .ab-stat-v { font-size:36px; }
    .ab-how { grid-template-columns:1fr; }
    .ab-what { grid-template-columns:1fr; }
    .ab-sec, .ab-contact { margin-top:72px; }
    .ab-contact { padding:30px 22px; }
  }
`;

export default function AboutPage({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const home = path(lang, "home");
  const whats = `${LEGAL.whatsappUrl}?text=${encodeURIComponent(
    lang === "es" ? "Hola, quiero información sobre sus servicios." : "Hi, I'd like some information about your services.",
  )}`;

  return (
    <div className="ab-root">
      <style>{styles}</style>
      <nav className="ab-nav" aria-label="Elite Route">
        <div className="ab-nav-in">
          <Link href={home} aria-label="Elite Route">
            <BrandMark size={18} compact={14} />
          </Link>
          <div className="ab-nav-right">
            <LangToggle lang={lang} page="about" />
            <Link href={`${home}#quote`} className="ab-nav-cta">{t.navQuote}</Link>
          </div>
        </div>
      </nav>

      <main className="ab-wrap">
        <header className="ab-hero">
          <p className="ab-kicker">{t.kicker}</p>
          <h1 className="ab-title">{t.title}</h1>
          <p className="ab-lede">{t.lede}</p>
          <a className="ab-reviews" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">★★★★★</span> {t.reviews} →
          </a>
        </header>

        <ul className="ab-stats">
          {t.stats.map(([v, l]) => (
            <li key={l} className="ab-stat">
              <div className="ab-stat-v">{v}</div>
              <div className="ab-stat-l">{l}</div>
            </li>
          ))}
        </ul>

        <section className="ab-sec" aria-labelledby="ab-how">
          <h2 className="ab-h2" id="ab-how">{t.howTitle}</h2>
          <ul className="ab-how">
            {t.how.map(([title, copy]) => (
              <li key={title}>
                <h3 className="ab-how-t">{title}</h3>
                <p className="ab-how-c">{copy}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="ab-sec" aria-labelledby="ab-what">
          <h2 className="ab-h2" id="ab-what">{t.whatTitle}</h2>
          <ul className="ab-what">
            {t.what.map(([title, copy, page]) => (
              <li key={title}>
                <Link href={path(lang, page)}>
                  <span className="ab-what-t">{title}</span>
                  <span className="ab-what-c">{copy}</span>
                  <span className="ab-what-go" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="ab-contact" aria-labelledby="ab-contact">
          <div>
            <h2 className="ab-h2" id="ab-contact" style={{ marginBottom: 14 }}>{t.contactTitle}</h2>
            <p>{t.contactCopy}</p>
            <div className="ab-btns">
              <Link href={`${home}#quote`} className="ab-btn ab-btn--gold">{t.ctaQuote}</Link>
              <a href={whats} target="_blank" rel="noopener noreferrer" className="ab-btn ab-btn--line">{t.ctaWhats}</a>
            </div>
          </div>
          <ul className="ab-data">
            <li><span>WhatsApp</span><a href={LEGAL.whatsappUrl} target="_blank" rel="noopener noreferrer">{LEGAL.whatsapp}</a></li>
            <li><span>{lang === "es" ? "Teléfono" : "Phone"}</span><a href={`tel:${LEGAL.telefonoTel}`}>{LEGAL.telefono}</a></li>
            <li><span>Email</span><a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a></li>
            <li><span>{lang === "es" ? "Base" : "Based in"}</span>{t.city}</li>
          </ul>
        </section>

        <p className="ab-motto">{t.motto}</p>
      </main>
    </div>
  );
}
