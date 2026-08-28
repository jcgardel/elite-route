import Link from "next/link";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { calculatePrice, tariffs, type Category } from "@/lib/booking";
import { path, type Lang } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";
import { ROUTE_KEYS, ROUTES, routePath, type RouteKey } from "@/lib/routes";
import {
  GOOGLE_PLACE_URL,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  REVIEWS,
  TRANSFERS_PER_YEAR,
  YEARS_OPERATING,
} from "@/lib/social-proof";

/**
 * La página de una ruta concreta: AICM → Polanco, AIFA → CDMX, y las demás.
 *
 * Existe porque nadie busca "transporte ejecutivo". Se busca "traslado AICM a
 * Polanco precio", con origen, destino y la palabra precio, y hasta ahora esa
 * búsqueda aterrizaba en /tarifas —una página sobre TODAS las rutas— que
 * competía contra páginas dedicadas a esa ruta exacta.
 *
 * Los precios no se escriben: los calcula `calculatePrice` con los mismos
 * kilómetros que publica /tarifas, así que no hay forma de que una página
 * diga un número y otra diga otro.
 */

const cats: Category[] = ["sedan", "executive", "minivan", "suv"];

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}

const TX = {
  es: {
    navRates: "Tarifas",
    navQuote: "Cotizar",
    navQuoteFull: "Cotizar traslado",
    kicker: (a: string, z: string) => `${a} → ${z}`,
    distance: "Distancia",
    duration: "Duración aprox.",
    price: "Desde",
    minutes: (n: number) => `${n} min`,
    km: (n: number) => `${n} km`,
    tableTitle: "Precio por vehículo",
    tableNote:
      "Precios finales en pesos, IVA incluido. La salida desde aeropuerto incluye estacionamiento y espera por retraso de vuelo; por eso cuesta más que el trayecto de ida hacia el aeropuerto.",
    colVehicle: "Vehículo",
    fromAirport: (a: string) => `Desde ${a}`,
    toAirport: (a: string) => `Hacia ${a}`,
    aboutTitle: "Sobre esta ruta",
    includedTitle: "Qué incluye",
    included: [
      "Chofer profesional y vehículo en condiciones de operar.",
      "Precio fijo con IVA: no cambia por tráfico, horario nocturno ni casetas de la ruta cotizada.",
      "Monitoreo del vuelo y espera sin costo si llega tarde, en las salidas desde aeropuerto.",
      "Factura CFDI a solicitud.",
    ],
    faqTitle: "Preguntas frecuentes",
    ctaTitle: "Reserva esta ruta",
    ctaCopy:
      "El cotizador calcula el precio exacto con tu dirección real y te deja pagar con tarjeta. Seis horas de anticipación como mínimo.",
    ctaBtn: "Cotizar ahora",
    othersTitle: "Otras rutas",
    allRates: "Ver todas las tarifas",
    trustTitle: "Quién te va a llevar",
    trustRating: `${GOOGLE_REVIEW_COUNT} reseñas en Google`,
    trustSeeAll: "Ver las reseñas en Google",
    trustYears: `${YEARS_OPERATING} años`,
    trustYearsLabel: "moviendo ejecutivos en Ciudad de México",
    trustVolume: `+${TRANSFERS_PER_YEAR}`,
    trustVolumeLabel: "traslados al año",
    trustPayValue: "Pago con tarjeta",
    trustPayLabel: "procesado por Stripe; la tarjeta no pasa por este sitio",
    footPay: "Pago seguro con",
    footTerms: "Términos",
    footPrivacy: "Aviso de privacidad",
  },
  en: {
    navRates: "Rates",
    // Corto a propósito: "Get a quote" mide 87 px y desbordaba la barra
    // en una pantalla de 360. El texto completo va en el aria-label.
    navQuote: "Quote",
    navQuoteFull: "Get a quote",
    kicker: (a: string, z: string) => `${a} → ${z}`,
    distance: "Distance",
    duration: "Approx. time",
    price: "From",
    minutes: (n: number) => `${n} min`,
    km: (n: number) => `${n} km`,
    tableTitle: "Price by vehicle",
    tableNote:
      "Final prices in Mexican pesos, VAT included. The airport pickup covers parking and waiting for flight delays, which is why it costs more than the run towards the airport.",
    colVehicle: "Vehicle",
    fromAirport: (a: string) => `From ${a}`,
    toAirport: (a: string) => `To ${a}`,
    aboutTitle: "About this route",
    includedTitle: "What it covers",
    included: [
      "A professional chauffeur and a roadworthy vehicle.",
      "Fixed price with VAT: unchanged by traffic, night hours or tolls on the quoted route.",
      "Flight tracking and free waiting if it lands late, on airport pickups.",
      "CFDI invoice on request.",
    ],
    faqTitle: "Frequently asked",
    ctaTitle: "Book this route",
    ctaCopy:
      "The quote form works out the exact price from your real address and lets you pay by card. Six hours' notice minimum.",
    ctaBtn: "Get a quote",
    othersTitle: "Other routes",
    allRates: "See all rates",
    trustTitle: "Who is driving you",
    trustRating: `${GOOGLE_REVIEW_COUNT} reviews on Google`,
    trustSeeAll: "Read the reviews on Google",
    trustYears: `${YEARS_OPERATING} years`,
    trustYearsLabel: "moving executives in Mexico City",
    trustVolume: `+${TRANSFERS_PER_YEAR}`,
    trustVolumeLabel: "transfers a year",
    trustPayValue: "Card payment",
    trustPayLabel: "handled by Stripe; your card never passes through this site",
    footPay: "Secure payment with",
    footTerms: "Terms",
    footPrivacy: "Privacy notice",
  },
} as const;

