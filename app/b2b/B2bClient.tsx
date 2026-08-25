"use client";

import Link from "next/link";
import { calculatePrice, tariffs, type Category } from "@/lib/booking";
import LangToggle from "../LangToggle";
import { useLang } from "../useLang";

/**
 * Corporativo, en los dos idiomas del sitio.
 *
 * Arranca en español —es la página que atiende al comprador corporativo
 * mexicano y sus metadatos están en ese idioma— pero respeta la elección que
 * el visitante ya haya hecho en cualquier otra página. Los precios salen de
 * lib/booking.ts en los dos casos: no hay tablas escritas a mano.
 */

const WHATSAPP_B2B = "https://wa.me/525543582919?text=Hola%2C+me+interesa+una+cuenta+corporativa+para+mi+empresa.";

// Precios calculados dinámicamente desde lib/booking.ts — igual que en
// /tarifas — para que esta tabla no quede desincronizada cuando cambien las
// tarifas base. Los km/min por ruta son los mismos que ya usa /tarifas para
// AICM; AIFA, Toluca y Pedregal/Sur se completan con la misma distancia usada
// para calcular los precios que ya se mostraban aquí.
type AirportRoute = { km: number; min: number } | null;
const AIRPORT_TABLES: {
  airport: string; code: string;
  routes: { polanco: AirportRoute; santafe: AirportRoute; centro: AirportRoute; sur: AirportRoute };
}[] = [
  {
    airport: "AICM · Benito Juárez",
    code: "MEX",
    routes: {
      polanco: { km: 22, min: 30 },
      santafe: { km: 35, min: 50 },
      centro: { km: 15, min: 25 },
      sur: { km: 25, min: 36 },
    },
  },
  {
    airport: "AIFA · Felipe Ángeles",
    code: "NLU",
    routes: {
      polanco: { km: 55, min: 61 },
      santafe: { km: 68, min: 75 },
      centro: { km: 50, min: 56 },
      sur: null,
    },
  },
  {
    airport: "Aeropuerto Toluca",
    code: "TLC",
    routes: {
      polanco: { km: 65, min: 69 },
      santafe: { km: 45, min: 48 },
      centro: { km: 70, min: 74 },
      sur: null,
    },
  },
];

// Nombre y flota salen de lib/booking.ts: esta página los tenía en español
// ("Sedán", "Ejecutivo") mientras el cotizador los tenía en inglés, así que
// un cliente que comparaba las dos veía dos catálogos distintos.
const B2B_CATS: { key: Category; cat: string; sub: string }[] = (
  ["sedan", "executive", "minivan", "suv"] as Category[]
).map((key) => ({ key, cat: tariffs[key].name, sub: tariffs[key].tag }));

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}
function routePrice(route: AirportRoute, cat: Category) {
  return route ? mxn(calculatePrice(route.km, route.min, cat, "route", 0, true)) : "";
}

