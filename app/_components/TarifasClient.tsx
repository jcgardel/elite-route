"use client";

import Link from "next/link";
import { calculatePrice, tariffs, type Category } from "@/lib/booking";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { path, type Lang } from "@/lib/i18n";

/**
 * Tarifas, en los dos idiomas del sitio.
 *
 * Arranca en español porque esta página es la que trae el tráfico de búsqueda
 * en español —"tarifa traslado aeropuerto CDMX" y compañía—, y sus metadatos
 * están en ese idioma. Si el visitante ya eligió inglés en la portada, la
 * elección viaja con él: vive en localStorage, no en el estado de una página.
 *
 * Los precios no se traducen: salen de lib/booking.ts en los dos casos.
 */

const cats: Category[] = ["sedan", "executive", "minivan", "suv"];

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}
function p(km: number, min: number, cat: Category, airport = false) {
  return mxn(calculatePrice(km, min, cat, "route", 3, airport));
}
function ph(hours: number, cat: Category) {
  return mxn(calculatePrice(0, 0, cat, "hour", hours));
}

const rutasDesde = [
  { key: "centro", zona: "~15 km", km: 15, min: 25 },
  { key: "polanco", zona: "~22 km", km: 22, min: 30 },
  { key: "santafe", zona: "~35 km", km: 35, min: 50 },
  { key: "satelite", zona: "~30 km", km: 30, min: 40 },
  { key: "aifa", zona: "~68 km", km: 68, min: 75 },
  { key: "toluca", zona: "~80 km", km: 80, min: 85 },
] as const;

const rutasHacia = [
  { key: "centro", km: 15, min: 25 },
  { key: "polanco", km: 22, min: 30 },
  { key: "santafe", km: 35, min: 50 },
  { key: "aifa", km: 68, min: 75 },
  { key: "toluca", km: 80, min: 85 },
] as const;

const duraciones = [2, 3, 4, 5, 6, 10] as const;

