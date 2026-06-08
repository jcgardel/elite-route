"use client";

import { useRef, useState, type MouseEvent } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const libraries: "places"[] = ["places"];
const WHATSAPP_NUMBER = "525543582919";
const GOOGLE_MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const tariffs = {
  sedan: { name: "Sedan", km: 25, hour: 450, min: 700, cap: "1-3 passengers · 2 bags", tag: "Executive" },
  executive: { name: "Executive", km: 40, hour: 650, min: 950, cap: "1-3 passengers · 3 bags", tag: "Premium" },
  minivan: { name: "Minivan", km: 45, hour: 700, min: 1100, cap: "4-6 passengers · 4 bags", tag: "Group" },
  suv: { name: "HIGH SUV", km: 70, hour: 990, min: 1600, cap: "1-6 passengers · 6 bags", tag: "Suburban" },
};

const vehicleImages: Record<string, string> = {
  sedan: "/sedan.jpg",
  executive: "/executive.jpg",
  minivan: "/minivan.jpg",
  suv: "/high-suv.jpg",
};

type Category = keyof typeof tariffs;
type Zone = "cdmx" | "semi_foraneo" | "foraneo";
type ServiceType = "route" | "hour" | "day";

function detectZone(origin: string, destination: string, km: number): Zone {
  const s = (origin + " " + destination).toLowerCase();
  if (/aifa|felipe\s*[aá]ngeles|zumpango|toluca/.test(s)) return "semi_foraneo";
  if (km > 80) return "foraneo";
  return "cdmx";
}

function zoneLabel(z: Zone) {
  return z === "cdmx" ? "Mexico City" : z === "semi_foraneo" ? "AIFA / Toluca" : "Out-of-town";
}

function zoneLabelEs(z: Zone) {
  return z === "cdmx" ? "CDMX" : z === "semi_foraneo" ? "AIFA / Toluca" : "Foráneo";
}

function serviceTypeLabel(serviceType: ServiceType, rentalHours: number) {
  if (serviceType === "hour") return `Hourly ride (${rentalHours} hrs)`;
  if (serviceType === "day") return "Full day (10 hrs)";
  return "Point-to-point transfer";
}

function serviceTypeLabelEs(serviceType: ServiceType, rentalHours: number) {
  if (serviceType === "hour") return `Por horas (${rentalHours} hrs)`;
  if (serviceType === "day") return "Por día (10 hrs)";
  return "Traslado por ruta";
}

