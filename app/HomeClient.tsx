"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  calculatePrice,
  detectZone,
  isAirportAddress,
  serviceTypeLabel,
  serviceTypeLabelEs,
  tariffs,
  zoneLabel,
  zoneLabelEs,
  type Category,
  type ServiceType,
  type Zone,
} from "@/lib/booking";

const libraries: "places"[] = ["places"];
const WHATSAPP_NUMBER = "525543582919";
const GOOGLE_MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Sesgo geográfico: prioriza sugerencias dentro de la ZMVM.
// strictBounds:false permite rutas foráneas si el usuario las escribe explícitamente.
const ZMVM_BOUNDS = { south: 18.9, west: -99.5, north: 20.0, east: -98.7 };
const AC_OPTIONS = {
  componentRestrictions: { country: "mx" },
  bounds: ZMVM_BOUNDS,
  strictBounds: false,
  fields: ["formatted_address", "geometry", "name"],
};

/**
 * Envuelve el campo en el autocompletado de Google sólo cuando la API ya
 * cargó. Así la página se pinta de inmediato y el visitante puede escribir
 * su dirección aunque el script de Maps siga en camino: la ruta se resuelve
 * igual en el servidor a partir del texto.
 */
function MaybeAutocomplete({
  isLoaded,
  onLoad,
  onPlaceChanged,
  children,
}: {
  isLoaded: boolean;
  onLoad: (a: google.maps.places.Autocomplete) => void;
  onPlaceChanged: () => void;
  children: React.ReactElement;
}) {
  if (!isLoaded) return children;
  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} options={AC_OPTIONS}>
      {children}
    </Autocomplete>
  );
}

const vehicleImages: Record<string, string> = {
  sedan: "/sedan.webp",
  executive: "/executive.webp",
  minivan: "/minivan.webp",
  suv: "/high-suv.webp",
};

function getMinDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isUrgent(dateStr: string, timeStr: string): boolean {
  if (!dateStr || !timeStr) return false;
  const diff = (new Date(`${dateStr}T${timeStr}`).getTime() - Date.now()) / 3600000;
  return diff > 0 && diff <= 6;
}

function formatDateTime(dateStr: string, timeStr: string, locale = "es-MX") {
  if (!dateStr || !timeStr) return "—";
  const dt = new Date(`${dateStr}T${timeStr}`);
  return dt.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + " · " + timeStr + "h";
}