const styles = `
  .rt-root { background:#0A0A0A; color:#ECEAE6; min-height:100vh; font-family:var(--font-barlow),sans-serif; font-weight:300; }
  .rt-nav { max-width:1180px; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .rt-nav a { text-decoration:none; }
  .rt-nav-right { display:flex; align-items:center; gap:14px; }
  .rt-nav-link { font-size:11px; letter-spacing:0.12em; color:#BFC3C8; text-transform:uppercase; white-space:nowrap; }
  .rt-nav-link:hover { color:#fff; }
  .rt-nav-cta { border:1px solid #C8A46B; border-radius:2px; padding:10px 16px; color:#fff; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .rt-nav-cta:hover { background:#C8A46B; color:#0A0A0A; }

  .rt-wrap { max-width:900px; margin:0 auto; padding:16px 28px 100px; }

  .rt-kicker { color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin:34px 0 14px; }
  .rt-title { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(34px,5.4vw,56px); line-height:1.06; margin:0 0 20px; text-wrap:balance; }
  .rt-intro { color:#BFC3C8; font-size:17px; line-height:1.7; max-width:64ch; margin:0; }

  .rt-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; max-width:620px; margin:34px 0 0; }
  .rt-fact { border-top:1px solid rgba(255,255,255,0.32); padding-top:14px; }
  .rt-fact-value { font-family:var(--font-barlow-condensed),sans-serif; font-size:24px; font-weight:700; letter-spacing:0.08em; }
  .rt-fact-label { color:#BFC3C8; font-size:12px; line-height:1.4; margin-top:4px; }

  .rt-section { margin-top:64px; }
  .rt-h2 { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(26px,3.4vw,34px); line-height:1.15; margin:0 0 18px; color:#fff; text-wrap:balance; }
  .rt-p { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0 0 16px; }

  .rt-table { width:100%; border-collapse:collapse; font-size:15px; }
  .rt-table th { text-align:left; font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#8B8B87; padding:0 0 12px; border-bottom:1px solid #232323; }
  .rt-table th + th, .rt-table td + td { text-align:right; }
  .rt-table td { border-bottom:1px solid #1a1a1a; padding:14px 0; color:#BFC3C8; font-variant-numeric:tabular-nums; }
  .rt-table td:first-child { color:#fff; }
  .rt-veh-cap { display:block; color:#8B8B87; font-size:12px; margin-top:2px; }
  .rt-note { color:#8B8B87; font-size:13px; line-height:1.65; max-width:66ch; margin:16px 0 0; }

  .rt-list { color:#BFC3C8; font-size:16px; line-height:1.75; max-width:66ch; margin:0; padding-left:20px; }
  .rt-list li { margin-bottom:10px; }
  .rt-list li::marker { color:#C8A46B; }

  .rt-faq { border-top:1px solid #232323; padding:22px 0; }
  .rt-faq-q { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:16px; letter-spacing:0.03em; color:#fff; margin:0 0 8px; }
  .rt-faq-a { color:#BFC3C8; font-size:15px; line-height:1.7; max-width:70ch; margin:0; }

  .rt-cta { margin-top:64px; border:1px solid rgba(200,164,107,0.4); padding:36px 32px; text-align:center; }
  .rt-cta-btn { display:inline-block; margin-top:20px; background:#C8A46B; color:#0A0A0A; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; padding:15px 30px; }
  .rt-cta-btn:hover { background:#d9b67e; }

  .rt-others { display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
  .rt-other { border:1px solid #232323; padding:11px 14px; color:#BFC3C8; text-decoration:none; font-size:13px; }
  .rt-other:hover { border-color:#C8A46B; color:#fff; }

  /* CONFIANZA — va justo debajo de la tabla de precios, que es donde nace
     la duda: el visitante acaba de ver una cifra y todavía no sabe si hay
     una empresa detrás. */
  .rt-trust { margin-top:64px; border:1px solid #232323; }
  .rt-trust-head { display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:20px 24px; border-bottom:1px solid #232323; }
  .rt-trust-badge { display:inline-flex; align-items:center; gap:12px; text-decoration:none; }
  .rt-trust-score { font-family:var(--font-cormorant),Georgia,serif; font-size:28px; line-height:1; color:#fff; }
  .rt-trust-stars { color:#C8A46B; font-size:13px; letter-spacing:1px; }
  .rt-trust-count { color:#BFC3C8; font-size:12.5px; }
  .rt-trust-see { margin-left:auto; color:#C8A46B; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; }
  .rt-trust-see:hover { color:#fff; }

  .rt-trust-quotes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:#232323; }
  .rt-trust-quote { background:#0A0A0A; padding:22px 24px; display:flex; flex-direction:column; gap:12px; }
  .rt-trust-q { font-family:var(--font-cormorant),Georgia,serif; font-size:19px; line-height:1.45; color:#ECEAE6; margin:0; flex-grow:1; text-wrap:balance; }
  .rt-trust-who { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:13px; letter-spacing:0.05em; color:#8B8B87; }
  .rt-trust-who b { color:#fff; font-weight:600; }

  .rt-trust-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; background:#232323; border-top:1px solid #232323; }
  .rt-trust-fact { background:#0A0A0A; padding:20px 24px; }
  .rt-trust-fact-v { font-family:var(--font-barlow-condensed),sans-serif; font-size:19px; font-weight:700; letter-spacing:0.07em; color:#fff; text-transform:uppercase; }
  .rt-trust-fact-l { color:#8B8B87; font-size:12px; line-height:1.5; margin-top:5px; }

  .rt-foot { border-top:1px solid rgba(200,164,107,0.28); margin-top:64px; padding-top:24px; font-size:13px; color:#8B8B87; }
  .rt-foot a { color:#C8A46B; text-decoration:none; }
  .rt-foot-id { display:flex; flex-direction:column; gap:5px; font-style:normal; line-height:1.6; margin-bottom:18px; }
  .rt-foot-name { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#BFC3C8; }
  .rt-foot-id a { color:#BFC3C8; border-bottom:1px solid rgba(200,164,107,0.3); padding-bottom:1px; }
  .rt-foot-id a:hover { color:#C8A46B; }
  .rt-foot-contact { display:flex; flex-wrap:wrap; gap:6px 18px; }
  .rt-foot-pay { display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:12px; padding-bottom:16px; margin-bottom:16px; border-bottom:1px solid #191919; }
  .rt-stripe-mark { display:inline-block; background:#635BFF; color:#fff; font-weight:700; font-size:12px; padding:2px 8px 3px; border-radius:4px; line-height:1.35; }
  .rt-cardmark { font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:10px; letter-spacing:0.12em; color:#8B8B87; border:1px solid #333; border-radius:2px; padding:2px 6px 1px; line-height:1.5; }
  .rt-foot-links { display:flex; flex-wrap:wrap; gap:8px 20px; }

  .rt-root a:focus-visible { outline:2px solid #C8A46B; outline-offset:3px; }

  @media (max-width:700px) {
    .rt-nav { padding:16px 14px; gap:10px; }
    .rt-nav .er-brand-tagline { display:none; }
    .rt-nav-link { display:none; }
    .rt-nav-right { gap:8px; }
    .rt-nav-cta { font-size:10px; padding:8px 9px; letter-spacing:0.06em; }
    .rt-wrap { padding:8px 18px 72px; }
    .rt-facts { gap:10px; }
    .rt-fact-value { font-size:18px; }
    .rt-fact-label { font-size:11px; }
    .rt-section { margin-top:48px; }
    .rt-cta { padding:28px 20px; }
    .rt-table { font-size:14px; }
    .rt-trust { margin-top:48px; }
    .rt-trust-head { padding:16px 18px; gap:10px; }
    .rt-trust-see { margin-left:0; flex-basis:100%; }
    .rt-trust-quotes { grid-template-columns:1fr; }
    .rt-trust-quote { padding:18px; }
    .rt-trust-facts { grid-template-columns:1fr; }
    .rt-trust-fact { padding:16px 18px; }
  }
`;

