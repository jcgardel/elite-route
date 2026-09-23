"use client";

import Link from "next/link";
import { vehicles, CATEGORIES, type Category } from "@/lib/vehicles";
import { GOOGLE_PLACE_URL, GOOGLE_RATING, GOOGLE_REVIEW_COUNT, REVIEWS } from "@/lib/social-proof";
import { LEGAL } from "@/lib/legal";
import { B2B_HORAS, B2B_SECTIONS, type TablasB2b } from "@/lib/rate-tables";
import LangToggle from "./LangToggle";
import { path, type Lang } from "@/lib/i18n";

/**
 * Corporativo, en los dos idiomas del sitio.
 *
 * Arranca en español —es la página que atiende al comprador corporativo
 * mexicano y sus metadatos están en ese idioma— pero respeta la elección que
 * el visitante ya haya hecho en cualquier otra página. Los precios salen de
 * el servidor en los dos casos: no hay tablas escritas a mano.
 */

const WHATSAPP_B2B = "https://wa.me/525543582919?text=Hola%2C+me+interesa+una+cuenta+corporativa+para+mi+empresa.";

// Las rutas y sus distancias viven ahora en lib/rate-tables.ts, compartidas
// con la página de servidor que calcula los precios: si estuvieran aquí,
// este componente tendría que calcularlos él mismo y arrastrar el tarifario
// al navegador.
const AIRPORT_TABLES = B2B_SECTIONS;

// Nombre y flota salen de lib/vehicles.ts: esta página los tenía en español
// ("Sedán", "Ejecutivo") mientras el cotizador los tenía en inglés, así que
// un cliente que comparaba las dos veía dos catálogos distintos.
const B2B_CATS: { key: Category; cat: string; sub: string }[] = (
  CATEGORIES
).map((key) => ({ key, cat: vehicles[key].name, sub: vehicles[key].tag }));

function mxn(n: number) {
  return "$" + n.toLocaleString("es-MX");
}
/** El precio ya viene resuelto del servidor; aquí sólo se busca y se
 *  formatea. Calcularlo en el navegador obligaba a bajar el tarifario. */
function routePrice(tablas: TablasB2b, code: string, destino: string, cat: Category) {
  const fila = tablas.rutas[`${code}:${destino}`];
  return fila ? mxn(fila[cat]) : "";
}