const TX = {
  es: {
    corporate: "Corporativo",
    quoteNow: "Cotizar ahora",
    quoteShort: "Cotizar",
    kicker: "Elite Route · Ciudad de México",
    title: ["Tarifas de transporte", "ejecutivo en CDMX"],
    subtitle:
      "Precios fijos con IVA incluido. Sin cargos por tráfico, sin sorpresas. Traslados al aeropuerto AICM, AIFA, Toluca y rutas corporativas.",
    badges: [
      ["IVA incluido", "Precio final sin cargos ocultos"],
      ["Precio fijo", "Sin variaciones por tráfico"],
      ["Factura CFDI", "Para empresas y particulares"],
      ["24 / 7", "Disponibilidad todos los días"],
    ],
    fromLabel: "Salida desde aeropuerto",
    fromTitle: "Traslado desde AICM, AIFA y Toluca",
    fromCopy:
      "Incluye monitoreo de vuelo, espera por retrasos y cargo de estacionamiento. Tu chofer espera el tiempo necesario sin costo adicional.",
    fromNote: ["✈️ Espera incluida:", " Monitoreamos tu vuelo en tiempo real. Si llega tarde, tu chofer espera sin costo extra."],
    toLabel: "Traslado hacia aeropuerto",
    toTitle: "CDMX → AICM, AIFA y Toluca",
    toCopy:
      "Precio directo sin espera en aeropuerto. Reserva con al menos 6 horas de anticipación para garantizar disponibilidad.",
    hourLabel: "Servicio por hora y día completo",
    hourTitle: "Chofer por horas en CDMX",
    hourCopy:
      "Tu chofer permanece disponible durante las horas contratadas. Incluye 20 km por hora. Ideal para reuniones, eventos o días de trabajo intenso.",
    colRoute: "Ruta",
    colDuration: "Duración",
    priceNote: "MXN c/IVA",
    hours: (h: number) => `${h} horas`,
    fullDay: "Día completo (10 hrs)",
    routes: {
      centro: "AICM → Centro Histórico / Roma / Condesa",
      polanco: "AICM → Polanco / Lomas de Chapultepec",
      santafe: "AICM → Santa Fe / Interlomas",
      satelite: "AICM → Satélite / Naucalpan",
      aifa: "AIFA → CDMX (cualquier zona)",
      toluca: "Aeropuerto Toluca → CDMX",
    },
    routesTo: {
      centro: "Centro Histórico / Roma / Condesa → AICM",
      polanco: "Polanco / Lomas → AICM",
      santafe: "Santa Fe / Interlomas → AICM",
      aifa: "CDMX → AIFA",
      toluca: "CDMX → Aeropuerto Toluca",
    },
    faqLabel: "Preguntas frecuentes",
    faqTitle: "Todo lo que necesitas saber",
    faqs: [
      ["¿Los precios incluyen IVA?", "Sí. Todos los precios que ves en esta página y en el cotizador incluyen IVA (16%). No hay cargos ocultos ni sorpresas al final del servicio."],
      ["¿Por qué los traslados desde el aeropuerto cuestan más que hacia el aeropuerto?", "Los traslados de salida desde cualquier aeropuerto incluyen un cargo por estacionamiento y tiempo de espera por posibles retrasos de vuelo. Nuestro chofer monitorea tu vuelo en tiempo real y espera el tiempo necesario sin costo adicional."],
      ["¿Qué pasa si mi vuelo se retrasa?", "Nada. El cargo por espera ya está incluido en la tarifa de salida desde aeropuerto. Tu chofer espera el tiempo que sea necesario sin cobrar extra."],
      ["¿Puedo pagar con tarjeta de crédito o débito?", "Sí. Aceptamos todas las tarjetas de crédito y débito mediante pago seguro con Stripe. También puedes coordinar tu reserva por WhatsApp."],
      ["¿Emiten factura?", "Sí. Emitimos factura CFDI para todos los servicios. Escríbenos a contabilidad@eliteroute.mx con tus datos fiscales."],
      ["¿Cuánto tiempo de anticipación necesito para reservar?", "Se requiere un mínimo de 6 horas de anticipación para confirmar tu reserva. Para servicios en horario de madrugada o rutas foráneas, lo ideal es reservar con 24 horas de antelación."],
      [`¿Cuál es la diferencia entre ${tariffs.sedan.name}, ${tariffs.executive.name} y ${tariffs.suv.name}?`, `${tariffs.sedan.name}: ideal para 1-3 pasajeros con equipaje ligero. ${tariffs.executive.name}: vehículos premium para 1-3 pasajeros, mayor confort y espacio. ${tariffs.minivan.name}: grupos de 4-6 personas con equipaje amplio. ${tariffs.suv.name}: el nivel más alto de lujo para 1-6 pasajeros.`],
      ["¿Hacen traslados a Querétaro, Cuernavaca u otras ciudades?", "Sí. Cubrimos rutas foráneas a cualquier destino desde Ciudad de México. Escríbenos a business@eliteroute.mx o usa el cotizador para calcular el precio exacto."],
    ],
    ctaTitle: "¿Quieres saber el precio exacto de tu ruta?",
    ctaCopy:
      "Usa el cotizador — calcula el precio en segundos con tu origen y destino real, incluyendo distancia, tiempo y categoría de vehículo.",
    ctaBtn: "Cotizar mi traslado →",
    footer: "Elite Route CDMX · Transporte ejecutivo privado",
  },
  en: {
    corporate: "Corporate",
    quoteNow: "Get a quote",
    quoteShort: "Quote",
    kicker: "Elite Route · Mexico City",
    title: ["Executive transfer rates", "in Mexico City"],
    subtitle:
      "Fixed prices with VAT included. No traffic surcharges, no surprises. Transfers to AICM, AIFA and Toluca airports, plus corporate routes.",
    badges: [
      ["VAT included", "Final price, no hidden charges"],
      ["Fixed price", "No variation for traffic"],
      ["CFDI invoice", "For companies and individuals"],
      ["24 / 7", "Available every day"],
    ],
    fromLabel: "Airport pickup",
    fromTitle: "Transfers from AICM, AIFA and Toluca",
    fromCopy:
      "Includes flight tracking, waiting time for delays and the parking charge. Your chauffeur waits as long as needed at no extra cost.",
    fromNote: ["✈️ Waiting included:", " We track your flight in real time. If it lands late, your chauffeur waits at no extra charge."],
    toLabel: "Transfer to the airport",
    toTitle: "Mexico City → AICM, AIFA and Toluca",
    toCopy:
      "Direct price with no airport waiting. Book at least 6 hours ahead to guarantee availability.",
    hourLabel: "Hourly and full-day service",
    hourTitle: "Chauffeur by the hour in Mexico City",
    hourCopy:
      "Your chauffeur stays available for the hours booked, with 20 km included per hour. Ideal for meetings, events or long working days.",
    colRoute: "Route",
    colDuration: "Duration",
    priceNote: "MXN incl. VAT",
    hours: (h: number) => `${h} hours`,
    fullDay: "Full day (10 hrs)",
    routes: {
      centro: "AICM → Historic Center / Roma / Condesa",
      polanco: "AICM → Polanco / Lomas de Chapultepec",
      santafe: "AICM → Santa Fe / Interlomas",
      satelite: "AICM → Satélite / Naucalpan",
      aifa: "AIFA → Mexico City (any area)",
      toluca: "Toluca Airport → Mexico City",
    },
    routesTo: {
      centro: "Historic Center / Roma / Condesa → AICM",
      polanco: "Polanco / Lomas → AICM",
      santafe: "Santa Fe / Interlomas → AICM",
      aifa: "Mexico City → AIFA",
      toluca: "Mexico City → Toluca Airport",
    },
    faqLabel: "Frequently asked questions",
    faqTitle: "Everything you need to know",
    faqs: [
      ["Do the prices include VAT?", "Yes. Every price on this page and in the quote form includes 16% VAT. There are no hidden charges and no surprises at the end of the ride."],
      ["Why do transfers from the airport cost more than transfers to it?", "Pickups at any airport include a parking charge and waiting time for possible flight delays. We track your flight in real time and your chauffeur waits as long as needed at no extra cost."],
      ["What happens if my flight is delayed?", "Nothing. The waiting charge is already included in the airport pickup fare. Your chauffeur waits as long as it takes, at no extra cost."],
      ["Can I pay by credit or debit card?", "Yes. We accept every credit and debit card through secure payment with Stripe. You can also arrange your booking over WhatsApp."],
      ["Do you issue invoices?", "Yes. We issue Mexican CFDI invoices for every service. Write to contabilidad@eliteroute.mx with your tax details."],
      ["How far in advance do I need to book?", "A minimum of 6 hours' notice is required to confirm a booking. For early-morning services or out-of-town routes, 24 hours ahead is ideal."],
      [`What is the difference between ${tariffs.sedan.name}, ${tariffs.executive.name} and ${tariffs.suv.name}?`, `${tariffs.sedan.name}: ideal for 1-3 passengers with light luggage. ${tariffs.executive.name}: premium vehicles for 1-3 passengers, with more comfort and space. ${tariffs.minivan.name}: groups of 4-6 with generous luggage. ${tariffs.suv.name}: the highest level of luxury, for 1-6 passengers.`],
      ["Do you drive to Querétaro, Cuernavaca or other cities?", "Yes. We cover out-of-town routes to any destination from Mexico City. Write to business@eliteroute.mx or use the quote form to calculate the exact price."],
    ],
    ctaTitle: "Want the exact price for your route?",
    ctaCopy:
      "Use the quote form — it calculates the price in seconds from your real pickup and destination, including distance, duration and vehicle category.",
    ctaBtn: "Quote my transfer →",
    footer: "Elite Route CDMX · Private executive transportation",
  },
} as const;