function calculatePrice(
  km: number, minutes: number, category: Category,
  zone: Zone, urgent: boolean, serviceType: ServiceType, rentalHours: number,
) {
  const tariff = tariffs[category];
  let base = 0;
  if (serviceType === "hour") {
    base = Math.max(rentalHours * tariff.hour, tariff.min);
  } else if (serviceType === "day") {
    base = Math.max(10 * tariff.hour, tariff.min);
  } else {
    const hours = Math.ceil((minutes / 60) * 2) / 2;
    base = Math.max(km * tariff.km, hours * tariff.hour, tariff.min);
    if (zone === "semi_foraneo") base *= 1.18;
    if (zone === "foraneo") base *= 1.35;
  }
  base = Math.round(base * 1.16);
  if (urgent) base = Math.round(base * 1.15);
  return base;
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

function formatDateTime(dateStr: string, timeStr: string) {
  if (!dateStr || !timeStr) return "—";
  const dt = new Date(`${dateStr}T${timeStr}`);
  return dt.toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + " · " + timeStr + "h";
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap');

  * { box-sizing:border-box; }
  .er-root { background:#0A0A0A; color:#fff; min-height:100vh; font-family:'Barlow',sans-serif; font-weight:300; }
  .er-shell { min-height:100vh; }
  .er-hero { position:relative; min-height:720px; background-image:linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.76) 48%, rgba(0,0,0,0.68) 100%), url('/high-suv.jpg'); background-size:cover; background-position:center 48%; display:flex; flex-direction:column; }
  .er-hero::after { content:""; position:absolute; inset:auto 0 0; height:190px; background:linear-gradient(180deg, transparent, #0A0A0A); pointer-events:none; }
  .er-nav { position:relative; z-index:2; max-width:1180px; width:100%; margin:0 auto; padding:24px 28px; display:flex; align-items:center; justify-content:space-between; }
  .er-logo-img { width:176px; height:auto; display:block; filter:drop-shadow(0 18px 32px rgba(0,0,0,0.65)); }
  .er-nav-links { display:flex; gap:28px; align-items:center; color:#BFC3C8; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; }
  .er-nav-chip { border:1px solid #C8A46B; border-radius:2px; padding:10px 14px; color:#fff; }
  .er-hero-inner { position:relative; z-index:1; max-width:1180px; width:100%; margin:0 auto; padding:42px 28px 92px; display:grid; grid-template-columns:minmax(0, 1fr) 440px; gap:48px; align-items:start; }
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
  .er-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media (max-width:580px) { .er-row { grid-template-columns:1fr; } }

  .er-hours-selector { display:flex; align-items:center; gap:0; background:#fff; border:1px solid #d9d2c4; border-radius:2px; padding:10px 16px; }
  .er-hr-btn { width:32px; height:32px; border-radius:50%; border:1px solid #bdb4a5; background:transparent; color:#111; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; }
  .er-hr-btn:hover { border-color:#111; background:#f0ece3; }
  .er-hr-count { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:400; width:52px; text-align:center; color:#0A0A0A; }
  .er-hr-unit { font-size:13px; color:#0A0A0A; letter-spacing:0.08em; }

  .er-service-note { font-size:12px; color:#0A0A0A; margin-top:-6px; margin-bottom:18px; line-height:1.55; background:#eee9df; border:1px solid #ded7ca; border-radius:2px; padding:12px 14px; }

  .er-section-title { color:#fff; font-family:'Cormorant Garamond',serif; font-size:42px; font-weight:300; margin:42px 0 20px; }
  .er-vehicles { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:18px; margin-bottom:24px; }
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
  .er-comfort { margin-top:34px; border:1px solid rgba(200,164,107,0.34); background:rgba(255,255,255,0.035); padding:26px; display:grid; grid-template-columns:minmax(0,0.95fr) minmax(0,1.3fr); gap:28px; align-items:start; }
  .er-hero .er-comfort { max-width:720px; margin-top:34px; background:rgba(10,10,10,0.58); backdrop-filter:blur(8px); }
  .er-comfort-title { color:#fff; font-family:'Cormorant Garamond',serif; font-size:34px; line-height:1.05; font-weight:300; margin:0; }
  .er-comfort-title span { color:#C8A46B; }
  .er-comfort-list { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px 18px; margin:0; padding:0; list-style:none; }
  .er-comfort-list li { color:#BFC3C8; font-size:14px; line-height:1.45; border-top:1px solid #2e2e2e; padding-top:10px; }
  .er-comfort-list li::before { content:""; display:inline-block; width:6px; height:6px; margin-right:9px; border-radius:50%; background:#C8A46B; vertical-align:middle; }
  .er-legal { text-align:center; font-size:11px; color:#666; margin-top:16px; letter-spacing:0.05em; line-height:1.8; }

  .PhoneInput { display:flex; align-items:center; background:rgba(255,255,255,0.08); border:1px solid rgba(200,164,107,0.35); border-radius:2px; padding:0 16px; }
  .PhoneInput:focus-within { border-color:#C8A46B; box-shadow:0 0 0 1px #C8A46B; }
  .PhoneInputCountry { margin-right:10px; }
  .PhoneInputInput { flex:1; background:transparent; border:none; color:#FFFFFF; font-family:'Barlow',sans-serif; font-size:15px; font-weight:400; outline:none; padding:14px 0; }
  .PhoneInputInput::placeholder { color:#BFC3C8; opacity:0.72; }

  @media (max-width:980px) {
    .er-hero-inner { grid-template-columns:1fr; padding-bottom:70px; }
    .er-booking-card { max-width:560px; }
    .er-vehicles { grid-template-columns:repeat(2, minmax(0,1fr)); }
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
    .er-svc-tab { border-right:none; border-bottom:1px solid #e5dfd3; }
    .er-svc-tab:last-child { border-bottom:none; }
    .er-vehicles { grid-template-columns:1fr; }
    .er-vehicle, .er-vehicle-content { min-height:330px; }
    .er-benefits { grid-template-columns:1fr; }
    .er-comfort { padding:20px; }
    .er-comfort-list { grid-template-columns:1fr; }
  }
`;

export default function Home() {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });

  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationRef = useRef<google.maps.places.Autocomplete | null>(null);

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
  const [alert1, setAlert1] = useState("");
  const [alert3, setAlert3] = useState("");

  const serviceHours = serviceType === "day" ? 10 : rentalHours;
  const maxAllowedKm = serviceType === "route" ? 0 : serviceHours * 20;

  function priceFor(cat: Category) {
    return serviceType === "route" && km === 0
      ? 0
      : calculatePrice(km, minutes, cat, zone, urgent, serviceType, rentalHours);
  }
  const price = priceFor(category);

  const summaryRows: Array<[string, string]> = [
    ["Service type", serviceTypeLabel(serviceType, rentalHours)],
    ...(serviceType !== "route" ? [["Included km", `${maxAllowedKm} km`] as [string, string]] : []),
    ["Date & time", formatDateTime(serviceDate, serviceTime)],
    ["Pickup", origin || "—"],
    ["Destination", serviceType === "route" ? (destination || "—") : "Open itinerary"],
    ["Vehicle", tariffs[category].name],
    serviceType === "route"
      ? ["Distance", `${km} km · ${minutes} min`]
      : ["Duration", serviceTypeLabel(serviceType, rentalHours)],
    ["Zone", zoneLabel(zone)],
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
    if (!origin) { setAlert1("Enter the pickup location."); return; }
    if (serviceType === "route" && !destination) { setAlert1("Enter the destination."); return; }
    if (!serviceDate || !serviceTime) { setAlert1("Select the service date and time."); return; }
    if (serviceType === "hour" && rentalHours < 2) { setAlert1("Minimum hourly service is 2 hours."); return; }

    const svc = new Date(`${serviceDate}T${serviceTime}`);
    const diff = (svc.getTime() - Date.now()) / 3600000;
    if (diff <= 0) { setAlert1("Select a future date and time."); return; }
    if (diff < 2) { setAlert1("At least 2 hours of advance notice are required."); return; }

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
      if (!res.ok || data.error) { setAlert1("We could not calculate the route. Please verify the addresses."); return; }

      const routeKm = Number(data.km.toFixed(1));
      const allowedKm = serviceType === "day" ? 200 : rentalHours * 20;
      if (serviceType !== "route" && routeKm > allowedKm) {
        setAlert1(`This service includes up to ${allowedKm} km. The calculated route is ${routeKm} km.`);
        return;
      }

      setKm(routeKm);
      setMinutes(Number(data.minutes));
      setZone(detectZone(origin, dest, data.km));
      setUrgent(isUrgent(serviceDate, serviceTime));
      goStep(2);
    } catch {
      setAlert1("Connection error. Please try again.");
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
      `Fecha: ${formatDateTime(serviceDate, serviceTime)}`,
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
    if (!fullName.trim()) { setAlert3("Full name is required."); return; }
    if (!phone) { setAlert3("Phone number is required."); return; }
    if (!isValidPhoneNumber(phone)) { setAlert3("Enter a valid phone number with country code."); return; }
    if (price === 0) { setAlert3("Error: go back to step 1 and calculate the route."); return; }
    setAlert3("");
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`,
      "_blank", "noopener,noreferrer"
    );
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
              <div className="er-nav-links">
                <span>Services</span>
                <span>Airports</span>
                <span>Corporate</span>
                <span>Contact</span>
                <span className="er-nav-chip">Reserve Now</span>
              </div>
            </nav>

            <div className="er-hero-inner">
              <div>
                <div className="er-kicker">EliteRoute Mexico City</div>
                <h1 className="er-hero-title">We move your level.</h1>
                <p className="er-hero-copy">
                  Premium chauffeur service in Mexico City, AICM, AIFA and Toluca.
                  Airport transfers, hourly rides and executive transportation.
                </p>
                <div className="er-hero-actions">
                  <a className="er-hero-btn" href="#quote">Reserve Now</a>
                  <a className="er-hero-btn er-hero-mail" href="mailto:business@eliteroute.mx">
                    business@eliteroute.mx
                  </a>
                </div>
                <section className="er-comfort" aria-label="Comfort amenities">
                  <h2 className="er-comfort-title">
                    Safety, comfort and <span>confidence</span> in every ride.
                  </h2>
                  <ul className="er-comfort-list">
                    <li>Complimentary beverage</li>
                    <li>Phone chargers available</li>
                    <li>Music connection</li>
                    <li>Climate-controlled vehicle</li>
                    <li>Attentive and service-minded driver</li>
                  </ul>
                </section>
              </div>

              <div className="er-booking-card" id="quote">
                <h2 className="er-booking-title">Get your quote</h2>

                <div className="er-progress">
                  <div className="er-progress-fill" style={{ width:`${(step/3)*100}%` }}/>
                </div>

                <div className="er-steps">
                  {[["Route","1"],["Vehicle","2"],["Confirm","3"]].map(([label,n]) => {
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

            {/* TABS SERVICIO */}
            <div className="er-service-tabs">
              {([
                ["route", "Transfer",  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"],
                ["hour",  "Hourly", "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm1-10V7h-2v6l4.28 2.54.72-1.21-3-1.79z"],
                ["day",   "Full Day",   "M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 18H5V8h14v13zM7 10h5v5H7z"],
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

            {/* NOTA */}
            {serviceType !== "route" && (
              <div className="er-service-note">
                {serviceType === "hour"
                  ? `Hourly service · 20 km included per hour · Up to ${rentalHours * 20} km`
                  : "Full-day service · 10 hours · Up to 200 km included"}
                <br/>
                <span style={{color:"#0A0A0A"}}>
                  {serviceType === "hour"
                    ? "Your chauffeur remains available during the contracted hours."
                    : "Ideal for meetings, events or city transportation in Mexico City."}
                </span>
              </div>
            )}

            {/* SELECTOR HORAS */}
            {serviceType === "hour" && (
              <div className="er-field">
                <label className="er-label">Service Duration</label>
                <div className="er-hours-selector">
                  <button type="button" className="er-hr-btn"
                    onClick={() => setRentalHours(h => Math.max(2, h-1))}>−</button>
                  <div className="er-hr-count">{rentalHours}</div>
                  <div className="er-hr-unit">hours</div>
                  <button type="button" className="er-hr-btn"
                    onClick={() => setRentalHours(h => h+1)}>+</button>
                </div>
              </div>
            )}

            {/* ORIGEN */}
            <div className="er-field">
                <label className="er-label">Pickup Location</label>
              <Autocomplete
                onLoad={(a) => { originRef.current = a; }}
                onPlaceChanged={onOriginChanged}
                options={{ componentRestrictions:{ country:"mx" }, fields:["formatted_address","geometry","name"] }}>
                <input className="er-input" placeholder="Hotel, airport, address..."
                  value={origin} onChange={(e) => setOrigin(e.target.value)}/>
              </Autocomplete>
            </div>

            {/* DESTINO — solo traslado */}
            {serviceType === "route" && (
              <div className="er-field">
                <label className="er-label">Destination</label>
                <Autocomplete
                  onLoad={(a) => { destinationRef.current = a; }}
                  onPlaceChanged={onDestinationChanged}
                  options={{ componentRestrictions:{ country:"mx" }, fields:["formatted_address","geometry","name"] }}>
                  <input className="er-input" placeholder="Where are we taking you?"
                    value={destination} onChange={(e) => setDestination(e.target.value)}/>
                </Autocomplete>
              </div>
            )}

            {/* FECHA Y HORA */}
            <div className="er-row">
              <div className="er-field">
                <label className="er-label">Date</label>
                <input className="er-input" type="date" min={getMinDate()}
                  value={serviceDate} onChange={(e) => setServiceDate(e.target.value)}/>
              </div>
              <div className="er-field">
                <label className="er-label">Time</label>
                <input className="er-input" type="time"
                  value={serviceTime} onChange={(e) => setServiceTime(e.target.value)}/>
              </div>
            </div>

            <div className="er-field">
              <label className="er-label">Vehicle Category</label>
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
              {loading ? "Calculating route..." : "Get Quote →"}
            </button>
          </div>
              </div>
            </div>
          </section>

          <main className="er-main">
            <div className="er-workspace">

          {/* ── PASO 2 ── */}
          <div className={`er-panel${step===2?" active":""}`}>
            <h2 className="er-section-title">Choose your category</h2>
            <div className="er-route-box">
              <div className="er-route-stats">
                <div>
                  <div className="er-stat-val">
                    {serviceType === "route" ? km : (serviceType === "hour" ? maxAllowedKm : 200)}
                  </div>
                  <div className="er-stat-lbl">{serviceType === "route" ? "Kilometers" : "Included km"}</div>
                </div>
                {serviceType === "route" && (
                  <div>
                    <div className="er-stat-val">{minutes}</div>
                    <div className="er-stat-lbl">Estimated min.</div>
                  </div>
                )}
              </div>
              <div className="er-zone-badge">{zoneLabel(zone)}</div>
            </div>

            {urgent && (
              <div className="er-urgent-note">
                ⚠️ Short-notice booking — 15% availability fee applies
              </div>
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
                      <div className="er-vehicle-price-label">VAT included</div>
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
              Continue →
            </button>
            <button className="er-btn-secondary" onClick={goBackToStep1} type="button">
              ← Modify route
            </button>
          </div>

          {/* ── PASO 3 ── */}
          <div className={`er-panel${step===3?" active":""}`}>
            <div className="er-row" style={{ marginBottom:20 }}>
              <div className="er-field">
                <label className="er-label">Full Name</label>
                <input className="er-input" placeholder="As shown on ID"
                  value={fullName} onChange={(e) => setFullName(e.target.value)}/>
              </div>
              <div className="er-field">
                <label className="er-label">Phone</label>
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
                <span className="er-summary-key" style={{ color:"#b8b8b8", fontWeight:500 }}>Total with VAT</span>
                <span className="er-summary-val er-summary-total">${price.toLocaleString("es-MX")} MXN</span>
              </div>
            </div>

            {alert3 && <div className="er-alert er-alert-err">{alert3}</div>}

            <a className="er-btn-wa" href="#" onClick={handleWhatsApp}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.942-1.42A9.953 9.953 0 0012 22c5.522 0 10-4.477 10-10S17.522 2 11.999 2zm.001 18.18c-1.64 0-3.162-.497-4.424-1.347l-.317-.188-3.287.944.944-3.22-.206-.33A8.178 8.178 0 013.82 12c0-4.515 3.665-8.18 8.18-8.18 4.516 0 8.18 3.665 8.18 8.18 0 4.516-3.664 8.18-8.18 8.18z"/>
              </svg>
              Request booking via WhatsApp
            </a>

            <div className="er-legal">
              Request subject to availability. Payment is confirmed once the booking is validated.<br/>
              Elite Route CDMX · eliteroute.mx
            </div>

            <button className="er-btn-secondary" style={{ marginTop:16 }} onClick={() => goStep(2)} type="button">
              ← Modify vehicle
            </button>
          </div>

              <section className="er-benefits" aria-label="Elite Route benefits">
                <div className="er-benefit">
                  <div className="er-benefit-title">Professional Chauffeurs</div>
                  <div className="er-benefit-copy">
                    Licensed and professionally trained.
                  </div>
                </div>
                <div className="er-benefit">
                  <div className="er-benefit-title">Fixed Pricing</div>
                  <div className="er-benefit-copy">
                    Transparent fares with no surprises.
                  </div>
                </div>
                <div className="er-benefit">
                  <div className="er-benefit-title">24/7 Availability</div>
                  <div className="er-benefit-copy">
                    Airport and executive transportation.
                  </div>
                </div>
                <div className="er-benefit">
                  <div className="er-benefit-title">Direct Confirmation</div>
                  <div className="er-benefit-copy">
                    Instant WhatsApp assistance.
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
