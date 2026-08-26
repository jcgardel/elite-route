import Link from "next/link";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { calculatePrice, tariffs, type Category } from "@/lib/booking";
import { path, type Lang } from "@/lib/i18n";
import { ROUTE_KEYS, ROUTES, routePath, type RouteKey } from "@/lib/routes";

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

  .rt-foot { border-top:1px solid rgba(200,164,107,0.28); margin-top:64px; padding-top:24px; font-size:13px; color:#8B8B87; }
  .rt-foot a { color:#C8A46B; text-decoration:none; }

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

        <div className="rt-foot">
          <Link href={path(lang, "rates")}>{t.allRates}</Link>
          {" · "}
          <Link href={home}>eliteroute.mx</Link>
        </div>
      </main>
    </div>
  );
}