const TX = {
  en: {
    services: "Dispositions", airports: "Transfers", corporate: "Corporate", contact: "Contact", reserveNow: "Reserve Now",
    kicker: "Elite Route Mexico City",
    heroTitle: "We move your level.",
    heroCopy: "Your private chauffeur in Mexico City. Airport transfers, hourly service and executive transportation.",
    heroBtnReserve: "Reserve Now",
    comfortTitleA: "Safety, comfort and ", comfortTitleB: "confidence", comfortTitleC: " in every ride.",
    water: "Complimentary water bottle", chargers: "Phone chargers", music: "Music connection",
    ac: "Vehicle with A/C", chauffeur: "Friendly, service-minded chauffeur",
    getQuote: "Get your quote",
    stepRoute: "Route", stepVehicle: "Vehicle", stepConfirm: "Confirm",
    transfer: "Transfer", hourly: "Hourly", fullDay: "Full Day",
    hourlyNote: (h: number) => `Hourly service · 20 km included per hour · Up to ${h * 20} km`,
    hourlyNote2: "Your chauffeur remains available during the contracted hours.",
    dayNote: "Full-day service · 10 hours · Up to 200 km included",
    dayNote2: "Ideal for meetings, events or city transportation in Mexico City.",
    duration: "Service Duration", hours: "hours",
    decreaseHours: "Decrease hours", increaseHours: "Increase hours",
    pickup: "Pickup Location", pickupPlaceholder: "Hotel, airport, address...",
    destination: "Destination", destinationPlaceholder: "Where are we taking you?",
    date: "Date", time: "Time", vehicleCategory: "Vehicle Category",
    getQuoteBtn: "Get Quote →", calculating: "Calculating route...",
    continue: "Continue →", modifyRoute: "← Modify route", modifyVehicle: "← Modify vehicle",
    kilometers: "Kilometers", includedKm: "Included km", estimatedMin: "Estimated min.",
    urgentNote: "⚠️ Short-notice booking — 15% availability fee applies",
    airportNote: "✈️ Airport pickup — parking & flight-delay waiting time included",
    vatIncluded: "VAT included",
    fullName: "Full Name", fullNamePlaceholder: "As shown on ID", phone: "Phone",
    stServiceType: "Service type", stIncludedKm: "Included km", stDateTime: "Date & time",
    stPickup: "Pickup", stDestination: "Destination", stOpenItinerary: "Open itinerary",
    stVehicle: "Vehicle", stDistance: "Distance", stDuration: "Duration", stZone: "Zone",
    totalVat: "Total with VAT",
    paymentNote: "Secure card payment powered by Stripe. Your booking details are attached to the payment.",
    payBtn: "Pay and reserve with card", payLoading: "Opening secure payment...",
    whatsappBtn: "Ask via WhatsApp",
    legal: "Paid bookings remain subject to final availability confirmation by Elite Route.",
    legal2: "Elite Route CDMX · eliteroute.mx",
    alertOrigin: "Enter the pickup location.",
    alertDest: "Enter the destination.",
    alertDateTime: "Select the service date and time.",
    alertMinHours: "Minimum hourly service is 2 hours.",
    alertPast: "Select a future date and time.",
    alertAdvance: "At least 4 hours of advance notice are required.",
    alertTooManyReq: "Too many requests. Please wait a moment and try again.",
    alertRouteErr: "We could not calculate the route. Please verify the addresses.",
    alertKmExceeded: (a: number, r: number) => `This service includes up to ${a} km. The calculated route is ${r} km.`,
    alertConnErr: "Connection error. Please try again.",
    alertName: "Full name is required.",
    alertPhone: "Phone number is required.",
    alertPhoneInvalid: "Enter a valid phone number with country code.",
    alertPriceErr: "Error: go back to step 1 and calculate the route.",
    alertCheckoutErr: "We could not start the payment. Please try again.",
    benefit1Title: "Professional Chauffeurs", benefit1Copy: "Licensed and professionally trained.",
    benefit2Title: "Fixed Pricing", benefit2Copy: "Transparent fares with no surprises.",
    benefit3Title: "24/7 Availability", benefit3Copy: "Airport and executive transportation.",
    benefit4Title: "Direct Confirmation", benefit4Copy: "Instant WhatsApp assistance.",
    b2bTitle: "Business to Business",
    b2bCopy: "Corporate accounts, executive transfers, recurring routes and commercial partnerships.",
    accTitle: "Accounting / Invoices",
    accCopy: "Billing details, invoice requests, payment records and administrative follow-up.",
  },
  es: {
    services: "Disposiciones", airports: "Traslados", corporate: "Corporativo", contact: "Contacto", reserveNow: "Reservar",
    kicker: "Elite Route Ciudad de México",
    heroTitle: "Movemos tu nivel.",
    heroCopy: "Tu chofer privado en Ciudad de México. Traslados al aeropuerto, servicio por hora y transporte ejecutivo.",
    heroBtnReserve: "Reservar Ahora",
    comfortTitleA: "Seguridad, comodidad y ", comfortTitleB: "confianza", comfortTitleC: " en cada viaje.",
    water: "Botella de agua de cortesía", chargers: "Cargadores para celular", music: "Conexión para música",
    ac: "Vehículo con A/C", chauffeur: "Chofer amable y orientado al servicio",
    getQuote: "Obtén tu cotización",
    stepRoute: "Ruta", stepVehicle: "Vehículo", stepConfirm: "Confirmar",
    transfer: "Traslado", hourly: "Por hora", fullDay: "Día completo",
    hourlyNote: (h: number) => `Servicio por hora · 20 km incluidos por hora · Hasta ${h * 20} km`,
    hourlyNote2: "Tu chofer permanece disponible durante las horas contratadas.",
    dayNote: "Servicio día completo · 10 horas · Hasta 200 km incluidos",
    dayNote2: "Ideal para reuniones, eventos o traslados en la Ciudad de México.",
    duration: "Duración del servicio", hours: "horas",
    decreaseHours: "Disminuir horas", increaseHours: "Aumentar horas",
    pickup: "Lugar de recogida", pickupPlaceholder: "Hotel, aeropuerto, dirección...",
    destination: "Destino", destinationPlaceholder: "¿A dónde te llevamos?",
    date: "Fecha", time: "Hora", vehicleCategory: "Categoría de vehículo",
    getQuoteBtn: "Obtener cotización →", calculating: "Calculando ruta...",
    continue: "Continuar →", modifyRoute: "← Modificar ruta", modifyVehicle: "← Modificar vehículo",
    kilometers: "Kilómetros", includedKm: "Km incluidos", estimatedMin: "Min. estimados",
    urgentNote: "⚠️ Reserva próxima — se aplica cargo de disponibilidad del 15%",
    airportNote: "✈️ Salida desde aeropuerto — estacionamiento y espera por retraso de vuelo incluidos",
    vatIncluded: "IVA incluido",
    fullName: "Nombre completo", fullNamePlaceholder: "Como aparece en identificación", phone: "Teléfono",
    stServiceType: "Tipo de servicio", stIncludedKm: "Km incluidos", stDateTime: "Fecha y hora",
    stPickup: "Recogida", stDestination: "Destino", stOpenItinerary: "Disposición libre",
    stVehicle: "Vehículo", stDistance: "Distancia", stDuration: "Duración", stZone: "Zona",
    totalVat: "Total con IVA",
    paymentNote: "Pago seguro con tarjeta vía Stripe. Los detalles de tu reserva se adjuntan al pago.",
    payBtn: "Pagar y reservar con tarjeta", payLoading: "Abriendo pago seguro...",
    whatsappBtn: "Consultar por WhatsApp",
    legal: "Las reservas pagadas están sujetas a confirmación final de disponibilidad por parte de Elite Route.",
    legal2: "Elite Route CDMX · eliteroute.mx",
    alertOrigin: "Ingresa el lugar de recogida.",
    alertDest: "Ingresa el destino.",
    alertDateTime: "Selecciona la fecha y hora del servicio.",
    alertMinHours: "El servicio mínimo por hora es de 2 horas.",
    alertPast: "Selecciona una fecha y hora futura.",
    alertAdvance: "Se requieren al menos 4 horas de anticipación.",
    alertTooManyReq: "Demasiadas solicitudes. Por favor espera un momento e intenta de nuevo.",
    alertRouteErr: "No pudimos calcular la ruta. Por favor verifica las direcciones.",
    alertKmExceeded: (a: number, r: number) => `Este servicio incluye hasta ${a} km. La ruta calculada es de ${r} km.`,
    alertConnErr: "Error de conexión. Por favor intenta de nuevo.",
    alertName: "El nombre completo es requerido.",
    alertPhone: "El número de teléfono es requerido.",
    alertPhoneInvalid: "Ingresa un número de teléfono válido con código de país.",
    alertPriceErr: "Error: regresa al paso 1 y calcula la ruta.",
    alertCheckoutErr: "No pudimos iniciar el pago. Por favor intenta de nuevo.",
    benefit1Title: "Choferes Profesionales", benefit1Copy: "Licenciados y capacitados profesionalmente.",
    benefit2Title: "Tarifas Fijas", benefit2Copy: "Precios transparentes sin sorpresas.",
    benefit3Title: "Disponibilidad 24/7", benefit3Copy: "Transporte aeroportuario y ejecutivo.",
    benefit4Title: "Confirmación Directa", benefit4Copy: "Asistencia inmediata por WhatsApp.",
    b2bTitle: "Business to Business",
    b2bCopy: "Cuentas corporativas, traslados ejecutivos, rutas recurrentes y asociaciones comerciales.",
    accTitle: "Contabilidad / Facturas",
    accCopy: "Datos de facturación, solicitudes de facturas, registros de pago y seguimiento administrativo.",
  },
};