const TX = {
  es: {
    home: "Inicio", rates: "Tarifas", corporate: "Corporativo",
    contact: "Contactar →", openMenu: "Abrir menú", quoteServices: "Cotizar servicios",
    heroKicker: "Soluciones para empresas",
    heroTitle: ["Tu equipo llega", "a tiempo"],
    heroCopy: "Transporte ejecutivo para empresas en CDMX. Rutas recurrentes, factura electrónica CFDI y cuenta corporativa centralizada con atención prioritaria 24/7.",
    heroBtn1: "Cotizar servicios →", heroBtn2: "Hablar con un asesor",
    trustKicker: "Estándar corporativo",
    trustTitle: "Diseñado para empresas",
    cells: [
      ["Factura electrónica CFDI", "CFDI disponible por cada servicio. Proceso directo con tu área administrativa sin fricciones."],
      ["Confirmación inmediata", "Reserva confirmada al instante. Sin llamadas, sin esperas, sin incertidumbre para tu coordinador de viajes."],
      ["Monitoreo de vuelo", "Tu chofer rastrea el vuelo en tiempo real. Llegamos cuando tú llegas, sin cargos por demora."],
      ["Choferes verificados", "Licencia profesional, antecedentes verificados y capacitación continua en etiqueta ejecutiva."],
      ["Flota asegurada", "Todos los vehículos con seguro de cobertura amplia y mantenimiento preventivo certificado."],
      ["Ingreso directo al aeropuerto", "Tu chofer ingresa a la zona de llegadas con tablet / iPad mostrando tu nombre. Sin confusiones, sin esperas en el exterior."],
      ["Tarjeta digital del conductor", "Antes de cada traslado recibes foto del chofer, modelo del vehículo y placas. Cero incertidumbre para tu equipo."],
    ],
    payLabel: "Métodos de pago aceptados",
    payCard: "· Tarjeta", payWallet: "· Tarjeta / wallet", payTransfer: "Transferencia", paySpei: "· SPEI / CoDi",
    paySub: "Encriptación de grado bancario. Pago empresarial con referencia para conciliación contable.",
    ratesKicker: "Tarifas corporativas · Aeropuertos",
    ratesTitle: "Precios fijos en los 3 aeropuertos",
    ratesCopy: "IVA incluido. Sin cargos ocultos. Recargo aeropuerto incluye ingreso a zona de llegadas, espera y estacionamiento.",
    colCategory: "Categoría", quoteIt: "Cotizar",
    airportNotes: [
      "El aeropuerto más cercano al centro de CDMX.",
      "~55 km al norte de CDMX. Zona industrial Tultitlán.",
      "~65 km al poniente. Conexión directa a Santa Fe.",
    ],
    cols: [
      ["→ Polanco", "→ Santa Fe", "→ Centro", "→ Pedregal / Sur"],
      ["→ Polanco", "→ Santa Fe", "→ Centro CDMX", "→ Consultar"],
      ["→ Polanco", "→ Santa Fe", "→ Centro CDMX", "→ Consultar"],
    ],
    hourTitle: "Servicio por hora · CDMX",
    hourNote: "Mínimo 2 horas. Chofer a disposición durante las horas contratadas. IVA incluido.",
    hourRate: "Tarifa / hora c/IVA", h2: "2 horas", h4: "4 horas", h8: "8 horas",
    ratesFoot: "Todos los precios incluyen IVA · Recargo aeropuerto incluido (ingreso a zona de llegadas, espera y estacionamiento) · Distancias y tiempos estimados sujetos a tráfico",
    stepsKicker: "Cómo funciona",
    stepsTitle: "Tu cuenta activa en 24 hrs",
    steps: [
      ["Contacto", "Nos escribes por WhatsApp con los datos de tu empresa y necesidades de transporte."],
      ["Cuenta corporativa", "Configuramos tarifas fijas, datos de facturación y método de pago preferido."],
      ["Reservas", "Tu equipo reserva directo en eliteroute.mx o por WhatsApp. Confirmación inmediata."],
      ["Seguimiento 24/7", "Atención directa por WhatsApp. Confirmaciones, cambios de último momento y facturas en minutos."],
    ],
    ctaTitle: "¿Listo para empezar",
    ctaCopy: "Escríbenos y en menos de 24 horas tienes tu cuenta activa.",
    ctaBtn2: "Solicitar cuenta corporativa",
    footerCopy: "Elite Route CDMX · eliteroute.mx",
    footerLink: "← Volver al cotizador",
  },
  en: {
    home: "Home", rates: "Rates", corporate: "Corporate",
    contact: "Contact us →", openMenu: "Open menu", quoteServices: "Request a quote",
    heroKicker: "Solutions for companies",
    heroTitle: ["Your team arrives", "on time"],
    heroCopy: "Executive transportation for companies in Mexico City. Recurring routes, CFDI electronic invoicing and a central corporate account with priority attention 24/7.",
    heroBtn1: "Request a quote →", heroBtn2: "Talk to an advisor",
    trustKicker: "Corporate standard",
    trustTitle: "Built for companies",
    cells: [
      ["CFDI electronic invoice", "A CFDI invoice for every service, handled directly with your finance team without friction."],
      ["Immediate confirmation", "Bookings confirmed on the spot. No calls, no waiting, no uncertainty for your travel coordinator."],
      ["Flight tracking", "Your chauffeur tracks the flight in real time. We arrive when you arrive, with no delay charges."],
      ["Vetted chauffeurs", "Professional licence, background checks and continuous training in executive etiquette."],
      ["Insured fleet", "Every vehicle carries comprehensive insurance and certified preventive maintenance."],
      ["Meet and greet inside", "Your chauffeur waits in the arrivals hall with a tablet showing your name. No confusion, no waiting outside."],
      ["Digital driver card", "Before each transfer you receive the chauffeur's photo, the vehicle model and the plates. Zero uncertainty for your team."],
    ],
    payLabel: "Accepted payment methods",
    payCard: "· Card", payWallet: "· Card / wallet", payTransfer: "Bank transfer", paySpei: "· SPEI / CoDi",
    paySub: "Bank-grade encryption. Corporate payment with a reference for accounting reconciliation.",
    ratesKicker: "Corporate rates · Airports",
    ratesTitle: "Fixed prices at all three airports",
    ratesCopy: "VAT included. No hidden charges. The airport surcharge covers arrivals-hall pickup, waiting time and parking.",
    colCategory: "Category", quoteIt: "On request",
    airportNotes: [
      "The airport closest to central Mexico City.",
      "~55 km north of Mexico City, by the Tultitlán industrial area.",
      "~65 km west. Direct connection to Santa Fe.",
    ],
    cols: [
      ["→ Polanco", "→ Santa Fe", "→ Downtown", "→ Pedregal / South"],
      ["→ Polanco", "→ Santa Fe", "→ Downtown", "→ On request"],
      ["→ Polanco", "→ Santa Fe", "→ Downtown", "→ On request"],
    ],
    hourTitle: "Hourly service · Mexico City",
    hourNote: "Two-hour minimum. The chauffeur stays at your disposal for the hours booked. VAT included.",
    hourRate: "Rate / hour incl. VAT", h2: "2 hours", h4: "4 hours", h8: "8 hours",
    ratesFoot: "All prices include VAT · Airport surcharge included (arrivals-hall pickup, waiting time and parking) · Distances and times are estimates subject to traffic",
    stepsKicker: "How it works",
    stepsTitle: "Your account live in 24 hrs",
    steps: [
      ["Contact", "You write to us on WhatsApp with your company details and transport needs."],
      ["Corporate account", "We set up fixed rates, billing details and your preferred payment method."],
      ["Bookings", "Your team books directly at eliteroute.mx or over WhatsApp. Confirmed immediately."],
      ["24/7 follow-up", "Direct attention over WhatsApp: confirmations, last-minute changes and invoices in minutes."],
    ],
    ctaTitle: "Ready to start",
    ctaCopy: "Write to us and your account is live in under 24 hours.",
    ctaBtn2: "Request a corporate account",
    footerCopy: "Elite Route CDMX · eliteroute.mx",
    footerLink: "← Back to the quote form",
  },
} as const;

