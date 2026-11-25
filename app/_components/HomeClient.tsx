"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import BrandMark from "./BrandMark";
import { path, type Lang } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";
import {
  GOOGLE_PLACE_URL,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  GOOGLE_WRITE_REVIEW_URL,
  REVIEWS,
  TRANSFERS_PER_YEAR,
  YEARS_OPERATING,
} from "@/lib/social-proof";
import InstallHint from "./InstallHint";
import WelcomeEn from "./WelcomeEn";
import LangToggle from "./LangToggle";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { CAPACIDAD,
  detectZone,
  isAirportAddress,
  isAirportPlace,
  serviceTypeLabel,
  serviceTypeLabelEs,
  vehicles,
  DISPLAY_ORDER,
  FEATURED,
  zoneLabel,
  zoneLabelEs,
  type Category,
  type ServiceType,
  type Zone,
} from "@/lib/vehicles";
import { HORAS_MIN, type PrecioPorCategoria, type TablasCotizador, type TablasRedondo } from "@/lib/rate-tables";
import { MIN_ADVANCE_HOURS, VUELO_MAX, esVueloValido, NOTAS_MAX } from "@/lib/booking-form";
import { identidadGa, track } from "@/lib/analytics";
import { DESPUES_DE_PAGAR } from "@/lib/booking-status";
import {
  CENTRO_CDMX,
  dentroDeZonaPorHoras,
  HORAS_DIA_COMPLETO,
  KM_POR_HORA,
  kmIncluidos,
  LEYENDA_POR_HORAS,
  REDONDO_HORAS_CORTESIA,
  REDONDO_HORAS_MAX,
  categoriaBloqueada,
  horasMinimas,
  precioConEvento,
  precioConEscalade,
  ESCALADE_PRIMA,
} from "@/lib/service-limits";

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
  // "types" y "name" son los que delatan al aeropuerto: el AICM devuelve
  // como formatted_address la dirección de la calle, sin la palabra
  // "aeropuerto" en ningún lado.
  fields: ["formatted_address", "geometry", "name", "types"],
};

/**
 * Carga el SDK de Maps una sola vez y sólo cuando hace falta. Antes entraba
 * en cada visita —305 KB entre places, main, util, common y controls, un
 * tercio del peso de la página— aunque el visitante sólo viniera a ver
 * precios y nunca tocara un campo de dirección.
 */