const styles = `

  * { box-sizing:border-box; }
  .er-root { background:#0A0A0A; color:#fff; min-height:100vh; font-family:var(--font-barlow),sans-serif; font-weight:300; }
  .er-shell { min-height:100vh; }
  .er-hero { position:relative; min-height:720px; background-image:linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.76) 48%, rgba(0,0,0,0.68) 100%), url('/high-suv.webp'); background-size:cover; background-position:center 48%; display:flex; flex-direction:column; }
  .er-hero::after { content:""; position:absolute; inset:auto 0 0; height:190px; background:linear-gradient(180deg, transparent, #0A0A0A); pointer-events:none; }
  .er-nav { position:relative; z-index:2; max-width:1180px; width:100%; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; }
  .er-logo-img { width:176px; height:auto; display:block; filter:drop-shadow(0 18px 32px rgba(0,0,0,0.65)); }
  .er-nav-right { display:flex; align-items:center; gap:20px; }
  .er-nav-links { display:flex; gap:28px; align-items:center; color:#BFC3C8; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; }
  .er-nav-chip { border:1px solid #C8A46B; border-radius:2px; padding:10px 14px; color:#fff; background:transparent; cursor:pointer; letter-spacing:0.14em; text-transform:uppercase; font-size:12px; }
  .er-nav-b2b-mobile { display:none; font-size:11px; letter-spacing:0.12em; color:#C8A46B; text-decoration:none; text-transform:uppercase; font-weight:600; border:1px solid rgba(200,164,107,0.4); padding:7px 12px; border-radius:2px; }
  @media (max-width:700px) { .er-nav-b2b-mobile { display:flex; align-items:center; min-height:44px; } }
  .er-lang-toggle { display:flex; border:1px solid rgba(200,164,107,0.45); border-radius:2px; overflow:hidden; flex-shrink:0; }
  /* min-height 44px: mínimo recomendado para un objetivo de toque. */
  .er-lang-btn { padding:7px 11px; min-height:44px; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; border:none; background:transparent; color:#BFC3C8; cursor:pointer; font-family:var(--font-barlow),sans-serif; transition:all 0.2s; }
  .er-lang-btn.active { background:#C8A46B; color:#0A0A0A; }
  .er-lang-btn:hover:not(.active) { color:#fff; }
  .er-hero-inner { position:relative; z-index:1; max-width:1180px; width:100%; margin:0 auto; padding:42px 28px 48px; display:grid; grid-template-columns:minmax(0, 1fr) 440px; gap:48px; align-items:start; }
  .er-kicker { color:#C8A46B; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin-bottom:18px; }
  .er-hero-title { font-family:var(--font-cormorant),serif; font-size:clamp(54px, 7vw, 92px); font-weight:300; line-height:0.96; margin:0 0 20px; max-width:720px; color:#FFFFFF; }
  .er-hero-copy { max-width:620px; color:#BFC3C8; font-size:18px; line-height:1.7; margin:0; }
  .er-hero-actions { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:28px; }
  .er-hero-btn { display:inline-flex; min-height:46px; align-items:center; justify-content:center; border:1px solid #C8A46B; color:#fff; background:rgba(10,10,10,0.58); text-decoration:none; padding:13px 20px; font-size:12px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; }
  .er-hero-btn:hover { background:#C8A46B; color:#0A0A0A; }
  .er-hero-mail { color:#BFC3C8; border-color:rgba(200,164,107,0.58); text-transform:none; letter-spacing:0.05em; font-size:14px; }
  .er-hero-footer { margin-top:30px; color:#BFC3C8; border-left:2px solid #C8A46B; padding-left:16px; max-width:560px; font-size:15px; line-height:1.6; }
  .er-proof { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:14px; max-width:620px; margin-top:34px; }
  .er-proof-item { border-top:1px solid rgba(255,255,255,0.32); padding-top:14px; }
  .er-proof-value { font-family:var(--font-barlow-condensed),sans-serif; font-size:24px; font-weight:700; letter-spacing:0.08em; }
  .er-proof-label { color:#BFC3C8; font-size:12px; line-height:1.4; margin-top:4px; }
  .er-booking-card { background:rgba(10,10,10,0.74); color:#FFFFFF; border:1px solid rgba(200,164,107,0.45); border-radius:2px; padding:26px; box-shadow:0 28px 70px rgba(0,0,0,0.58); backdrop-filter:blur(12px); }
  .er-booking-title { font-size:23px; font-weight:600; margin:0 0 18px; letter-spacing:0; color:#FFFFFF; }
  .er-main { max-width:1180px; margin:-56px auto 0; padding:0 28px 90px; position:relative; z-index:2; }
  .er-workspace { display:grid; grid-template-columns:minmax(0, 1fr); gap:26px; }

  .er-progress { height:2px; background:rgba(255,255,255,0.14); margin-bottom:0; }
  .er-progress-fill { height:100%; background:#C8A46B; transition:width 0.4s ease; }
  .er-steps { display:flex; border:1px solid rgba(200,164,107,0.38); border-top:none; margin-bottom:24px; background:rgba(0,0,0,0.28); }
  .er-step-tab { flex:1; padding:14px 10px; text-align:center; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#BFC3C8; cursor:pointer; border:none; border-right:1px solid rgba(200,164,107,0.24); background:none; font-family:var(--font-barlow),sans-serif; font-weight:600; transition:all 0.25s; }
  .er-step-tab:last-child { border-right:none; }
  .er-step-tab.active { color:#0A0A0A; background:#C8A46B; }
  .er-step-tab:disabled { cursor:default; opacity:0.55; }
  .er-step-num { display:inline-block; width:18px; height:18px; border-radius:50%; border:1px solid currentColor; font-size:10px; line-height:18px; text-align:center; margin-right:7px; }

  .er-panel { display:none; animation:erFadeIn 0.3s ease; }
  .er-panel.active { display:block; }
  @keyframes erFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .er-service-tabs { display:flex; border:1px solid rgba(200,164,107,0.45); overflow:hidden; margin-bottom:22px; background:rgba(255,255,255,0.04); }
  .er-svc-tab { flex:1; padding:13px 10px; background:transparent; border:none; color:#BFC3C8; font-family:var(--font-barlow-condensed),sans-serif; font-size:13px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; border-right:1px solid rgba(200,164,107,0.24); transition:all 0.2s; }
  .er-svc-tab:last-child { border-right:none; }
  .er-svc-tab.active { background:#C8A46B; color:#0A0A0A; }
  .er-svc-tab:hover:not(.active) { background:rgba(200,164,107,0.12); color:#fff; }

  .er-field { margin-bottom:17px; }
  .er-label { display:block; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#BFC3C8; margin-bottom:8px; font-weight:600; }
  /* font-size 16px: por debajo de eso Safari en iOS hace zoom al enfocar el campo. */
  .er-input { width:100%; background:rgba(255,255,255,0.08); border:1px solid rgba(200,164,107,0.35); border-radius:2px; padding:14px 15px; color:#FFFFFF; font-family:var(--font-barlow),sans-serif; font-size:16px; font-weight:400; outline:none; transition:border 0.2s, box-shadow 0.2s; -webkit-appearance:none; }
  .er-input:focus { border-color:#C8A46B; box-shadow:0 0 0 1px #C8A46B; }
  .er-input::placeholder { color:#BFC3C8; opacity:0.72; }
  .er-input option { background:#0A0A0A; color:#FFFFFF; }
  select.er-input { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23C8A46B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:40px; cursor:pointer; }
  .er-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media (max-width:580px) { .er-row { grid-template-columns:1fr; } }

  .er-hours-selector { display:flex; align-items:center; gap:0; background:#fff; border:1px solid #d9d2c4; border-radius:2px; padding:10px 16px; }
  .er-hr-btn { width:32px; height:32px; border-radius:50%; border:1px solid #bdb4a5; background:transparent; color:#111; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; }
  .er-hr-btn:hover { border-color:#111; background:#f0ece3; }
  .er-hr-count { font-family:var(--font-cormorant),serif; font-size:26px; font-weight:400; width:52px; text-align:center; color:#0A0A0A; }
  .er-hr-unit { font-size:13px; color:#0A0A0A; letter-spacing:0.08em; }

  .er-service-note { font-size:12px; color:#0A0A0A; margin-top:-6px; margin-bottom:18px; line-height:1.55; background:#eee9df; border:1px solid #ded7ca; border-radius:2px; padding:12px 14px; }

  .er-section-title { color:#fff; font-family:var(--font-cormorant),serif; font-size:42px; font-weight:300; margin:42px 0 20px; }
  .er-vehicles { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:18px; margin-bottom:24px; }
  .er-vehicle { position:relative; border-radius:2px; cursor:pointer; transition:transform 0.2s, border-color 0.2s; text-align:left; overflow:hidden; border:1px solid #272727; min-height:360px; background:#090909; }
  .er-vehicle:hover { transform:translateY(-3px); border-color:#858585; }
  .er-vehicle.selected { border-color:#fff; box-shadow:0 0 0 1px #fff; }
  .er-vehicle-bg { position:absolute; inset:0; background-size:cover; background-position:center; transition:transform 0.3s ease; }
  .er-vehicle:hover .er-vehicle-bg { transform:scale(1.04); }
  .er-vehicle-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.06) 100%); }
  .er-vehicle-content { position:relative; z-index:1; padding:18px; display:flex; flex-direction:column; justify-content:flex-end; min-height:360px; }
  .er-vehicle-name { font-family:var(--font-barlow-condensed),sans-serif; font-size:22px; font-weight:700; letter-spacing:0.12em; color:#fff; margin-bottom:2px; text-transform:uppercase; }
  .er-vehicle-tag { font-size:11px; color:#ded8cd; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:8px; }
  .er-vehicle-cap { font-size:12px; color:#b4b4b4; margin-bottom:10px; }
  .er-vehicle-price { font-family:var(--font-cormorant),serif; font-size:25px; color:#fff; }
  .er-vehicle-price-label { font-size:10px; color:#a8a8a8; letter-spacing:0.1em; text-transform:uppercase; }
  .er-vehicle-check { position:absolute; top:12px; right:12px; z-index:2; width:22px; height:22px; border-radius:50%; background:#fff; display:none; align-items:center; justify-content:center; }
  .er-vehicle.selected .er-vehicle-check { display:flex; }

  .er-route-box { background:#111; border:1px solid #292929; border-radius:2px; padding:20px 24px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
  .er-route-stats { display:flex; gap:24px; }
  .er-stat-val { font-family:var(--font-cormorant),serif; font-size:30px; font-weight:400; color:#fff; line-height:1; }
  .er-stat-lbl { font-size:11px; color:#9a9a9a; letter-spacing:0.1em; text-transform:uppercase; margin-top:4px; }
  .er-zone-badge { display:inline-block; padding:5px 12px; border:1px solid #4a4a4a; border-radius:20px; font-size:11px; color:#d0d0d0; letter-spacing:0.1em; text-transform:uppercase; }

  .er-urgent-note { color:#ef4444; font-size:12px; margin:8px 0; text-align:center; }
  .er-airport-note { color:#C8A46B; font-size:12px; margin:8px 0 16px; text-align:center; }

  .er-btn-primary { width:100%; background:#0A0A0A; color:#fff; border:1px solid #C8A46B; border-radius:2px; padding:16px; font-family:var(--font-barlow),sans-serif; font-size:13px; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; cursor:pointer; transition:background 0.2s, color 0.2s; }
  .er-btn-primary:hover { background:#C8A46B; color:#0A0A0A; }
  .er-btn-primary:disabled { opacity:0.5; cursor:default; }
  .er-btn-secondary { width:100%; background:transparent; color:#d8d8d8; border:1px solid #363636; border-radius:2px; padding:13px; font-family:var(--font-barlow),sans-serif; font-size:13px; font-weight:500; letter-spacing:0.1em; cursor:pointer; transition:border 0.2s; margin-top:10px; }
  .er-btn-secondary:hover { border-color:#8a8a8a; }
  .er-booking-card .er-btn-secondary { border-color:rgba(200,164,107,0.45); }
  .er-booking-card .er-btn-secondary:hover { border-color:#C8A46B; }
  .er-btn-wa { width:100%; background:#25D366; color:#000; border:none; border-radius:2px; padding:18px; font-family:var(--font-barlow),sans-serif; font-size:14px; font-weight:700; letter-spacing:0.08em; cursor:pointer; transition:background 0.2s; display:flex; align-items:center; justify-content:center; gap:10px; text-decoration:none; }
  .er-btn-wa:hover { background:#1fb85a; }
  .er-payment-note { color:#BFC3C8; font-size:12px; line-height:1.6; margin:-8px 0 14px; text-align:center; }

  .er-alert { padding:12px 16px; border-radius:2px; font-size:13px; margin-bottom:16px; }
  .er-alert-err { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); color:#f87171; }

  .er-summary { background:#111; border:1px solid #292929; border-radius:2px; overflow:hidden; margin-bottom:24px; }
  .er-summary-row { display:flex; justify-content:space-between; align-items:flex-start; padding:13px 16px; border-bottom:1px solid #222; font-size:14px; }
  .er-summary-row:last-child { border-bottom:none; background:#191919; }
  .er-summary-key { color:#9a9a9a; flex-shrink:0; }
  .er-summary-val { color:#fff; text-align:right; max-width:65%; line-height:1.4; }
  .er-summary-total { font-family:var(--font-cormorant),serif; font-size:22px; font-weight:400; }

  .er-benefits { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:22px; margin-top:58px; }
  .er-benefit { border-top:1px solid #2e2e2e; padding-top:18px; }
  .er-benefit-title { font-weight:600; font-size:17px; margin-bottom:8px; }
  .er-benefit-copy { color:#BFC3C8; line-height:1.6; font-size:14px; }
  .er-contact-grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:20px; margin-top:42px; border-top:1px solid rgba(200,164,107,0.32); padding-top:24px; }
  .er-contact-item { border:1px solid #2e2e2e; padding:20px; background:rgba(255,255,255,0.025); }
  .er-contact-title { color:#fff; font-weight:600; font-size:17px; margin-bottom:8px; }
  .er-contact-copy { color:#BFC3C8; line-height:1.6; font-size:14px; margin-bottom:12px; }
  .er-contact-link { color:#C8A46B; font-size:14px; font-weight:600; text-decoration:none; overflow-wrap:anywhere; }
  .er-contact-link:hover { color:#fff; }

  .er-testimonials { padding:72px 40px; border-top:1px solid #1a1a1a; }
  .er-testimonials-kicker { color:#C8A46B; font-size:11px; letter-spacing:0.22em; text-transform:uppercase; margin-bottom:14px; }
  .er-testimonials-title { font-family:var(--font-cormorant),serif; font-size:clamp(28px,4vw,46px); font-weight:300; color:#fff; margin-bottom:40px; line-height:1.1; }
  .er-testimonials-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; }
  .er-testimonial-card { background:#0d0d0d; border:1px solid #2e2e2e; padding:28px 26px; display:flex; flex-direction:column; gap:16px; }
  .er-testimonial-stars { color:#C8A46B; font-size:14px; letter-spacing:3px; }
  .er-testimonial-quote { font-family:var(--font-cormorant),serif; font-size:16px; font-weight:300; color:#D8D8D8; line-height:1.7; font-style:italic; margin:0; }
  .er-testimonial-author { display:flex; align-items:center; gap:12px; margin-top:auto; }
  .er-testimonial-avatar { width:36px; height:36px; border-radius:50%; background:rgba(200,164,107,0.15); border:1px solid rgba(200,164,107,0.35); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#C8A46B; flex-shrink:0; }
  .er-testimonial-name { font-size:13px; font-weight:600; color:#fff; }
  .er-testimonial-role { font-size:11px; color:#9a9a9a; margin-top:2px; }
  @media (max-width:900px) { .er-testimonials-grid { grid-template-columns:1fr; } .er-testimonials { padding:48px 20px; } }
  .er-comfort { margin-top:34px; border:1px solid rgba(200,164,107,0.34); background:rgba(255,255,255,0.035); padding:26px; display:grid; grid-template-columns:minmax(0,0.95fr) minmax(0,1.3fr); gap:28px; align-items:start; }
  .er-hero .er-comfort { max-width:720px; margin-top:34px; background:rgba(10,10,10,0.58); backdrop-filter:blur(8px); }
  .er-comfort-title { color:#fff; font-family:var(--font-cormorant),serif; font-size:34px; line-height:1.05; font-weight:300; margin:0; }
  .er-comfort-title span { color:#C8A46B; }
  .er-comfort-list { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px 18px; margin:0; padding:0; list-style:none; }
  .er-comfort-list li { color:#BFC3C8; font-size:14px; line-height:1.45; border-top:1px solid #2e2e2e; padding-top:10px; display:flex; align-items:flex-start; gap:10px; }
  .er-comfort-icon { color:#C8A46B; width:18px; min-width:18px; text-align:center; font-size:16px; line-height:1.15; }
  .er-comfort-icon svg { display:block; width:16px; height:16px; stroke:currentColor; }
  .er-legal { text-align:center; font-size:11px; color:#9a9a9a; margin-top:16px; letter-spacing:0.05em; line-height:1.8; }

  .PhoneInput { display:flex; align-items:center; background:rgba(255,255,255,0.08); border:1px solid rgba(200,164,107,0.35); border-radius:2px; padding:0 16px; }
  .PhoneInput:focus-within { border-color:#C8A46B; box-shadow:0 0 0 1px #C8A46B; }
  .PhoneInputCountry { margin-right:10px; }
  .PhoneInputInput { flex:1; background:transparent; border:none; color:#FFFFFF; font-family:var(--font-barlow),sans-serif; font-size:16px; font-weight:400; outline:none; padding:14px 0; }

  .er-wa-fab { position:fixed; bottom:24px; right:24px; z-index:9999; width:54px; height:54px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px rgba(0,0,0,0.45); transition:opacity 0.2s, transform 0.2s, visibility 0.2s; }
  /* Un botón fijo sobre un formulario a todo el ancho siempre acaba encima de
     algún campo: el toque abría WhatsApp en lugar del selector. En móvil se
     retira mientras el cotizador está a la vista. */
  @media (max-width:700px) {
    .er-wa-fab--oculto { opacity:0; visibility:hidden; transform:scale(0.8); pointer-events:none; }
  }
  .PhoneInputInput::placeholder { color:#BFC3C8; opacity:0.72; }

  @media (max-width:980px) {
    .er-hero-inner { grid-template-columns:1fr; padding-bottom:70px; }
    .er-booking-card { max-width:560px; }
    .er-comfort { grid-template-columns:1fr; }
  }
  @media (max-width:700px) {
    .er-hero { min-height:auto; }
    .er-nav { padding:18px 18px; }
    .er-logo-img { width:138px; }
    .er-nav-links { display:none; }
    .er-hero-inner { padding:22px 18px 54px; gap:26px; }
    .er-hero-title { font-size:42px; }
    .er-hero-copy { font-size:15px; }
    .er-proof { grid-template-columns:1fr; }
    .er-main { margin:0; padding:0 18px 64px; }
    .er-booking-card { padding:20px; }
    .er-service-tabs { flex-direction:column; }
    .er-svc-tab { border-right:none; border-bottom:1px solid rgba(200,164,107,0.24); }
    .er-svc-tab:last-child { border-bottom:none; }
    .er-vehicles { grid-template-columns:1fr; }
    .er-vehicle, .er-vehicle-content { min-height:330px; }
    .er-benefits { grid-template-columns:1fr; }
    .er-contact-grid { grid-template-columns:1fr; }
    .er-comfort { padding:20px; }
    .er-comfort-list { grid-template-columns:1fr; }
  }
`;