const styles = `

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0A0A; color: #fff; font-family: var(--font-barlow), sans-serif; font-weight: 300; }

  .tf-nav { max-width: 1180px; margin: 0 auto; padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .tf-nav a { text-decoration: none; }
  .tf-nav-right { display: flex; gap: 18px; align-items: center; }
  .tf-nav-cta { border: 1px solid #C8A46B; border-radius: 2px; padding: 10px 18px; color: #fff; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; transition: background 0.2s, color 0.2s; white-space: nowrap; }
  .tf-nav-cta:hover { background: #C8A46B; color: #0A0A0A; }
  .tf-cta-corto { display: none; }
  .tf-nav-link { font-size: 11px; letter-spacing: 0.12em; color: #BFC3C8; text-decoration: none; text-transform: uppercase; white-space: nowrap; }
  .tf-nav-link:hover { color: #fff; }

  .tf-hero { border-bottom: 1px solid #1e1e1e; padding: 60px 28px 56px; text-align: center; max-width: 1180px; margin: 0 auto; }
  .tf-kicker { color: #C8A46B; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 16px; }
  .tf-title { font-family: var(--font-cormorant), serif; font-size: clamp(40px, 6vw, 72px); font-weight: 300; line-height: 1; margin-bottom: 20px; color: #fff; text-wrap: balance; }
  .tf-subtitle { color: #BFC3C8; font-size: 17px; line-height: 1.7; max-width: 620px; margin: 0 auto 32px; }
  .tf-badge { display: inline-flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .tf-badge-item { font-size: 12px; color: #BFC3C8; letter-spacing: 0.1em; border-left: 2px solid #C8A46B; padding-left: 12px; text-align: left; }
  .tf-badge-val { color: #fff; font-weight: 600; display: block; font-size: 14px; margin-bottom: 2px; }

  .tf-main { max-width: 1180px; margin: 0 auto; padding: 0 28px 100px; }

  .tf-section { margin-top: 64px; }
  .tf-section-label { color: #C8A46B; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 12px; }
  .tf-section-title { font-family: var(--font-cormorant), serif; font-size: clamp(28px, 4vw, 46px); font-weight: 300; color: #fff; margin-bottom: 8px; line-height: 1.1; text-wrap: balance; }
  .tf-section-copy { color: #BFC3C8; font-size: 15px; line-height: 1.7; max-width: 620px; margin-bottom: 28px; }

  .tf-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .tf-table { width: 100%; border-collapse: collapse; min-width: 560px; }
  .tf-table th { background: #111; border: 1px solid #222; padding: 12px 16px; text-align: left; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #BFC3C8; font-weight: 600; }
  .tf-table th:first-child { color: #fff; }
  .tf-table td { border: 1px solid #1a1a1a; padding: 14px 16px; font-size: 14px; color: #fff; vertical-align: middle; }
  .tf-table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
  .tf-table tr:hover td { background: rgba(200,164,107,0.05); }
  .tf-table .tf-route { color: #BFC3C8; font-size: 13px; }
  .tf-table .tf-route strong { color: #fff; display: block; font-size: 14px; font-weight: 500; margin-bottom: 2px; }
  .tf-table .tf-price { font-family: var(--font-cormorant), serif; font-size: 22px; font-weight: 400; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .tf-table .tf-price-note { font-size: 10px; color: #9a9a9a; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-top: 2px; }

  .tf-note { background: rgba(200,164,107,0.08); border: 1px solid rgba(200,164,107,0.25); border-radius: 2px; padding: 14px 18px; font-size: 13px; color: #BFC3C8; line-height: 1.6; margin-top: 16px; }
  .tf-note strong { color: #C8A46B; }

  .tf-faq { margin-top: 64px; }
  .tf-faq-item { border-top: 1px solid #1e1e1e; padding: 22px 0; }
  .tf-faq-q { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 10px; }
  .tf-faq-a { color: #BFC3C8; font-size: 14px; line-height: 1.7; max-width: 780px; }

  .tf-cta { margin-top: 72px; border: 1px solid rgba(200,164,107,0.45); padding: 48px; text-align: center; background: rgba(255,255,255,0.02); }
  .tf-cta-title { font-family: var(--font-cormorant), serif; font-size: clamp(28px, 4vw, 48px); font-weight: 300; margin-bottom: 16px; text-wrap: balance; }
  .tf-cta-copy { color: #BFC3C8; font-size: 16px; margin-bottom: 28px; line-height: 1.6; }
  .tf-cta-btn { display: inline-flex; align-items: center; justify-content: center; border: 1px solid #C8A46B; color: #fff; background: transparent; text-decoration: none; padding: 16px 36px; font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; transition: background 0.2s, color 0.2s; }
  .tf-cta-btn:hover { background: #C8A46B; color: #0A0A0A; }

  /* #8B8B87 y no #555: aquel daba 2.66:1 sobre el negro del sitio. */
  .tf-footer { text-align: center; padding: 32px 28px; border-top: 1px solid #1a1a1a; font-size: 11px; color: #8B8B87; letter-spacing: 0.06em; line-height: 1.8; }

  .tf-root a:focus-visible, .tf-root button:focus-visible { outline: 2px solid #C8A46B; outline-offset: 3px; }

  @media (max-width: 700px) {
    /* Mismo problema que en la portada: transform:scale encogía el logotipo
       a la vista pero no en el layout, y aquí además se pintaba el lema
       —"We move your level", 146 px— que es más ancho que el propio nombre.
       Entre eso y el botón de cotizar, el selector de idioma acababa 117 px
       fuera de una pantalla de 375. */
    .tf-nav { padding: 16px 14px; gap: 10px; }
    .tf-nav .er-brand-tagline { display: none; }
    .tf-nav-link { display: none; }
    .tf-nav-right { gap: 10px; }
    .tf-nav-cta { font-size: 10px; padding: 8px 10px; letter-spacing: 0.06em; }
    /* "Cotizar ahora" no cabe; "Cotizar" sí, y el enlace conserva el texto
       completo en aria-label para quien navegue escuchando. */
    .tf-cta-largo { display: none; }
    .tf-cta-corto { display: inline; }
    .tf-hero { padding: 40px 18px 44px; }
    .tf-main { padding: 0 18px 64px; }
    .tf-cta { padding: 32px 20px; }
    .tf-badge { gap: 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .tf-root *, .tf-root *::before, .tf-root *::after { transition-duration: 0.01ms !important; }
  }
`;