export default function RoutePage({ lang, routeKey }: { lang: Lang; routeKey: RouteKey }) {
  const route = ROUTES[routeKey];
  const c = route[lang];
  const t = TX[lang];
  const home = path(lang, "home");
  const quote = `${home}#quote`;

  // El mismo cálculo que /tarifas: el trayecto de salida lleva el recargo de
  // aeropuerto —estacionamiento y espera—, el de vuelta no.
  const precio = (cat: Category, airport: boolean) =>
    mxn(calculatePrice(route.km, route.minutes, cat, "route", 3, airport));

  const desde = Math.min(...cats.map((cat) => calculatePrice(route.km, route.minutes, cat, "route", 3, false)));

  const otras = ROUTE_KEYS.filter((k) => k !== routeKey);

  return (
    <div className="rt-root">
      <style>{styles}</style>

      <nav className="rt-nav">
        <Link href={home} aria-label="Elite Route">
          <BrandMark size={17} compact={14} />
        </Link>
        <div className="rt-nav-right">
          <Link href={path(lang, "rates")} className="rt-nav-link">{t.navRates}</Link>
          <Link href={quote} className="rt-nav-cta" aria-label={t.navQuoteFull}>{t.navQuote}</Link>
          <LangToggle
            lang={lang}
            hrefs={{ es: routePath("es", routeKey), en: routePath("en", routeKey) }}
          />
        </div>
      </nav>

      <main className="rt-wrap">
        <p className="rt-kicker">{t.kicker(c.airport, c.zone)}</p>
        <h1 className="rt-title">{c.title}</h1>
        <p className="rt-intro">{c.intro}</p>

        <div className="rt-facts">
          <div className="rt-fact">
            <div className="rt-fact-value">{t.km(route.km)}</div>
            <div className="rt-fact-label">{t.distance}</div>
          </div>
          <div className="rt-fact">
            <div className="rt-fact-value">{t.minutes(route.minutes)}</div>
            <div className="rt-fact-label">{t.duration}</div>
          </div>
          <div className="rt-fact">
            <div className="rt-fact-value">{mxn(desde)}</div>
            <div className="rt-fact-label">{t.price}</div>
          </div>
        </div>

        <section className="rt-section">
          <h2 className="rt-h2">{t.tableTitle}</h2>
          <table className="rt-table">
            <thead>
              <tr>
                <th>{t.colVehicle}</th>
                <th>{t.fromAirport(c.airport)}</th>
                <th>{t.toAirport(c.airport)}</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((cat) => (
                <tr key={cat}>
                  <td>
                    {tariffs[cat].name}
                    <span className="rt-veh-cap">
                      {lang === "es" ? tariffs[cat].capEs : tariffs[cat].cap}
                    </span>
                  </td>
                  <td>{precio(cat, true)}</td>
                  <td>{precio(cat, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="rt-note">{t.tableNote}</p>
        </section>

        {/* Reseñas reales de la ficha de Google, las cifras del dueño y
            quién cobra la tarjeta. Dos reseñas y no las tres de la portada:
            aquí compiten con el contenido de la ruta, que es lo que trajo
            al visitante. */}
        <section className="rt-trust" aria-label={t.trustTitle}>
          <div className="rt-trust-head">
            <a className="rt-trust-badge" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.5 5.4C39.9 37 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
              </svg>
              <span className="rt-trust-score">{GOOGLE_RATING}</span>
              <span>
                <span className="rt-trust-stars">★★★★★</span>
                <br />
                <span className="rt-trust-count">{t.trustRating}</span>
              </span>
            </a>
            <a className="rt-trust-see" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
              {t.trustSeeAll} →
            </a>
          </div>

          <div className="rt-trust-quotes">
            {REVIEWS.slice(0, 2).map((r) => (
              <figure className="rt-trust-quote" key={r.name}>
                <blockquote className="rt-trust-q">“{r.quote}”</blockquote>
                <figcaption className="rt-trust-who">
                  <b>{r.name}</b> · Google
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="rt-trust-facts">
            <div className="rt-trust-fact">
              <div className="rt-trust-fact-v">{t.trustYears}</div>
              <div className="rt-trust-fact-l">{t.trustYearsLabel}</div>
            </div>
            <div className="rt-trust-fact">
              <div className="rt-trust-fact-v">{t.trustVolume}</div>
              <div className="rt-trust-fact-l">{t.trustVolumeLabel}</div>
            </div>
            <div className="rt-trust-fact">
              <div className="rt-trust-fact-v">{t.trustPayValue}</div>
              <div className="rt-trust-fact-l">{t.trustPayLabel}</div>
            </div>
          </div>
        </section>

        <section className="rt-section">
          <h2 className="rt-h2">{t.aboutTitle}</h2>
          <p className="rt-p">{c.about}</p>
        </section>

        <section className="rt-section">
          <h2 className="rt-h2">{t.includedTitle}</h2>
          <ul className="rt-list">
            {t.included.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>

        <section className="rt-section">
          <h2 className="rt-h2">{t.faqTitle}</h2>
          {c.faqs.map(([q, a]) => (
            <div className="rt-faq" key={q}>
              <p className="rt-faq-q">{q}</p>
              <p className="rt-faq-a">{a}</p>
            </div>
          ))}
        </section>

        <div className="rt-cta">
          <h2 className="rt-h2" style={{ marginBottom: 12 }}>{t.ctaTitle}</h2>
          <p className="rt-p" style={{ margin: "0 auto", maxWidth: "52ch" }}>{t.ctaCopy}</p>
          <Link href={quote} className="rt-cta-btn">{t.ctaBtn}</Link>
        </div>

        <section className="rt-section">
          <h2 className="rt-h2">{t.othersTitle}</h2>
          <div className="rt-others">
            {otras.map((k) => (
              <Link key={k} href={routePath(lang, k)} className="rt-other">
                {ROUTES[k][lang].airport} → {ROUTES[k][lang].zone}
              </Link>
            ))}
          </div>
        </section>

        {/* El pie eran dos enlaces. Quien llega aquí desde el buscador no
            ha visto la portada, así que esta es la única ocasión de decirle
            quién es el negocio y dónde encontrarlo. */}
        <footer className="rt-foot">
          <p className="rt-foot-pay">
            <span>{t.footPay}</span>
            <span className="rt-stripe-mark">stripe</span>
            <span className="rt-cardmark">VISA</span>
            <span className="rt-cardmark">MASTERCARD</span>
            <span className="rt-cardmark">AMEX</span>
          </p>

          <address className="rt-foot-id">
            <span className="rt-foot-name">{LEGAL.responsable}</span>
            <span>{LEGAL.domicilio}</span>
            <span className="rt-foot-contact">
              <a href={LEGAL.whatsappUrl} target="_blank" rel="noopener noreferrer">{LEGAL.whatsapp}</a>
              <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>
            </span>
          </address>

          <div className="rt-foot-links">
            <Link href={path(lang, "rates")}>{t.allRates}</Link>
            <Link href={path(lang, "terms")}>{t.footTerms}</Link>
            <Link href={path(lang, "privacy")}>{t.footPrivacy}</Link>
            <Link href={home}>eliteroute.mx</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