export default function Home() {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });

  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [lang, setLang] = useState<"es" | "en">("es");
  const t = TX[lang];
  // La capacidad venía sólo en inglés y se mostraba así con la UI en español.
  const capFor = (cat: Category) =>
    lang === "es" ? tariffs[cat].capEs : tariffs[cat].cap;

  // En móvil el formulario ocupa todo el ancho, así que un botón flotante fijo
  // acaba encima de sus campos. Se oculta mientras la tarjeta está a la vista.
  const [formularioALaVista, setFormularioALaVista] = useState(false);
  useEffect(() => {
    const card = document.getElementById("quote");
    if (!card || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setFormularioALaVista(entry.isIntersecting),
      { threshold: 0.12 },
    );
    obs.observe(card);
    return () => obs.disconnect();
  }, []);

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType>("route");
  const [rentalHours, setRentalHours] = useState(3);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTime, setServiceTime] = useState("");
  const [km, setKm] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [zone, setZone] = useState<Zone>("cdmx");
  const [category, setCategory] = useState<Category>("executive");
  const [urgent, setUrgent] = useState(false);
  const [airportPickup, setAirportPickup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [alert1, setAlert1] = useState("");
  const [alert3, setAlert3] = useState("");

  const serviceHours = serviceType === "day" ? 10 : rentalHours;
  const maxAllowedKm = serviceType === "route" ? 0 : serviceHours * 20;
  const locale = lang === "es" ? "es-MX" : "en-US";

  function priceFor(cat: Category) {
    return serviceType === "route" && km === 0
      ? 0
      : calculatePrice(km, minutes, cat, zone, urgent, serviceType, rentalHours, airportPickup);
  }
  const price = priceFor(category);

  const summaryRows: Array<[string, string]> = lang === "es"
    ? [
        [t.stServiceType, serviceTypeLabelEs(serviceType, rentalHours)],
        ...(serviceType !== "route" ? [[t.stIncludedKm, `${maxAllowedKm} km`] as [string, string]] : []),
        [t.stDateTime, formatDateTime(serviceDate, serviceTime, locale)],
        [t.stPickup, origin || "—"],
        [t.stDestination, serviceType === "route" ? (destination || "—") : t.stOpenItinerary],
        [t.stVehicle, tariffs[category].name],
        serviceType === "route"
          ? [t.stDistance, `${km} km · ${minutes} min`]
          : [t.stDuration, serviceTypeLabelEs(serviceType, rentalHours)],
      ]
    : [
        [t.stServiceType, serviceTypeLabel(serviceType, rentalHours)],
        ...(serviceType !== "route" ? [[t.stIncludedKm, `${maxAllowedKm} km`] as [string, string]] : []),
        [t.stDateTime, formatDateTime(serviceDate, serviceTime, locale)],
        [t.stPickup, origin || "—"],
        [t.stDestination, serviceType === "route" ? (destination || "—") : t.stOpenItinerary],
        [t.stVehicle, tariffs[category].name],
        serviceType === "route"
          ? [t.stDistance, `${km} km · ${minutes} min`]
          : [t.stDuration, serviceTypeLabel(serviceType, rentalHours)],
      ];

  function goStep(n: number) { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function goBackToStep1() { setKm(0); setMinutes(0); setZone("cdmx"); setUrgent(false); setAirportPickup(false); goStep(1); }

  function onOriginChanged() {
    const place = originRef.current?.getPlace();
    if (place?.formatted_address) {
      setOrigin(place.formatted_address);
      setAirportPickup(isAirportAddress(place.formatted_address));
    }
  }
  function onDestinationChanged() {
    const place = destinationRef.current?.getPlace();
    if (place?.formatted_address) setDestination(place.formatted_address);
  }

  async function validateStep1() {
    if (!origin) { setAlert1(t.alertOrigin); return; }
    if (serviceType === "route" && !destination) { setAlert1(t.alertDest); return; }
    if (!serviceDate || !serviceTime) { setAlert1(t.alertDateTime); return; }
    if (serviceType === "hour" && rentalHours < 2) { setAlert1(t.alertMinHours); return; }

    const svc = new Date(`${serviceDate}T${serviceTime}`);
    const diff = (svc.getTime() - Date.now()) / 3600000;
    if (diff <= 0) { setAlert1(t.alertPast); return; }
    if (diff < 4) { setAlert1(t.alertAdvance); return; }

    setAlert1("");
    setLoading(true);
    try {
      const dest = serviceType === "route" ? destination : origin;
      const res = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination: dest }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAlert1(res.status === 429 ? t.alertTooManyReq : t.alertRouteErr);
        return;
      }

      const routeKm = Number(data.km.toFixed(1));
      const allowedKm = serviceType === "day" ? 200 : rentalHours * 20;
      if (serviceType !== "route" && routeKm > allowedKm) {
        setAlert1(t.alertKmExceeded(allowedKm, routeKm));
        return;
      }

      setKm(routeKm);
      setMinutes(Number(data.minutes));
      setZone(detectZone(data.km));
      setUrgent(isUrgent(serviceDate, serviceTime));
      goStep(2);
    } catch {
      setAlert1(t.alertConnErr);
    } finally {
      setLoading(false);
    }
  }

  function buildWhatsAppMessage() {
    return [
      "━━━━━━━━━━━━━━━━━━━━━━",
      "🚗 *ELITE ROUTE — Nueva reserva*",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "*Cliente*",
      `Nombre: ${fullName}`,
      `Tel: ${phone}`,
      "",
      "*Servicio*",
      `Tipo: ${serviceTypeLabelEs(serviceType, rentalHours)}`,
      serviceType !== "route" ? `Kilómetros incluidos: ${maxAllowedKm} km` : "",
      `Fecha: ${formatDateTime(serviceDate, serviceTime, "es-MX")}`,
      `Origen: ${origin}`,
      `Destino: ${serviceType === "route" ? destination : "Disposición libre"}`,
      "",
      "*Detalles*",
      `Vehículo: ${tariffs[category].name}`,
      serviceType === "route"
        ? `Distancia: ${km} km / ${minutes} min`
        : `Duración: ${serviceTypeLabelEs(serviceType, rentalHours)}`,
      airportPickup ? "✈️ Salida desde aeropuerto — cargo por estacionamiento y espera incluido" : "",
      "",
      `*💰 Total estimado con IVA: $${price.toLocaleString("es-MX")} MXN*`,
      "",
      "_Solicito confirmación de disponibilidad._",
      "━━━━━━━━━━━━━━━━━━━━━━",
    ].filter(Boolean).join("\n");
  }

  function handleWhatsApp(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (!fullName.trim()) { setAlert3(t.alertName); return; }
    if (!phone) { setAlert3(t.alertPhone); return; }
    if (!isValidPhoneNumber(phone)) { setAlert3(t.alertPhoneInvalid); return; }
    if (price === 0) { setAlert3(t.alertPriceErr); return; }
    setAlert3("");
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`,
      "_blank", "noopener,noreferrer"
    );
  }

  async function handleCheckout() {
    if (!fullName.trim()) { setAlert3(t.alertName); return; }
    if (!phone) { setAlert3(t.alertPhone); return; }
    if (!isValidPhoneNumber(phone)) { setAlert3(t.alertPhoneInvalid); return; }
    if (price === 0) { setAlert3(t.alertPriceErr); return; }

    setAlert3("");
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType, rentalHours, origin, destination, serviceDate, serviceTime,
          km, minutes, zone, category, fullName, phone, airportPickup,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setAlert3(data.error || t.alertCheckoutErr);
        return;
      }
      window.location.href = data.url;
    } catch {
      setAlert3(t.alertConnErr);
    } finally {
      setPaymentLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="er-root">
        <div className="er-shell">
          <section className="er-hero">
            <nav className="er-nav" aria-label="Elite Route">
              <img className="er-logo-img" src="/elite-route-logo.jpg" alt="Elite Route" />
              <div className="er-nav-right">
                <a href="/b2b" className="er-nav-b2b-mobile">Corporativo</a>
                <div className="er-nav-links">
                  <button type="button" style={{background:"none",border:"none",padding:0,color:"#BFC3C8",textDecoration:"none",letterSpacing:"0.14em",textTransform:"uppercase",fontSize:"12px",transition:"color 0.2s",fontFamily:"inherit",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px"}}
                    onClick={() => { setServiceType("hour"); setStep(1); document.getElementById("quote")?.scrollIntoView({behavior:"smooth"}); }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {t.services}
                  </button>
                  <button type="button" style={{background:"none",border:"none",padding:0,color:"#BFC3C8",textDecoration:"none",letterSpacing:"0.14em",textTransform:"uppercase",fontSize:"12px",transition:"color 0.2s",fontFamily:"inherit",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px"}}
                    onClick={() => { setServiceType("route"); setStep(1); document.getElementById("quote")?.scrollIntoView({behavior:"smooth"}); }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                    {t.airports}
                  </button>
                  <a href="/b2b" style={{color:"#BFC3C8",textDecoration:"none",letterSpacing:"0.14em",textTransform:"uppercase",fontSize:"12px",transition:"color 0.2s"}}>{t.corporate}</a>
                  <a href="#contacto" style={{color:"#BFC3C8",textDecoration:"none",letterSpacing:"0.14em",textTransform:"uppercase",fontSize:"12px",transition:"color 0.2s"}}>{t.contact}</a>
                  <button type="button" className="er-nav-chip" style={{fontFamily:"inherit",cursor:"pointer"}}
                    onClick={() => { setStep(1); document.getElementById("quote")?.scrollIntoView({behavior:"smooth"}); }}>
                    {t.reserveNow}
                  </button>
                </div>
                <div className="er-lang-toggle" aria-label="Idioma / Language">
                  <button type="button" className={`er-lang-btn${lang === "es" ? " active" : ""}`} onClick={() => setLang("es")}>ES</button>
                  <button type="button" className={`er-lang-btn${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>EN</button>
                </div>
              </div>
            </nav>

            <div className="er-hero-inner">
              <div>
                <div className="er-kicker">{t.kicker}</div>
                <h1 className="er-hero-title">{t.heroTitle}</h1>
                <p className="er-hero-copy">{t.heroCopy}</p>
                <div className="er-hero-actions">
                  <a className="er-hero-btn" href="#quote">{t.heroBtnReserve}</a>
                  <a className="er-hero-btn er-hero-mail" href="mailto:business@eliteroute.mx">
                    business@eliteroute.mx
                  </a>
                </div>
                <section className="er-comfort" aria-label="Comfort amenities">
                  <h2 className="er-comfort-title">
                    {t.comfortTitleA}<span>{t.comfortTitleB}</span>{t.comfortTitleC}
                  </h2>
                  <ul className="er-comfort-list">
                    <li>
                      <span className="er-comfort-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
                          <path d="M9 2h6" />
                          <path d="M10 2v4l-2 3v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9l-2-3V2" />
                          <path d="M8 13h8" />
                          <path d="M8 18h8" />
                        </svg>
                      </span>
                      {t.water}
                    </li>
                    <li><span className="er-comfort-icon">⚡</span>{t.chargers}</li>
                    <li><span className="er-comfort-icon">♪</span>{t.music}</li>
                    <li><span className="er-comfort-icon">❄</span>{t.ac}</li>
                    <li><span className="er-comfort-icon">✦</span>{t.chauffeur}</li>
                  </ul>
                </section>
              </div>

              <div className="er-booking-card" id="quote">
                <h2 className="er-booking-title">{t.getQuote}</h2>

                <div className="er-progress">
                  <div className="er-progress-fill" style={{ width:`${(step/3)*100}%` }}/>
                </div>

                <div className="er-steps">
                  {([[t.stepRoute,"1"],[t.stepVehicle,"2"],[t.stepConfirm,"3"]] as [string,string][]).map(([label,n]) => {
                    const num = Number(n);
                    return (
                      <button key={n} className={`er-step-tab${step===num?" active":""}`}
                        onClick={() => { if(num===1&&step>1) goBackToStep1(); else if(num<step) goStep(num); }}
                        disabled={num>step} type="button">
                        <span className="er-step-num">{n}</span>{label}
                      </button>
                    );
                  })}
                </div>

          {/* ── PASO 1 ── */}
          <div className={`er-panel${step===1?" active":""}`}>

            <div className="er-service-tabs">
              {([
                ["route", t.transfer,  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"],
                ["hour",  t.hourly, "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm1-10V7h-2v6l4.28 2.54.72-1.21-3-1.79z"],
                ["day",   t.fullDay,   "M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 18H5V8h14v13zM7 10h5v5H7z"],
              ] as const).map(([val, label, d]) => (
                <button key={val} type="button"
                  className={`er-svc-tab${serviceType===val?" active":""}`}
                  onClick={() => { setServiceType(val as ServiceType); if(val==="hour") setRentalHours(3); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={d}/>
                  </svg>
                  {label}
                </button>
              ))}
            </div>

            {serviceType !== "route" && (
              <div className="er-service-note">
                {serviceType === "hour" ? t.hourlyNote(rentalHours) : t.dayNote}
                <br/>
                <span style={{color:"#0A0A0A"}}>
                  {serviceType === "hour" ? t.hourlyNote2 : t.dayNote2}
                </span>
              </div>
            )}

            {serviceType === "hour" && (
              <div className="er-field">
                <label className="er-label" id="rental-hours-label">{t.duration}</label>
                <div className="er-hours-selector" role="group" aria-labelledby="rental-hours-label">
                  <button type="button" className="er-hr-btn" aria-label={t.decreaseHours}
                    onClick={() => setRentalHours(h => Math.max(2, h-1))}>−</button>
                  <div className="er-hr-count" role="status" aria-atomic="true">{rentalHours}</div>
                  <div className="er-hr-unit">{t.hours}</div>
                  <button type="button" className="er-hr-btn" aria-label={t.increaseHours}
                    onClick={() => setRentalHours(h => Math.min(24, h+1))}>+</button>
                </div>
              </div>
            )}

            <div className="er-field">
              <label className="er-label" htmlFor="origin-input">{t.pickup}</label>
              <MaybeAutocomplete
                isLoaded={isLoaded}
                onLoad={(a) => { originRef.current = a; }}
                onPlaceChanged={onOriginChanged}>
                <input id="origin-input" className="er-input" placeholder={t.pickupPlaceholder}
                  value={origin} onChange={(e) => setOrigin(e.target.value)}/>
              </MaybeAutocomplete>
            </div>

            {serviceType === "route" && (
              <div className="er-field">
                <label className="er-label" htmlFor="destination-input">{t.destination}</label>
                <MaybeAutocomplete
                  isLoaded={isLoaded}
                  onLoad={(a) => { destinationRef.current = a; }}
                  onPlaceChanged={onDestinationChanged}>
                  <input id="destination-input" className="er-input" placeholder={t.destinationPlaceholder}
                    value={destination} onChange={(e) => setDestination(e.target.value)}/>
                </MaybeAutocomplete>
              </div>
            )}

            <div className="er-row">
              <div className="er-field">
                <label className="er-label" htmlFor="service-date-input">{t.date}</label>
                <input id="service-date-input" className="er-input" type="date" min={getMinDate()}
                  value={serviceDate} onChange={(e) => setServiceDate(e.target.value)}/>
              </div>
              <div className="er-field">
                <label className="er-label" htmlFor="service-time-input">{t.time}</label>
                <input id="service-time-input" className="er-input" type="time"
                  value={serviceTime} onChange={(e) => setServiceTime(e.target.value)}/>
              </div>
            </div>

            <div className="er-field">
              <label className="er-label" htmlFor="vehicle-category-select">{t.vehicleCategory}</label>
              <select
                id="vehicle-category-select"
                className="er-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {(Object.keys(tariffs) as Category[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {tariffs[cat].name} · {capFor(cat)}
                  </option>
                ))}
              </select>
            </div>

            {alert1 && <div className="er-alert er-alert-err">{alert1}</div>}

            <button className="er-btn-primary" onClick={validateStep1} disabled={loading} type="button">
              {loading ? t.calculating : t.getQuoteBtn}
            </button>
          </div>

          {/* ── PASO 2 ── */}
          <div className={`er-panel${step===2?" active":""}`}>
            <div className="er-route-box">
              <div className="er-route-stats">
                <div>
                  <div className="er-stat-val">
                    {serviceType === "route" ? km : (serviceType === "hour" ? maxAllowedKm : 200)}
                  </div>
                  <div className="er-stat-lbl">{serviceType === "route" ? t.kilometers : t.includedKm}</div>
                </div>
                {serviceType === "route" && (
                  <div>
                    <div className="er-stat-val">{minutes}</div>
                    <div className="er-stat-lbl">{t.estimatedMin}</div>
                  </div>
                )}
              </div>
            </div>


            <div className="er-vehicles">
              {(Object.keys(tariffs) as Category[]).map((cat) => {
                const p = priceFor(cat);
                return (
                  <button key={cat} type="button"
                    className={`er-vehicle${category===cat?" selected":""}`}
                    onClick={() => setCategory(cat)}>
                    <div className="er-vehicle-bg"
                      style={{ backgroundImage:`url(${vehicleImages[cat]})` }}/>
                    <div className="er-vehicle-overlay"/>
                    <div className="er-vehicle-content">
                      <div className="er-vehicle-name">{tariffs[cat].name}</div>
                      <div className="er-vehicle-tag">{tariffs[cat].tag}</div>
                      <div className="er-vehicle-cap">{capFor(cat)}</div>
                      <div className="er-vehicle-price">
                        ${p.toLocaleString("es-MX")} <span style={{fontSize:"14px",color:"#b8b8b8"}}>MXN</span>
                      </div>
                      <div className="er-vehicle-price-label">{t.vatIncluded}</div>
                    </div>
                    <div className="er-vehicle-check">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>

            <button className="er-btn-primary" onClick={() => goStep(3)} type="button">
              {t.continue}
            </button>
            <button className="er-btn-secondary" onClick={goBackToStep1} type="button">
              {t.modifyRoute}
            </button>
          </div>

          {/* ── PASO 3 ── */}
          <div className={`er-panel${step===3?" active":""}`}>
            <div className="er-row" style={{ marginBottom:20 }}>
              <div className="er-field">
                <label className="er-label" htmlFor="full-name-input">{t.fullName}</label>
                <input id="full-name-input" className="er-input" placeholder={t.fullNamePlaceholder}
                  value={fullName} onChange={(e) => setFullName(e.target.value)}/>
              </div>
              <div className="er-field">
                <label className="er-label" htmlFor="phone-input">{t.phone}</label>
                {/* flagUrl local: por defecto el componente pide las banderas a
                    purecatamphetamine.github.io, un tercero del que no
                    queremos depender en cada carga. */}
                <PhoneInput international defaultCountry="MX"
                  numberInputProps={{ id: "phone-input" }}
                  flagUrl="/flags/{XX}.svg"
                  value={phone} onChange={setPhone} placeholder="+52 55 1234 5678"/>
              </div>
            </div>

            <div className="er-summary">
              {summaryRows.map(([k,v]) => (
                <div className="er-summary-row" key={k}>
                  <span className="er-summary-key">{k}</span>
                  <span className="er-summary-val">{v}</span>
                </div>
              ))}
              <div className="er-summary-row">
                <span className="er-summary-key" style={{ color:"#b8b8b8", fontWeight:500 }}>{t.totalVat}</span>
                <span className="er-summary-val er-summary-total">${price.toLocaleString("es-MX")} MXN</span>
              </div>
            </div>

            {alert3 && <div className="er-alert er-alert-err">{alert3}</div>}

            <p className="er-payment-note">{t.paymentNote}</p>

            <button className="er-btn-primary" onClick={handleCheckout} disabled={paymentLoading} type="button">
              {paymentLoading ? t.payLoading : t.payBtn}
            </button>


            <div className="er-legal">
              {t.legal}<br/>
              {t.legal2}
            </div>

            <button className="er-btn-secondary" style={{ marginTop:16 }} onClick={() => goStep(2)} type="button">
              {t.modifyVehicle}
            </button>
          </div>
              </div>
            </div>
          </section>

          <main className="er-main">
            <section className="er-benefits" aria-label="Elite Route benefits">
                <div className="er-benefit">
                  <div className="er-benefit-title">{t.benefit1Title}</div>
                  <div className="er-benefit-copy">{t.benefit1Copy}</div>
                </div>
                <div className="er-benefit">
                  <div className="er-benefit-title">{t.benefit2Title}</div>
                  <div className="er-benefit-copy">{t.benefit2Copy}</div>
                </div>
                <div className="er-benefit">
                  <div className="er-benefit-title">{t.benefit3Title}</div>
                  <div className="er-benefit-copy">{t.benefit3Copy}</div>
                </div>
                <div className="er-benefit">
                  <div className="er-benefit-title">{t.benefit4Title}</div>
                  <div className="er-benefit-copy">{t.benefit4Copy}</div>
                </div>
              </section>

              <section id="contacto" className="er-contact-grid" aria-label="Elite Route contact emails">
                <div className="er-contact-item">
                  <a href="/b2b" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="er-contact-title">{t.b2bTitle}</div>
                  </a>
                  <div className="er-contact-copy">{t.b2bCopy}</div>
                  <a className="er-contact-link" href="mailto:business@eliteroute.mx">
                    business@eliteroute.mx
                  </a>
                  <a href="/b2b/cotizar" style={{ display:"inline-block", marginTop:"12px", fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A46B", textDecoration:"none", borderBottom:"1px solid rgba(200,164,107,0.35)", paddingBottom:"2px" }}>
                    Cotizar servicios corporativos →
                  </a>
                </div>
                <div className="er-contact-item">
                  <div className="er-contact-title">{t.accTitle}</div>
                  <div className="er-contact-copy">{t.accCopy}</div>
                  <a className="er-contact-link" href="mailto:contabilidad@eliteroute.mx">
                    contabilidad@eliteroute.mx
                  </a>
                </div>
              </section>
          </main>

          {/* TESTIMONIOS */}
          <section className="er-testimonials" aria-label="Testimonios de clientes">
            <p className="er-testimonials-kicker">Clientes Elite Route</p>
            <h2 className="er-testimonials-title">Lo que dicen quienes viajan con nosotros</h2>
            <div className="er-testimonials-grid">
              {([
                {
                  quote: "Usé el servicio para recoger a un cliente de AICM. El chofer llegó puntual, el vehículo impecable. Mi cliente quedó muy bien impresionado. Lo seguiré usando para visitas corporativas.",
                  name: "Sofía M.",
                  role: "Gerente de Cuentas · Sector Tecnológico",
                  initial: "S",
                },
                {
                  quote: "Contraté el servicio por horas para una jornada de reuniones en Santa Fe. El chofer esperó pacientemente entre cita y cita. Precio fijo, sin sorpresas al final. Exactamente lo que necesitaba.",
                  name: "Ricardo V.",
                  role: "Director de Operaciones · Consultoría",
                  initial: "R",
                },
                {
                  quote: "Coordiné 8 traslados corporativos en una sola semana para un evento. Todo puntual, todos los choferes profesionales. La factura llegó sin problemas. Definitivamente mi proveedor de transporte ejecutivo.",
                  name: "Alejandra T.",
                  role: "Coordinadora de Eventos Corporativos",
                  initial: "A",
                },
                {
                  quote: "Thank you for picking me up right on time at the airport. The driver was waiting for me inside the terminal with a sign — exactly what you expect from a professional service. Highly recommended.",
                  name: "James K.",
                  role: "Business Traveler · New York",
                  initial: "J",
                },
                {
                  quote: "Thank you so much for picking up my wife and family at the airport. Having the driver waiting for them inside gave us great peace of mind. They felt safe and well taken care of from the moment they landed.",
                  name: "Michael R.",
                  role: "Corporate Client · Houston",
                  initial: "M",
                },
              ] as const).map((t) => (
                <div className="er-testimonial-card" key={t.name}>
                  <div className="er-testimonial-stars">★★★★★</div>
                  <blockquote className="er-testimonial-quote">"{t.quote}"</blockquote>
                  <div className="er-testimonial-author">
                    <div className="er-testimonial-avatar">{t.initial}</div>
                    <div>
                      <div className="er-testimonial-name">{t.name}</div>
                      <div className="er-testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{borderTop:"1px solid #1e1e1e",padding:"28px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px",fontSize:"11px",color:"#555",letterSpacing:"0.06em"}}>
            <span>Elite Route CDMX · business@eliteroute.mx</span>
            <div style={{display:"flex",gap:"24px",flexWrap:"wrap"}}>
              <a href="/tarifas" style={{color:"#C8A46B",textDecoration:"none"}}>Tarifas</a>
              <a href="/b2b" style={{color:"#C8A46B",textDecoration:"none"}}>Corporativo</a>
              <a href="mailto:contabilidad@eliteroute.mx" style={{color:"#9a9a9a",textDecoration:"none"}}>contabilidad@eliteroute.mx</a>
            </div>
          </footer>
        </div>
      </div>

      {/* WHATSAPP FLOTANTE */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C+quisiera+cotizar+un+traslado.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className={`er-wa-fab${formularioALaVista ? " er-wa-fab--oculto" : ""}`}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.118 1.528 5.845L.057 23.486a.5.5 0 0 0 .614.614l5.588-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.513-5.187-1.408l-.37-.222-3.844 1.007 1.03-3.76-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
    </>
  );
}