let mapsLoader: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (mapsLoader) return mapsLoader;
  const intento = new Promise<void>((resolve, reject) => {
    const w = window as unknown as { google?: { maps?: { places?: unknown } } };
    if (w.google?.maps?.places) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&loading=async`;
    script.async = true;
    // `onload` NO significa que se pueda usar Places.
    //
    // Con `loading=async` lo que se descarga primero es un cargador, y las
    // librerías vienen después. Al dispararse `onload`, `google.maps.places`
    // todavía no existe: construir el autocompletado ahí lanza un
    // TypeError, y como el llamador lo capturaba en silencio, el visitante
    // se quedaba sin sugerencias en su PRIMER clic —el único que importa—.
    // Funcionaba al segundo intento, cuando la librería ya había llegado,
    // que es justo el síntoma que se veía: "a veces sirve".
    //
    // `importLibrary` es la forma que documenta Google para esperar de
    // verdad a que la librería esté lista.
    script.onload = () => {
      const g = (window as unknown as {
        google?: { maps?: { importLibrary?: (n: string) => Promise<unknown> } };
      }).google;
      if (g?.maps?.importLibrary) {
        g.maps.importLibrary("places").then(() => resolve(), reject);
      } else {
        // Cargador antiguo: al llegar aquí las librerías ya están dentro.
        resolve();
      }
    };
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });
  // Un fallo no puede dejar la promesa rechazada en caché para siempre:
  // sin esto, un corte de red momentáneo apagaba el autocompletado hasta
  // que el visitante recargara la página.
  mapsLoader = intento.catch((e) => {
    mapsLoader = null;
    throw e;
  });
  return mapsLoader;
}

/**
 * Engancha el autocompletado al input que ya está en pantalla, en lugar de
 * envolverlo en un componente: así el campo nunca se desmonta y el visitante
 * no pierde el foco ni lo que llevaba escrito cuando el SDK termina de
 * cargar. Mientras tanto el campo funciona como texto libre — la ruta se
 * resuelve en el servidor a partir del texto.
 */
function attachAutocomplete(
  input: HTMLInputElement | null,
  store: React.RefObject<google.maps.places.Autocomplete | null>,
  onPlaceChanged: () => void,
) {
  if (!input || store.current) return;
  loadGoogleMaps()
    .then(() => {
      if (store.current) return;
      const autocomplete = new google.maps.places.Autocomplete(input, AC_OPTIONS);
      autocomplete.addListener("place_changed", onPlaceChanged);
      store.current = autocomplete;
    })
    .catch((e) => {
      // Sin autocompletado se sigue pudiendo cotizar —el campo es texto
      // libre y la ruta la resuelve el servidor—, pero se deja constancia:
      // tragarse este error en silencio fue lo que mantuvo escondido
      // durante semanas que las sugerencias no salían al primer clic.
      console.error("Autocompletado de direcciones no disponible:", e);
    });
}

/** Fotos verticales (4:5) para las tarjetas del cotizador: la misma unidad
 *  que la flota, pero encuadrada para una tarjeta alta (17 oct 2026). */
const vehicleImages: Record<string, string> = {
  // Desde nov 2026 son las mismas fotos de estudio del catálogo (16:9), para
  // que la categoría se vea igual en la portada y al elegirla.
  sedan: "/flota/sedan.webp",
  executive: "/flota/executive.webp",
  minivan: "/flota/minivan.webp",
  suv: "/flota/high-suv.webp",
};

/** Las horizontales de la flota, para la miniatura del paso de pago. */
const vehicleThumbs: Record<string, string> = {
  sedan: "/flota/sedan.webp",
  executive: "/flota/executive.webp",
  minivan: "/flota/minivan.webp",
  suv: "/flota/high-suv.webp",
};

function getMinDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatDateTime(dateStr: string, timeStr: string, locale = "es-MX") {
  if (!dateStr || !timeStr) return "—";
  const dt = new Date(`${dateStr}T${timeStr}`);
  return dt.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + " · " + timeStr + "h";
}

const TX = {
  en: {
    // "Dispositions" era calco de "Disposiciones": en inglés significa
    // carácter o temperamento, no servicio por horas.
    services: "Hourly", airports: "Transfers", corporate: "Corporate", contact: "Contact", reserveNow: "Reserve Now",
    kicker: "Private Airport Transfers & Chauffeur Services in Mexico City",
    heroTitle: "We move your level.",
    heroCopy: "Arrive in Mexico City with confidence. Enjoy professional chauffeurs, flight monitoring, fixed prices, and personalized airport pickup arrangements.",
    heroPromise: "Your journey begins before you land. We coordinate your arrival, monitor your flight, and keep you informed every step of the way.",
    heroWaitStrong: "1 free hour of waiting at the airport.",
    heroWaitRest: "We track your flight and the chauffeur adjusts to the actual landing time.",
    heroBtnReserve: "Get Your Quote",
    heroBtnTalk: "Talk to Our Team",
    comfortTitleA: "Safety, comfort and ", comfortTitleB: "confidence", comfortTitleC: " in every ride.",
    insured: "Every vehicle insured", gps: "GPS-monitored fleet, 24/7",
    toursKicker: "Tours & day trips with a chauffeur",
    toursTitle: "Your chauffeur, at your disposal all day",
    toursCopy: "No tour schedules, no groups: the car and the chauffeur are yours alone. They wait at every stop and take you back to your hotel.",
    tours: [
      { tag: "Custom quote · full day", title: "Teotihuacán & the Basilica", copy: "The pyramids in the morning and the Basilica of Guadalupe on the way back — same direction, one day, at your pace.", cta: "See the Teotihuacán trip" },
      { tag: "Hourly · from 3 h", title: "Xochimilco & Coyoacán", copy: "Trajineras on the canals, then an afternoon in Coyoacán or San Ángel. Inside the city, with your chauffeur by the hour.", cta: "See hourly service" },
      { tag: "Same-day round trip", title: "Valle de Bravo", copy: "The lake and the magic town, there and back the same day with your chauffeur waiting for you. No driving, no rush.", cta: "See price to Valle de Bravo" },
      { tag: "Same-day round trip", title: "Tepoztlán", copy: "Climb El Tepozteco and walk the market, then ride back with the chauffeur who waited for you.", cta: "See price to Tepoztlán" },
    ],
    toursGuide: "What fits in one day? Read the day-trip guide",
    toursWa: "Plan my tour on WhatsApp",
    toursWaText: "Hi, I'd like a quote for a tour with a chauffeur at my disposal.",
    navServices: "Services", navRoutes: "Routes", navFleet: "Fleet", navCompanies: "Companies", navAbout: "About",
    navCall: "Call +52 55 4130 1651", navQuote: "Get a quote", navMenu: "Menu",
    stripAria: "Why travel with Elite Route",
    strip: ["Insured vehicles", "Professional chauffeurs", "Flight tracking", "Fixed prices, VAT included", "Personal attention"],
    catPax: "passengers", catBags: "bags", catSelect: "Select", catSelected: "Selected",
    corpKicker: "For companies",
    corpTitle: "Executive transportation for companies and events.",
    corpCopy: "Coordination, invoicing and dedicated attention.",
    corpCta: "Learn more",
    corpImgAlt: "Office towers on Paseo de la Reforma with the Angel of Independence at dusk",
    fleetKicker: "The fleet",
    fleetTitle: "Executive and SUV Lux, with a bilingual chauffeur",
    fleetCopy: "Our two executive categories, for business travel and airport pickups. Sedan Lite and SUV Urban remain available as alternatives. Every vehicle insured and GPS-monitored around the clock.",
    fleetAltKicker: "Also available",
    fleetBilingual: "Bilingual chauffeur",
    byCategory: "You book a category: make and model are assigned according to availability.",
    fleetCta: "Quote my transfer →",
    fleetAlt: (c: string) => `Elite Route ${c} category vehicles`,
    water: "Complimentary water bottle", chargers: "Phone chargers", music: "Music connection",
    ac: "Vehicle with A/C", chauffeur: "Friendly, service-minded chauffeur",
    getQuote: "Get your quote",
    stepRoute: "Route", stepVehicle: "Vehicle", stepConfirm: "Confirm",
    transfer: "Transfer", hourly: "Hourly", fullDay: "Full Day",
    hourlyNote: (h: number) => `Hourly service · ${KM_POR_HORA} km included per hour · Up to ${kmIncluidos(h)} km`,
    hourlyNote2: "Your chauffeur remains available during the contracted hours.",
    dayNote: `Full-day service · ${HORAS_DIA_COMPLETO} hours · Up to ${kmIncluidos(HORAS_DIA_COMPLETO)} km included`,
    dayNote2: "Ideal for meetings, events or city transportation in Mexico City.",
    duration: "Service Duration", hours: "hours",
    decreaseHours: "Decrease hours", increaseHours: "Increase hours",
    pickup: "Pickup Location", pickupPlaceholder: "Hotel, airport, address...",
    destination: "Destination", destinationPlaceholder: "Where are we taking you?",
    date: "Date", time: "Time", vehicleCategory: "Vehicle Category",
    getQuoteBtn: "Quote my transfer", calculating: "Calculating route...",
    continue: "Continue →", modifyRoute: "← Modify route", modifyVehicle: "← Modify vehicle",
    kilometers: "Kilometers", includedKm: "Included km", estimatedMin: "Estimated min.",
    airportNote: "✈️ Airport pickup — parking & flight-delay waiting time included",
    vatIncluded: "VAT included",
    fullName: "Full Name", fullNamePlaceholder: "As shown on ID", phone: "Phone",
    flight: "Flight number",
    flightPh: "AM234, AA1234, LA456…",
    flightHelpFrom: "We track this flight and the chauffeur adjusts to the real landing time. The waiting is already included in the fare.",
    flightHelpTo: "So we can check your flight before setting off and choose the pickup time with it in mind.",
    alertFlight: "The flight number is required for airport transfers.",
    currencyNote: "Prices are in Mexican pesos. At checkout the amount is converted to your own currency — dollars, pounds, euros — and you see it before confirming.",
    routesTitle: "Every route, with its price in the open",
    routesAirport: "Airport transfers",
    routesOut: "Out of town",
    routesHelp: "Fixed prices, VAT included. No quote request, no surprises on arrival.",
    airportAsk: "Does this trip touch an airport?",
    airportAskFrom: "You are picked up at an airport",
    airportAskTo: "You are dropped off at an airport",
    airportAskHelp: "Tick it if you wrote the city instead of the terminal. We use it to track your flight and have the chauffeur there at the right time.",
    pax: "Passengers",
    bags: "Bags",
    paxBagsHelp: "So the chauffeur knows what to expect at arrivals. A bag means a checked suitcase; cabin bags do not count.",
    sinUnidadesCta: "Assistance on WhatsApp",
    alertCapacity: (cat: string, pax: number, bags: number, cabe: string) =>
      `${cat} takes up to ${pax} passengers and ${bags} bags. For what you entered, choose ${cabe}.`,
    escLabel: "Guarantee the Cadillac Escalade 2027",
    escHelp: (pct: number) => `+${pct}% on the SUV Lux fare. Without it, we assign the Suburban High Country or the Cadillac Escalade 2027 depending on availability.`,
    escVehicle: "SUV Lux · Cadillac Escalade 2027 guaranteed",
    rtTitle: "Want to come back the same day?",
    rtLabel: "Round trip with the chauffeur waiting",
    rtHelp: (h: number) =>
      `Your chauffeur waits for you and drives you back. ${h} hours of waiting are included; the prices below already show the round trip.`,
    rtWait: "Waiting time",
    rtHours: "hours",
    rtIncluded: (h: number) => `${h} hours included`,
    rtExtra: (n: number, money: string) =>
      `${n} extra ${n === 1 ? "hour" : "hours"} · ${money} each`,
    rtMax: (h: number) => `Need more than ${h} hours? Write to us and we quote it for you.`,
    rtDecrease: "Less waiting time",
    rtIncrease: "More waiting time",
    rtSummary: (h: number) => `Round trip · ${h} h waiting`,
    swap: "Swap",
    swapAria: "Swap pickup and destination",
    routesGuides: "Before you book — traveller guides",
    routesOutRt: (
      <>
        <strong>Going and coming back the same day?</strong> On these routes you can
        book a round trip with the chauffeur waiting for you. It usually costs less than
        two separate transfers — pick your destination in the quote form above and tick it
        in step 2.
      </>
    ),
    notes: "Anything we should know? (optional)",
    notesPlaceholder: "Child seat, extra luggage, a stop on the way, a name sign at arrivals, a preferred language…",
    notesHelp: "We read every request and confirm it over WhatsApp. Some — an extra stop, a longer wait — may change the price; we tell you before charging anything.",
    stServiceType: "Service type", stIncludedKm: "Included km", stDateTime: "Date & time",
    stPickup: "Pickup", stDestination: "Destination", stOpenItinerary: "Open itinerary",
    stVehicle: "Vehicle", stDistance: "Distance", stDuration: "Duration", stZone: "Zone",
    totalVat: "Total with VAT",
    trustPay: "Secure payment with",
    proof1Value: `+${YEARS_OPERATING} YEARS`, proof1Label: "of experience in the sector",
    proof2Value: `+${TRANSFERS_PER_YEAR}`, proof2Label: "trips a year",
    proof3Value: "FIXED PRICE", proof3Label: "VAT included, no surprise charges",
    footPay: "Payments processed by",
    footBilling: "CFDI invoicing",
    footTerms: "Terms",
    footPrivacy: "Privacy",
    footRates: "Rates",
    footHourly: "Hourly chauffeur",
    footChauffeur: "Private chauffeur",
    footExecutive: "Executive transportation",
    footAirport: "Airport transfers",
    footFleet: "Fleet",
    // Sin año: se pintaría en el servidor y otra vez en el navegador, y en
    // el cambio de año los dos no coinciden. No vale una advertencia de
    // hidratación por un dato que no aporta.
    footRights: "Elite Route MX · Mexico City",
    payBtn: "Pay and reserve with card", payLoading: "Opening secure payment...",
    whatsappBtn: "Prefer to book over WhatsApp?",
    payStepsTitle: DESPUES_DE_PAGAR.en.pasosTitulo,
    paySteps: DESPUES_DE_PAGAR.en.pasos,
    trustTitle: "Book with confidence",
    trustGoogle: (r: string) => `${r} ★ on Google`,
    trustGoogleSub: (n: number) => `${n} reviews · see them`,
    trustStripe: "Secure payment",
    trustStripeSub: "Processed by Stripe; we never see your card",
    trustInsured: "Insured vehicles",
    trustInsuredSub: "GPS-monitored 24/7",
    trustDirect: "Direct attention",
    trustDirectSub: "WhatsApp messages and chauffeur details before the service",
    condTitle: "Before you pay",
    condWait: "Waiting included: 60 min at the airport from actual landing; 30 min anywhere else.",
    condRoute: "One-way fare: tolls, fuel and parking included.",
    condHourly: (h: number) => `Hourly: within Mexico City only · ${KM_POR_HORA} km per hour (${kmIncluidos(h)} km in total) · ${HORAS_MIN}-hour minimum (SUV Lux, 5).`,
    condCancel: "Cancellation: more than 24 h ahead, we refund what you paid minus 15%; within 24 h or in case of no-show, no refund.",
    condExtras: "Extra stops, route changes, extra hours or extra waiting time requested on the day are agreed and charged separately — we tell you before charging.",
    condTerms: "Full terms",
    legal2: "Elite Route CDMX · eliteroute.mx",
    alertOrigin: "Enter the pickup location.",
    alertDest: "Enter the destination.",
    alertDateTime: "Select the service date and time.",
    alertMinHours: (h: number) => `Minimum hourly service is ${h} hours.`,
    alertPast: "Select a future date and time.",
    alertAdvance: "At least 12 hours of advance notice are required.",
    alertTooManyReq: "Too many requests. Please wait a moment and try again.",
    alertRouteErr: "We could not calculate the route. Please verify the addresses.",
    alertBloqueada: (n: string) => `${n} is not available on that date. Choose another category or message us on WhatsApp.`,
    notAvailable: "Not available on this date",
    alertFueraCdmx: "Hourly service applies only within Mexico City. For AIFA, Toluca or out-of-town trips, message us on WhatsApp for a special quote.",
    alertConnErr: "Connection error. Please try again.",
    alertName: "Full name is required.",
    alertPhone: "Phone number is required.",
    alertPhoneInvalid: "Enter a valid phone number with country code.",
    alertPriceErr: "Error: go back to step 1 and calculate the route.",
    alertCheckoutErr: "We could not start the payment. Please try again.",
    benefit1Title: "Professional Chauffeurs", benefit1Copy: "Licensed and professionally trained.",
    benefit2Title: "Fixed Pricing", benefit2Copy: "Transparent fares with no surprises.",
    benefit3Title: "24/7 Availability", benefit3Copy: "Airport and executive transportation.",
    benefit4Title: "Direct Attention", benefit4Copy: "WhatsApp support; chauffeur details before the service.",
    b2bTitle: "Business to Business",
    b2bCopy: "Corporate accounts, executive transfers, recurring routes and commercial partnerships.",
    accTitle: "Accounting / Invoices",
    accCopy: "Billing details, invoice requests, payment records and administrative follow-up.",
    reviewsKicker: "Elite Route Reviews",
    reviewsTitle: "What our clients say",
    reviewsRatingLabel: "Reviews on Google",
    reviewsWriteBtn: "Write us a review",
    reviewsSeeBtn: "See reviews",
    reviewsCount: (n: number) => (n === 1 ? "1 Google review" : `${n} Google reviews`),
  },
  es: {
    services: "Disposiciones", airports: "Traslados", corporate: "Corporativo", contact: "Contacto", reserveNow: "Reservar",
    kicker: "Transporte privado y ejecutivo en Ciudad de México",
    heroTitle: "Movemos tu nivel.",
    heroCopy: "Viaja con tranquilidad. Conductores profesionales, monitoreo de vuelos, tarifas transparentes y atención personalizada desde tu llegada.",
    heroPromise: "Tu viaje empieza antes de aterrizar. Coordinamos tu llegada, monitoreamos tu vuelo y te mantenemos al tanto en cada paso.",
    heroWaitStrong: "1 hora de espera gratuita en el aeropuerto.",
    heroWaitRest: "Monitoreamos tu vuelo y el chofer se ajusta a la hora real de aterrizaje.",
    heroBtnReserve: "Cotizar traslado",
    heroBtnTalk: "Hablar con un asesor",
    comfortTitleA: "Seguridad, comodidad y ", comfortTitleB: "confianza", comfortTitleC: " en cada viaje.",
    insured: "Todas las unidades con seguro vigente", gps: "Monitoreo GPS las 24 horas en toda la flota",
    toursKicker: "Tours y excursiones con chofer",
    toursTitle: "Tu chofer, a tu disposición todo el día",
    toursCopy: "Sin horarios de tour ni grupos: el auto y el chofer son sólo para ti. Te esperan en cada parada y te regresan a tu hotel.",
    tours: [
      { tag: "Cotización especial · día completo", title: "Teotihuacán y la Basílica", copy: "Las pirámides por la mañana y la Basílica de Guadalupe de regreso: quedan en la misma dirección. Un día, a tu ritmo.", cta: "Ver el viaje a Teotihuacán" },
      { tag: "Por horas · desde 3 h", title: "Xochimilco y Coyoacán", copy: "Trajineras en los canales y la tarde en Coyoacán o San Ángel. Dentro de la ciudad, con tu chofer por horas.", cta: "Ver chofer por horas" },
      { tag: "Ida y vuelta el mismo día", title: "Valle de Bravo", copy: "El lago y el pueblo mágico, ida y vuelta el mismo día con el chofer esperándote. Sin manejar y sin prisa.", cta: "Ver precio a Valle de Bravo" },
      { tag: "Ida y vuelta el mismo día", title: "Tepoztlán", copy: "Sube al Tepozteco, recorre el mercado y regresa con el chofer que te esperó.", cta: "Ver precio a Tepoztlán" },
    ],
    toursGuide: "¿Qué cabe en un día? Lee la guía de excursiones",
    toursWa: "Armar mi tour por WhatsApp",
    toursWaText: "Hola, quiero cotizar un tour con chofer a disposición.",
    navServices: "Servicios", navRoutes: "Rutas", navFleet: "Flota", navCompanies: "Empresas", navAbout: "Nosotros",
    navCall: "Llamar al +52 55 4130 1651", navQuote: "Cotizar", navMenu: "Menú",
    stripAria: "Por qué viajar con Elite Route",
    strip: ["Vehículos asegurados", "Conductores profesionales", "Seguimiento de vuelos", "Precios fijos con IVA incluido", "Atención personalizada"],
    catPax: "pasajeros", catBags: "maletas", catSelect: "Seleccionar", catSelected: "Seleccionado",
    corpKicker: "Para empresas",
    corpTitle: "Transporte ejecutivo para empresas y eventos.",
    corpCopy: "Coordinación, facturación y atención dedicada.",
    corpCta: "Conoce más",
    corpImgAlt: "Torres de oficinas en Paseo de la Reforma con el Ángel de la Independencia al atardecer",
    fleetKicker: "La flota",
    fleetTitle: "Executive y SUV Lux, con chofer bilingüe",
    fleetCopy: "Nuestras dos categorías ejecutivas, para viajes de negocio y recepciones en aeropuerto. Sedan Lite y SUV Urban siguen disponibles como alternativas. Todas con seguro vigente y monitoreo GPS las 24 horas.",
    fleetAltKicker: "También disponibles",
    fleetBilingual: "Chofer bilingüe",
    byCategory: "Reservas una categoría: la marca y el modelo se asignan según disponibilidad.",
    fleetCta: "Cotizar mi traslado →",
    fleetAlt: (c: string) => `Unidades de la categoría ${c} de Elite Route`,
    water: "Botella de agua de cortesía", chargers: "Cargadores para celular", music: "Conexión para música",
    ac: "Vehículo con A/C", chauffeur: "Chofer amable y orientado al servicio",
    getQuote: "Obtén tu cotización",
    stepRoute: "Ruta", stepVehicle: "Vehículo", stepConfirm: "Confirmar",
    transfer: "Traslado", hourly: "Por hora", fullDay: "Día completo",
    hourlyNote: (h: number) => `Servicio por hora · ${KM_POR_HORA} km incluidos por hora · Hasta ${kmIncluidos(h)} km`,
    hourlyNote2: "Tu chofer permanece disponible durante las horas contratadas.",
    dayNote: `Servicio día completo · ${HORAS_DIA_COMPLETO} horas · Hasta ${kmIncluidos(HORAS_DIA_COMPLETO)} km incluidos`,
    dayNote2: "Ideal para reuniones, eventos o traslados en la Ciudad de México.",
    duration: "Duración del servicio", hours: "horas",
    decreaseHours: "Disminuir horas", increaseHours: "Aumentar horas",
    pickup: "Lugar de recogida", pickupPlaceholder: "Hotel, aeropuerto, dirección...",
    destination: "Destino", destinationPlaceholder: "¿A dónde te llevamos?",
    date: "Fecha", time: "Hora", vehicleCategory: "Categoría de vehículo",
    getQuoteBtn: "Cotizar traslado", calculating: "Calculando ruta...",
    continue: "Continuar →", modifyRoute: "← Modificar ruta", modifyVehicle: "← Modificar vehículo",
    kilometers: "Kilómetros", includedKm: "Km incluidos", estimatedMin: "Min. estimados",
    airportNote: "✈️ Salida desde aeropuerto — estacionamiento y espera por retraso de vuelo incluidos",
    vatIncluded: "IVA incluido",
    fullName: "Nombre completo", fullNamePlaceholder: "Como aparece en identificación", phone: "Teléfono",
    flight: "Número de vuelo",
    flightPh: "AM234, AA1234, LA456…",
    flightHelpFrom: "Monitoreamos este vuelo y el chofer se ajusta a la hora real de aterrizaje. La espera ya va incluida en la tarifa.",
    flightHelpTo: "Para revisar tu vuelo antes de salir y elegir la hora de recogida con eso en la mano.",
    alertFlight: "El número de vuelo es obligatorio en traslados de aeropuerto.",
    currencyNote: "Los precios están en pesos mexicanos. Al pagar, el importe se convierte a tu moneda y lo ves antes de confirmar.",
    routesTitle: "Cada ruta, con su precio por delante",
    routesAirport: "Traslados de aeropuerto",
    routesOut: "Viajes foráneos",
    routesHelp: "Precios fijos con IVA incluido. Sin pedir cotización y sin sorpresas al llegar.",
    airportAsk: "¿Este viaje toca un aeropuerto?",
    airportAskFrom: "Te recogemos en un aeropuerto",
    airportAskTo: "Te dejamos en un aeropuerto",
    airportAskHelp: "Márcalo si escribiste la ciudad en lugar de la terminal. Nos sirve para monitorear tu vuelo y que el chofer esté ahí a la hora correcta.",
    pax: "Pasajeros",
    bags: "Maletas",
    paxBagsHelp: "Para que el chofer sepa qué esperar en llegadas. Maleta es la documentada; el equipaje de mano no cuenta.",
    sinUnidadesCta: "Atención por WhatsApp",
    alertCapacity: (cat: string, pax: number, bags: number, cabe: string) =>
      `En ${cat} caben ${pax} pasajeros y ${bags} maletas. Para lo que indicaste, elige ${cabe}.`,
    escLabel: "Garantizar Cadillac Escalade 2027",
    escHelp: (pct: number) => `+${pct}% sobre la tarifa de SUV Lux. Sin esta opción asignamos la Suburban High Country o la Cadillac Escalade 2027 según disponibilidad.`,
    escVehicle: "SUV Lux · Cadillac Escalade 2027 garantizada",
    rtTitle: "¿Quieres regresar el mismo día?",
    rtLabel: "Viaje redondo con el chofer esperándote",
    rtHelp: (h: number) =>
      `El chofer te espera y te regresa. Incluye ${h} horas de espera; los precios de abajo ya son los del viaje redondo.`,
    rtWait: "Horas de espera",
    rtHours: "horas",
    rtIncluded: (h: number) => `${h} horas incluidas`,
    rtExtra: (n: number, money: string) =>
      `${n} ${n === 1 ? "hora extra" : "horas extra"} · ${money} cada una`,
    rtMax: (h: number) => `¿Necesitas más de ${h} horas? Escríbenos y te lo cotizamos.`,
    rtDecrease: "Menos horas de espera",
    rtIncrease: "Más horas de espera",
    rtSummary: (h: number) => `Viaje redondo · ${h} h de espera`,
    swap: "Invertir",
    swapAria: "Invertir origen y destino",
    routesGuides: "Antes de reservar — guías para el viajero",
    routesOutRt: (
      <>
        <strong>¿Ir y volver el mismo día?</strong> En estas rutas puedes reservar el
        viaje redondo con el chofer esperándote. Normalmente cuesta menos que dos
        traslados por separado: elige tu destino en el cotizador de arriba y márcalo en el paso 2.
      </>
    ),
    notes: "¿Algo que debamos saber? (opcional)",
    notesPlaceholder: "Silla para bebé, equipaje voluminoso, una parada en el camino, letrero con tu nombre en la llegada, idioma del chofer…",
    notesHelp: "Leemos cada solicitud y te la confirmamos por WhatsApp. Algunas —una parada extra, más tiempo de espera— pueden cambiar el precio; te avisamos antes de cobrar nada.",
    stServiceType: "Tipo de servicio", stIncludedKm: "Km incluidos", stDateTime: "Fecha y hora",
    stPickup: "Recogida", stDestination: "Destino", stOpenItinerary: "Disposición libre",
    stVehicle: "Vehículo", stDistance: "Distancia", stDuration: "Duración", stZone: "Zona",
    totalVat: "Total con IVA",
    trustPay: "Pago seguro con",
    proof1Value: `+${YEARS_OPERATING} AÑOS`, proof1Label: "de experiencia en el sector",
    proof2Value: `+${TRANSFERS_PER_YEAR}`, proof2Label: "viajes por año",
    proof3Value: "PRECIO FIJO", proof3Label: "IVA incluido, sin cargos sorpresa",
    footPay: "Pagos procesados por",
    footBilling: "Facturación CFDI",
    footTerms: "Términos",
    footPrivacy: "Aviso de privacidad",
    footRates: "Tarifas",
    footHourly: "Chofer por horas",
    footChauffeur: "Chofer privado",
    footExecutive: "Transporte ejecutivo",
    footAirport: "Traslados de aeropuerto",
    footFleet: "Flota",
    footRights: "Elite Route MX · Ciudad de México",
    payBtn: "Pagar y reservar con tarjeta", payLoading: "Abriendo pago seguro...",
    whatsappBtn: "¿Prefieres reservar por WhatsApp?",
    payStepsTitle: DESPUES_DE_PAGAR.es.pasosTitulo,
    paySteps: DESPUES_DE_PAGAR.es.pasos,
    trustTitle: "Reserva con confianza",
    trustGoogle: (r: string) => `${r} ★ en Google`,
    trustGoogleSub: (n: number) => `${n} reseñas · verlas`,
    trustStripe: "Pago seguro",
    trustStripeSub: "Procesado por Stripe; nunca vemos tu tarjeta",
    trustInsured: "Unidades aseguradas",
    trustInsuredSub: "Monitoreo GPS 24/7",
    trustDirect: "Atención directa",
    trustDirectSub: "Mensajes por WhatsApp y datos del conductor antes del servicio",
    condTitle: "Antes de pagar",
    condWait: "Espera incluida: 60 min en aeropuerto desde el aterrizaje real; 30 min en cualquier otro punto.",
    condRoute: "Tarifa por trayecto sencillo: casetas, gasolina y estacionamiento incluidos.",
    condHourly: (h: number) => `Por horas: sólo dentro de la CDMX · ${KM_POR_HORA} km por hora (${kmIncluidos(h)} km en total) · mínimo ${HORAS_MIN} horas (SUV Lux, 5).`,
    condCancel: "Cancelación: con más de 24 h te reembolsamos lo pagado menos 15%; con menos de 24 h o si no te presentas, no hay reembolso.",
    condExtras: "Paradas extra, cambios de ruta, horas extra o esperas adicionales pedidas en el momento se acuerdan y cobran aparte; te avisamos antes de cobrar.",
    condTerms: "Términos completos",
    legal2: "Elite Route CDMX · eliteroute.mx",
    alertOrigin: "Ingresa el lugar de recogida.",
    alertDest: "Ingresa el destino.",
    alertDateTime: "Selecciona la fecha y hora del servicio.",
    alertMinHours: (h: number) => `El servicio mínimo por hora es de ${h} horas.`,
    alertPast: "Selecciona una fecha y hora futura.",
    alertAdvance: "Se requieren al menos 12 horas de anticipación.",
    alertTooManyReq: "Demasiadas solicitudes. Por favor espera un momento e intenta de nuevo.",
    alertRouteErr: "No pudimos calcular la ruta. Por favor verifica las direcciones.",
    alertBloqueada: (n: string) => `${n} no está disponible en esa fecha. Elige otra categoría o escríbenos por WhatsApp.`,
    notAvailable: "No disponible en esta fecha",
    alertFueraCdmx: "El servicio por horas aplica sólo dentro de la Ciudad de México. Para AIFA, Toluca o foráneos, escríbenos por WhatsApp y te hacemos una cotización especial.",
    alertConnErr: "Error de conexión. Por favor intenta de nuevo.",
    alertName: "El nombre completo es requerido.",
    alertPhone: "El número de teléfono es requerido.",
    alertPhoneInvalid: "Ingresa un número de teléfono válido con código de país.",
    alertPriceErr: "Error: regresa al paso 1 y calcula la ruta.",
    alertCheckoutErr: "No pudimos iniciar el pago. Por favor intenta de nuevo.",
    benefit1Title: "Choferes Profesionales", benefit1Copy: "Licenciados y capacitados profesionalmente.",
    benefit2Title: "Tarifas Fijas", benefit2Copy: "Precios transparentes sin sorpresas.",
    benefit3Title: "Disponibilidad 24/7", benefit3Copy: "Transporte aeroportuario y ejecutivo.",
    benefit4Title: "Atención Directa", benefit4Copy: "WhatsApp y datos del conductor antes del servicio.",
    b2bTitle: "Business to Business",
    b2bCopy: "Cuentas corporativas, traslados ejecutivos, rutas recurrentes y asociaciones comerciales.",
    accTitle: "Contabilidad / Facturas",
    accCopy: "Datos de facturación, solicitudes de facturas, registros de pago y seguimiento administrativo.",
    reviewsKicker: "Reseñas Elite Route",
    reviewsTitle: "Lo que dicen quienes viajan con nosotros",
    reviewsRatingLabel: "Reseñas en Google",
    reviewsWriteBtn: "Escríbenos una reseña",
    reviewsSeeBtn: "Ver reseñas",
    reviewsCount: (n: number) =>
      n === 1 ? "1 reseña en Google" : `${n} reseñas en Google`,
  },
};

const styles = `

  /* ── Rediseño oscuro (especificación nov 2026) ──────────────────────────
     85-90 % tonos oscuros neutros; el dorado sólo como acento de marca y en
     el botón de cotizar. Títulos en Cormorant (serif), interfaz en Manrope.
     Nada de comillas invertidas en estos comentarios: esto vive dentro de
     una plantilla de texto y una comilla invertida la cierra. */
  .er-root {
    --bg:#080D12; --bg2:#10171D; --card:#192127; --field:#252D34;
    --tx:#F7F7F5; --tx2:#B8BEC3; --line:#343C43; --gold:#C8A76E; --gold-btn:#D5B57A;
    --serif:var(--font-cormorant), Georgia, serif;
    --sans:var(--font-manrope), system-ui, -apple-system, sans-serif;
    --r:12px; --ease:cubic-bezier(0.2, 0.7, 0.2, 1);
    --hero-photo:url('/portada.webp');
    --hero-photo-sm:url('/portada-900.webp');
    background:var(--bg); color:var(--tx); min-height:100vh;
    font-family:var(--sans); font-weight:400; -webkit-font-smoothing:antialiased;
  }
  .er-root * { box-sizing:border-box; }
  .er-shell { min-height:100vh; }
  @media (prefers-reduced-motion: reduce) {
    .er-root *, .er-root *::before, .er-root *::after {
      animation-duration:0.01ms !important; animation-iteration-count:1 !important;
      transition-duration:0.01ms !important; scroll-behavior:auto !important;
    }
  }

  /* ── Encabezado ── */
  .er-topbar { position:sticky; top:0; z-index:60; background:rgba(8,13,18,0.82); backdrop-filter:saturate(140%) blur(14px); -webkit-backdrop-filter:saturate(140%) blur(14px); border-bottom:1px solid rgba(52,60,67,0.7); }
  .er-nav { max-width:1320px; margin:0 auto; padding:0 32px; height:76px; display:flex; align-items:center; gap:28px; }
  .er-brand { display:inline-flex; align-items:center; text-decoration:none; flex:none; }
  .er-nav-links { list-style:none; margin:0 0 0 auto; padding:0; display:flex; align-items:center; gap:30px; }
  .er-nav-links a { color:var(--tx2); text-decoration:none; font-size:14px; font-weight:500; letter-spacing:0.01em; transition:color 0.18s var(--ease); }
  .er-nav-links a:hover { color:var(--tx); }
  .er-nav-right { display:flex; align-items:center; gap:18px; flex:none; }
  .er-nav-tel { display:inline-flex; align-items:center; gap:8px; color:var(--tx); text-decoration:none; font-size:14px; font-weight:600; min-height:44px; }
  .er-nav-tel svg { color:var(--tx2); }
  .er-nav-cta { display:inline-flex; align-items:center; min-height:44px; padding:0 20px; border-radius:10px; background:var(--gold-btn); color:#14181C; font-size:14px; font-weight:700; text-decoration:none; transition:background 0.18s var(--ease); }
  .er-nav-cta:hover { background:#E0C38D; }
  .er-nav-burger { display:none; width:44px; height:44px; align-items:center; justify-content:center; background:transparent; border:1px solid var(--line); border-radius:10px; color:var(--tx); cursor:pointer; }

  /* ── Portada: texto | fotografía | cotizador ── */
  .er-hero { position:relative; overflow:hidden; background:var(--bg); }
  /* La foto aprobada (16 nov 2026): dos SUV a los lados y el Ángel al centro,
     formato 2:1. Va de la orilla izquierda hasta donde empieza el cotizador,
     apoyada sobre la franja de beneficios, para que las dos camionetas se vean
     completas; el texto queda sobre el cielo. Bordes desvanecidos hacia el
     fondo, sin halos. */
  .er-hero::before {
    content:""; position:absolute; left:0; top:350px; width:calc(100% - 470px); max-width:1180px; aspect-ratio:2 / 1;
    background:var(--hero-photo) center / cover no-repeat;
    -webkit-mask-image:linear-gradient(to bottom, transparent 0%, #000 34%, #000 86%, transparent 100%), linear-gradient(to right, transparent 0%, #000 8%, #000 90%, transparent 100%);
    -webkit-mask-composite:source-in;
    mask-image:linear-gradient(to bottom, transparent 0%, #000 34%, #000 86%, transparent 100%), linear-gradient(to right, transparent 0%, #000 8%, #000 90%, transparent 100%);
    mask-composite:intersect;
    pointer-events:none;
  }
  .er-hero-lede { text-shadow:0 2px 18px rgba(8,13,18,0.85); }
  .er-hero-inner { position:relative; z-index:1; max-width:1320px; margin:0 auto; padding:72px 32px 0; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,0.8fr) 432px; grid-template-areas:"lede photo card" "strip strip strip"; column-gap:24px; align-items:start; }
  .er-hero-lede { grid-area:lede; padding-top:28px; max-width:470px; }
  .er-hero-photo { grid-area:photo; display:none; }
  .er-booking-card { grid-area:card; }
  .er-strip { grid-area:strip; }
  .er-kicker { color:var(--tx2); font-size:12px; letter-spacing:0.2em; text-transform:uppercase; }
  .er-hero-h1 { font-family:var(--sans); font-size:12px; font-weight:600; margin:0 0 22px; line-height:1.6; }
  .er-hero-title { font-family:var(--serif); font-size:clamp(52px, 5.4vw, 76px); font-weight:400; line-height:0.98; letter-spacing:-0.01em; margin:0 0 22px; color:var(--tx); text-wrap:balance; }
  .er-hero-copy { color:var(--tx2); font-size:17px; line-height:1.65; margin:0 0 26px; max-width:420px; }
  .er-hero-reviews { display:inline-flex; align-items:center; gap:10px; min-height:44px; padding:0 16px; border:1px solid var(--line); border-radius:10px; background:rgba(16,23,29,0.7); color:var(--tx); text-decoration:none; font-size:14px; transition:border-color 0.18s var(--ease); }
  .er-hero-reviews:hover { border-color:#4A535B; }
  .er-hero-reviews strong { font-weight:700; }
  .er-hero-stars { color:#F4B400; letter-spacing:2px; font-size:13px; }
  .er-hero-wa { display:block; width:max-content; margin-top:16px; color:var(--tx2); font-size:14px; text-decoration:underline; text-underline-offset:4px; text-decoration-color:rgba(184,190,195,0.4); min-height:24px; }
  .er-hero-wa:hover { color:var(--tx); }

  /* ── Franja de beneficios ── */
  .er-strip { list-style:none; margin:56px 0 0; padding:26px 0; display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
  .er-strip-item { display:flex; align-items:center; gap:12px; padding:0 20px; color:var(--tx); font-size:14px; font-weight:500; line-height:1.35; }
  .er-strip-item + .er-strip-item { border-left:1px solid var(--line); }
  .er-strip-icon { flex:none; width:24px; height:24px; color:#D9DCDF; }
  .er-strip-icon svg { width:24px; height:24px; display:block; }

  /* ── Cotizador ── */
  .er-booking-card { background:var(--card); color:var(--tx); border:1px solid var(--line); border-radius:18px; padding:26px; box-shadow:0 24px 60px -30px rgba(0,0,0,0.8); scroll-margin-top:92px; }
  .er-booking-title { font-family:var(--serif); font-size:28px; font-weight:500; margin:0 0 12px; color:var(--tx); }
  .er-main { max-width:1320px; margin:0 auto; padding:0 32px 100px; }
  .er-progress { height:2px; background:var(--line); border-radius:2px; overflow:hidden; }
  .er-progress-fill { height:100%; background:var(--gold); transition:width 0.25s var(--ease); }
  .er-steps { display:flex; gap:6px; margin:12px 0 22px; }
  .er-step-tab { flex:1; min-height:44px; padding:8px 6px; display:flex; align-items:center; justify-content:center; font-family:var(--sans); font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:var(--tx2); background:transparent; border:1px solid var(--line); border-radius:10px; cursor:pointer; transition:all 0.18s var(--ease); }
  .er-step-tab.active { color:var(--tx); border-color:#5A636B; background:var(--field); }
  .er-step-tab:disabled { cursor:default; opacity:0.5; }
  .er-step-num { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; border:1px solid currentColor; font-size:10.5px; margin-right:7px; flex:none; }
  .er-panel { display:none; animation:erFadeIn 0.22s var(--ease); }
  .er-panel.active { display:block; }
  @keyframes erFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

  .er-service-tabs { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:6px; padding:4px; background:var(--bg2); border:1px solid var(--line); border-radius:12px; margin-bottom:20px; }
  .er-svc-tab { min-height:44px; padding:8px; background:transparent; border:none; border-radius:9px; color:var(--tx2); font-family:var(--sans); font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:all 0.18s var(--ease); }
  .er-svc-tab.active { background:var(--field); color:var(--tx); box-shadow:inset 0 0 0 1px #4A535B; }
  .er-svc-tab:hover:not(.active) { color:var(--tx); }

  .er-field { margin-bottom:16px; }
  .er-label { display:block; font-size:13px; font-weight:600; color:var(--tx2); margin-bottom:7px; }
  /* 16 px: por debajo Safari en iOS hace zoom al enfocar. */
  .er-input { width:100%; min-height:52px; background:var(--field); border:1px solid transparent; border-radius:10px; padding:14px 15px; color:var(--tx); font-family:var(--sans); font-size:16px; font-weight:500; outline:none; transition:border-color 0.18s var(--ease), box-shadow 0.18s var(--ease); -webkit-appearance:none; }
  .er-input:hover { border-color:#3E474F; }
  .er-input:focus { border-color:#6B747C; box-shadow:0 0 0 3px rgba(200,167,110,0.16); }
  .er-input::placeholder { color:#8D959C; opacity:1; }
  .er-input option { background:var(--card); color:var(--tx); }
  input[type="date"].er-input, input[type="time"].er-input { color-scheme:dark; }
  .er-textarea { width:100%; background:var(--field); border:1px solid transparent; border-radius:10px; padding:14px 15px; color:var(--tx); font-family:var(--sans); font-size:16px; line-height:1.55; outline:none; -webkit-appearance:none; resize:vertical; min-height:92px; display:block; transition:border-color 0.18s var(--ease); }
  .er-textarea:focus { border-color:#6B747C; box-shadow:0 0 0 3px rgba(200,167,110,0.16); }
  .er-textarea::placeholder { color:#8D959C; opacity:1; }
  .er-notes-foot { display:flex; justify-content:space-between; gap:14px; margin-top:7px; }
  .er-notes-help, .er-notes-count { color:var(--tx2); font-size:12.5px; line-height:1.5; }
  .er-notes-count { white-space:nowrap; font-variant-numeric:tabular-nums; }
  .er-notes-count.full { color:var(--gold); }

  .er-wa-link { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:14px; min-height:44px; color:var(--tx2); font-size:14px; text-decoration:none; }
  .er-wa-link svg { color:#25D366; }
  .er-wa-link:hover { color:var(--tx); text-decoration:underline; text-underline-offset:3px; }

  .er-flight, .er-rt, .er-sinunidades { border:1px solid var(--line); border-radius:12px; padding:14px 16px; background:var(--bg2); }
  .er-flight .er-label { color:var(--tx); }
  .er-flight-help { margin:8px 0 0; font-size:12.5px; line-height:1.55; color:var(--tx2); }
  .er-sinunidades { margin:-4px 0 18px; }
  .er-sinunidades-t { margin:0 0 6px; font-size:14px; font-weight:700; color:var(--tx); }
  .er-sinunidades-c { margin:0 0 12px; font-size:13.5px; line-height:1.6; color:var(--tx2); }
  .er-sinunidades-btn { display:inline-flex; align-items:center; min-height:44px; padding:0 18px; border:1px solid #5A636B; border-radius:10px; color:var(--tx); text-decoration:none; font-size:13.5px; font-weight:600; }
  .er-sinunidades-btn:hover { background:var(--field); }
  .er-paxbags { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px; }
  .er-airport-ask { margin:-2px 0 16px; padding:10px 14px 8px; border:1px solid var(--line); border-radius:12px; }
  .er-airport-ask-q { margin:0 0 2px; font-size:13px; font-weight:600; color:var(--tx2); }
  .er-airport-ask-help { margin:6px 0 0; font-size:12px; line-height:1.55; color:var(--tx2); }
  .er-check { display:flex; align-items:flex-start; gap:10px; cursor:pointer; padding:11px 0; min-height:44px; font-size:14px; line-height:1.45; color:var(--tx); }
  .er-check input { width:18px; height:18px; margin:1px 0 0; flex:none; accent-color:var(--gold); cursor:pointer; }
  .er-swap-row { display:flex; justify-content:flex-end; margin:-10px 0 6px; }
  .er-swap { display:inline-flex; align-items:center; gap:7px; min-height:44px; padding:0 8px; background:none; border:none; cursor:pointer; color:var(--tx2); font-family:inherit; font-size:12.5px; font-weight:600; }
  .er-swap:hover { color:var(--tx); }
  .er-input-wrap { position:relative; }
  .er-input-wrap .er-input--clearable { padding-right:44px; }
  .er-input-clear { position:absolute; right:10px; top:50%; transform:translateY(-50%); width:28px; height:28px; display:flex; align-items:center; justify-content:center; background:var(--card); border:1px solid var(--line); border-radius:50%; color:var(--tx2); font-size:15px; line-height:1; padding:0; cursor:pointer; }
  .er-input-clear:hover { color:var(--tx); border-color:#5A636B; }
  select.er-input { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23B8BEC3' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 15px center; padding-right:42px; cursor:pointer; }
  .er-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  .er-hours-selector { display:flex; align-items:center; background:var(--field); border-radius:10px; padding:6px 12px; }
  .er-hr-btn { width:40px; height:40px; border-radius:50%; border:1px solid #4A535B; background:transparent; color:var(--tx); font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .er-hr-btn:hover { border-color:var(--tx2); }
  @media (max-width:900px) { .er-hr-btn { width:44px; height:44px; } }
  .er-hr-count { font-size:22px; font-weight:700; width:52px; text-align:center; color:var(--tx); font-variant-numeric:tabular-nums; }
  .er-hr-unit { font-size:13px; color:var(--tx2); }
  .er-zone-legend { font-size:13px; font-weight:500; color:var(--tx); line-height:1.5; background:var(--bg2); border:1px solid var(--line); border-left:2px solid var(--gold); border-radius:10px; padding:10px 14px; margin:-4px 0 12px; }
  .er-service-note { font-size:13px; color:var(--tx2); margin:-6px 0 18px; line-height:1.55; background:var(--bg2); border:1px solid var(--line); border-radius:10px; padding:12px 14px; }
  .er-service-note span { color:var(--tx2) !important; }

  .er-section-title { font-family:var(--serif); color:var(--tx); font-size:30px; font-weight:500; margin:40px 0 18px; }
  .er-rt { margin-bottom:20px; }
  .er-rt-q { font-size:13px; font-weight:700; color:var(--tx); margin:0 0 10px; }
  .er-rt-check { display:flex; align-items:flex-start; gap:10px; cursor:pointer; color:var(--tx); font-size:15px; line-height:1.45; }
  .er-rt-check input { width:18px; height:18px; margin:2px 0 0; flex:none; accent-color:var(--gold); }
  .er-rt-help, .er-rt-wait-note, .er-rt-max { color:var(--tx2); font-size:12.5px; line-height:1.55; }
  .er-rt-help { margin:8px 0 0 28px; }
  .er-rt-wait { margin-top:14px; padding-top:12px; border-top:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
  .er-rt-wait-lbl { font-size:13px; font-weight:600; color:var(--tx); }
  .er-rt-max { margin:10px 0 0; }

  /* Paso 2: mismas proporciones para todas; sólo la elegida con línea dorada. */
  .er-vehicles { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; margin-bottom:22px; }
  .er-vehicle { position:relative; border-radius:14px; cursor:pointer; text-align:left; overflow:hidden; border:1px solid var(--line); background:var(--card); transition:border-color 0.18s var(--ease), transform 0.18s var(--ease); }
  .er-vehicle:hover { border-color:#5A636B; }
  .er-vehicle.selected { border-color:var(--gold); box-shadow:inset 0 0 0 1px var(--gold); }
  .er-vehicle.blocked { opacity:0.4; cursor:not-allowed; }
  .er-vehicle-bg { position:absolute; inset:0 0 auto 0; aspect-ratio:16 / 9; background-size:cover; background-position:center; }
  .er-vehicle-overlay { display:none; }
  .er-vehicle-content { position:relative; z-index:1; padding:calc(56.25% + 14px) 16px 16px; display:flex; flex-direction:column; justify-content:flex-start; }
  .er-vehicle-name { font-family:var(--serif); font-size:24px; font-weight:500; color:var(--tx); margin-bottom:2px; }
  .er-vehicle-tag { font-size:11.5px; color:var(--tx2); letter-spacing:0.04em; margin-bottom:6px; }
  .er-vehicle-cap { font-size:12.5px; color:var(--tx2); margin-bottom:8px; }
  .er-vehicle-price { font-size:22px; font-weight:700; color:var(--tx); font-variant-numeric:tabular-nums; }
  .er-vehicle-price-label { font-size:11px; color:var(--tx2); }
  .er-vehicle-check { position:absolute; top:12px; right:12px; z-index:2; width:24px; height:24px; border-radius:50%; background:var(--gold); display:none; align-items:center; justify-content:center; }
  .er-vehicle.selected .er-vehicle-check { display:flex; }

  .er-route-box { background:var(--bg2); border:1px solid var(--line); border-radius:12px; padding:16px 20px; margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; }
  .er-route-stats { display:flex; gap:26px; }
  .er-stat-val { font-size:24px; font-weight:700; color:var(--tx); line-height:1; font-variant-numeric:tabular-nums; }
  .er-stat-lbl { font-size:12px; color:var(--tx2); margin-top:5px; }
  .er-zone-badge { display:inline-block; padding:6px 12px; border:1px solid var(--line); border-radius:20px; font-size:12px; color:var(--tx2); }
  .er-airport-note { color:var(--tx2); font-size:12.5px; margin:8px 0 16px; text-align:center; }

  /* Botón principal: dorado discreto, texto oscuro, 54 px. */
  .er-btn-primary { width:100%; min-height:54px; background:var(--gold-btn); color:#14181C; border:none; border-radius:12px; padding:15px; font-family:var(--sans); font-size:15.5px; font-weight:700; cursor:pointer; transition:background 0.18s var(--ease), transform 0.18s var(--ease); }
  .er-btn-primary:hover { background:#E0C38D; }
  .er-btn-primary:active { transform:translateY(1px); }
  .er-btn-primary:disabled { opacity:0.65; cursor:progress; background-image:linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); background-size:200% 100%; animation:erLoad 1.1s linear infinite; }
  @keyframes erLoad { from{background-position:200% 0} to{background-position:-200% 0} }
  .er-btn-secondary { width:100%; min-height:48px; background:transparent; color:var(--tx); border:1px solid var(--line); border-radius:12px; padding:12px; font-family:var(--sans); font-size:14px; font-weight:600; cursor:pointer; margin-top:10px; transition:border-color 0.18s var(--ease); }
  .er-btn-secondary:hover { border-color:#5A636B; }
  .er-btn-wa { width:100%; min-height:54px; background:#25D366; color:#06140B; border:none; border-radius:12px; padding:15px; font-family:var(--sans); font-size:15px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; text-decoration:none; }
  .er-btn-wa:hover { background:#1fb85a; }
  .er-btn-outline { display:inline-flex; align-items:center; min-height:48px; padding:0 22px; border:1px solid #5A636B; border-radius:12px; color:var(--tx); text-decoration:none; font-size:14.5px; font-weight:600; transition:border-color 0.18s var(--ease), color 0.18s var(--ease); }
  .er-btn-outline:hover { border-color:var(--gold); }
  .er-payment-note, .er-currency-note { color:var(--tx2); font-size:12.5px; line-height:1.6; margin:-6px 0 14px; text-align:center; }
  .er-alert { padding:12px 16px; border-radius:10px; font-size:14px; margin-bottom:16px; }
  .er-alert-err { background:rgba(220,80,70,0.1); border:1px solid rgba(220,80,70,0.35); color:#F2A39B; }

  .er-summary { background:var(--bg2); border:1px solid var(--line); border-radius:12px; overflow:hidden; margin-bottom:22px; }
  .er-summary-row { display:flex; justify-content:space-between; gap:16px; padding:12px 16px; border-bottom:1px solid var(--line); font-size:14px; }
  .er-summary-row:last-child { border-bottom:none; background:var(--field); }
  .er-summary-key { color:var(--tx2); flex-shrink:0; }
  .er-summary-val { color:var(--tx); text-align:right; max-width:65%; line-height:1.4; }
  .er-summary-total { font-size:22px; font-weight:700; font-variant-numeric:tabular-nums; }
  .er-pick { display:flex; gap:14px; align-items:center; padding:10px; border:1px solid var(--line); border-radius:12px; background:var(--bg2); margin-bottom:16px; }
  .er-pick img { width:120px; height:68px; object-fit:cover; border-radius:8px; flex-shrink:0; }
  .er-pick-name { font-family:var(--serif); font-size:21px; color:var(--tx); }
  .er-pick-tag, .er-pick-cap { font-size:12.5px; color:var(--tx2); margin-top:2px; line-height:1.45; }
  .er-cond, .er-paysteps { border:1px solid var(--line); border-radius:12px; background:var(--bg2); padding:14px 16px; margin-bottom:14px; }
  .er-cond ul, .er-paysteps ol { margin:0; padding-left:18px; }
  .er-cond li, .er-paysteps li { color:var(--tx2); font-size:13px; line-height:1.55; margin-bottom:5px; }
  .er-cond a { display:inline-block; margin-top:4px; font-size:13px; color:var(--tx); text-decoration:underline; text-underline-offset:3px; }
  .er-cond-title { font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--tx); margin:0 0 8px; }
  .er-paysteps strong { color:var(--tx); }
  .er-trust { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; margin-bottom:16px; }
  .er-trust-item { display:flex; flex-direction:column; gap:2px; padding:10px 12px; border:1px solid var(--line); border-radius:10px; text-decoration:none; }
  a.er-trust-item:hover { border-color:#5A636B; }
  .er-trust-item strong { color:var(--tx); font-size:13px; font-weight:600; }
  .er-trust-item span { color:var(--tx2); font-size:12px; line-height:1.45; }
  .er-legal { text-align:center; font-size:11.5px; color:var(--tx2); margin-top:16px; line-height:1.8; }
  .er-bycat { font-size:12.5px; line-height:1.6; color:var(--tx2); text-align:center; margin:-6px 0 16px; }

  .PhoneInput { display:flex; align-items:center; min-height:52px; background:var(--field); border:1px solid transparent; border-radius:10px; padding:0 15px; }
  .PhoneInput:focus-within { border-color:#6B747C; box-shadow:0 0 0 3px rgba(200,167,110,0.16); }
  .PhoneInputCountry { margin-right:10px; }
  .PhoneInputInput { flex:1; background:transparent; border:none; color:var(--tx); font-family:var(--sans); font-size:16px; font-weight:500; outline:none; padding:14px 0; }
  .PhoneInputInput::placeholder { color:#8D959C; }

  .er-trust-line { display:flex; align-items:center; flex-wrap:wrap; gap:8px; color:var(--tx2); font-size:12.5px; line-height:1.5; margin:0 0 16px; }
  .er-trust-line svg { flex-shrink:0; stroke:var(--tx2); }
  .er-stripe-mark { display:inline-block; background:#635BFF; color:#fff; font-weight:700; font-size:12px; padding:2px 8px 3px; border-radius:4px; line-height:1.35; }
  .er-cardmarks { display:inline-flex; gap:6px; flex-wrap:wrap; }
  .er-cardmark { font-weight:600; font-size:10px; letter-spacing:0.08em; color:var(--tx2); border:1px solid var(--line); border-radius:3px; padding:2px 6px 1px; line-height:1.5; }

  /* ── Secciones ── */
  .er-sec-kicker { color:var(--tx2); font-size:12px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; margin:0 0 14px; }
  .er-sec-title { font-family:var(--serif); font-size:clamp(32px, 3.3vw, 44px); font-weight:400; line-height:1.08; color:var(--tx); margin:0 0 14px; text-wrap:balance; }
  .er-sec-copy { color:var(--tx2); font-size:16.5px; line-height:1.65; max-width:620px; margin:0 0 30px; }

  /* Catálogo */
  .er-fleet { padding-top:104px; }
  .er-cat-row { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:16px; }
  .er-cat-row > li { display:flex; }
  .er-cat { width:100%; display:flex; flex-direction:column; text-align:left; background:var(--card); border:1px solid var(--line); border-radius:16px; overflow:hidden; padding:0; cursor:pointer; color:var(--tx); font-family:var(--sans); transition:border-color 0.18s var(--ease), transform 0.18s var(--ease); }
  .er-cat:hover { border-color:#4A535B; transform:translateY(-2px); }
  .er-cat.is-selected { border-color:var(--gold); box-shadow:inset 0 0 0 1px rgba(200,167,110,0.6); }
  .er-cat img { display:block; width:100%; height:auto; aspect-ratio:16 / 9; object-fit:cover; background:#24292D; }
  .er-cat-body { display:flex; flex-direction:column; gap:6px; padding:18px 18px 20px; flex:1; }
  .er-cat-name { font-family:var(--serif); font-size:27px; font-weight:500; line-height:1.05; }
  .er-cat-tag { font-size:12px; color:var(--tx2); letter-spacing:0.03em; min-height:2.6em; }
  .er-cat-specs { display:flex; gap:16px; color:var(--tx2); font-size:13.5px; margin-top:6px; }
  .er-cat-specs > span { display:inline-flex; align-items:center; gap:6px; }
  .er-cat-cta { margin-top:auto; padding-top:14px; font-size:13.5px; font-weight:600; color:var(--tx); display:inline-flex; align-items:center; gap:6px; }
  .er-cat.is-selected .er-cat-cta { color:var(--gold); }
  .er-cat-cta::after { content:"→"; transition:transform 0.18s var(--ease); }
  .er-cat:hover .er-cat-cta::after { transform:translateX(3px); }

  /* Corporativo */
  .er-corp { margin-top:104px; border:1px solid var(--line); border-radius:20px; background:var(--card); overflow:hidden; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.1fr); align-items:stretch; }
  .er-corp-text { padding:56px; align-self:center; max-width:560px; }
  .er-corp-img { display:block; width:100%; height:100%; min-height:360px; object-fit:cover; object-position:center; }
  .er-corp .er-sec-copy { margin-bottom:26px; }

  /* Tours */
  .er-tours { margin-top:104px; }
  .er-tours-kicker { color:var(--tx2); font-size:12px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; margin:0 0 14px; }
  .er-tours-title { font-family:var(--serif); font-size:clamp(32px, 3.3vw, 44px); font-weight:400; line-height:1.08; margin:0 0 14px; }
  .er-tours-copy { margin:0 0 30px; max-width:620px; color:var(--tx2); font-size:16.5px; line-height:1.65; }
  .er-tours-grid { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:16px; }
  /* Tarjeta con la foto del destino de fondo: el texto va abajo, sobre un
     degradado oscuro que garantiza la lectura sin importar la foto. */
  .er-tour { position:relative; isolation:isolate; overflow:hidden; display:flex; flex-direction:column; justify-content:flex-end; gap:10px; min-height:400px; padding:22px; border:1px solid var(--line); border-radius:16px; background:var(--card); text-decoration:none; color:var(--tx); transition:border-color 0.18s var(--ease); }
  .er-tour::before { content:""; position:absolute; inset:0; z-index:-1; background:linear-gradient(to top, rgba(8,13,18,0.96) 0%, rgba(8,13,18,0.82) 38%, rgba(8,13,18,0.25) 68%, rgba(8,13,18,0.05) 100%); }
  .er-tour-img { position:absolute; inset:0; z-index:-2; width:100%; height:100%; object-fit:cover; transition:transform 0.4s var(--ease); }
  .er-tour:hover { border-color:#4A535B; }
  .er-tour:hover .er-tour-img { transform:scale(1.04); }
  .er-tour-tag { align-self:flex-start; font-size:11.5px; font-weight:600; color:var(--tx); background:rgba(8,13,18,0.6); border:1px solid rgba(255,255,255,0.18); border-radius:20px; padding:4px 10px; backdrop-filter:blur(6px); }
  .er-tour-title { font-family:var(--serif); font-size:24px; font-weight:500; margin:0; }
  .er-tour-copy { margin:0; color:#D4D8DC; font-size:14px; line-height:1.6; }
  .er-tour-cta { color:var(--tx); font-size:13.5px; font-weight:600; }
  .er-tours-foot { display:flex; flex-wrap:wrap; align-items:center; gap:14px 24px; margin-top:24px; }
  .er-tours-guide { color:var(--tx2); font-size:14px; text-decoration:underline; text-underline-offset:4px; }
  .er-tours-wa { display:inline-flex; min-height:48px; align-items:center; padding:0 20px; border-radius:12px; border:1px solid var(--line); color:var(--tx); font-size:14px; font-weight:600; text-decoration:none; }
  .er-tours-wa:hover { border-color:#5A636B; }

  /* Amenidades */
  .er-comfort { margin-top:96px; display:grid; grid-template-columns:minmax(0,0.8fr) minmax(0,1.4fr); gap:32px; border-top:1px solid var(--line); padding-top:40px; }
  .er-comfort-title { font-family:var(--serif); color:var(--tx); font-size:32px; line-height:1.12; font-weight:400; margin:0; }
  .er-comfort-title span { color:var(--tx); font-style:italic; }
  .er-comfort-list { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px 24px; margin:0; padding:0; list-style:none; }
  .er-comfort-list li { color:var(--tx2); font-size:14px; line-height:1.45; border-top:1px solid var(--line); padding-top:11px; display:flex; gap:10px; }
  .er-comfort-icon { color:var(--tx2); width:18px; min-width:18px; text-align:center; }
  .er-comfort-icon svg { display:block; width:16px; height:16px; stroke:currentColor; }

  /* Rutas (bajo perfil) */
  .er-routes { margin-top:88px; border-top:1px solid var(--line); padding-top:40px; scroll-margin-top:90px; }
  .er-routes-title { font-family:var(--serif); font-size:30px; font-weight:400; margin:0 0 8px; }
  .er-routes-help { margin:0 0 24px; font-size:14px; color:var(--tx2); line-height:1.6; }
  .er-routes-group + .er-routes-group { margin-top:24px; }
  .er-routes-sub { font-size:11.5px; letter-spacing:0.16em; text-transform:uppercase; color:var(--tx2); font-weight:600; margin:0 0 12px; }
  .er-routes-list { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:10px 24px; }
  .er-routes-list a { color:var(--tx); text-decoration:none; font-size:14px; line-height:1.5; opacity:0.85; }
  .er-routes-list a:hover { opacity:1; text-decoration:underline; text-underline-offset:3px; }
  .er-routes-rt { margin:14px 0 0; font-size:13.5px; line-height:1.65; color:var(--tx2); }
  .er-routes-rt strong { color:var(--tx); }

  .er-contact-grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:16px; margin-top:44px; scroll-margin-top:90px; }
  .er-contact-item { border:1px solid var(--line); border-radius:16px; padding:22px; background:var(--bg2); }
  .er-contact-title { color:var(--tx); font-weight:700; font-size:16px; margin-bottom:8px; }
  .er-contact-copy { color:var(--tx2); line-height:1.6; font-size:14px; margin-bottom:12px; }
  .er-contact-actions { display:flex; flex-direction:column; align-items:flex-start; gap:12px; }
  .er-contact-link { color:var(--tx); font-size:14px; font-weight:600; text-decoration:underline; text-underline-offset:3px; overflow-wrap:anywhere; }

  /* Reseñas: neutras, sin bordes dorados; las estrellas conservan su color. */
  .er-testimonials { padding:96px 32px; border-top:1px solid var(--line); background:var(--bg2); }
  .er-testimonials > * { max-width:1320px; margin-left:auto; margin-right:auto; }
  .er-testimonials-kicker { color:var(--tx2); font-size:12px; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:12px; text-align:center; }
  .er-testimonials-title { font-family:var(--serif); font-size:clamp(30px,3.3vw,44px); font-weight:400; color:var(--tx); margin:0 auto 30px; line-height:1.1; text-align:center; }
  .er-testimonials-grid { display:flex; flex-wrap:wrap; justify-content:center; gap:16px; }
  .er-testimonials-grid > * { flex:0 1 calc((100% - 32px) / 3); min-width:0; }
  @media (max-width:1000px) { .er-testimonials-grid > * { flex-basis:calc((100% - 16px) / 2); } }
  .er-testimonial-card { background:var(--card); border:1px solid var(--line); border-radius:16px; padding:26px; display:flex; flex-direction:column; gap:14px; }
  .er-testimonial-stars { color:#F4B400; font-size:13px; letter-spacing:3px; }
  .er-testimonial-quote { font-family:var(--serif); font-size:19px; font-weight:400; color:var(--tx); line-height:1.5; margin:0; }
  .er-testimonial-author { display:flex; align-items:center; gap:12px; margin-top:auto; }
  .er-testimonial-avatar { width:34px; height:34px; border-radius:50%; background:var(--field); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:var(--tx); flex-shrink:0; }
  .er-testimonial-name { font-size:13.5px; font-weight:600; color:var(--tx); }
  .er-testimonial-role { font-size:12px; color:var(--tx2); margin-top:2px; }
  /* Las tarjetas en los colores de la G de Google, en su orden (azul, rojo,
     amarillo, verde). Tonos oficiales profundos de Google para que el texto
     blanco cumpla contraste; en el amarillo el texto va oscuro. */
  .er-testimonial-card[class*="er-g-"] { border:none; }
  .er-g-blue { background:#1A73E8; }
  .er-g-red { background:#D93025; }
  .er-g-green { background:#188038; }
  .er-g-yellow { background:#F9AB00; }
  .er-g-blue .er-testimonial-quote, .er-g-red .er-testimonial-quote, .er-g-green .er-testimonial-quote,
  .er-g-blue .er-testimonial-name, .er-g-red .er-testimonial-name, .er-g-green .er-testimonial-name { color:#FFFFFF; }
  .er-g-blue .er-testimonial-role, .er-g-red .er-testimonial-role, .er-g-green .er-testimonial-role { color:rgba(255,255,255,0.86); }
  .er-g-blue .er-testimonial-stars, .er-g-red .er-testimonial-stars, .er-g-green .er-testimonial-stars { color:#FFFFFF; }
  .er-g-blue .er-testimonial-avatar, .er-g-red .er-testimonial-avatar, .er-g-green .er-testimonial-avatar { background:rgba(255,255,255,0.2); color:#FFFFFF; }
  .er-g-yellow .er-testimonial-quote, .er-g-yellow .er-testimonial-name, .er-g-yellow .er-testimonial-stars { color:#202124; }
  .er-g-yellow .er-testimonial-role { color:rgba(32,33,36,0.8); }
  .er-g-yellow .er-testimonial-avatar { background:rgba(32,33,36,0.14); color:#202124; }
  .er-reviews-badge-row { display:flex; justify-content:center; margin-bottom:30px; }
  .er-reviews-badge { display:inline-flex; align-items:center; gap:13px; border:1px solid var(--line); background:var(--card); border-radius:12px; padding:12px 22px; text-decoration:none; }
  .er-reviews-badge:hover { border-color:#5A636B; }
  .er-reviews-badge-text { display:flex; flex-direction:column; gap:2px; }
  .er-reviews-badge-top { display:flex; align-items:baseline; gap:8px; }
  .er-reviews-score { font-size:22px; font-weight:700; color:var(--tx); line-height:1; }
  .er-reviews-stars { letter-spacing:1px; color:#F4B400; font-size:13px; }
  .er-reviews-label { color:var(--tx2); font-size:12.5px; }
  .er-reviews-cta-row { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:32px; }
  .er-reviews-btn-primary, .er-reviews-btn-secondary { display:inline-flex; align-items:center; min-height:48px; padding:0 22px; font-size:14px; font-weight:600; border-radius:12px; text-decoration:none; font-family:var(--sans); }
  .er-reviews-btn-primary { border:1px solid #5A636B; color:var(--tx); }
  .er-reviews-btn-secondary { border:1px solid var(--line); color:var(--tx2); }
  .er-reviews-btn-primary:hover, .er-reviews-btn-secondary:hover { border-color:var(--tx2); color:var(--tx); }
  @media (max-width:900px) { .er-testimonials-grid > * { flex-basis:100%; } .er-testimonials { padding:64px 20px; } }

  .er-wa-fab { position:fixed; bottom:calc(22px + env(safe-area-inset-bottom)); right:22px; z-index:50; width:56px; height:56px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px -8px rgba(0,0,0,0.6); transition:opacity 0.2s, transform 0.2s, visibility 0.2s; }
  @media (max-width:700px) { .er-wa-fab--oculto { opacity:0; visibility:hidden; transform:scale(0.8); pointer-events:none; } }

  /* ── Pie ── */
  .er-foot { border-top:1px solid var(--line); padding:34px 32px 96px; background:var(--bg); }
  .er-foot > * { max-width:1320px; margin-left:auto; margin-right:auto; }
  .er-foot-pay { display:flex; justify-content:space-between; align-items:center; gap:18px; flex-wrap:wrap; padding-bottom:20px; border-bottom:1px solid var(--line); }
  .er-foot-billing { color:var(--tx2); font-size:13px; text-decoration:none; }
  .er-foot-billing:hover { color:var(--tx); }
  .er-foot-id { display:flex; flex-direction:column; gap:5px; padding-top:20px; font-style:normal; font-size:13px; line-height:1.6; color:var(--tx2); }
  .er-foot-id-name { font-weight:700; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:var(--tx); }
  .er-foot-id-contact { display:flex; flex-wrap:wrap; gap:6px 18px; }
  .er-foot-id-contact a { color:var(--tx); text-decoration:none; border-bottom:1px solid var(--line); }
  .er-foot-meta { display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap; margin-top:20px; padding-top:18px; border-top:1px solid var(--line); font-size:12px; color:var(--tx2); }
  .er-foot-links { display:flex; gap:22px; flex-wrap:wrap; }
  .er-foot-links a { color:var(--tx2); text-decoration:none; }
  .er-foot-links a:hover { color:var(--tx); }

  .er-root a:focus-visible, .er-root button:focus-visible, .er-root input:focus-visible, .er-root select:focus-visible, .er-wa-fab:focus-visible { outline:2px solid var(--gold); outline-offset:3px; border-radius:8px; }

  /* ── 1024: el cotizador baja bajo el texto; la foto queda de fondo ── */
  @media (max-width:1180px) {
    .er-nav-links { gap:22px; }
    .er-nav-tel-num { display:none; }
  }
  @media (max-width:1080px) {
    .er-hero::before { width:calc(100% - 460px); }
    .er-hero-inner { grid-template-columns:minmax(0,1fr) 432px; grid-template-areas:"lede card" "strip strip"; }
    .er-strip { grid-template-columns:repeat(3, minmax(0,1fr)); row-gap:18px; }
    .er-strip-item:nth-child(4) { border-left:none; }
    .er-cat-row { grid-template-columns:repeat(2, minmax(0,1fr)); }
    .er-tours-grid { grid-template-columns:repeat(2, minmax(0,1fr)); }
  }
  @media (max-width:960px) {
    .er-nav-links { display:none; }
    .er-nav-links[data-open="1"] { display:flex; flex-direction:column; align-items:stretch; gap:0; position:absolute; top:100%; left:0; right:0; margin:0; padding:8px 20px 18px; background:#080D12; border-bottom:1px solid var(--line); box-shadow:0 24px 40px -12px rgba(0,0,0,0.7); z-index:70; }
    .er-nav-links[data-open="1"] a { display:flex; align-items:center; min-height:52px; font-size:16px; color:var(--tx); border-bottom:1px solid var(--line); }
    .er-nav-burger { display:inline-flex; }
    .er-nav-right { margin-left:auto; gap:10px; }
    .er-nav-cta { display:none; }
    .er-hero::before { display:none; }
    .er-hero-inner { grid-template-columns:1fr; grid-template-areas:"lede" "photo" "strip" "card"; padding-top:44px; }
    .er-hero-lede { max-width:none; padding-top:0; }
    .er-hero-photo { display:block; margin:24px -32px 0; aspect-ratio:2 / 1; background:var(--hero-photo-sm) center / cover no-repeat; -webkit-mask-image:linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%); mask-image:linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%); }
    .er-strip { margin-top:8px; }
    .er-booking-card { margin-top:28px; }
    .er-comfort { grid-template-columns:1fr; }
    .er-corp { grid-template-columns:1fr; }
    .er-corp-img { order:-1; min-height:0; height:auto; aspect-ratio:3 / 2; }
  }

  /* ── Teléfono ── */
  @media (max-width:700px) {
    .er-nav { padding:0 16px; height:64px; gap:12px; }
    .er-brand .er-brand-tagline { display:none; }
    .er-nav-tel { width:44px; justify-content:center; border:1px solid var(--line); border-radius:10px; }
    .er-nav-right { gap:8px; }
    .er-topbar .lt-globe { display:none; }
    .er-topbar .lt-btn { min-width:38px; padding-left:8px; padding-right:8px; }
    .er-hero-inner { padding:32px 20px 0; }
    .er-hero-title { font-size:46px; }
    .er-hero-copy { font-size:15.5px; }
    .er-hero-photo { margin:20px -20px 0; aspect-ratio:2 / 1; }
    .er-strip { grid-template-columns:1fr 1fr; padding:18px 0; gap:16px 0; }
    .er-strip-item { padding:0 10px 0 0; font-size:13.5px; }
    .er-strip-item + .er-strip-item { border-left:none; }
    .er-strip-item:last-child { grid-column:1 / -1; }
    .er-booking-card { padding:20px 16px; border-radius:16px; }
    .er-step-tab { font-size:11px; padding:6px 4px; }
    .er-step-num { margin-right:5px; }
    .er-main { padding:0 20px 80px; }
    .er-vehicles { grid-template-columns:1fr; }
    .er-fleet { padding-top:72px; }
    /* Carrusel táctil: una tarjeta y se asoma la siguiente. */
    .er-cat-row { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; gap:12px; margin:0 -20px; padding:0 20px 8px; scrollbar-width:none; }
    .er-cat-row::-webkit-scrollbar { display:none; }
    .er-cat-row > li { flex:0 0 82%; scroll-snap-align:start; }
    .er-corp { margin-top:72px; }
    .er-corp-text { padding:28px 22px 32px; }
    .er-tours, .er-comfort { margin-top:72px; }
    .er-tours-grid { grid-template-columns:1fr; }
    .er-contact-grid { grid-template-columns:1fr; }
    .er-routes-list { grid-template-columns:repeat(2, minmax(0,1fr)); gap:10px 14px; }
    .er-comfort-list { grid-template-columns:1fr; }
    .er-foot { padding:30px 20px 96px; }
    .er-foot-pay, .er-foot-meta { flex-direction:column; align-items:flex-start; }
    .er-row--fecha { grid-template-columns:1fr 1fr; }
  }
  @media (max-width:580px) { .er-row { grid-template-columns:1fr; } .er-row.er-row--fecha { grid-template-columns:1fr 1fr; } }
  .er-hero-inner > * { min-width:0; }
  @media (max-width:400px) {
    .er-nav { padding:0 12px; gap:8px; }
    .er-nav-right { gap:6px; }
    .er-topbar .lt-btn { min-width:34px; padding-left:6px; padding-right:6px; }
    .er-nav-tel, .er-nav-burger { width:42px; }
  }
`;

/** Íconos lineales de la franja de beneficios, en el orden de t.strip. Un solo trazo, sin relleno. */
const STRIP_ICONS = [
  <svg key="seguro" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/></svg>,
  <svg key="chofer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>,
  <svg key="vuelo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15.5 21 9l-2.5-1.5-6 1.5L8 4.5 6.5 5l2.5 5-4 1L3 9.5 2 10l2 4z"/><path d="M3 20h18"/></svg>,
  <svg key="precio" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5h.01M17.5 14.5h.01"/></svg>,
  <svg key="atencion" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z"/></svg>,
];

/** Fotos de fondo de las tarjetas de tours, en el orden de t.tours. */
const TOUR_IMAGES = ["/tours/teotihuacan.webp", "/tours/xochimilco.webp", "/tours/valle-de-bravo.webp", "/tours/tepoztlan.webp"];

/** Orden del catálogo de la portada (especificación de diseño, nov 2026). */
const CATALOG_ORDER: readonly Category[] = ["suv", "executive", "minivan", "sedan"];

/** Un enlace de ruta ya resuelto en el servidor. Ver `app/[lang]/page.tsx`. */
export type EnlaceDeRuta = { key: string; href: string; label: string; foranea: boolean };

/** Un enlace a una guía, resuelto igual y por el mismo motivo. */
export type EnlaceDeGuia = { href: string; label: string };

export default function HomeClient({
  lang,
  tablas,
  rutas,
  guias,
}: {
  lang: Lang;
  /**
   * Precios por horas y de día completo, ya resueltos en el servidor. No se
   * calculan aquí porque hacerlo obligaba a importar el tarifario, y todo lo
   * que importa un componente de cliente se descarga en el navegador del
   * visitante: el costo por kilómetro de cada categoría viajaba en texto
   * plano dentro del JavaScript del sitio.
   */
  tablas: TablasCotizador;
  /**
   * Las 16 rutas, reducidas a enlace y etiqueta en el servidor por el mismo
   * motivo que los precios: `lib/routes.ts` lleva el texto completo de todas
   * ellas en los dos idiomas y no tiene por qué viajar al navegador.
   */
  rutas: EnlaceDeRuta[];
  /** Las tres guías, resueltas en el servidor por el mismo motivo. */
  guias: EnlaceDeGuia[];
}) {
  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationRef = useRef<google.maps.places.Autocomplete | null>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // El idioma llega por la ruta (/en o /es), no por el estado: ver
  // lib/i18n.ts. Así la portada en inglés y la portada en español son dos
  // páginas distintas que un buscador puede indexar por separado.
  const t = TX[lang];
  const corporate = path(lang, "corporate");
  // La capacidad venía sólo en inglés y se mostraba así con la UI en español.
  const capFor = (cat: Category) =>
    lang === "es" ? vehicles[cat].capEs : vehicles[cat].cap;
  // Sólo la SUV Lux la lleva: su máximo de pasajeros y el de maletas no
  // caben a la vez, y enterarse de eso en la banqueta es tarde.
  const noteFor = (cat: Category) =>
    lang === "es" ? vehicles[cat].noteEs : vehicles[cat].note;

  // En móvil el formulario ocupa todo el ancho, así que un botón flotante fijo
  // acaba encima de sus campos. Se oculta mientras la tarjeta está a la vista.
  const [formularioALaVista, setFormularioALaVista] = useState(false);
  useEffect(() => {
    const card = document.getElementById("quote");
    if (!card || typeof IntersectionObserver === "undefined") return;
    // EL SDK DE MAPS (316 KB en ocho archivos) se pide antes del primer
    // clic —esperarlo hasta el clic dejaba dos segundos sin sugerencias—,
    // pero ya no en cuanto el cotizador entra en pantalla: está en la
    // primera pantalla, así que eso era descargarlo al abrir la página y
    // competir con la carga inicial en el teléfono (Lighthouse móvil:
    // TBT 3.4 s, 16 nov 2026). Ahora se pide:
    //   · al primer toque o foco dentro de la tarjeta, de inmediato;
    //   · si no, con el navegador ya libre: cotizador a la vista, página
    //     cargada y 2.5 s más (requestIdleCallback si existe).
    let programado = false;
    let espera: ReturnType<typeof setTimeout> | undefined;
    const pedirMaps = () => loadGoogleMaps().catch(() => {});
    const pedirCuandoLibre = () => {
      if (programado) return;
      programado = true;
      const lanzar = () => {
        espera = setTimeout(() => {
          const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
          if (ric) ric(pedirMaps, { timeout: 3000 }); else pedirMaps();
        }, 2500);
      };
      if (document.readyState === "complete") lanzar();
      else window.addEventListener("load", lanzar, { once: true });
    };
    card.addEventListener("pointerdown", pedirMaps, { once: true, passive: true });
    card.addEventListener("focusin", pedirMaps, { once: true });

    const obs = new IntersectionObserver(
      ([entry]) => {
        setFormularioALaVista(entry.isIntersecting);
        if (entry.isIntersecting) pedirCuandoLibre();
      },
      { threshold: 0.12 },
    );
    obs.observe(card);
    return () => {
      obs.disconnect();
      if (espera) clearTimeout(espera);
      card.removeEventListener("pointerdown", pedirMaps);
      card.removeEventListener("focusin", pedirMaps);
    };
  }, []);

  const [step, setStep] = useState(1);
  const [menuAbierto, setMenuAbierto] = useState(false);
  // El primer evento del embudo se manda una vez y no en cada tecla: sin
  // esto, "empezó a cotizar" contaría una vez por carácter escrito.
  const yaContadaLaIntencion = useRef(false);
  function marcarIntencion() {
    if (yaContadaLaIntencion.current) return;
    yaContadaLaIntencion.current = true;
    track("cotizacion_iniciada", { tipo_servicio: serviceType });
  }
  const [serviceType, setServiceType] = useState<ServiceType>("route");
  const [rentalHours, setRentalHours] = useState<number>(HORAS_MIN);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTime, setServiceTime] = useState("");
  const [km, setKm] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [zone, setZone] = useState<Zone>("cdmx");
  /** Precio de las cuatro categorías para la ruta cotizada, tal como lo
   *  devolvió el servidor. `null` mientras no haya una ruta calculada. */
  const [routePrices, setRoutePrices] = useState<PrecioPorCategoria | null>(null);
  /**
   * EL VIAJE REDONDO FORÁNEO. Llega resuelto desde /api/maps —base y hora
   * extra de las cuatro categorías— y es `null` cuando la ruta no da para
   * ofrecerlo. Quien decide eso es la distancia que midió el servidor, no
   * esta pantalla: aquí no hay forma de encenderlo escribiendo un destino.
   */
  const [redondoTabla, setRedondoTabla] = useState<TablasRedondo | null>(null);
  /**
   * Desmarcado a propósito. El precio que el visitante ve al llegar al paso 2
   * es el del traslado sencillo, que es el más bajo y el que vino buscando;
   * el redondo lo enciende él. Marcarlo por defecto sería subir la tarifa en
   * pantalla sin que nadie lo pidiera.
   */
  const [redondo, setRedondo] = useState(false);
  const [horasEspera, setHorasEspera] = useState(REDONDO_HORAS_CORTESIA);
  const [category, setCategory] = useState<Category>("executive");
  // Dirección exacta que Google confirmó como aeropuerto. Se guarda el texto
  // (y no un booleano) para que el recargo se caiga solo si el cliente edita
  // el campo después de haber elegido el aeropuerto en el autocompletado.
  const [airportPlace, setAirportPlace] = useState("");
  // El aeropuerto del DESTINO se guarda aparte del de origen a propósito.
  // `airportPickup` dispara el recargo del 25% —estacionamiento y espera en
  // terminal— y eso sólo aplica cuando se SALE de una terminal. Mezclarlos
  // encarecería un 25% todos los traslados hacia el aeropuerto sin que nadie
  // lo pidiera.
  const [destAirportPlace, setDestAirportPlace] = useState("");
  /**
   * Lo que el cliente declara a mano, cuando la dirección no lo delata.
   *
   * POR QUÉ EXISTEN. El 1 de octubre de 2026 un cliente reservó un traslado
   * llegando en el vuelo UA 783 y escribió "Mexico City" como origen, no la
   * terminal. Ninguna detección puede adivinar eso: el texto es una ciudad,
   * no un aeropuerto. Resultado: no se le pidió el número de vuelo, no se
   * activó el monitoreo de la llegada y no se cobró el recargo de aeropuerto
   * que sí correspondía. Preguntarlo es lo único que cierra ese hueco.
   */
  const [manualAirportPickup, setManualAirportPickup] = useState(false);
  const [manualAirportDropoff, setManualAirportDropoff] = useState(false);
  const [flightNumber, setFlightNumber] = useState("");
  /**
   * Cuánta gente y cuánto equipaje llega. Sólo se pregunta en traslados de
   * aeropuerto, que es donde el dato cambia la operación: el chofer sale de
   * la base sabiendo si caben. Arrancan en 1 y 1 porque es el caso normal y
   * así nadie tiene que tocarlos para reservar.
   */
  /** Se enciende cuando el servidor contesta que no quedan unidades. */
  const [sinUnidades, setSinUnidades] = useState(false);
  /** Garantizar Cadillac Escalade 2027 (+20 %). Sólo cuenta con SUV Lux elegida. */
  const [escalade, setEscalade] = useState(false);
  /**
   * LO QUE CONTESTÓ /api/disponibilidad para el horario y la categoría
   * elegidos. `null` mientras no aplique (categoría sin límite, sin fecha)
   * o no haya contestado. Ver lib/agenda.ts: sólo SUV Lux tiene límite.
   *
   * Dos estados que importan: `sujetoAConfirmacion` (queda la unidad del
   * convenio) muestra un aviso y deja pagar; `!libre` (las dos tomadas)
   * abre la salida a WhatsApp y apaga el botón de pago. El servidor vuelve
   * a comprobarlo en /api/checkout: esto avisa antes, no protege.
   */
  const [huecoRespuesta, setHueco] = useState<{ libre: boolean; sujetoAConfirmacion: boolean } | null>(null);
  const [pasajeros, setPasajeros] = useState(1);
  /**
   * Devuelve el aviso si lo que el cliente indicó no cabe en la categoría
   * elegida, o null si cabe. Se comprueba aquí Y en el servidor: la lista
   * desplegable no obliga a quien llame a la API directamente.
   */
  function avisoCapacidad(): string | null {
    const c = CAPACIDAD[category];
    if (pasajeros <= c.pax && maletas <= c.maletas) return null;
    const caben = (Object.keys(CAPACIDAD) as Category[])
      .filter((k) => pasajeros <= CAPACIDAD[k].pax && maletas <= CAPACIDAD[k].maletas)
      .map((k) => vehicles[k].name);
    return t.alertCapacity(
      vehicles[category].name,
      c.pax,
      c.maletas,
      caben.length ? caben.join(" o ") : "—",
    );
  }

  const [maletas, setMaletas] = useState(1);
  const [fullName, setFullName] = useState("");
  /** Solicitudes extra del cliente. Opcional: la reserva es válida sin ellas. */
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [alert1, setAlert1] = useState("");
  const [alert3, setAlert3] = useState("");

  // Lo que la dirección delata por sí sola: el texto del origen —así funciona
  // aunque el cliente escriba "AICM" o "aeropuerto" a mano sin elegir
  // sugerencia— o el lugar que Google confirmó como aeropuerto.
  const detectaPickup = isAirportAddress(origin) || (!!airportPlace && origin === airportPlace);
  const detectaDropoff =
    serviceType === "route" &&
    (isAirportAddress(destination) || (!!destAirportPlace && destination === destAirportPlace));

  // La detección MANDA sobre la casilla, nunca al revés. Quien eligió la
  // terminal en el autocompletado no puede desmarcarla para ahorrarse el
  // recargo: la casilla ni siquiera aparece en ese caso. Sólo suma.
  const airportPickup = detectaPickup || manualAirportPickup;
  /** Deja al pasajero en una terminal. No cobra recargo: sólo pide el vuelo. */
  const airportDropoff = detectaDropoff || (serviceType === "route" && manualAirportDropoff);
  /** El viaje toca un aeropuerto por cualquiera de los dos extremos. */
  const airportTrip = airportPickup || airportDropoff;

  const serviceHours = serviceType === "day" ? 10 : rentalHours;
  const maxAllowedKm = serviceType === "route" ? 0 : kmIncluidos(serviceHours);
  const locale = lang === "es" ? "es-MX" : "en-US";

  /**
   * El precio ya no se calcula aquí: se consulta.
   *
   * Por horas y por día sale de las tablas que trae el servidor, que no
   * dependen de la ruta. Un traslado sí depende de la ruta, así que su
   * precio llega junto con los kilómetros en la respuesta de /api/maps y
   * vive en `routePrices` hasta que el visitante cambie el recorrido.
   */
  /** El redondo está activo sólo si la ruta lo admite Y el cliente lo marcó. */
  const redondoActivo = redondo && redondoTabla !== null;
  const escaladeActivo = escalade && category === "suv";

  /** Sólo se pregunta cuando hay algo que preguntar. */
  const huecoAplica = category === "suv" && Boolean(serviceDate) && Boolean(serviceTime);
  useEffect(() => {
    if (!huecoAplica) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/disponibilidad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            category, serviceDate, serviceTime, serviceType, minutes, rentalHours, km,
            redondo: redondoActivo, horasEspera: redondoActivo ? horasEspera : 0, airportPickup,
            escalade: escaladeActivo,
          }),
        });
        const d = await res.json();
        setHueco({ libre: d.libre !== false, sujetoAConfirmacion: Boolean(d.sujetoAConfirmacion) });
      } catch {
        if (!ctrl.signal.aborted) setHueco(null);
      }
    }, 400);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [huecoAplica, category, serviceDate, serviceTime, serviceType, minutes, rentalHours, km, redondoActivo, horasEspera, airportPickup, escaladeActivo]);

  /** La última respuesta, pero sólo mientras siga aplicando. */
  const hueco = huecoAplica ? huecoRespuesta : null;
  const bloqueadoPorAgenda = hueco !== null && !hueco.libre;

  /** Mínimo por horas según la fecha y la categoría (SUV Lux 5 h; 8 h en fechas de evento). */
  const horasMin = horasMinimas(serviceDate, HORAS_MIN, category);

  /** Horas a cobrar por categoría: la tarjeta de SUV Lux enseña su mínimo. */
  const horasPara = (cat: Category) => Math.max(rentalHours, horasMinimas(serviceDate, HORAS_MIN, cat));

  /** Precio con la tarifa de evento aplicada según la fecha. */
  function priceFor(cat: Category) {
    const horas = serviceType === "day" ? 10 : serviceType === "hour" ? horasPara(cat) : undefined;
    return precioConEscalade(precioConEvento(precioBase(cat), cat, serviceDate, horas, origin, serviceTime), cat, escalade);
  }
  function precioBase(cat: Category) {
    if (serviceType === "day") return tablas.dia[cat] ?? 0;
    if (serviceType === "hour") return tablas.horas[horasPara(cat)]?.[cat] ?? 0;
    if (redondoActivo && redondoTabla) {
      // La base ya trae las horas de cortesía; sólo se suman las de encima.
      const extras = Math.max(0, horasEspera - REDONDO_HORAS_CORTESIA);
      return (redondoTabla.base[cat] ?? 0) + extras * (redondoTabla.horaExtra[cat] ?? 0);
    }
    return routePrices?.[cat] ?? 0;
  }
  const price = priceFor(category);

  /**
   * Cómo se llama el servicio en el resumen y en el mensaje de WhatsApp.
   *
   * El redondo tiene que decir su nombre y sus horas en los dos sitios donde
   * el cliente revisa antes de pagar. Rotularlo "Traslado punto a punto"
   * —que es lo que `serviceType` sigue siendo por dentro— le escondería la
   * mitad de lo que está comprando justo en la pantalla de confirmar.
   */
  const labelServicio = redondoActivo
    ? t.rtSummary(horasEspera)
    : lang === "es"
      ? serviceTypeLabelEs(serviceType, rentalHours)
      : serviceTypeLabel(serviceType, rentalHours);

  const summaryRows: Array<[string, string]> = lang === "es"
    ? [
        [t.stServiceType, labelServicio],
        ...(serviceType !== "route" ? [[t.stIncludedKm, `${maxAllowedKm} km`] as [string, string]] : []),
        [t.stDateTime, formatDateTime(serviceDate, serviceTime, locale)],
        [t.stPickup, origin || "—"],
        [t.stDestination, serviceType === "route" ? (destination || "—") : t.stOpenItinerary],
        [t.stVehicle, escaladeActivo ? t.escVehicle : vehicles[category].name],
        serviceType === "route"
          ? [t.stDistance, `${km} km · ${minutes} min`]
          : [t.stDuration, serviceTypeLabelEs(serviceType, rentalHours)],
      ]
    : [
        [t.stServiceType, labelServicio],
        ...(serviceType !== "route" ? [[t.stIncludedKm, `${maxAllowedKm} km`] as [string, string]] : []),
        [t.stDateTime, formatDateTime(serviceDate, serviceTime, locale)],
        [t.stPickup, origin || "—"],
        [t.stDestination, serviceType === "route" ? (destination || "—") : t.stOpenItinerary],
        [t.stVehicle, escaladeActivo ? t.escVehicle : vehicles[category].name],
        serviceType === "route"
          ? [t.stDistance, `${km} km · ${minutes} min`]
          : [t.stDuration, serviceTypeLabel(serviceType, rentalHours)],
      ];

  function goStep(n: number) {
    // El precio con IVA sólo está delante del visitante en el paso 3; ahí es
    // donde se decide, y por eso es el paso que interesa contar.
    if (n === 3) {
      track("precio_mostrado", {
        tipo_servicio: serviceType,
        categoria: category,
        value: price,
        currency: "MXN",
      });
    }
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  // El precio se borra junto con la ruta: si se quedara, el visitante podría
  // ver el importe del recorrido anterior mientras edita el nuevo.
  /**
   * INVIERTE ORIGEN Y DESTINO.
   *
   * Lo pidió el dueño el 3 de octubre de 2026: quien acaba de cotizar la ida
   * casi siempre quiere la vuelta, y hasta hoy tenía que volver a escribir las
   * dos direcciones a mano, con el autocompletado de Google de por medio.
   *
   * NO INTERCAMBIA SÓLO EL TEXTO, y aquí está lo que importa. Cada extremo
   * arrastra su estado de aeropuerto: el lugar que Google confirmó como
   * terminal y la casilla que el cliente marcó a mano. Si sólo se cambiaran
   * las cadenas, un AICM → Polanco invertido seguiría creyendo que el ORIGEN
   * es el aeropuerto, y le cobraría al cliente el recargo de estacionamiento y
   * espera —hasta $600 con IVA— por un viaje que va HACIA la terminal y no
   * sale de ella. El recargo cubre esperar al pasajero que aterriza; en el
   * sentido contrario no existe.
   *
   * También se intercambian las casillas manuales por el mismo motivo: son las
   * que el cliente marca cuando escribió la ciudad en lugar de la terminal.
   */
  function invertirDirecciones() {
    setOrigin(destination);
    setDestination(origin);
    setAirportPlace(destAirportPlace);
    setDestAirportPlace(airportPlace);
    setManualAirportPickup(manualAirportDropoff);
    setManualAirportDropoff(manualAirportPickup);
  }

  function goBackToStep1() {
    setKm(0); setMinutes(0); setZone("cdmx"); setRoutePrices(null);
    setRedondoTabla(null); setRedondo(false); setHorasEspera(REDONDO_HORAS_CORTESIA);
    goStep(1);
  }

  function onOriginChanged() {
    const place = originRef.current?.getPlace();
    const address = place?.formatted_address || place?.name;
    if (!address) return;
    setOrigin(address);
    setAirportPlace(isAirportPlace(place, address) ? address : "");
  }
  function onDestinationChanged() {
    const place = destinationRef.current?.getPlace();
    const address = place?.formatted_address;
    if (!address) return;
    setDestination(address);
    setDestAirportPlace(isAirportPlace(place, address) ? address : "");
  }

  async function validateStep1() {
    if (!origin) { setAlert1(t.alertOrigin); return; }
    if (serviceType === "route" && !destination) { setAlert1(t.alertDest); return; }
    if (!serviceDate || !serviceTime) { setAlert1(t.alertDateTime); return; }
    if (serviceType === "hour" && rentalHours < horasMin) { setAlert1(t.alertMinHours(horasMin)); return; }

    const svc = new Date(`${serviceDate}T${serviceTime}`);
    const diff = (svc.getTime() - Date.now()) / 3600000;
    if (diff <= 0) { setAlert1(t.alertPast); return; }
    if (diff < MIN_ADVANCE_HOURS) { setAlert1(t.alertAdvance); return; }
    if (categoriaBloqueada(category, serviceDate)) { setAlert1(t.alertBloqueada(vehicles[category].name)); return; }

    setAlert1("");
    setLoading(true);
    try {
      // Por horas se mide la recogida contra el centro: sólo aplica en CDMX.
      const dest = serviceType === "route" ? destination : CENTRO_CDMX;
      const res = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination: dest, airportPickup, airportDropoff }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAlert1(res.status === 429 ? t.alertTooManyReq : t.alertRouteErr);
        return;
      }

      const routeKm = Number(data.km.toFixed(1));
      if (serviceType !== "route" && !dentroDeZonaPorHoras(routeKm)) {
        setAlert1(t.alertFueraCdmx);
        return;
      }

      setKm(routeKm);
      setMinutes(Number(data.minutes));
      setZone(detectZone(data.km));
      setRoutePrices(data.prices ?? null);
      // Cada ruta nueva reinicia el redondo. Dejar marcada la casilla de una
      // cotización anterior encendería un servicio que esta ruta puede ni
      // siquiera admitir, y el precio en pantalla dejaría de ser el suyo.
      setRedondoTabla(data.redondo ?? null);
      setRedondo(false);
      setHorasEspera(REDONDO_HORAS_CORTESIA);
      track("ruta_completada", {
        tipo_servicio: serviceType,
        km: routeKm,
        minutos: Number(data.minutes),
        desde_aeropuerto: airportPickup,
      });
      goStep(2);
    } catch {
      setAlert1(t.alertConnErr);
    } finally {
      setLoading(false);
    }
  }

  function buildWhatsAppMessage() {
    // `null` = renglón que no aplica y se quita; `""` = renglón en blanco que
    // separa bloques y se conserva. Antes los dos eran "" y el filtro se
    // llevaba también los separadores, así que el mensaje llegaba en un solo
    // párrafo apelmazado.
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
      `Tipo: ${redondoActivo ? `Viaje redondo foráneo · ${horasEspera} h de espera` : serviceTypeLabelEs(serviceType, rentalHours)}`,
      serviceType !== "route" ? `Kilómetros incluidos: ${maxAllowedKm} km` : null,
      `Fecha: ${formatDateTime(serviceDate, serviceTime, "es-MX")}`,
      `Origen: ${origin}`,
      `Destino: ${serviceType === "route" ? destination : "Disposición libre"}`,
      "",
      "*Detalles*",
      `Vehículo: ${escaladeActivo ? "SUV Lux · Cadillac Escalade 2027 garantizada" : vehicles[category].name}`,
      serviceType === "route"
        ? `Distancia: ${km} km / ${minutes} min`
        : `Duración: ${serviceTypeLabelEs(serviceType, rentalHours)}`,
      airportPickup ? "✈️ Salida desde aeropuerto — cargo por estacionamiento y espera incluido" : null,
      airportTrip && flightNumber.trim() ? `✈️ Vuelo: ${flightNumber.trim().toUpperCase()}` : null,
      airportTrip ? `👥 ${pasajeros} ${pasajeros === 1 ? "pasajero" : "pasajeros"} · ${maletas} ${maletas === 1 ? "maleta" : "maletas"}` : null,
      // Junto al resto del servicio y no al final: es parte de lo que hay
      // que preparar, no una posdata.
      notes.trim() ? `*Solicitudes del cliente:* ${notes.trim()}` : null,
      "",
      `*💰 Total estimado con IVA: $${price.toLocaleString("es-MX")} MXN*`,
      "",
      "_Solicito confirmación de disponibilidad._",
      "━━━━━━━━━━━━━━━━━━━━━━",
    ].filter((linea) => linea !== null).join("\n");
  }

  function handleWhatsApp(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (!fullName.trim()) { setAlert3(t.alertName); return; }
    if (!phone) { setAlert3(t.alertPhone); return; }
    if (!isValidPhoneNumber(phone)) { setAlert3(t.alertPhoneInvalid); return; }
    if (airportTrip && !esVueloValido(flightNumber)) { setAlert3(t.alertFlight); return; }
    if (airportTrip) { const m = avisoCapacidad(); if (m) { setAlert3(m); return; } }
    if (price === 0) { setAlert3(t.alertPriceErr); return; }
    setAlert3("");
    // Después de las validaciones: un clic que sólo enseñó "falta el nombre"
    // no es una salida a WhatsApp, y contarlo inflaría el canal.
    track("clic_whatsapp", {
      tipo_servicio: serviceType,
      categoria: category,
      value: price,
      currency: "MXN",
      con_solicitudes: notes.trim().length > 0,
    });
    // Se guarda la solicitud para darle seguimiento aunque el cliente no
    // llegue a mandar el mensaje. Sin await: window.open tiene que salir en
    // este mismo clic o el navegador lo bloquea como ventana emergente, y
    // keepalive deja terminar la petición aunque la pestaña pierda el foco.
    // Si falla, WhatsApp se abre igual.
    fetch("/api/solicitud-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        serviceType, rentalHours, origin, destination, serviceDate, serviceTime, notes,
        km, minutes, zone, category, fullName, phone, price, lang,
        flightNumber: airportTrip ? flightNumber.trim().toUpperCase() : "",
        ...(airportTrip ? { pasajeros } : {}),
      }),
    }).catch(() => {});
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`,
      "_blank", "noopener,noreferrer"
    );
  }

  async function handleCheckout() {
    if (!fullName.trim()) { setAlert3(t.alertName); return; }
    if (!phone) { setAlert3(t.alertPhone); return; }
    if (!isValidPhoneNumber(phone)) { setAlert3(t.alertPhoneInvalid); return; }
    if (airportTrip && !esVueloValido(flightNumber)) { setAlert3(t.alertFlight); return; }
    if (airportTrip) { const m = avisoCapacidad(); if (m) { setAlert3(m); return; } }
    if (price === 0) { setAlert3(t.alertPriceErr); return; }

    setAlert3("");
    track("pago_iniciado", {
      tipo_servicio: serviceType,
      categoria: category,
      value: price,
      currency: "MXN",
      con_solicitudes: notes.trim().length > 0,
    });
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType, rentalHours, origin, destination, serviceDate, serviceTime, notes,
          km, minutes, zone, category, fullName, phone, airportPickup, lang,
          airportDropoff,
          // La identidad que GA4 ya le puso a este navegador. Viaja hasta la
          // metadata de Stripe para que el webhook pueda mandar la conversión
          // atribuida al recorrido real. Si no hay cookie va null y la venta
          // se cuenta igual, sólo que sin origen.
          ...(() => { const g = identidadGa(); return g ? { gaClientId: g.clientId, gaSessionId: g.sessionId } : {}; })(),
          // Sólo si el viaje lo necesita: un vuelo escrito y luego
          // abandonado al cambiar de destino no debe colarse en el aviso
          // del equipo ni en la metadata de la reserva.
          flightNumber: airportTrip ? flightNumber.trim().toUpperCase() : "",
          ...(airportTrip ? { pasajeros, maletas } : {}),
          // Se manda lo que de verdad está activo, no lo que quedó en el
          // estado: `redondoActivo` ya exige que la ruta lo admita. El
          // servidor lo vuelve a comprobar contra sus propios kilómetros y
          // rechaza la reserva si no cuadra.
          redondo: redondoActivo,
          horasEspera: redondoActivo ? horasEspera : undefined,
          escalade: escaladeActivo,
        }),
      });
      const data = await res.json();
      // SIN UNIDADES. No es un error que el cliente pueda corregir en el
      // formulario, así que no va al mismo sitio que los demás: abre el
      // aviso con salida a WhatsApp. Ver lib/agenda.ts.
      if (res.status === 409 && data.whatsapp) {
        setSinUnidades(true);
        track("clic_whatsapp", { origen: "sin_unidades", categoria: category });
        return;
      }
      if (!res.ok || !data.url) {
        setAlert3(data.error || t.alertCheckoutErr);
        return;
      }
      // location.assign en vez de asignar location.href: el compilador de
      // React marca la asignación directa como mutación de un valor externo.
      window.location.assign(data.url);
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
          <header className="er-topbar">
            <nav className="er-nav" aria-label="Elite Route">
              <a href={path(lang, "home")} className="er-brand" aria-label="Elite Route">
                <BrandMark size={19} compact={15} />
              </a>
              <ul className="er-nav-links" id="er-menu" data-open={menuAbierto ? "1" : "0"} onClick={() => setMenuAbierto(false)}>
                <li><a href={path(lang, "executive")}>{t.navServices}</a></li>
                <li><a href="#rutas">{t.navRoutes}</a></li>
                <li><a href="#flota">{t.navFleet}</a></li>
                <li><a href={corporate}>{t.navCompanies}</a></li>
                <li><a href={path(lang, "about")}>{t.navAbout}</a></li>
                <li><a href="#contacto">{t.contact}</a></li>
              </ul>
              <div className="er-nav-right">
                <a className="er-nav-tel" href={`tel:${LEGAL.telefonoTel}`} aria-label={t.navCall}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>
                  <span className="er-nav-tel-num">{LEGAL.telefono}</span>
                </a>
                <LangToggle lang={lang} page="home" />
                <a className="er-nav-cta" href="#quote" onClick={() => setStep(1)}>{t.navQuote}</a>
                <button type="button" className="er-nav-burger" aria-expanded={menuAbierto} aria-controls="er-menu" aria-label={t.navMenu} onClick={() => setMenuAbierto((v) => !v)}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">{menuAbierto ? <path d="M6 6l12 12M18 6 6 18"/> : <path d="M4 7h16M4 12h16M4 17h16"/>}</svg>
                </button>
              </div>
            </nav>
          </header>

          <section className="er-hero">

            <div className="er-hero-inner">
              <div className="er-hero-lede">
                {/* El H1 dice lo que la gente busca; el lema conserva su
                    tamaño y su peso, pero deja de ser el encabezado. La
                    portada decía "Movemos tu nivel" como H1: buena frase,
                    nula para búsqueda, y la línea de arriba no decía más que
                    el nombre de la empresa, que ya está en el logotipo. */}
                <h1 className="er-kicker er-hero-h1">{t.kicker}</h1>
                <p className="er-hero-title">We move your level.</p>
                <p className="er-hero-copy">{t.heroCopy}</p>
                <a className="er-hero-reviews" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
                  <span className="er-hero-stars" aria-hidden="true">★★★★★</span>
                  <span><strong>{GOOGLE_RATING}</strong> · {t.reviewsCount(GOOGLE_REVIEW_COUNT)}</span>
                  <span aria-hidden="true">→</span>
                </a>
                {/* WhatsApp sigue a un toque (69 % de las reservas pagadas se
                    cotizan por ahí), pero discreto: el cotizador manda. */}
                <a
                  className="er-hero-wa"
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("clic_whatsapp", { origen: "hero" })}
                >
                  {t.heroBtnTalk}
                </a>
              </div>

              {/* La SUV protagonista: en escritorio es el fondo central del
                  hero; en el teléfono, un bloque propio bajo el texto. */}
              <div className="er-hero-photo" aria-hidden="true" />

              <ul className="er-strip" aria-label={t.stripAria}>
                {t.strip.map((txt, i) => (
                  <li key={txt} className="er-strip-item">
                    <span className="er-strip-icon" aria-hidden="true">{STRIP_ICONS[i]}</span>
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>

              <div className="er-booking-card" id="quote">
                <h2 className="er-booking-title">{t.getQuote}</h2>

                {/* El sello va aquí, donde el cliente empieza a dar sus datos:
                    la mención a Stripe del paso 3 llegaba demasiado tarde. */}
                <p className="er-trust-line">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A46B" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>{t.trustPay}</span>
                  <span className="er-stripe-mark">stripe</span>
                  <span className="er-cardmarks">
                    <span className="er-cardmark">VISA</span>
                    <span className="er-cardmark">MASTERCARD</span>
                    <span className="er-cardmark">AMEX</span>
                  </span>
                </p>

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
                  onClick={() => { setServiceType(val as ServiceType); if(val==="hour") setRentalHours(horasMin); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={d}/>
                  </svg>
                  {label}
                </button>
              ))}
            </div>

            {serviceType !== "route" && (
              <p className="er-zone-legend" role="note">{LEYENDA_POR_HORAS[lang]}</p>
            )}

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
                    onClick={() => setRentalHours(h => Math.max(horasMin, h-1))}>−</button>
                  <div className="er-hr-count" role="status" aria-atomic="true">{rentalHours}</div>
                  <div className="er-hr-unit">{t.hours}</div>
                  <button type="button" className="er-hr-btn" aria-label={t.increaseHours}
                    onClick={() => setRentalHours(h => Math.min(24, h+1))}>+</button>
                </div>
              </div>
            )}

            <div className="er-field">
              <label className="er-label" htmlFor="origin-input">{t.pickup}</label>
              <div className="er-input-wrap">
                <input id="origin-input" ref={originInputRef} className="er-input er-input--clearable"
                  placeholder={t.pickupPlaceholder} value={origin}
                  onFocus={() => attachAutocomplete(originInputRef.current, originRef, onOriginChanged)}
                  onChange={(e) => { setOrigin(e.target.value); marcarIntencion(); }}/>
                {origin && (
                  <button type="button" className="er-input-clear" aria-label={lang === "es" ? "Borrar dirección" : "Clear address"}
                    onClick={() => setOrigin("")}>×</button>
                )}
              </div>
            </div>

            {/* Va ENTRE los dos campos, que es donde se entiende sin leerlo:
                una flecha doble entre "de dónde" y "a dónde" sólo puede
                significar una cosa. Sale de la rejilla hacia la derecha para
                no empujar las etiquetas. */}
            {serviceType === "route" && (origin || destination) && (
              <div className="er-swap-row">
                <button type="button" className="er-swap" onClick={invertirDirecciones}
                  aria-label={t.swapAria} title={t.swapAria}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                  </svg>
                  <span>{t.swap}</span>
                </button>
              </div>
            )}

            {serviceType === "route" && (
              <div className="er-field">
                <label className="er-label" htmlFor="destination-input">{t.destination}</label>
                <div className="er-input-wrap">
                  <input id="destination-input" ref={destinationInputRef} className="er-input er-input--clearable"
                    placeholder={t.destinationPlaceholder} value={destination}
                    onFocus={() => attachAutocomplete(destinationInputRef.current, destinationRef, onDestinationChanged)}
                    onChange={(e) => setDestination(e.target.value)}/>
                  {destination && (
                    <button type="button" className="er-input-clear" aria-label={lang === "es" ? "Borrar destino" : "Clear destination"}
                      onClick={() => setDestination("")}>×</button>
                  )}
                </div>
              </div>
            )}

            {/*
              La pregunta va AQUÍ, en el paso 1, porque cambia el precio: el
              recargo se calcula en /api/maps junto con los kilómetros, antes
              de enseñar las tarifas del paso 2. Ponerla más adelante obligaría
              a recalcular con el importe ya en pantalla.

              Cada casilla se esconde en cuanto la dirección de ese extremo ya
              delata el aeropuerto: repetir la pregunta a quien eligió la
              terminal en el autocompletado sólo invita a desmarcarla.
            */}
            {(!detectaPickup || (serviceType === "route" && !detectaDropoff)) && (
              <div className="er-airport-ask">
                <p className="er-airport-ask-q">{t.airportAsk}</p>
                {!detectaPickup && (
                  <label className="er-check">
                    <input type="checkbox" checked={manualAirportPickup}
                      onChange={(e) => setManualAirportPickup(e.target.checked)}/>
                    {/*
                      Aquí NO va el aviso del recargo, a propósito. Decirle al
                      cliente "marcar esto te sube la tarifa" justo al lado de
                      la casilla invita a no marcarla, y entonces la pregunta
                      no sirve para nada: volvemos al hueco que vino a cerrar.

                      No es un cargo oculto. El recargo se explica con todas
                      sus letras en `airportNote` —estacionamiento y espera por
                      retraso de vuelo— en los pasos 2 y 3, al lado del importe
                      y antes de que nadie pague.
                    */}
                    <span>{t.airportAskFrom}</span>
                  </label>
                )}
                {serviceType === "route" && !detectaDropoff && (
                  <label className="er-check">
                    <input type="checkbox" checked={manualAirportDropoff}
                      onChange={(e) => setManualAirportDropoff(e.target.checked)}/>
                    <span>{t.airportAskTo}</span>
                  </label>
                )}
                <p className="er-airport-ask-help">{t.airportAskHelp}</p>
              </div>
            )}

            <div className="er-row er-row--fecha">
              <div className="er-field">
                <label className="er-label" htmlFor="service-date-input">{t.date}</label>
                <input id="service-date-input" className="er-input" type="date" min={getMinDate()}
                  value={serviceDate} onChange={(e) => { setServiceDate(e.target.value); setRentalHours((h) => Math.max(h, horasMinimas(e.target.value, HORAS_MIN, category))); }}/>
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
                onChange={(e) => { const c = e.target.value as Category; setCategory(c); setRentalHours((h) => Math.max(h, horasMinimas(serviceDate, HORAS_MIN, c))); }}
              >
                {DISPLAY_ORDER.map((cat) => (
                  <option key={cat} value={cat} disabled={categoriaBloqueada(cat, serviceDate)}>
                    {vehicles[cat].name} · {categoriaBloqueada(cat, serviceDate) ? t.notAvailable : capFor(cat)}
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
                    {serviceType === "route" ? km : maxAllowedKm}
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


            {/*
              EL VIAJE REDONDO VA AQUÍ, EN EL PASO 2, y no junto a la pregunta
              de aeropuerto del paso 1 por una razón dura: en el paso 1 el
              cotizador todavía no sabe la distancia. Los kilómetros los mide
              /api/maps al pasar al paso 2, y son ellos —no el texto que el
              cliente escribió— los que deciden si esta ruta es foránea.
              Ofrecerlo antes obligaría a adivinar el destino por su nombre.

              Puesto arriba de las tarjetas, además, marcar la casilla cambia
              los cuatro precios a la vista: el cliente compara el redondo en
              las cuatro categorías de un vistazo, sin volver a cotizar.
            */}
            {redondoTabla && (
              <div className="er-rt">
                <p className="er-rt-q">{t.rtTitle}</p>
                <label className="er-rt-check">
                  <input type="checkbox" checked={redondo}
                    onChange={(e) => {
                      setRedondo(e.target.checked);
                      setHorasEspera(REDONDO_HORAS_CORTESIA);
                      if (e.target.checked) track("redondo_marcado", { km, categoria: category });
                    }}/>
                  <span>{t.rtLabel}</span>
                </label>
                <p className="er-rt-help">{t.rtHelp(REDONDO_HORAS_CORTESIA)}</p>

                {redondo && (
                  <>
                    <div className="er-rt-wait">
                      <div>
                        <div className="er-rt-wait-lbl" id="rt-hours-label">{t.rtWait}</div>
                        <div className="er-rt-wait-note">
                          {horasEspera <= REDONDO_HORAS_CORTESIA
                            ? t.rtIncluded(REDONDO_HORAS_CORTESIA)
                            : t.rtExtra(
                                horasEspera - REDONDO_HORAS_CORTESIA,
                                `$${(redondoTabla.horaExtra[category] ?? 0).toLocaleString("es-MX")}`,
                              )}
                        </div>
                      </div>
                      <div className="er-hours-selector" role="group" aria-labelledby="rt-hours-label">
                        <button type="button" className="er-hr-btn" aria-label={t.rtDecrease}
                          onClick={() => setHorasEspera((h) => Math.max(REDONDO_HORAS_CORTESIA, h - 1))}>−</button>
                        <div className="er-hr-count" role="status" aria-atomic="true">{horasEspera}</div>
                        <div className="er-hr-unit">{t.rtHours}</div>
                        <button type="button" className="er-hr-btn" aria-label={t.rtIncrease}
                          onClick={() => setHorasEspera((h) => Math.min(REDONDO_HORAS_MAX, h + 1))}>+</button>
                      </div>
                    </div>
                    {horasEspera >= REDONDO_HORAS_MAX && (
                      <p className="er-rt-max">{t.rtMax(REDONDO_HORAS_MAX)}</p>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="er-vehicles">
              {DISPLAY_ORDER.map((cat) => {
                const p = priceFor(cat);
                const bloqueada = categoriaBloqueada(cat, serviceDate);
                return (
                  <button key={cat} type="button" disabled={bloqueada}
                    className={`er-vehicle${category===cat?" selected":""}${bloqueada?" blocked":""}`}
                    onClick={() => {
                      setCategory(cat);
                      setRentalHours((h) => Math.max(h, horasMinimas(serviceDate, HORAS_MIN, cat)));
                      track("vehiculo_seleccionado", { categoria: cat, value: p, currency: "MXN" });
                      setSinUnidades(false);
                    }}>
                    <div className="er-vehicle-bg"
                      style={{ backgroundImage:`url(${vehicleImages[cat]})` }}/>
                    <div className="er-vehicle-overlay"/>
                    <div className="er-vehicle-content">
                      <div className="er-vehicle-name">{vehicles[cat].name}</div>
                      <div className="er-vehicle-tag">{vehicles[cat].tag}</div>
                      <div className="er-vehicle-cap">{capFor(cat)}</div>
                      {noteFor(cat) && <div className="er-vehicle-cap">{noteFor(cat)}</div>}
                      {bloqueada && <div className="er-vehicle-cap">{t.notAvailable}</div>}
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

            <p className="er-bycat">{t.byCategory}</p>

            {category === "suv" && !categoriaBloqueada("suv", serviceDate) && (
              <div className="er-rt">
                <label className="er-rt-check">
                  <input type="checkbox" checked={escalade}
                    onChange={(e) => {
                      setEscalade(e.target.checked);
                      setSinUnidades(false);
                      if (e.target.checked) track("vehiculo_seleccionado", { categoria: "suv_escalade" });
                    }}/>
                  <span>{t.escLabel}</span>
                </label>
                <p className="er-rt-help">{t.escHelp(Math.round(ESCALADE_PRIMA * 100))}</p>
              </div>
            )}

            {bloqueadoPorAgenda && (
              <div className="er-sinunidades" role="alert">
                <a
                  className="er-sinunidades-btn"
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.sinUnidadesCta}
                </a>
              </div>
            )}

            {airportPickup && <p className="er-airport-note">{t.airportNote}</p>}

            <button className="er-btn-primary" onClick={() => goStep(3)} type="button" disabled={bloqueadoPorAgenda}>
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
                  value={phone} onChange={setPhone} placeholder={lang === "es" ? "Tu número a 10 dígitos" : "Your phone number"}/>
              </div>
            </div>

            {/* El número de vuelo. Aparece SÓLO si el viaje toca un
                aeropuerto por cualquiera de los dos extremos, y entonces es
                obligatorio: sin él no se puede monitorear el vuelo, que es
                justo lo que el sitio promete en el hero, en el FAQ y en las
                dieciséis páginas de ruta.

                Marco dorado y no un campo más: el visitante llega aquí con
                el precio delante y la tarjeta en la mano, y un campo nuevo
                que parece opcional se salta. La ayuda cambia según el
                sentido —llegada o salida— porque el motivo es distinto. */}
            {/* SIN UNIDADES EN ESTA CATEGORÍA. Aparece cuando el servidor
                contesta 409: el horario ya está apartado para una categoría
                de flota limitada. No es un callejón sin salida —la agenda
                sólo ve las reservas del sitio y puede equivocarse—, así que
                lo único que ofrece es seguir por WhatsApp, que es donde el
                equipo puede comprobar la disponibilidad de verdad. */}
            {(sinUnidades || bloqueadoPorAgenda) && (
              <div className="er-sinunidades" role="alert">
                <a
                  className="er-sinunidades-btn"
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.sinUnidadesCta}
                </a>
              </div>
            )}

            {airportTrip && (
              <div className="er-field er-flight" style={{ marginBottom: 20 }}>
                <label className="er-label" htmlFor="flight-input">
                  {t.flight} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="flight-input"
                  className="er-input"
                  placeholder={t.flightPh}
                  value={flightNumber}
                  maxLength={VUELO_MAX}
                  required
                  autoComplete="off"
                  aria-describedby="flight-help"
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                />
                <p id="flight-help" className="er-flight-help">
                  {airportPickup ? t.flightHelpFrom : t.flightHelpTo}
                </p>

                {/* PASAJEROS Y MALETAS. Sólo aquí, en traslados de
                    aeropuerto: es donde el chofer necesita saberlo antes de
                    salir, y donde el 88 % del volumen son recogidas en
                    terminal. En un traslado urbano el dato no cambia nada y
                    preguntarlo sería fricción sin motivo.

                    SE OFRECEN HASTA 6 EN LAS DOS LISTAS AUNQUE LA CATEGORÍA
                    ELEGIDA NO LOS ADMITA, a propósito. Recortar las opciones
                    escondería que existe una categoría más grande; dejarlas y
                    avisar convierte un "no cabe" en "elige SUV Urban". El
                    aviso nombra las categorías que sí caben. */}
                <div className="er-paxbags">
                  <div className="er-field">
                    <label className="er-label" htmlFor="pax-input">{t.pax}</label>
                    <select
                      id="pax-input"
                      className="er-input"
                      value={pasajeros}
                      onChange={(e) => setPasajeros(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="er-field">
                    <label className="er-label" htmlFor="bags-input">{t.bags}</label>
                    <select
                      id="bags-input"
                      className="er-input"
                      value={maletas}
                      onChange={(e) => setMaletas(Number(e.target.value))}
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="er-flight-help">{t.paxBagsHelp}</p>
              </div>
            )}

            {/* Solicitudes extra. Va antes del resumen y del pago porque es
                parte de lo que se está reservando, no un añadido posterior:
                quien necesita silla de bebé quiere decirlo ANTES de dar la
                tarjeta. El texto viaja con la reserva hasta el aviso que
                recibe el chofer. */}
            <div className="er-field" style={{ marginBottom: 20 }}>
              <label className="er-label" htmlFor="notes-input">{t.notes}</label>
              <textarea
                id="notes-input"
                className="er-textarea"
                placeholder={t.notesPlaceholder}
                value={notes}
                maxLength={NOTAS_MAX}
                rows={3}
                onChange={(e) => setNotes(e.target.value)}
                aria-describedby="notes-help"
              />
              <div className="er-notes-foot">
                {/* El aviso no es adorno: sin él, escribir "necesito dos
                    paradas" se lee como incluido en el precio fijo que está
                    justo debajo. */}
                <span id="notes-help" className="er-notes-help">{t.notesHelp}</span>
                <span
                  className={`er-notes-count${notes.length >= NOTAS_MAX ? " full" : ""}`}
                  aria-live="polite"
                >
                  {notes.length}/{NOTAS_MAX}
                </span>
              </div>
            </div>

            {/* La categoría elegida, con foto propia, justo antes del total:
                quien paga ve qué tipo de unidad compra y que el modelo
                concreto se asigna según disponibilidad. */}
            <div className="er-pick">
              <img src={vehicleThumbs[category]} alt="" width={120} height={68} loading="lazy" decoding="async" />
              <div>
                <div className="er-pick-name">{vehicles[category].name}</div>
                <div className="er-pick-tag">{vehicles[category].tag}</div>
                <div className="er-pick-cap">{capFor(category)}</div>
                {noteFor(category) && <div className="er-pick-cap">{noteFor(category)}</div>}
              </div>
            </div>
            <p className="er-bycat" style={{ margin: "-10px 0 16px" }}>{t.byCategory}</p>

            <div className="er-summary">
              {summaryRows.map(([k,v]) => (
                <div className="er-summary-row" key={k}>
                  <span className="er-summary-key">{k}</span>
                  <span className="er-summary-val">{v}</span>
                </div>
              ))}
              <div className="er-summary-row">
                <span className="er-summary-key" style={{ color:"#b8b8b8", fontWeight:600 }}>{t.totalVat}</span>
                <span className="er-summary-val er-summary-total">${price.toLocaleString("es-MX")} MXN</span>
              </div>
            </div>

            {airportPickup && <p className="er-airport-note">{t.airportNote}</p>}

            {/* CONDICIONES, en corto y antes de cobrar. Sólo lo publicado
                en /terminos y lib/service-limits.ts: si cambia una política,
                cambia allá y aquí. */}
            <div className="er-cond">
              <p className="er-cond-title">{t.condTitle}</p>
              <ul>
                <li>{t.condWait}</li>
                <li>
                  {serviceType === "route"
                    ? t.condRoute
                    : t.condHourly(serviceType === "day" ? HORAS_DIA_COMPLETO : rentalHours)}
                </li>
                <li>{t.condCancel}</li>
                <li>{t.condExtras}</li>
              </ul>
              <a href={path(lang, "terms")} target="_blank" rel="noopener noreferrer">{t.condTerms} →</a>
            </div>

            {/* CONFIANZA junto al botón. La calificación y el número salen
                de lib/social-proof.ts —una sola fuente— y enlazan a la ficha
                real para que cualquiera lo compruebe. Nada de cifras nuevas. */}
            <div className="er-trust" aria-label={t.trustTitle}>
              <a className="er-trust-item" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
                <strong>{t.trustGoogle(GOOGLE_RATING)}</strong>
                <span>{t.trustGoogleSub(GOOGLE_REVIEW_COUNT)}</span>
              </a>
              <div className="er-trust-item">
                <strong>{t.trustStripe}</strong>
                <span>{t.trustStripeSub}</span>
              </div>
              <div className="er-trust-item">
                <strong>{t.trustInsured}</strong>
                <span>{t.trustInsuredSub}</span>
              </div>
              <div className="er-trust-item">
                <strong>{t.trustDirect}</strong>
                <span>{t.trustDirectSub}</span>
              </div>
            </div>

            {alert3 && <div className="er-alert er-alert-err">{alert3}</div>}

            {/*
              SÓLO EN INGLÉS, y a propósito.

              Stripe tiene Adaptive Pricing activo y convierte a la moneda
              local de unos 130 países. Para quien paga desde México no cambia
              nada —peso a peso—, así que el aviso sería ruido. Para quien mira
              "$4,851" desde Londres o Nueva York resuelve dos dudas a la vez y
              justo en el peor momento para tenerlas: tener que convertir de
              cabeza, y temerle al tipo de cambio de su banco.

              Está redactado para ser cierto en los dos casos: si el visitante
              está en México, su moneda ES el peso.
            */}
            {lang === "en" && <p className="er-currency-note">{t.currencyNote}</p>}

            <button className="er-btn-primary" onClick={handleCheckout} disabled={paymentLoading || bloqueadoPorAgenda} type="button">
              {paymentLoading ? t.payLoading : t.payBtn}
            </button>

            {/* La salida para quien no quiere dejar la tarjeta todavía.
                Deliberadamente un enlace y no un botón: el pago con precio
                fijo es lo que distingue a Elite Route y tiene que seguir
                mandando en la pantalla. Dos botones del mismo peso reparten
                la atención y le quitan fuerza al principal.

                Hace falta aquí porque el botón flotante de WhatsApp se
                esconde justo cuando el cotizador está a la vista, así que en
                este paso —con el precio delante y la decisión encima— no
                había ninguna alternativa a pagar o irse.

                El mensaje va armado con la cotización entera: nombre, fecha,
                ruta, vehículo, precio y las solicitudes extra. El botón
                flotante manda "Hola, quisiera cotizar un traslado" y nada
                más, y obliga a preguntarlo todo otra vez. */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              onClick={handleWhatsApp}
              className="er-wa-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.118 1.528 5.845L.057 23.486a.5.5 0 0 0 .614.614l5.588-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.513-5.187-1.408l-.37-.222-3.844 1.007 1.03-3.76-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              {t.whatsappBtn}
            </a>

            {/* Qué pasa después de pagar: pago recibido no es servicio
                confirmado. Ver lib/booking-status.ts. */}
            <div className="er-paysteps">
              <p className="er-cond-title">{t.payStepsTitle}</p>
              <ol>
                {t.paySteps.map(([titulo, detalle]) => (
                  <li key={titulo}><strong>{titulo}.</strong> {detalle}</li>
                ))}
              </ol>
            </div>

            <div className="er-legal">{t.legal2}</div>

            <button className="er-btn-secondary" style={{ marginTop:16 }} onClick={() => goStep(2)} type="button">
              {t.modifyVehicle}
            </button>
          </div>
              </div>

            </div>
          </section>

          <main className="er-main">
            {/* CATÁLOGO. Fotos actuales de la flota, recortadas sobre un fondo
                neutro (#24292D). Mismo tamaño de tarjeta para todas; sólo la
                categoría elegida en el cotizador lleva la línea dorada. Tocar
                una tarjeta la elige en el cotizador y lleva a él. En el
                teléfono es un carrusel con la siguiente tarjeta asomada. */}
            <section className="er-fleet" id="flota" aria-labelledby="flota-title">
              <p className="er-sec-kicker">{t.fleetKicker}</p>
              <h2 className="er-sec-title" id="flota-title">{t.fleetTitle}</h2>
              <p className="er-sec-copy">{t.fleetCopy}</p>
              <ul className="er-cat-row">
                {CATALOG_ORDER.map((k) => (
                  <li key={k}>
                    <button
                      type="button"
                      className={`er-cat${category === k ? " is-selected" : ""}`}
                      aria-pressed={category === k}
                      onClick={() => { setCategory(k); setRentalHours((h) => Math.max(h, horasMinimas(serviceDate, HORAS_MIN, k))); document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" }); }}
                    >
                      <img
                        src={`/flota/${k === "suv" ? "high-suv" : k}.webp`}
                        alt={t.fleetAlt(vehicles[k].name)}
                        width={1400}
                        height={788}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="er-cat-body">
                        <span className="er-cat-name">{vehicles[k].name}</span>
                        <span className="er-cat-tag">{vehicles[k].tag}</span>
                        <span className="er-cat-specs">
                          <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>{CAPACIDAD[k].pax} {t.catPax}</span>
                          <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 7V4h6v3M9 20v1M15 20v1"/></svg>{CAPACIDAD[k].maletas} {t.catBags}</span>
                        </span>
                        <span className="er-cat-cta">{category === k ? t.catSelected : t.catSelect}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="er-bycat" style={{ textAlign: "left", marginTop: 18 }}>{t.byCategory}</p>
            </section>

            {/* Corporativo: presentación breve con acceso a /b2b o /corporate. */}
            <section className="er-corp" aria-labelledby="corp-title">
              <div className="er-corp-text">
                <p className="er-sec-kicker">{t.corpKicker}</p>
                <h2 className="er-sec-title" id="corp-title">{t.corpTitle}</h2>
                <p className="er-sec-copy">{t.corpCopy}</p>
                <a className="er-btn-outline" href={corporate}>{t.corpCta}</a>
              </div>
              {/* Foto arquitectónica (Reforma con el Ángel al fondo), del dueño. */}
              <img
                className="er-corp-img"
                src="/corporativo.webp"
                srcSet="/corporativo-720.webp 720w, /corporativo.webp 1200w"
                sizes="(max-width: 980px) 100vw, 640px"
                alt={t.corpImgAlt}
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
              />
            </section>

            {/* TOURS Y EXCURSIONES. Antes de la flota para que se vea pronto.
                Los enlaces a Valle de Bravo y Tepoztlán salen de `rutas`
                (resueltas en el servidor); si una ruta desapareciera, su
                tarjeta manda al cotizador en vez de romperse. */}
            <section className="er-tours" id="tours" aria-label={t.toursTitle}>
              <p className="er-tours-kicker">{t.toursKicker}</p>
              <h2 className="er-tours-title">{t.toursTitle}</h2>
              <p className="er-tours-copy">{t.toursCopy}</p>
              <div className="er-tours-grid">
                {t.tours.map((tour, i) => {
                  const href = [
                    path(lang, "teotihuacan"),
                    path(lang, "hourly"),
                    rutas.find((r) => r.key === "vallebravo")?.href ?? "#quote",
                    rutas.find((r) => r.key === "tepoztlan")?.href ?? "#quote",
                  ][i];
                  return (
                    <a key={tour.title} className="er-tour" href={href}>
                      {/* Foto del destino de fondo (del dueño, nov 2026). img y no
                          background para que se cargue sólo al llegar aquí. */}
                      <img
                        className="er-tour-img"
                        src={TOUR_IMAGES[i]}
                        alt=""
                        width={720}
                        height={460}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="er-tour-tag">{tour.tag}</span>
                      <h3 className="er-tour-title">{tour.title}</h3>
                      <p className="er-tour-copy">{tour.copy}</p>
                      <span className="er-tour-cta">{tour.cta} →</span>
                    </a>
                  );
                })}
              </div>
              <div className="er-tours-foot">
                <a
                  className="er-tours-wa"
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.toursWaText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("clic_whatsapp", { origen: "tours" })}
                >
                  {t.toursWa}
                </a>
                <a className="er-tours-guide" href={path(lang, "guideDayTrips")}>{t.toursGuide}</a>
              </div>
            </section>

            <section className="er-comfort" aria-label="Comfort amenities">
              <h2 className="er-comfort-title">
                {t.comfortTitleA}<span>{t.comfortTitleB}</span>{t.comfortTitleC}
              </h2>
              {/* La seguridad va PRIMERO: el título de la sección la
                  promete y la lista arrancaba con la botella de agua.
                  Las dos afirmaciones las confirmó el dueño el 22 sep
                  2026 y están en su catálogo corporativo. No añadir aquí
                  cobertura, monto ni proceso de selección de choferes:
                  eso no está confirmado. */}
              <ul className="er-comfort-list">
                <li>
                  <span className="er-comfort-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
                      <path d="M12 3l7 3v6c0 4.2-2.9 7.8-7 9-4.1-1.2-7-4.8-7-9V6l7-3z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </span>
                  {t.insured}
                </li>
                <li>
                  <span className="er-comfort-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
                      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  {t.gps}
                </li>
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

            {/* Bienvenida para quien visita CDMX por primera vez: sólo en inglés. */}
            {lang === "en" && <WelcomeEn origen="bienvenida_portada" />}


            {/* Las cuatro categorías también viven en el paso 2 del
                cotizador, pero ahí sólo se ven después de escribir origen y
                destino: están detrás de un formulario y la mayoría de las
                visitas no llegan. Aquí se ven sin pedir nada. Sin precio a
                propósito: el precio depende de la ruta y lo da el cotizador,
                que está justo arriba. Imágenes y datos son los mismos que
                usa /b2b — /flota/*.webp y lib/vehicles.ts. */}



              {/*
                LAS 16 RUTAS, ENLAZADAS DESDE LA PORTADA.

                Hasta el 30 de septiembre de 2026 la portada no enlazaba a
                NINGUNA página de ruta: se llegaba a ellas sólo desde el hub de
                aeropuerto y desde tarifas. La portada es la página más fuerte
                del sitio —el mejor CTR de todas, 8.6% en Search Console— y
                era un callejón sin salida: su autoridad se quedaba ahí en vez
                de repartirse a las dieciséis páginas que necesitan posicionar.

                Para el visitante también sirve: quien llega buscando "chofer
                privado" ve de un vistazo que su ruta concreta ya tiene precio
                publicado, sin tener que cotizar para enterarse.
              */}
              <section className="er-routes" id="rutas" aria-label={t.routesTitle}>
                <h2 className="er-routes-title">{t.routesTitle}</h2>
                <p className="er-routes-help">{t.routesHelp}</p>
                {/* La nota del redondo cuelga SÓLO del grupo foráneo. Es el
                    único sitio de la portada donde alguien está mirando
                    justamente los destinos que lo admiten; ponerla arriba, en
                    el encabezado general, se la enseñaría también a quien
                    busca un traslado de aeropuerto, donde no se ofrece. */}
                {([
                  [t.routesAirport, rutas.filter((r) => !r.foranea), null],
                  [t.routesOut, rutas.filter((r) => r.foranea), t.routesOutRt],
                ] as const).map(([titulo, lista, nota]) => (
                  <div key={titulo} className="er-routes-group">
                    <h3 className="er-routes-sub">{titulo}</h3>
                    <ul className="er-routes-list">
                      {lista.map((r) => (
                        <li key={r.href}>
                          <a href={r.href}>{r.label}</a>
                        </li>
                      ))}
                    </ul>
                    {nota && <p className="er-routes-rt">{nota}</p>}
                  </div>
                ))}

                {/* LAS GUÍAS, al final del bloque de rutas y no arriba.
                    Quien llegó hasta aquí ya vio los destinos; estas páginas
                    son para el que todavía no sabe cómo se va a mover, y es
                    tráfico que hoy no llega al sitio porque las 56 URLs que
                    había eran todas comerciales. */}
                <div className="er-routes-group">
                  <h3 className="er-routes-sub">{t.routesGuides}</h3>
                  <ul className="er-routes-list">
                    {guias.map((g) => (
                      <li key={g.href}>
                        <a href={g.href}>{g.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section id="contacto" className="er-contact-grid" aria-label="Elite Route contact emails">
                <div className="er-contact-item">
                  <a href={corporate} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="er-contact-title">{t.b2bTitle}</div>
                  </a>
                  <div className="er-contact-copy">{t.b2bCopy}</div>
                  <div className="er-contact-actions">
                    <a className="er-contact-link" href="mailto:business@eliteroute.mx">
                      business@eliteroute.mx
                    </a>
                    <a href={path(lang, "quote")} style={{ fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A46B", textDecoration:"none", borderBottom:"1px solid rgba(200,164,107,0.35)", paddingBottom:"2px" }}>
                      Cotizar servicios corporativos →
                    </a>
                  </div>
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

          {/* RESEÑAS DE GOOGLE — reales, de la ficha "Elite Route MX" en Google
              Maps (5.0 · verificado). Sustituye testimonios de ejemplo que
              vivían aquí antes con nombres y citas inventados. */}
          <section className="er-testimonials" aria-label="Reseñas de clientes en Google">
            <p className="er-testimonials-kicker">{t.reviewsKicker}</p>
            <h2 className="er-testimonials-title">{t.reviewsTitle}</h2>

            <div className="er-reviews-badge-row">
              <a
                className="er-reviews-badge"
                href={GOOGLE_PLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="er-google-g" width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.5 5.4C39.9 37 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
                </svg>
                <span className="er-reviews-badge-text">
                  <span className="er-reviews-badge-top">
                    <span className="er-reviews-score">{GOOGLE_RATING}</span>
                    <span className="er-reviews-stars">★★★★★</span>
                  </span>
                  <span className="er-reviews-label">{t.reviewsCount(GOOGLE_REVIEW_COUNT)}</span>
                </span>
              </a>
            </div>

            <div className="er-testimonials-grid">
              {REVIEWS.map((r, i) => (
                <div className={`er-testimonial-card er-g-${["blue", "red", "yellow", "green"][i % 4]}`} key={r.name}>
                  <div className="er-testimonial-stars">★★★★★</div>
                  <blockquote className="er-testimonial-quote">“{r.quote}”</blockquote>
                  <div className="er-testimonial-author">
                    <div className="er-testimonial-avatar">{r.initial}</div>
                    <div>
                      <div className="er-testimonial-name">{r.name}</div>
                      {/* Google no enseña este número de todo el mundo. Sin él, la línea no va. */}
                      {r.count !== undefined && (
                        <div className="er-testimonial-role">{t.reviewsCount(r.count)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="er-reviews-cta-row">
              <a className="er-reviews-btn-primary" href={GOOGLE_WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
                {t.reviewsWriteBtn}
              </a>
              <a className="er-reviews-btn-secondary" href={GOOGLE_PLACE_URL} target="_blank" rel="noopener noreferrer">
                {t.reviewsSeeBtn}
              </a>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="er-foot">
            <div className="er-foot-pay">
              <p className="er-trust-line">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A46B" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>{t.footPay}</span>
                <span className="er-stripe-mark">stripe</span>
                <span className="er-cardmarks">
                  <span className="er-cardmark">VISA</span>
                  <span className="er-cardmark">MASTERCARD</span>
                  <span className="er-cardmark">AMEX</span>
                </span>
              </p>
              <a className="er-foot-billing" href="mailto:contabilidad@eliteroute.mx">
                {t.footBilling} · contabilidad@eliteroute.mx
              </a>
            </div>
            {/* Quién es el negocio y cómo se le contacta: estaba sólo en las
                páginas legales, que casi nadie abre.
                SIN DOMICILIO, a propósito. Elite Route no tiene local: la
                dirección de LEGAL.domicilio es la casa del dueño, y un
                servicio de transporte ejecutivo no publica dónde vive quien
                lo dirige en cada página. Sólo la llevan los avisos de
                privacidad, porque ahí la ley pide un domicilio. No volver a
                ponerla aquí para "dar confianza": la dan el teléfono, el
                correo y las reseñas verificables. */}
            <address className="er-foot-id">
              <span className="er-foot-id-name">{LEGAL.responsable}</span>
              <span className="er-foot-id-contact">
                <a href={`tel:${LEGAL.telefonoTel}`}>{LEGAL.telefono}</a>
                <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>
              </span>
            </address>

            <div className="er-foot-meta">
              <span>{t.footRights}</span>
              <div className="er-foot-links">
                <a href={path(lang, "rates")}>{t.footRates}</a>
                {/* El enlace de "Disposiciones" de la barra es un botón que
                    baja al cotizador, no una dirección: un buscador no puede
                    seguirlo. Este sí. */}
                <a href={path(lang, "hourly")}>{t.footHourly}</a>
                {/* Las dos páginas de servicio. Sin un enlace desde aquí
                    sólo las alcanzaría el sitemap, y una página a la que el
                    propio sitio no enlaza pesa mucho menos. */}
                <a href={path(lang, "airport")}>{t.footAirport}</a>
                <a href={path(lang, "chauffeur")}>{t.footChauffeur}</a>
                <a href={path(lang, "executive")}>{t.footExecutive}</a>
                <a href={path(lang, "fleet")}>{t.footFleet}</a>
                <a href={path(lang, "about")}>{t.navAbout}</a>
                <a href={corporate}>{t.corporate}</a>
                <a href={path(lang, "terms")}>{t.footTerms}</a>
                <a href={path(lang, "privacy")}>{t.footPrivacy}</a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <InstallHint lang={lang} />

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