export default function B2bClient() {
  const [lang, setLang] = useLang("es");
  const t = TX[lang];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        .b-root { font-family: var(--font-barlow), 'Helvetica Neue', Arial, sans-serif; background: #080808; color: #fff; min-height: 100vh; }

        /* NAV */
        .b-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 56px; border-bottom: 1px solid #1e1e1e; position: relative; }
        .b-logo { font-family: var(--font-cormorant), Georgia, serif; font-size: 22px; letter-spacing: 0.12em; color: #C8A46B; text-decoration: none; }
        .b-nav-links { display: flex; gap: 32px; align-items: center; }
        .b-nav-link { font-size: 11px; letter-spacing: 0.12em; color: #BFC3C8; text-transform: uppercase; text-decoration: none; transition: color 0.2s; }
        .b-nav-link:hover { color: #fff; }
        .b-nav-link-active { color: #C8A46B; border-bottom: 1px solid #C8A46B; padding-bottom: 2px; }
        .b-nav-cta { font-size: 11px; letter-spacing: 0.12em; color: #000; background: #C8A46B; padding: 10px 20px; text-transform: uppercase; text-decoration: none; font-weight: 700; transition: background 0.2s; }
        .b-nav-cta:hover { background: #b8924f; }

        /* HAMBURGER */
        /* El selector de idioma vive fuera de .b-nav-links: ese grupo se
           oculta en móvil y con él desaparecía la única forma de volver
           al español desde un teléfono. */
        .b-nav-side { display: flex; align-items: center; gap: 14px; }
        .b-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; background: none; border: none; }
        .b-hamburger span { display: block; width: 22px; height: 1.5px; background: #BFC3C8; transition: background 0.2s; }
        .b-hamburger:hover span { background: #fff; }
        .b-mobile-menu { display: none; flex-direction: column; gap: 0; border-top: 1px solid #1e1e1e; background: #0a0a0a; }
        .b-mobile-menu.open { display: flex; }
        .b-mobile-link { font-size: 12px; letter-spacing: 0.12em; color: #BFC3C8; text-transform: uppercase; text-decoration: none; padding: 16px 24px; border-bottom: 1px solid #141414; display: block; transition: color 0.2s; }
        .b-mobile-link:hover { color: #fff; }
        .b-mobile-link-cta { background: #C8A46B; color: #000; font-weight: 700; border-bottom: none; }
        .b-mobile-link-cta:hover { background: #b8924f; color: #000; }

        /* HERO */
        .b-hero { padding: 88px 56px 72px; border-bottom: 1px solid #1e1e1e; }
        .b-kicker { font-size: 11px; letter-spacing: 0.22em; color: #C8A46B; text-transform: uppercase; margin-bottom: 18px; }
        .b-h1 { font-family: var(--font-cormorant), Georgia, serif; font-weight: 300; font-size: 62px; line-height: 1.0; margin-bottom: 22px; }
        .b-h1 span { color: #C8A46B; }
        .b-hero-copy { color: #BFC3C8; font-size: 16px; line-height: 1.75; max-width: 520px; margin-bottom: 40px; }
        .b-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .b-btn-primary { background: #C8A46B; color: #000; padding: 15px 30px; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: background 0.2s; display: inline-block; }
        .b-btn-primary:hover { background: #b8924f; }
        .b-btn-ghost { border: 1px solid #2e2e2e; color: #BFC3C8; padding: 15px 30px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; transition: border-color 0.2s, color 0.2s; display: inline-block; }
        .b-btn-ghost:hover { border-color: #8a8a8a; color: #fff; }

        /* TRUST */
        .b-trust { padding: 72px 56px; border-bottom: 1px solid #1e1e1e; }
        .b-section-kicker { font-size: 11px; letter-spacing: 0.18em; color: #C8A46B; text-transform: uppercase; margin-bottom: 12px; }
        .b-h2 { font-family: var(--font-cormorant), Georgia, serif; font-weight: 300; font-size: 38px; color: #fff; margin-bottom: 36px; }
        .b-h2 span { color: #C8A46B; }
        .b-trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #2e2e2e; border: 1px solid #2e2e2e; }
        .b-trust-cell { background: #080808; padding: 32px 28px; }
        .b-check { color: #C8A46B; font-size: 18px; margin-bottom: 16px; }
        .b-cell-title { font-weight: 600; font-size: 15px; margin-bottom: 8px; color: #fff; }
        .b-cell-copy { color: #BFC3C8; font-size: 13px; line-height: 1.65; }

        /* PAYMENT CELL */
        .b-payment-cell { background: #080808; padding: 32px 28px; display: flex; flex-direction: column; gap: 14px; }
        .b-payment-label { font-size: 10px; letter-spacing: 0.14em; color: #9a9a9a; text-transform: uppercase; margin-bottom: 4px; }
        .b-payment-methods { display: flex; flex-direction: column; gap: 10px; }
        .b-payment-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid #2e2e2e; width: fit-content; white-space: nowrap; }
        .b-payment-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .b-payment-name { font-size: 13px; font-weight: 600; letter-spacing: 0.02em; }
        .b-payment-sub { color: #BFC3C8; font-size: 11px; margin-top: 10px; line-height: 1.5; }

        /* PROCESO */
        .b-proceso { padding: 72px 56px; border-bottom: 1px solid #1e1e1e; }
        .b-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; margin-top: 36px; }
        .b-step { border-top: 1px solid #2e2e2e; padding-top: 18px; }
        .b-step-num { font-size: 11px; letter-spacing: 0.18em; color: #C8A46B; margin-bottom: 12px; }
        .b-step-title { font-weight: 600; font-size: 15px; margin-bottom: 8px; }
        .b-step-copy { color: #BFC3C8; font-size: 13px; line-height: 1.6; }

        /* CTA FINAL */
        .b-cta { padding: 88px 56px; text-align: center; border-top: 1px solid rgba(200,164,107,0.22); }
        .b-cta-h2 { font-family: var(--font-cormorant), Georgia, serif; font-weight: 300; font-size: 46px; margin-bottom: 14px; }
        .b-cta-h2 span { color: #C8A46B; }
        .b-cta-copy { color: #BFC3C8; font-size: 14px; margin-bottom: 36px; }

        /* FOOTER */
        .b-footer { border-top: 1px solid #1e1e1e; padding: 24px 56px; display: flex; justify-content: space-between; align-items: center; }
        .b-footer-copy { font-size: 11px; color: #666; letter-spacing: 0.06em; }
        .b-footer-link { font-size: 11px; color: #C8A46B; text-decoration: none; letter-spacing: 0.06em; }

        @media (max-width: 900px) {
          .b-nav { padding: 18px 24px; }
          .b-nav-links { display: none; }
          .b-hamburger { display: flex; }
          .b-hero { padding: 56px 24px 48px; }
          .b-h1 { font-size: 42px; }
          .b-trust { padding: 48px 24px; }
          .b-trust-grid { grid-template-columns: 1fr 1fr; }
          .b-proceso { padding: 48px 24px; }
          .b-steps { grid-template-columns: 1fr 1fr; }
          .b-cta { padding: 56px 24px; }
          .b-footer { padding: 20px 24px; flex-direction: column; gap: 8px; text-align: center; }
        }
        @media (max-width: 560px) {
          /* A dos columnas las celdas no caben —28px de padding más contenido
             que no se encoge— y la página se desplazaba de lado. */
          .b-trust-grid { grid-template-columns: 1fr; }
          .b-trust-cell, .b-payment-cell { min-width: 0; }
          .b-steps { grid-template-columns: 1fr; }
          .b-hero-btns { flex-direction: column; }
          .b-cta-h2 { font-size: 32px; }
        }
      `}</style>

      <div className="b-root">

        <nav className="b-nav">
          <Link href="/" className="b-logo">ELITE ROUTE</Link>
          <div className="b-nav-links">
            <Link href="/" className="b-nav-link">{t.home}</Link>
            <Link href="/tarifas" className="b-nav-link">{t.rates}</Link>
            <Link href="/b2b" className="b-nav-link b-nav-link-active">{t.corporate}</Link>
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-nav-cta">{t.contact}</a>
          </div>
          <div className="b-nav-side">
            <LangToggle lang={lang} setLang={setLang} />
            <button className="b-hamburger" aria-label={t.openMenu} id="b-hamburger-btn">
              <span /><span /><span />
            </button>
          </div>
        </nav>
        <div id="b-mobile-menu" className="b-mobile-menu">
          <Link href="/" className="b-mobile-link">{t.home}</Link>
          <Link href="/tarifas" className="b-mobile-link">{t.rates}</Link>
          <Link href="/b2b" className="b-mobile-link" style={{color:"#C8A46B"}}>{t.corporate}</Link>
          <Link href="/b2b/cotizar" className="b-mobile-link">{t.quoteServices}</Link>
          <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-mobile-link b-mobile-link-cta">{t.contact}</a>
        </div>

        <section className="b-hero">
          <p className="b-kicker">{t.heroKicker}</p>
          <h1 className="b-h1">{t.heroTitle[0]}<br />{t.heroTitle[1]}<span>.</span></h1>
          <p className="b-hero-copy">{t.heroCopy}</p>
          <div className="b-hero-btns">
            <Link href="/b2b/cotizar" className="b-btn-primary">{t.heroBtn1}</Link>
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-btn-ghost">{t.heroBtn2}</a>
          </div>
        </section>

        <section className="b-trust">
          <p className="b-section-kicker">{t.trustKicker}</p>
          <h2 className="b-h2">{t.trustTitle}<span>.</span></h2>
          <div className="b-trust-grid">
            {t.cells.map(([title, copy]) => (
              <div className="b-trust-cell" key={title}>
                <div className="b-check">✓</div>
                <div className="b-cell-title">{title}</div>
                <div className="b-cell-copy">{copy}</div>
              </div>
            ))}

            <div className="b-payment-cell">
              <div>
                <div className="b-payment-label">{t.payLabel}</div>
                <div className="b-payment-methods">
                  <div className="b-payment-badge">
                    <div className="b-payment-dot" style={{ background: "#635BFF" }} />
                    <span className="b-payment-name" style={{ color: "#635BFF" }}>Stripe</span>
                    <span style={{ color: "#8B8B87", fontSize: "11px" }}>{t.payCard}</span>
                  </div>
                  <div className="b-payment-badge">
                    <div className="b-payment-dot" style={{ background: "#009EE3" }} />
                    <span className="b-payment-name" style={{ color: "#009EE3" }}>Mercado Pago</span>
                    <span style={{ color: "#8B8B87", fontSize: "11px" }}>{t.payWallet}</span>
                  </div>
                  <div className="b-payment-badge">
                    <div className="b-payment-dot" style={{ background: "#C8A46B" }} />
                    <span className="b-payment-name" style={{ color: "#C8A46B" }}>{t.payTransfer}</span>
                    <span style={{ color: "#8B8B87", fontSize: "11px" }}>{t.paySpei}</span>
                  </div>
                </div>
              </div>
              <div className="b-payment-sub">{t.paySub}</div>
            </div>
          </div>
        </section>

        <section className="b-trust" style={{borderBottom:"1px solid #1e1e1e"}}>
          <p className="b-section-kicker">{t.ratesKicker}</p>
          <h2 className="b-h2">{t.ratesTitle}<span>.</span></h2>
          <p style={{color:"#BFC3C8",fontSize:"14px",marginBottom:"40px",maxWidth:"580px",lineHeight:"1.7"}}>{t.ratesCopy}</p>

          {AIRPORT_TABLES.map((section,si)=>(
            <div key={si} style={{marginBottom: si < 2 ? "48px" : 0}}>
              <div style={{display:"flex",alignItems:"baseline",gap:"12px",marginBottom:"6px"}}>
                <span style={{color:"#fff",fontWeight:600,fontSize:"16px"}}>{section.airport}</span>
                <span style={{color:"#C8A46B",fontSize:"11px",letterSpacing:"0.14em"}}>{section.code}</span>
              </div>
              <p style={{color:"#8B8B87",fontSize:"12px",marginBottom:"16px"}}>{t.airportNotes[si]}</p>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",minWidth:"680px"}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #2e2e2e"}}>
                      <th style={{textAlign:"left",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.1em",textTransform:"uppercase",fontSize:"11px"}}>{t.colCategory}</th>
                      {t.cols[si].map((c,i)=>(
                        <th key={i} style={{textAlign:"right",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.08em",textTransform:"uppercase",fontSize:"11px"}}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {B2B_CATS.map((c,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #1a1a1a"}}>
                        <td style={{padding:"14px",color:"#fff"}}>
                          <div style={{fontWeight:600,marginBottom:"2px"}}>{c.cat}</div>
                          <div style={{color:"#8B8B87",fontSize:"11px"}}>{c.sub}</div>
                        </td>
                        <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{routePrice(section.routes.polanco, c.key)}</td>
                        <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{routePrice(section.routes.santafe, c.key)}</td>
                        <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{routePrice(section.routes.centro, c.key)}</td>
                        <td style={{textAlign:"right",padding:"14px",color:"#8B8B87",fontSize:"12px"}}>{routePrice(section.routes.sur, c.key) || t.quoteIt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div style={{marginTop:"48px",borderTop:"1px solid #2e2e2e",paddingTop:"32px"}}>
            <div style={{color:"#fff",fontWeight:600,fontSize:"15px",marginBottom:"6px"}}>{t.hourTitle}</div>
            <p style={{color:"#8B8B87",fontSize:"12px",marginBottom:"16px"}}>{t.hourNote}</p>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",minWidth:"480px"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #2e2e2e"}}>
                    {[t.colCategory, t.hourRate, t.h2, t.h4, t.h8].map((h,i)=>(
                      <th key={i} style={{textAlign: i === 0 ? "left" : "right",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.1em",textTransform:"uppercase",fontSize:"11px"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {B2B_CATS.map((c,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #1a1a1a"}}>
                      <td style={{padding:"14px",color:"#fff"}}>
                        <div style={{fontWeight:600,marginBottom:"2px"}}>{c.cat}</div>
                        <div style={{color:"#8B8B87",fontSize:"11px"}}>{c.sub}</div>
                      </td>
                      {[1,2,4,8].map((h)=>(
                        <td key={h} style={{textAlign:"right",padding:"14px",color: h === 1 ? "#BFC3C8" : "#C8A46B",fontWeight: h === 1 ? 400 : 600,fontVariantNumeric:"tabular-nums"}}>
                          {mxn(calculatePrice(0, 0, c.key, "hour", h))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{color:"#8B8B87",fontSize:"11px",marginTop:"32px",letterSpacing:"0.06em",lineHeight:"1.8"}}>{t.ratesFoot}</p>
        </section>

        <section className="b-proceso">
          <p className="b-section-kicker">{t.stepsKicker}</p>
          <h2 className="b-h2">{t.stepsTitle}<span>.</span></h2>
          <div className="b-steps">
            {t.steps.map(([title, copy], i) => (
              <div className="b-step" key={title}>
                <div className="b-step-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="b-step-title">{title}</div>
                <div className="b-step-copy">{copy}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="b-cta">
          <h2 className="b-cta-h2">{t.ctaTitle}<span>?</span></h2>
          <p className="b-cta-copy">{t.ctaCopy}</p>
          <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap"}}>
            <Link href="/b2b/cotizar" className="b-btn-primary">{t.heroBtn1}</Link>
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-btn-ghost">{t.ctaBtn2}</a>
          </div>
        </section>

        <footer className="b-footer">
          <span className="b-footer-copy">{t.footerCopy}</span>
          <Link href="/" className="b-footer-link">{t.footerLink}</Link>
        </footer>

      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('b-hamburger-btn')?.addEventListener('click', function() {
          document.getElementById('b-mobile-menu')?.classList.toggle('open');
        });
      `}} />

      <a
        href={WHATSAPP_B2B}
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
    </>
  );
}
