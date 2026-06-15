"use client";

import { useRef, useState, type MouseEvent } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  calculatePrice,
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

const vehicleImages: Record<string, string> = {
  sedan: "/sedan.jpg",
  executive: "/executive.jpg",
  minivan: "/minivan.jpg",
  suv: "/high-suv.jpg",
};

function detectZone(km: number): Zone {
  if (km > 120) return "foraneo";
  if (km > 50) return "semi_foraneo";
  return "cdmx";
}

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
    services: "Services", airports: "Airports", corporate: "Corporate", contact: "Contact", reserveNow: "Reserve Now",
    kicker: "EliteRoute Mexico City",
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
    pickup: "Pickup Location", pickupPlaceholder: "Hotel, airport, address...",
    destination: "Destination", destinationPlaceholder: "Where are we taking you?",
    date: "Date", time: "Time", vehicleCategory: "Vehicle Category",
    getQuoteBtn: "Get Quote →", calculating: "Calculating route...",
    continue: "Continue →", modifyRoute: "← Modify route", modifyVehicle: "← Modify vehicle",
    kilometers: "Kilometers", includedKm: "Included km", estimatedMin: "Estimated min.",
    urgentNote: "⚠️ Short-notice booking — 15% availability fee applies",
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
    alertAdvance: "At least 2 hours of advance notice are required.",
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
    services: "Servicios", airports: "Aeropuertos", corporate: "Corporativo", contact: "Contacto", reserveNow: "Reservar",
    kicker: "EliteRoute Ciudad de México",
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
    pickup: "Lugar de recogida", pickupPlaceholder: "Hotel, aeropuerto, dirección...",
    destination: "Destino", destinationPlaceholder: "¿A dónde te llevamos?",
    date: "Fecha", time: "Hora", vehicleCategory: "Categoría de vehículo",
    getQuoteBtn: "Obtener cotización →", calculating: "Calculando ruta...",
    continue: "Continuar →", modifyRoute: "← Modificar ruta", modifyVehicle: "← Modificar vehículo",
    kilometers: "Kilómetros", includedKm: "Km incluidos", estimatedMin: "Min. estimados",
    urgentNote: "⚠️ Reserva próxima — se aplica cargo de disponibilidad del 15%",
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
    alertAdvance: "Se requieren al menos 2 horas de anticipación.",
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
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap');

  * { box-sizing:border-box; }
  .er-root { background:#0A0A0A; color:#fff; min-height:100vh; font-family:'Barlow',sans-serif; font-weight:300; }
  .er-shell { min-height:100vh; }
  .er-hero { position:relative; min-height:720px; background-image:linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.76) 48%, rgba(0,0,0,0.68) 100%), url('/high-suv.jpg'); background-size:cover; background-position:center 48%; display:flex; flex-direction:column; }
  .er-hero::after { content:""; position:absolute; inset:auto 0 0; height:190px; background:linear-gradient(180deg, transparent, #0A0A0A); pointer-events:none; }
  .er-nav { position:relative; z-index:2; max-width:1180px; width:100%; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; }
  .er-logo-img { width:176px; height:auto; display:block; filter:drop-shadow(0 18px 32px rgba(0,0,0,0.65)); }
  .er-nav-right { display:flex; align-items:center; gap:20px; }
  .er-nav-links { display:flex; gap:28px; align-items:center; color:#BFC3C8; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; }
  .er-nav-chip { border:1px solid #C8A46B; border-radius:2px; padding:10px 14px; color:#fff; }
  .er-lang-toggle { display:flex; border:1px solid rgba(200,164,107,0.45); border-radius:2px; overflow:hidden; flex-shrink:0; }
  .er-lang-btn { padding:7px 11px; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; border:none; background:transparent; color:#BFC3C8; cursor:pointer; font-family:'Barlow',sans-serif; transition:all 0.2s; }
  .er-lang-btn.active { background:#C8A46B; color:#0A0A0A; }
  .er-lang-btn:hover:not(.active) { color:#fff; }
  .er-hero-inner { position:relative; z-index:1; max-width:1180px; width:100%; margin:0 auto; padding:42px 28px 48px; display:grid; grid-template-columns:minmax(0, 1fr) 440px; gap:48px; align-items:start; }
  .er-kicker { color:#C8A46B; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin-bottom:18px; }
  .er-hero-title { font-family:'Cormorant Garamond',serif; font-size:clamp(54px, 7vw, 92px); font-weight:300; line-height:0.96; margin:0 0 20px; max-width:720px; color:#FFFFFF; }
  .er-hero-copy { max-width:620px; color:#BFC3C8; font-size:18px; line-height:1.7; margin:0; }
  .er-hero-actions { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:28px; }
  .er-hero-btn { display:inline-flex; min-height:46px; align-items:center; justify-content:center; border:1px solid #C8A46B; color:#fff; background:rgba(10,10,10,0.58); text-decoration:none; padding:13px 20px; font-size:12px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; }
  .er-hero-btn:hover { background:#C8A46B; color:#0A0A0A; }
  .er-hero-mail { color:#BFC3C8; border-color:rgba(200,164,107,0.58); text-transform:none; letter-spacing:0.05em; font-size:14px; }
  .er-hero-footer { margin-top:30px; color:#BFC3C8; border-left:2px solid #C8A46B; padding-left:16px; max-width:560px; font-size:15px; line-height:1.6; }
  .er-proof { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:14px; max-width:620px; margin-top:34px; }
  .er-proof-item { border-top:1px solid rgba(255,255,255,0.32); padding-top:14px; }
  .er-proof-value { font-family:'Barlow Condensed',sans-serif; font-size:24px; font-weight:700; letter-spacing:0.08em; }
  .er-proof-label { color:#BFC3C8; font-size:12px; line-height:1.4; margin-top:4px; }
  .er-booking-card { background:rgba(10,10,10,0.74); color:#FFFFFF; border:1px solid rgba(200,164,107,0.45); border-radius:2px; padding:26px; box-shadow:0 28px 70px rgba(0,0,0,0.58); backdrop-filter:blur(12px); }
  .er-booking-title { font-size:23px; font-weight:600; margin:0 0 18px; letter-spacing:0; color:#FFFFFF; }
  .er-main { max-width:1180px; margin:-56px auto 0; padding:0 28px 90px; position:relative; z-index:2; }
  .er-workspace { display:grid; grid-template-columns:minmax(0, 1fr); gap:26px; }

  .er-progress { height:2px; background:rgba(255,255,255,0.14); margin-bottom:0; }
  .er-progress-fill { height:100%; background:#C8A46B; transition:width 0.4s ease; }
  .er-steps { display:flex; border:1px solid rgba(200,164,107,0.38); border-top:none; margin-bottom:24px; background:rgba(0,0,0,0.28); }
  .er-step-tab { flex:1; padding:14px 10px; text-align:center; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#BFC3C8; cursor:pointer; border:none; border-right:1px solid rgba(200,164,107,0.24); background:none; font-family:'Barlow',sans-serif; font-weight:600; transition:all 0.25s; }
  .er-step-tab:last-child { border-right:none; }
  .er-step-tab.active { color:#0A0A0A; background:#C8A46B; }
  .er-step-tab:disabled { cursor:default; opacity:0.55; }
  .er-step-num { display:inline-block; width:18px; height:18px; border-radius:50%; border:1px solid currentColor; font-size:10px; line-height:18px; text-align:center; margin-right:7px; }

  .er-panel { display:none; animation:erFadeIn 0.3s ease; }
  .er-panel.active { display:block; }
  @keyframes erFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .er-service-tabs { display:flex; border:1px solid rgba(200,164,107,0.45); overflow:hidden; margin-bottom:22px; background:rgba(255,255,255,0.04); }
  .er-svc-tab { flex:1; padding:13px 10px; background:transparent; border:none; color:#BFC3C8; font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; border-right:1px solid rgba(200,164,107,0.24); transition:all 0.2s; }
  .er-svc-tab:last-child { border-right:none; }
  .er-svc-tab.active { background:#C8A46B; color:#0A0A0A; }
  .er-svc-tab:hover:not(.active) { background:rgba(200,164,107,0.12); color:#fff; }

  .er-field { margin-bottom:17px; }
  .er-label { display:block; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#BFC3C8; margin-bottom:8px; font-weight:600; }
  .er-input { width:100%; background:rgba(255,255,255,0.08); border:1px solid rgba(200,164,107,0.35); border-radius:2px; padding:14px 15px; color:#FFFFFF; font-family:'Barlow',sans-serif; font-size:15px; font-weight:400; outline:none; transition:border 0.2s, box-shadow 0.2s; -webkit-appearance:none; }
  .er-input:focus { border-color:#C8A46B; box-shadow:0 0 0 1px #C8A46B; }
  .er-input::placeholder { color:#BFC3C8; opacity:0.72; }
  .er-input option { background:#0A0A0A; color:#FFFFFF; }
  select.er-input { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23C8A46B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:40px; cursor:pointer; }
  .er-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media (max-width:580px) { .er-row { grid-template-columns:1fr; } }

  .er-hours-selector { display:flex; align-items:center; gap:0; background:#fff; border:1px solid #d9d2c4; border-radius:2px; padding:10px 16px; }
  .er-hr-btn { width:32px; height:32px; border-radius:50%; border:1px solid #bdb4a5; background:transparent; color:#111; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; }
  .er-hr-btn:hover { border-color:#111; background:#f0ece3; }
  .er-hr-count { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:400; width:52px; text-align:center; color:#0A0A0A; }
  .er-hr-unit { font-size:13px; color:#0A0A0A; letter-spacing:0.08em; }

  .er-service-note { font-size:12px; color:#0A0A0A; margin-top:-6px; margin-bottom:18px; line-height:1.55; background:#eee9df; border:1px solid #ded7ca; border-radius:2px; padding:12px 14px; }

  .er-section-title { color:#fff; font-family:'Cormorant Garamond',serif; font-size:42px; font-weight:300; margin:42px 0 20px; }
  .er-vehicles { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:18px; margin-bottom:24px; }
  .er-vehicle { position:relative; border-radius:2px; cursor:pointer; transition:transform 0.2s, border-color 0.2s; text-align:left; overflow:hidden; border:1px solid #272727; min-height:360px; background:#090909; }
  .er-vehicle:hover { transform:translateY(-3px); border-color:#858585; }
  .er-vehicle.selected { border-color:#fff; box-shadow:0 0 0 1px #fff; }
  .er-vehicle-bg { position:absolute; inset:0; background-size:cover; background-position:center; transition:transform 0.3s ease; }
  .er-vehicle:hover .er-vehicle-bg { transform:scale(1.04); }
  .er-vehicle-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.06) 100%); }
  .er-vehicle-content { position:relative; z-index:1; padding:18px; display:flex; flex-direction:column; justify-content:flex-end; min-height:360px; }
  .er-vehicle-name { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700; letter-spacing:0.12em; color:#fff; margin-bottom:2px; text-transform:uppercase; }
  .er-vehicle-tag { font-size:11px; color:#ded8cd; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:8px; }
  .er-vehicle-cap { font-size:12px; color:#b4b4b4; margin-bottom:10px; }
  .er-vehicle-price { font-family:'Cormorant Garamond',serif; font-size:25px; color:#fff; }
  .er-vehicle-price-label { font-size:10px; color:#a8a8a8; letter-spacing:0.1em; text-transform:uppercase; }
  .er-vehicle-check { position:absolute; top:12px; right:12px; z-index:2; width:22px; height:22px; border-radius:50%; background:#fff; display:none; align-items:center; justify-content:center; }
  .er-vehicle.selected .er-vehicle-check { display:flex; }

  .er-route-box { background:#111; border:1px solid #292929; border-radius:2px; padding:20px 24px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
  .er-route-stats { display:flex; gap:24px; }
  .er-stat-val { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:400; color:#fff; line-height:1; }
  .er-stat-lbl { font-size:11px; color:#9a9a9a; letter-spacing:0.1em; text-transform:uppercase; margin-top:4px; }
  .er-zone-badge { display:inline-block; padding:5px 12px; border:1px solid #4a4a4a; border-radius:20px; font-size:11px; color:#d0d0d0; letter-spacing:0.1em; text-transform:uppercase; }

  .er-urgent-note { color:#ef4444; font-size:12px; margin:8px 0; text-align:center; }

  .er-btn-primary { width:100%; background:#0A0A0A; color:#fff; border:1px solid #C8A46B; border-radius:2px; padding:16px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; cursor:pointer; transition:background 0.2s, color 0.2s; }
  .er-btn-primary:hover { background:#C8A46B; color:#0A0A0A; }
  .er-btn-primary:disabled { opacity:0.5; cursor:default; }
  .er-btn-secondary { width:100%; background:transparent; color:#d8d8d8; border:1px solid #363636; border-radius:2px; padding:13px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:500; letter-spacing:0.1em; cursor:pointer; transition:border 0.2s; margin-top:10px; }
  .er-btn-secondary:hover { border-color:#8a8a8a; }
  .er-booking-card .er-btn-secondary { color:#5f5951; border-color:#d9d2c4; }
  .er-booking-card .er-btn-secondary:hover { border-color:#111; }
  .er-btn-wa { width:100%; background:#25D366; color:#000; border:none; border-radius:2px; padding:18px; font-family:'Barlow',sans-serif; font-size:14px; font-weight:700; letter-spacing:0.08em; cursor:pointer; transition:background 0.2s; display:flex; align-items:center; justify-content:center; gap:10px; text-decoration:none; }
  .er-btn-wa:hover { background:#1fb85a; }
  .er-payment-note { color:#BFC3C8; font-size:12px; line-height:1.6; margin:-8px 0 14px; text-align:center; }

  .er-alert { padding:12px 16px; border-radius:2px; font-size:13px; margin-bottom:16px; }
  .er-alert-err { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); color:#f87171; }

  .er-summary { background:#111; border:1px solid #292929; border-radius:2px; overflow:hidden; margin-bottom:24px; }
  .er-summary-row { display:flex; justify-content:space-between; align-items:flex-start; padding:13px 16px; border-bottom:1px solid #222; font-size:14px; }
  .er-summary-row:last-child { border-bottom:none; background:#191919; }
  .er-summary-key { color:#9a9a9a; flex-shrink:0; }
  .er-summary-val { color:#fff; text-align:right; max-width:65%; line-height:1.4; }
  .er-summary-total { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; }

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
  .er-comfort { margin-top:34px; border:1px solid rgba(200,164,107,0.34); background:rgba(255,255,255,0.035); padding:26px; display:grid; grid-template-columns:minmax(0,0.95fr) minmax(0,1.3fr); gap:28px; align-items:start; }
  .er-hero .er-comfort { max-width:720px; margin-top:34px; background:rgba(10,10,10,0.58); backdrop-filter:blur(8px); }
  .er-comfort-title { color:#fff; font-family:'Cormorant Garamond',serif; font-size:34px; line-height:1.05; font-weight:300; margin:0; }
  .er-comfort-title span { color:#C8A46B; }
  .er-comfort-list { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px 18px; margin:0; padding:0; list-style:none; }
  .er-comfort-list li { color:#BFC3C8; font-size:14px; line-height:1.45; border-top:1px solid #2e2e2e; padding-top:10px; display:flex; align-items:flex-start; gap:10px; }
  .er-comfort-icon { color:#C8A46B; width:18px; min-width:18px; text-align:center; font-size:16px; line-height:1.15; }
  .er-comfort-icon svg { display:block; width:16px; height:16px; stroke:currentColor; }
  .er-legal { text-align:center; font-size:11px; color:#666; margin-top:16px; letter-spacing:0.05em; line-height:1.8; }

  .PhoneInput { display:flex; align-items:center; background:rgba(255,255,255,0.08); border:1px solid rgba(200,164,107,0.35); border-radius:2px; padding:0 16px; }
  .PhoneInput:focus-within { border-color:#C8A46B; box-shadow:0 0 0 1px #C8A46B; }
  .PhoneInputCountry { margin-right:10px; }
  .PhoneInputInput { flex:1; background:transparent; border:none; color:#FFFFFF; font-family:'Barlow',sans-serif; font-size:15px; font-weight:400; outline:none; padding:14px 0; }
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
      : calculatePrice(km, minutes, cat, zone, urgent, serviceType, rentalHours);
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
        [t.stZone, zoneLabelEs(zone)],
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
        [t.stZone, zoneLabel(zone)],
      ];

  function goStep(n: number) { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function goBackToStep1() { setKm(0); setMinutes(0); setZone("cdmx"); setUrgent(false); goStep(1); }

  function onOriginChanged() {
    const place = originRef.current?.getPlace();
    if (place?.formatted_address) setOrigin(place.formatted_address);
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
    if (diff < 2) { setAlert1(t.alertAdvance); return; }

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
      `Zona: ${zoneLabelEs(zone)}`,
      urgent ? "⚠️ Reserva próxima — cargo adicional aplicado" : "",
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
          km, minutes, zone, category, fullName, phone,
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

  if (!isLoaded) {
    return (
      <div style={{ background:"#000", color:"#444", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif", fontSize:13, letterSpacing:"0.1em" }}>
        Loading...
      </div>
    );
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
                <div className="er-nav-links">
                  <span>{t.services}</span>
                  <span>{t.airports}</span>
                  <span>{t.corporate}</span>
                  <span>{t.contact}</span>
                  <span className="er-nav-chip">{t.reserveNow}</span>
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
                <label className="er-label">{t.duration}</label>
                <div className="er-hours-selector">
                  <button type="button" className="er-hr-btn"
                    onClick={() => setRentalHours(h => Math.max(2, h-1))}>−</button>
                  <div className="er-hr-count">{rentalHours}</div>
                  <div className="er-hr-unit">{t.hours}</div>
                  <button type="button" className="er-hr-btn"
                    onClick={() => setRentalHours(h => h+1)}>+</button>
                </div>
              </div>
            )}

            <div className="er-field">
              <label className="er-label">{t.pickup}</label>
              <Autocomplete
                onLoad={(a) => { originRef.current = a; }}
                onPlaceChanged={onOriginChanged}
                options={{ componentRestrictions:{ country:"mx" }, fields:["formatted_address","geometry","name"] }}>
                <input className="er-input" placeholder={t.pickupPlaceholder}
                  value={origin} onChange={(e) => setOrigin(e.target.value)}/>
              </Autocomplete>
            </div>

            {serviceType === "route" && (
              <div className="er-field">
                <label className="er-label">{t.destination}</label>
                <Autocomplete
                  onLoad={(a) => { destinationRef.current = a; }}
                  onPlaceChanged={onDestinationChanged}
                  options={{ componentRestrictions:{ country:"mx" }, fields:["formatted_address","geometry","name"] }}>
                  <input className="er-input" placeholder={t.destinationPlaceholder}
                    value={destination} onChange={(e) => setDestination(e.target.value)}/>
                </Autocomplete>
              </div>
            )}

            <div className="er-row">
              <div className="er-field">
                <label className="er-label">{t.date}</label>
                <input className="er-input" type="date" min={getMinDate()}
                  value={serviceDate} onChange={(e) => setServiceDate(e.target.value)}/>
              </div>
              <div className="er-field">
                <label className="er-label">{t.time}</label>
                <input className="er-input" type="time"
                  value={serviceTime} onChange={(e) => setServiceTime(e.target.value)}/>
              </div>
            </div>

            <div className="er-field">
              <label className="er-label">{t.vehicleCategory}</label>
              <select
                className="er-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {(Object.keys(tariffs) as Category[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {tariffs[cat].name} · {tariffs[cat].cap}
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
              <div className="er-zone-badge">{lang === "es" ? zoneLabelEs(zone) : zoneLabel(zone)}</div>
            </div>

            {urgent && (
              <div className="er-urgent-note">{t.urgentNote}</div>
            )}

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
                      <div className="er-vehicle-cap">{tariffs[cat].cap}</div>
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
                <label className="er-label">{t.fullName}</label>
                <input className="er-input" placeholder={t.fullNamePlaceholder}
                  value={fullName} onChange={(e) => setFullName(e.target.value)}/>
              </div>
              <div className="er-field">
                <label className="er-label">{t.phone}</label>
                <PhoneInput international defaultCountry="MX"
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

            <a className="er-btn-wa" href="#" onClick={handleWhatsApp}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.942-1.42A9.953 9.953 0 0012 22c5.522 0 10-4.477 10-10S17.522 2 11.999 2zm.001 18.18c-1.64 0-3.162-.497-4.424-1.347l-.317-.188-3.287.944.944-3.22-.206-.33A8.178 8.178 0 013.82 12c0-4.515 3.665-8.18 8.18-8.18 4.516 0 8.18 3.665 8.18 8.18 0 4.516-3.664 8.18-8.18 8.18z"/>
              </svg>
              {t.whatsappBtn}
            </a>

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

              <section className="er-contact-grid" aria-label="Elite Route contact emails">
                <div className="er-contact-item">
                  <div className="er-contact-title">{t.b2bTitle}</div>
                  <div className="er-contact-copy">{t.b2bCopy}</div>
                  <a className="er-contact-link" href="mailto:business@eliteroute.mx">
                    business@eliteroute.mx
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
        </div>
      </div>
    </>
  );
}