const TX = {
  es: {
    home: "Inicio", rates: "Tarifas", corporate: "Corporativo",
    contact: "Contactar →", openMenu: "Abrir menú", quoteServices: "Cotizar servicios",
    heroKicker: "Soluciones para empresas",
    heroTitle: "Transporte Ejecutivo Corporativo en Ciudad de México",
    heroTagline: "Tu equipo llega a tiempo.",
    heroCopy: "Transporte ejecutivo para empresas en CDMX. Rutas recurrentes, factura electrónica CFDI y cuenta corporativa centralizada con atención prioritaria 24/7.",
    heroBtn1: "Cotizar servicios →", heroBtn2: "Hablar con un asesor",
    trustKicker: "Estándar corporativo",
    trustTitle: "Diseñado para empresas",
    cells: [
      ["Factura electrónica CFDI", "CFDI disponible por cada servicio. Proceso directo con tu área administrativa sin fricciones."],
      ["Confirmación y seguimiento operativo", "Validamos cada servicio y damos seguimiento antes y durante la operación."],
      ["Monitoreo de vuelo en tiempo real", "Seguimos la hora real de aterrizaje para coordinar la recepción y ajustar el servicio si cambia el itinerario."],
      ["Una hora de espera incluida", "Desde la hora real de aterrizaje, sin costo. Si el pasajero se comunica y sigue dentro del aeropuerto, el chofer espera hasta 30 minutos más."],
      ["Conductores profesionales", "Conductores identificados y seleccionados conforme a nuestros estándares de servicio y operación."],
      ["Unidades aseguradas", "Todas las unidades con seguro vigente y monitoreo GPS las 24 horas."],
      ["Recepción personalizada en aeropuerto", "Tu conductor te espera en la zona de llegadas con un letrero o tablet con tu nombre."],
      ["Tarjeta digital del conductor", "Antes del servicio compartimos los datos del conductor y de la unidad asignada para que el pasajero pueda identificarlos."],
    ],
    payLabel: "Métodos de pago aceptados",
    payCard: "· Tarjeta", payWallet: "· Tarjeta / wallet", payTransfer: "Transferencia", paySpei: "· SPEI / CoDi",
    paySub: "Pagos procesados mediante plataformas de pago seguras. Pago empresarial con referencia para conciliación contable.",
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
    cancelNote: "Cancelaciones: sin costo con más de 24 horas de anticipación; 50% entre 12 y 24 horas; 100% dentro de las 12 horas previas o si el pasajero no se presenta. Se considera no presentado 60 minutos después del aterrizaje real en aeropuerto y 30 minutos en cualquier otro punto, tras intentar contactar al pasajero; si el pasajero se comunica y sigue dentro del aeropuerto, el chofer espera hasta 30 minutos adicionales sin costo.",
    fleetNote: "Conoce las unidades que forman parte de nuestra operación. La reservación se realiza por categoría; marca, modelo y color se asignan según disponibilidad y requerimientos del servicio.",
    orEquivalent: "o equivalente",
    solKicker: "Soluciones",
    solTitle: "Soluciones de transporte para empresas",
    solCopy: "Coordinamos transporte ejecutivo para empresas, equipos y organizadores que necesitan puntualidad, seguimiento y atención personalizada en Ciudad de México.",
    solItems: [
      ["Viajes corporativos", "Traslados a los tres aeropuertos, servicios ejecutivos y transporte por hora para tu equipo."],
      ["Asistentes de dirección", "Coordinación de traslados para directivos, invitados y visitantes, con un solo interlocutor."],
      ["Eventos y reuniones", "Operaciones con varios vehículos, horarios escalonados y distintos puntos de recogida."],
    ],
    partKicker: "Partners y operadores",
    partTitle: "Partner local de transporte ejecutivo en Ciudad de México",
    partCopy: "Trabajamos con agencias, operadores de transporte y compañías internacionales que necesitan cobertura local en Ciudad de México. Coordinamos traslados aeroportuarios, servicio por hora, movimientos corporativos y operaciones con varios vehículos.",
    partItems: [
      "Tarifas B2B",
      "Atención operativa 24/7",
      "Monitoreo de vuelo",
      "Recepción en sala de llegadas",
      "Datos del conductor y la unidad",
      "Factura CFDI",
      "Coordinación de operaciones con varios vehículos",
    ],
    partCta: "Solicitar tarifas B2B / Affiliate",
    partMailSubject: "Tarifas B2B / Affiliate — Elite Route",
    revKicker: "Reseñas",
    revTitle: "Empresas y viajeros confían en Elite Route",
    revCount: (n: number) => `${n} reseñas en Google`,
    revCta: "Ver reseñas en Google",
    fleetKicker: "La flota",
    fleetTitle: "Cuatro categorías, unidades propias",
    fleetCopy: "Flota propia en operación, monitoreada por GPS las 24 horas. Cada categoría cubre un tipo de traslado distinto.",
    fleetAlt: (c: string) => `Unidades de la categoría ${c} de Elite Route`,
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
    heroTitle: "Corporate Executive Transportation in Mexico City",
    heroTagline: "Your team arrives on time.",
    heroCopy: "Executive transportation for companies in Mexico City. Recurring routes, CFDI electronic invoicing and a central corporate account with priority attention 24/7.",
    heroBtn1: "Request a quote →", heroBtn2: "Talk to an advisor",
    trustKicker: "Corporate standard",
    trustTitle: "Built for companies",
    cells: [
      ["CFDI electronic invoice", "A CFDI invoice for every service, handled directly with your finance team without friction."],
      ["Confirmation and operational follow-up", "We validate every service and follow it before and during the operation."],
      ["Real-time flight tracking", "We follow the actual landing time to coordinate the pickup and adjust the service if the itinerary changes."],
      ["One hour of waiting included", "From the actual landing time, at no charge. If the passenger gets in touch and is still inside the airport, the chauffeur waits up to 30 minutes more."],
      ["Professional chauffeurs", "Chauffeurs identified and selected according to our own service and operating standards."],
      ["Insured vehicles", "Every vehicle insured and GPS-monitored around the clock."],
      ["Meet and greet in arrivals", "Your chauffeur waits in the arrivals hall with a sign or tablet showing your name."],
      ["Digital driver card", "Before the service we share the assigned chauffeur's and vehicle's details so the passenger can identify them."],
    ],
    payLabel: "Accepted payment methods",
    payCard: "· Card", payWallet: "· Card / wallet", payTransfer: "Bank transfer", paySpei: "· SPEI / CoDi",
    paySub: "Payments processed through secure payment platforms. Corporate payment with a reference for accounting reconciliation.",
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
    cancelNote: "Cancellations: free of charge more than 24 hours before pickup; 50% between 12 and 24 hours; 100% within 12 hours or in case of no-show. A no-show is 60 minutes after the actual landing time at airports and 30 minutes anywhere else, after attempting to contact the passenger; if the passenger gets in touch and is still inside the airport, the chauffeur waits up to 30 extra minutes at no charge.",
    fleetNote: "These are the vehicles in our operation. Bookings are made by category; make, model and colour are assigned according to availability and the requirements of the service.",
    orEquivalent: "or equivalent",
    solKicker: "Solutions",
    solTitle: "Transport solutions for companies",
    solCopy: "We coordinate executive transport for companies, teams and organisers who need punctuality, follow-up and a single point of contact in Mexico City.",
    solItems: [
      ["Corporate travel", "Transfers to all three airports, executive services and hourly transport for your team."],
      ["Executive assistants", "Transport coordinated for directors, guests and visitors, through one point of contact."],
      ["Events and meetings", "Multi-vehicle operations, staggered schedules and several pickup points."],
    ],
    partKicker: "Partners and operators",
    partTitle: "Your local chauffeur partner in Mexico City",
    partCopy: "We work with agencies, ground transportation operators and international chauffeur companies that need local coverage in Mexico City. We handle airport transfers, hourly service, corporate movements and multi-vehicle operations.",
    partItems: [
      "B2B rates",
      "24/7 operations desk",
      "Flight tracking",
      "Meet and greet in arrivals",
      "Chauffeur and vehicle details",
      "CFDI invoicing",
      "Multi-vehicle coordination",
    ],
    partCta: "Request B2B / affiliate rates",
    partMailSubject: "B2B / Affiliate rates — Elite Route",
    revKicker: "Reviews",
    revTitle: "Companies and travellers trust Elite Route",
    revCount: (n: number) => (n === 1 ? "1 Google review" : `${n} Google reviews`),
    revCta: "See the reviews on Google",
    fleetKicker: "The fleet",
    fleetTitle: "Four categories, our own vehicles",
    fleetCopy: "Our own fleet in service, GPS-monitored around the clock. Each category covers a different kind of transfer.",
    fleetAlt: (c: string) => `Elite Route ${c} category vehicles`,
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

export default function B2bClient({
  lang,
  tablas,
}: {
  lang: Lang;
  /** Precios ya calculados en el servidor. */
  tablas: TablasB2b;
}) {
  const t = TX[lang];
  const home = path(lang, "home");
  const quote = path(lang, "quote");

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
        .b-hero-tagline { font-family: var(--font-cormorant), Georgia, serif; font-size: 27px; font-weight: 300; color: #C8A46B; margin: -8px 0 18px; }
        .b-hero-copy { color: #BFC3C8; font-size: 16px; line-height: 1.75; max-width: 520px; margin-bottom: 40px; }
        .b-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .b-btn-primary { background: #C8A46B; color: #000; padding: 15px 30px; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: background 0.2s; display: inline-block; }
        .b-btn-primary:hover { background: #b8924f; }
        .b-btn-ghost { border: 1px solid #2e2e2e; color: #BFC3C8; padding: 15px 30px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; transition: border-color 0.2s, color 0.2s; display: inline-block; }
        .b-btn-ghost:hover { border-color: #8a8a8a; color: #fff; }

        /* SOLUCIONES */
        .b-sol { padding: 72px 56px; border-bottom: 1px solid #1e1e1e; }
        .b-sol-copy { color: #BFC3C8; font-size: 15px; line-height: 1.85; max-width: 620px; margin: -18px 0 36px; }
        .b-sol-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1px; background: #2e2e2e; border: 1px solid #2e2e2e; }
        .b-sol-cell { background: #080808; padding: 30px 26px; }
        .b-sol-name { font-family: var(--font-barlow-condensed), sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #fff; margin-bottom: 10px; }
        .b-sol-copy-sm { color: #8B8B87; font-size: 13.5px; line-height: 1.8; }
        @media (max-width: 860px) {
          .b-sol { padding: 56px 20px; }
          .b-sol-grid { grid-template-columns: 1fr; }
        }

        /* PARTNERS */
        .b-part { padding: 72px 56px; border-bottom: 1px solid #1e1e1e; }
        .b-part-copy { color: #BFC3C8; font-size: 15px; line-height: 1.85; max-width: 640px; margin: -18px 0 34px; }
        .b-part-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px 40px; max-width: 760px; }
        .b-part-item { display: flex; align-items: flex-start; gap: 10px; color: #d6d6d2; font-size: 14px; line-height: 1.6; border-top: 1px solid #232323; padding-top: 13px; }
        .b-part-item span { color: #C8A46B; flex-shrink: 0; }
        @media (max-width: 860px) {
          .b-part { padding: 56px 20px; }
          .b-part-grid { grid-template-columns: 1fr; }
        }

        /* RESEÑAS */
        .b-rev { padding: 72px 56px; border-bottom: 1px solid #1e1e1e; }
        .b-rev-score { display: flex; align-items: baseline; gap: 12px; margin: -14px 0 30px; }
        .b-rev-num { font-family: var(--font-cormorant), Georgia, serif; font-size: 42px; color: #fff; line-height: 1; }
        .b-rev-stars { color: #C8A46B; letter-spacing: 2px; font-size: 15px; }
        .b-rev-count { color: #8B8B87; font-size: 13px; }
        .b-rev-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .b-rev-card { border: 1px solid #272727; background: #0c0c0c; padding: 26px 24px; }
        .b-rev-quote { color: #d6d6d2; font-size: 14px; line-height: 1.8; font-style: italic; }
        .b-rev-name { color: #fff; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 16px; }
        .b-rev-cta { display: inline-block; margin-top: 26px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #C8A46B; text-decoration: none; border-bottom: 1px solid rgba(200,164,107,0.45); padding-bottom: 3px; }
        .b-rev-cta:hover { color: #fff; border-color: #fff; }
        @media (max-width: 860px) {
          .b-rev { padding: 56px 20px; }
          .b-rev-grid { grid-template-columns: 1fr; }
          .b-hero-tagline { font-size: 22px; }
        }

        /* FLOTA */
        .b-fleet { padding: 72px 56px; border-bottom: 1px solid #1e1e1e; }
        .b-fleet-copy { color: #8B8B87; font-size: 14px; line-height: 1.9; max-width: 640px; margin: -20px 0 36px; }
        .b-fleet-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .b-fleet-card { border: 1px solid #2e2e2e; background: #080808; }
        .b-fleet-card img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; }
        .b-fleet-meta { padding: 20px 24px 24px; }
        .b-fleet-name { font-family: var(--font-cormorant), Georgia, serif; font-size: 26px; color: #fff; }
        .b-fleet-cap { color: #8B8B87; font-size: 13px; letter-spacing: 0.04em; margin-top: 6px; }
        .b-fleet-note { color: #6f6f6c; font-size: 12px; line-height: 1.7; margin-top: 8px; }
        @media (max-width: 860px) {
          .b-fleet { padding: 56px 20px; }
          .b-fleet-grid { grid-template-columns: 1fr; gap: 18px; }
        }

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
          <Link href={home} className="b-logo">ELITE ROUTE</Link>
          <div className="b-nav-links">
            <Link href={home} className="b-nav-link">{t.home}</Link>
            <Link href={path(lang, "rates")} className="b-nav-link">{t.rates}</Link>
            <Link href={path(lang, "corporate")} className="b-nav-link b-nav-link-active">{t.corporate}</Link>
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-nav-cta">{t.contact}</a>
          </div>
          <div className="b-nav-side">
            <LangToggle lang={lang} page="corporate" />
            <button className="b-hamburger" aria-label={t.openMenu} id="b-hamburger-btn">
              <span /><span /><span />
            </button>
          </div>
        </nav>
        <div id="b-mobile-menu" className="b-mobile-menu">
          <Link href={home} className="b-mobile-link">{t.home}</Link>
          <Link href={path(lang, "rates")} className="b-mobile-link">{t.rates}</Link>
          <Link href={path(lang, "corporate")} className="b-mobile-link" style={{color:"#C8A46B"}}>{t.corporate}</Link>
          <Link href={quote} className="b-mobile-link">{t.quoteServices}</Link>
          <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-mobile-link b-mobile-link-cta">{t.contact}</a>
        </div>

        <section className="b-hero">
          <p className="b-kicker">{t.heroKicker}</p>
          {/* El H1 dice lo que se busca en Google; el lema, que es lo que
              vende, baja a la línea de abajo. Un solo H1 en la página. */}
          <h1 className="b-h1">{t.heroTitle}<span>.</span></h1>
          <p className="b-hero-tagline">{t.heroTagline}</p>
          <p className="b-hero-copy">{t.heroCopy}</p>
          <div className="b-hero-btns">
            <Link href={quote} className="b-btn-primary">{t.heroBtn1}</Link>
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

        {/* Va ANTES de las tarifas a propósito: primero para qué sirve el
            servicio, después cuánto cuesta. Tres perfiles, no seis: son los
            que el dueño tiene hoy. Los demás entran cuando haya clientes
            reales de cada uno — una tarjeta sin cliente detrás es una
            promesa que nadie ha cumplido todavía. No duplica la sección de
            partners: aquella es para operadores que revenden, esta para
            quien viaja o organiza. */}
        <section className="b-sol">
          <p className="b-section-kicker">{t.solKicker}</p>
          <h2 className="b-h2">{t.solTitle}<span>.</span></h2>
          <p className="b-sol-copy">{t.solCopy}</p>
          <div className="b-sol-grid">
            {t.solItems.map(([name, copy]) => (
              <div className="b-sol-cell" key={name}>
                <div className="b-sol-name">{name}</div>
                <p className="b-sol-copy-sm">{copy}</p>
              </div>
            ))}
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
                        <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{routePrice(tablas, section.code, "polanco", c.key)}</td>
                        <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{routePrice(tablas, section.code, "santafe", c.key)}</td>
                        <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{routePrice(tablas, section.code, "centro", c.key)}</td>
                        <td style={{textAlign:"right",padding:"14px",color:"#8B8B87",fontSize:"12px"}}>{routePrice(tablas, section.code, "sur", c.key) || t.quoteIt}</td>
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
                      <td style={{textAlign:"right",padding:"14px",color:"#BFC3C8",fontWeight:400,fontVariantNumeric:"tabular-nums"}}>
                        {mxn(tablas.tarifaHora[c.key])}
                      </td>
                      {B2B_HORAS.map((h)=>(
                        <td key={h} style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>
                          {mxn(tablas.horas[h][c.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{color:"#8B8B87",fontSize:"11px",marginTop:"32px",letterSpacing:"0.06em",lineHeight:"1.8"}}>{t.ratesFoot}</p>
          <p style={{color:"#8B8B87",fontSize:"11px",marginTop:"10px",letterSpacing:"0.06em",lineHeight:"1.8"}}>{t.cancelNote}</p>
        </section>

        {/* La flota va aquí a propósito: entre ver el precio y que le pidan
            abrir cuenta había un salto seco. Las imágenes son las cuatro de
            categoría del catálogo corporativo; los modelos y capacidades
            salen de lib/vehicles.ts, que es la misma fuente del cotizador,
            así que no pueden contradecirse. */}
        <section className="b-fleet">
          <p className="b-section-kicker">{t.fleetKicker}</p>
          <h2 className="b-h2">{t.fleetTitle}<span>.</span></h2>
          <p className="b-fleet-copy">{t.fleetCopy}</p>
          <p className="b-fleet-copy" style={{ marginTop: "-18px" }}>{t.fleetNote}</p>
          <div className="b-fleet-grid">
            {(["suv", "executive", "minivan", "sedan"] as const).map((k) => {
              const v = vehicles[k];
              const note = lang === "es" ? v.noteEs : v.note;
              return (
                <div className="b-fleet-card" key={k}>
                  <img
                    src={`/flota/${k === "suv" ? "high-suv" : k}.webp`}
                    alt={t.fleetAlt(v.name)}
                    width={1400}
                    height={788}
                    loading="lazy"
                  />
                  <div className="b-fleet-meta">
                    <div className="b-fleet-name">{v.name}</div>
                    <div className="b-fleet-cap">{v.tag} {t.orEquivalent}</div>
                    <div className="b-fleet-cap">{lang === "es" ? v.capEs : v.cap}</div>
                    {note && <div className="b-fleet-note">{note}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* El operador internacional que necesita cobertura en CDMX es un
            comprador distinto del corporativo local: no cotiza un traslado,
            busca proveedor. Va después de la flota —ya vio precio y unidades—
            y antes de las reseñas. El CTA es correo, no WhatsApp: este
            comprador manda tarifarios y contratos, no mensajes. */}
        <section className="b-part">
          <p className="b-section-kicker">{t.partKicker}</p>
          <h2 className="b-h2">{t.partTitle}<span>.</span></h2>
          <p className="b-part-copy">{t.partCopy}</p>
          <div className="b-part-grid">
            {t.partItems.map((item) => (
              <div className="b-part-item" key={item}>
                <span aria-hidden="true">—</span>{item}
              </div>
            ))}
          </div>
          <a
            className="b-btn-primary"
            style={{ display: "inline-block", marginTop: "34px" }}
            href={`mailto:${LEGAL.correoComercial}?subject=${encodeURIComponent(t.partMailSubject)}`}
          >
            {t.partCta}
          </a>
        </section>

        {/* Las reseñas salen de lib/social-proof.ts, la misma fuente de la
            portada y de las páginas de ruta: si Google recalcula, cambia en
            un sitio y se actualiza en todos. Tres, no cinco: aquí la prueba
            social apoya, no es el argumento principal. */}
        <section className="b-rev">
          <p className="b-section-kicker">{t.revKicker}</p>
          <h2 className="b-h2">{t.revTitle}<span>.</span></h2>
          <div className="b-rev-score">
            <span className="b-rev-num">{GOOGLE_RATING}</span>
            <span className="b-rev-stars">★★★★★</span>
            <span className="b-rev-count">{t.revCount(GOOGLE_REVIEW_COUNT)}</span>
          </div>
          <div className="b-rev-grid">
            {REVIEWS.slice(0, 3).map((r) => (
              <div className="b-rev-card" key={r.name}>
                <p className="b-rev-quote">&ldquo;{r.quote}&rdquo;</p>
                <div className="b-rev-name">{r.name}</div>
              </div>
            ))}
          </div>
          <a className="b-rev-cta" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">{t.revCta}</a>
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
            <Link href={quote} className="b-btn-primary">{t.heroBtn1}</Link>
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-btn-ghost">{t.ctaBtn2}</a>
          </div>
        </section>

        <footer className="b-footer">
          <span className="b-footer-copy">{t.footerCopy}</span>
          <Link href={home} className="b-footer-link">{t.footerLink}</Link>
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