export default function TarifasClient({ lang }: { lang: Lang }) {
  const t = TX[lang];
  const home = path(lang, "home");

  return (
    <div className="tf-root">
      <style>{styles}</style>

      <nav>
        <div className="tf-nav">
          <Link href={home} aria-label="Elite Route">
            <BrandMark size={17} compact={14} />
          </Link>
          <div className="tf-nav-right">
            <Link href={path(lang, "corporate")} className="tf-nav-link">{t.corporate}</Link>
            <Link className="tf-nav-cta" href={`${home}#quote`} aria-label={t.quoteNow}>
              <span className="tf-cta-largo">{t.quoteNow}</span>
              <span className="tf-cta-corto">{t.quoteShort}</span>
            </Link>
            <LangToggle lang={lang} page="rates" />
          </div>
        </div>
      </nav>

      <div className="tf-hero">
        <p className="tf-kicker">{t.kicker}</p>
        <h1 className="tf-title">{t.title[0]}<br />{t.title[1]}</h1>
        <p className="tf-subtitle">{t.subtitle}</p>
        <div className="tf-badge">
          {t.badges.map(([val, note]) => (
            <div className="tf-badge-item" key={val}>
              <span className="tf-badge-val">{val}</span>
              {note}
            </div>
          ))}
        </div>
      </div>

      <main className="tf-main">
        <section className="tf-section" aria-labelledby="desde-aeropuerto">
          <p className="tf-section-label">{t.fromLabel}</p>
          <h2 className="tf-section-title" id="desde-aeropuerto">{t.fromTitle}</h2>
          <p className="tf-section-copy">{t.fromCopy}</p>
          <div className="tf-table-wrap">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>{t.colRoute}</th>
                  {cats.map((cat) => <th key={cat}>{tariffs[cat].name}</th>)}
                </tr>
              </thead>
              <tbody>
                {rutasDesde.map((r) => (
                  <tr key={r.key}>
                    <td>
                      <div className="tf-route">
                        <strong>{t.routes[r.key]}</strong>
                        {r.zona}
                      </div>
                    </td>
                    {cats.map((cat) => (
                      <td key={cat}>
                        <span className="tf-price">{p(r.km, r.min, cat, true)}</span>
                        <span className="tf-price-note">{t.priceNote}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tf-note">
            <strong>{t.fromNote[0]}</strong>{t.fromNote[1]}
          </p>
        </section>

        <section className="tf-section" aria-labelledby="hacia-aeropuerto">
          <p className="tf-section-label">{t.toLabel}</p>
          <h2 className="tf-section-title" id="hacia-aeropuerto">{t.toTitle}</h2>
          <p className="tf-section-copy">{t.toCopy}</p>
          <div className="tf-table-wrap">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>{t.colRoute}</th>
                  {cats.map((cat) => <th key={cat}>{tariffs[cat].name}</th>)}
                </tr>
              </thead>
              <tbody>
                {rutasHacia.map((r) => (
                  <tr key={r.key}>
                    <td>
                      <div className="tf-route">
                        <strong>{t.routesTo[r.key]}</strong>
                      </div>
                    </td>
                    {cats.map((cat) => (
                      <td key={cat}>
                        <span className="tf-price">{p(r.km, r.min, cat, false)}</span>
                        <span className="tf-price-note">{t.priceNote}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="tf-section" aria-labelledby="por-hora">
          <p className="tf-section-label">{t.hourLabel}</p>
          <h2 className="tf-section-title" id="por-hora">{t.hourTitle}</h2>
          <p className="tf-section-copy">{t.hourCopy}</p>
          <div className="tf-table-wrap">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>{t.colDuration}</th>
                  {cats.map((cat) => <th key={cat}>{tariffs[cat].name}</th>)}
                </tr>
              </thead>
              <tbody>
                {duraciones.map((h) => {
                  const esDia = h === 10;
                  return (
                    <tr key={h}>
                      <td style={{ fontWeight: esDia ? 600 : 400, color: esDia ? "#C8A46B" : "#fff" }}>
                        {esDia ? t.fullDay : t.hours(h)}
                      </td>
                      {cats.map((cat) => (
                        <td key={cat}>
                          <span className="tf-price">{ph(h, cat)}</span>
                          <span className="tf-price-note">{t.priceNote}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="tf-section tf-faq" aria-labelledby="faq">
          <p className="tf-section-label">{t.faqLabel}</p>
          <h2 className="tf-section-title" id="faq" style={{ marginBottom: 32 }}>{t.faqTitle}</h2>
          {t.faqs.map(([q, a]) => (
            <div className="tf-faq-item" key={q}>
              <p className="tf-faq-q">{q}</p>
              <p className="tf-faq-a">{a}</p>
            </div>
          ))}
        </section>

        <div className="tf-cta">
          <h2 className="tf-cta-title">{t.ctaTitle}</h2>
          <p className="tf-cta-copy">{t.ctaCopy}</p>
          <Link className="tf-cta-btn" href={`${home}#quote`}>{t.ctaBtn}</Link>
        </div>
      </main>

      <footer className="tf-footer">
        {t.footer}<br />
        business@eliteroute.mx · contabilidad@eliteroute.mx<br />
        <Link href={home} style={{ color: "#C8A46B", textDecoration: "none" }}>eliteroute.mx</Link>
      </footer>

      <a
        href="https://wa.me/525543582919?text=Hola%2C+quisiera+cotizar+un+traslado."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        style={{position:"fixed",bottom:"calc(24px + env(safe-area-inset-bottom))",right:"24px",zIndex:9999,width:"54px",height:"54px",borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(0,0,0,0.45)"}}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.118 1.528 5.845L.057 23.486a.5.5 0 0 0 .614.614l5.588-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.513-5.187-1.408l-.37-.222-3.844 1.007 1.03-3.76-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
    </div>
  );
}
