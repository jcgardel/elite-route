"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { calculatePrice, detectZone, isAirportAddress, tariffs, type Category } from "@/lib/booking";

const CONTACT_EMAIL = "contabilidad@eliteroute.mx";
const MAX_SERVICES = 20;
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const ZMVM_BOUNDS = { south: 18.9, west: -99.5, north: 20.0, east: -98.7 };
const AC_OPTIONS = {
  componentRestrictions: { country: "mx" },
  bounds: ZMVM_BOUNDS,
  strictBounds: false,
  fields: ["formatted_address", "geometry", "name"],
};
const libraries: "places"[] = ["places"];

const VEHICLES: { key: Category; label: string; sub: string }[] = [
  { key: "sedan",     label: "Sedan",    sub: "Nissan / VW"            },
  { key: "executive", label: "Executive",sub: "BMW / Mercedes / Tesla"  },
  { key: "minivan",   label: "Minivan",  sub: "Captiva · 7 pax"        },
  { key: "suv",       label: "HIGH SUV", sub: "Suburban / Escalade"    },
];

type Service = {
  id: number;
  fecha: string;
  hora: string;
  origen: string;
  destino: string;
  vehiculo: Category;
  airport: boolean;   // auto-detectado, no visible al usuario
  vuelo: string;      // obligatorio cuando airport = true
  notas: string;
  km: number;
  minutes: number;
};

function isUrgent(fecha: string, hora: string) {
  if (!fecha || !hora) return false;
  const diff = (new Date(`${fecha}T${hora}`).getTime() - Date.now()) / 3600000;
  return diff > 0 && diff <= 6;
}

/**
 * Calcula precio del servicio.
 * Cuando airport=true aplica 23% sobre el precio base (pre-IVA),
 * sin usar el parámetro airport de calculatePrice (que aplica 25%).
 * Formula: precio_sin_aeropuerto * 1.23 ≈ precio_con_23%
 */
function calcRow(s: Service) {
  if (s.km > 0) {
    const zone   = detectZone(s.km);
    const urgent = isUrgent(s.fecha, s.hora);
    const total  = calculatePrice(s.km, s.minutes, s.vehiculo, zone, urgent, "route", 0, s.airport);
    const base   = Math.round(total / 1.16);
    const iva    = total - base;
    return { base, iva, total, estimate: false };
  }
  // Sin ruta → tarifa mínima como referencia
  const totalEst = Math.round(tariffs[s.vehiculo].min * (s.airport ? 1.25 : 1) * 1.16);
  const base = Math.round(totalEst / 1.16);
  const iva  = totalEst - base;
  return { base, iva, total: totalEst, estimate: true };
}

function fmt(n: number) {
  return "$" + n.toLocaleString("es-MX");
}

function getMinDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// ─── Sub-componente por servicio ───────────────────────────────────────────
type ServiceRowProps = {
  service: Service;
  index: number;
  showRemove: boolean;
  isLoaded: boolean;
  onUpdate: (id: number, patch: Partial<Service>) => void;
  onRemove: (id: number) => void;
};

function ServiceRow({ service: s, index, showRemove, isLoaded, onUpdate, onRemove }: ServiceRowProps) {
  const originAcRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destAcRef   = useRef<google.maps.places.Autocomplete | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [routeErr, setRouteErr]       = useState("");

  async function fetchRoute(origin: string, destination: string) {
    setCalculating(true);
    setRouteErr("");
    try {
      const res  = await fetch("/api/maps", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ origin, destination }) });
      const data = await res.json();
      if (!res.ok) { setRouteErr("No se pudo calcular la ruta"); return; }
      onUpdate(s.id, { km: Number(data.km.toFixed(1)), minutes: Number(data.minutes) });
    } catch {
      setRouteErr("Error de conexión");
    } finally {
      setCalculating(false);
    }
  }

  function onOriginChanged() {
    const place = originAcRef.current?.getPlace();
    if (!place?.formatted_address) return;
    const addr = place.formatted_address;
    const airp = isAirportAddress(addr);
    onUpdate(s.id, { origen: addr, airport: airp, km: 0, minutes: 0, vuelo: airp ? s.vuelo : "" });
    if (s.destino) fetchRoute(addr, s.destino);
  }

  function onDestinationChanged() {
    const place = destAcRef.current?.getPlace();
    if (!place?.formatted_address) return;
    const addr = place.formatted_address;
    onUpdate(s.id, { destino: addr, km: 0, minutes: 0 });
    if (s.origen) fetchRoute(s.origen, addr);
  }

  const r = calcRow(s);
  const acOptions = AC_OPTIONS;

  return (
    <div className="cq-card">
      <p className="cq-card-num">Servicio {index + 1}</p>
      {showRemove && (
        <button className="cq-rm" onClick={() => onRemove(s.id)} aria-label="Eliminar">×</button>
      )}

      {/* Fila 1: fecha, hora, origen, destino */}
      <div className="cq-r1">
        <div className="cq-f">
          <label>Fecha *</label>
          <input type="date" min={getMinDate()} value={s.fecha} suppressHydrationWarning
            onChange={(e) => onUpdate(s.id, { fecha: e.target.value, km: 0, minutes: 0 })} />
        </div>
        <div className="cq-f">
          <label>Hora *</label>
          <input type="time" value={s.hora}
            onChange={(e) => onUpdate(s.id, { hora: e.target.value })} />
        </div>
        <div className="cq-f">
          <label>Origen *</label>
          {isLoaded ? (
            <Autocomplete onLoad={(a) => { originAcRef.current = a; }} onPlaceChanged={onOriginChanged} options={acOptions}>
              <input className="cq-ac-input" type="text" placeholder="Hotel, aeropuerto, dirección..."
                defaultValue={s.origen}
                onChange={(e) => { if (!e.target.value) onUpdate(s.id, { origen:"", airport:false, km:0, minutes:0, vuelo:"" }); }} />
            </Autocomplete>
          ) : (
            <input className="cq-ac-input" type="text" placeholder="Cargando Maps..." disabled />
          )}
        </div>
        <div className="cq-f">
          <label>Destino *</label>
          {isLoaded ? (
            <Autocomplete onLoad={(a) => { destAcRef.current = a; }} onPlaceChanged={onDestinationChanged} options={acOptions}>
              <input className="cq-ac-input" type="text" placeholder="Hotel, aeropuerto, dirección..."
                defaultValue={s.destino}
                onChange={(e) => { if (!e.target.value) onUpdate(s.id, { destino:"", km:0, minutes:0 }); }} />
            </Autocomplete>
          ) : (
            <input className="cq-ac-input" type="text" placeholder="Cargando Maps..." disabled />
          )}
        </div>
      </div>

      {/* Vuelo — aparece solo cuando origen es aeropuerto */}
      {s.airport && (
        <div className="cq-vuelo-row">
          <div className="cq-f" style={{ maxWidth:240 }}>
            <label>Número de vuelo *</label>
            <input type="text" placeholder="AM234, AA1234, LA456..."
              value={s.vuelo}
              onChange={(e) => onUpdate(s.id, { vuelo: e.target.value.toUpperCase() })} />
          </div>
        </div>
      )}

      {/* Fila 2: vehículo, notas */}
      <div className="cq-r2">
        <div className="cq-f">
          <label>Vehículo</label>
          <select value={s.vehiculo} onChange={(e) => onUpdate(s.id, { vehiculo: e.target.value as Category })}>
            {VEHICLES.map((v) => (
              <option key={v.key} value={v.key}>{v.label} — {v.sub}</option>
            ))}
          </select>
        </div>
        <div className="cq-f">
          <label>Notas</label>
          <input type="text" placeholder="Núm. de pax, equipaje, instrucciones..." value={s.notas}
            onChange={(e) => onUpdate(s.id, { notas: e.target.value })} />
        </div>
      </div>

      {/* Total por servicio */}
      <div className="cq-row-tot">
        {calculating ? (
          <span style={{ color:"#666" }}>Calculando ruta...</span>
        ) : routeErr ? (
          <span style={{ color:"#e57373", fontSize:11 }}>{routeErr}</span>
        ) : (
          <>
            {s.km > 0 && <span style={{ color:"#555", fontSize:11, marginRight:10 }}>{s.km} km · {s.minutes} min</span>}
            Subtotal: {fmt(r.base)}&nbsp;·&nbsp;IVA: {fmt(r.iva)}&nbsp;·&nbsp;
            <strong>Total: {fmt(r.total)}</strong>
            {r.estimate && <span style={{ color:"#555", fontSize:11, marginLeft:6 }}>(estimado mínimo)</span>}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
const INITIAL_SERVICE: Service = {
  id:1, fecha:"", hora:"", origen:"", destino:"", vehiculo:"sedan",
  airport:false, vuelo:"", notas:"", km:0, minutes:0,
};

export default function B2BCotizarPage() {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });
  const idRef = useRef(2);

  const [empresa, setEmpresa] = useState({ nombre:"", rfc:"", correo:"", telefono:"", responsable:"" });
  const [services, setServices] = useState<Service[]>([{ ...INITIAL_SERVICE }]);
  const [sent, setSent] = useState(false);

  function updateEmpresa(k: keyof typeof empresa, v: string) {
    setEmpresa((p) => ({ ...p, [k]: v }));
  }
  function addService() {
    if (services.length >= MAX_SERVICES) return;
    const id = idRef.current++;
    setServices((p) => [...p, { id, fecha:"", hora:"", origen:"", destino:"", vehiculo:"sedan", airport:false, vuelo:"", notas:"", km:0, minutes:0 }]);
  }
  function removeService(id: number) { setServices((p) => p.filter((x) => x.id !== id)); }
  function updateService(id: number, patch: Partial<Service>) {
    setServices((p) => p.map((x) => x.id === id ? { ...x, ...patch } : x));
  }

  const totals = services.reduce((acc, s) => {
    const r = calcRow(s);
    return { base: acc.base + r.base, iva: acc.iva + r.iva, total: acc.total + r.total };
  }, { base:0, iva:0, total:0 });

  const hasEstimates = services.some((s) => calcRow(s).estimate && (s.origen || s.destino));

  function buildBody() {
    const date = new Date().toLocaleDateString("es-MX", { day:"2-digit", month:"long", year:"numeric" });
    const lines: string[] = [
      "SOLICITUD DE COTIZACION CORPORATIVA - Elite Route",
      `Fecha: ${date}`, "",
      "DATOS DE LA EMPRESA",
      `Empresa:     ${empresa.nombre}`,
      `RFC:         ${empresa.rfc}`,
      `Responsable: ${empresa.responsable}`,
      `Telefono:    ${empresa.telefono}`,
      `Correo:      ${empresa.correo}`,
      "", "SERVICIOS SOLICITADOS", "---",
    ];
    services.forEach((s, i) => {
      const v = VEHICLES.find((x) => x.key === s.vehiculo)?.label ?? s.vehiculo;
      const r = calcRow(s);
      lines.push(`${i+1}. ${s.fecha} ${s.hora} | ${v}`);
      lines.push(`   Origen:  ${s.origen}`);
      lines.push(`   Destino: ${s.destino}`);
      if (s.airport && s.vuelo) lines.push(`   Vuelo:   ${s.vuelo}`);
      if (s.km > 0) lines.push(`   Ruta:    ${s.km} km / ${s.minutes} min`);
      lines.push(`   Total (IVA inc.): ${fmt(r.total)}  [Subtotal ${fmt(r.base)} + IVA ${fmt(r.iva)}]${r.estimate ? " *estimado" : ""}`);
      if (s.notas) lines.push(`   Notas:   ${s.notas}`);
      lines.push("");
    });
    lines.push("---", "RESUMEN TOTAL");
    lines.push(`Subtotal sin IVA: ${fmt(totals.base)}`);
    lines.push(`IVA (16%):        ${fmt(totals.iva)}`);
    lines.push(`TOTAL:            ${fmt(totals.total)}`);
    if (hasEstimates) lines.push("", "* Servicios marcados como estimado usan tarifa minima. El total se actualiza al ingresar la ruta completa.");
    return lines.join("\n");
  }

  function handleSend() {
    const subject = `Cotizacion corporativa - ${empresa.nombre || "Empresa"}`;
    window.open(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBody())}`, "_blank");
    setSent(true);
  }

  const canSend =
    empresa.nombre.trim() !== "" &&
    empresa.correo.trim() !== "" &&
    services.length > 0 &&
    services.every((s) =>
      s.fecha && s.hora && s.origen.trim() && s.destino.trim() &&
      (!s.airport || s.vuelo.trim() !== "")
    );

  const CSS = `
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html, body { background:#080808 !important; }
    .cq { font-family:var(--font-barlow),Arial,sans-serif; background:#080808; color:#fff; min-height:100vh; }

    .cq-nav { display:flex; justify-content:space-between; align-items:center; padding:20px 56px; border-bottom:1px solid #1e1e1e; }
    .cq-logo { font-family:var(--font-cormorant),Georgia,serif; font-size:22px; letter-spacing:0.12em; color:#C8A46B; text-decoration:none; }
    .cq-nav-links { display:flex; gap:28px; align-items:center; }
    .cq-nl { font-size:11px; letter-spacing:0.12em; color:#BFC3C8; text-transform:uppercase; text-decoration:none; }
    .cq-nl:hover { color:#fff; }
    .cq-nl-active { color:#C8A46B !important; }

    .cq-header { padding:56px 56px 40px; border-bottom:1px solid #1e1e1e; }
    .cq-kicker { font-size:11px; letter-spacing:0.22em; color:#C8A46B; text-transform:uppercase; margin-bottom:14px; }
    .cq-h1 { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:46px; line-height:1.05; margin-bottom:14px; color:#fff; }
    .cq-h1 em { color:#C8A46B; font-style:normal; }
    .cq-sub { color:#BFC3C8; font-size:14px; line-height:1.7; max-width:560px; }
    .cq-sub a { color:#C8A46B; text-decoration:none; }

    .cq-body { padding:40px 56px 80px; max-width:960px; }
    .cq-sec { margin-bottom:36px; }
    .cq-sec-label { font-size:10px; letter-spacing:0.2em; color:#555; text-transform:uppercase; margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid #1a1a1a; }

    .cq-g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:12px; }
    .cq-g2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

    .cq-f { display:flex; flex-direction:column; gap:5px; }
    .cq-f label { font-size:11px; color:#777; letter-spacing:0.05em; text-transform:uppercase; }

    .cq-f input[type=text],
    .cq-f input[type=email],
    .cq-f input[type=tel],
    .cq-f input[type=date],
    .cq-f input[type=time],
    .cq-ac-input,
    .cq-f select {
      background:#111 !important; border:1px solid #2e2e2e !important; color:#fff !important;
      /* 16px mínimo: por debajo de eso Safari en iOS hace zoom al enfocar. */
      padding:9px 12px !important; font-size:16px !important;
      font-family:var(--font-barlow),Arial,sans-serif !important; border-radius:3px !important;
      outline:none !important; width:100% !important;
    }
    .cq-ac-input:focus, .cq-f input:focus, .cq-f select:focus { border-color:#C8A46B !important; }
    .cq-f input::placeholder, .cq-ac-input::placeholder { color:#444 !important; }
    .cq-f select option { background:#222; color:#fff; }

    .cq-svc-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
    .cq-add { background:transparent; border:1px solid #2e2e2e; color:#C8A46B; padding:7px 16px; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; font-family:inherit; border-radius:3px; }
    .cq-add:hover { border-color:#C8A46B; }
    .cq-add:disabled { color:#444; border-color:#1e1e1e; cursor:not-allowed; }

    .cq-card { background:#0b0b0b; border:1px solid #2e2e2e; border-radius:4px; padding:18px 18px 14px; margin-bottom:10px; position:relative; }
    .cq-card-num { font-size:10px; letter-spacing:0.14em; color:#555; text-transform:uppercase; margin-bottom:12px; }
    .cq-rm { position:absolute; top:12px; right:14px; background:transparent; border:none; color:#444; font-size:20px; cursor:pointer; line-height:1; padding:0 2px; }
    .cq-rm:hover { color:#C8A46B; }

    .cq-r1 { display:grid; grid-template-columns:148px 110px 1fr 1fr; gap:10px; margin-bottom:10px; }
    .cq-r2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

    .cq-vuelo-row { margin-bottom:10px; padding:12px 14px; background:#0f0f0f; border:1px solid rgba(200,164,107,0.25); border-radius:3px; }
    .cq-vuelo-row .cq-f label { color:#C8A46B; }

    .cq-row-tot { text-align:right; font-size:12px; color:#666; margin-top:10px; padding-top:10px; border-top:1px solid #161616; }
    .cq-row-tot strong { color:#C8A46B; font-size:13px; }

    .cq-summary { background:#0a0a0a; border:1px solid #2e2e2e; border-radius:4px; padding:20px 24px; margin-bottom:16px; }
    .cq-sl { display:flex; justify-content:space-between; font-size:13px; padding:5px 0; }
    .cq-sl span:first-child { color:#777; }
    .cq-sl span:last-child { color:#fff; }
    .cq-st { display:flex; justify-content:space-between; font-size:16px; padding:14px 0 0; margin-top:8px; border-top:1px solid #2e2e2e; }
    .cq-st span:first-child { color:#fff; }
    .cq-st span:last-child { color:#C8A46B; font-weight:700; font-size:18px; }

    .cq-note { font-size:11px; color:#444; line-height:1.65; margin-bottom:20px; }
    .cq-send { width:100%; padding:16px 24px; background:transparent; border:1px solid #C8A46B; color:#C8A46B; font-family:inherit; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; border-radius:2px; }
    .cq-send:hover:not(:disabled) { background:rgba(200,164,107,0.08); }
    .cq-send:disabled { border-color:#2e2e2e; color:#444; cursor:not-allowed; }
    .cq-send-note { font-size:11px; color:#444; text-align:center; margin-top:8px; }

    .cq-sent { text-align:center; padding:60px 24px; }
    .cq-sent h2 { font-family:var(--font-cormorant),Georgia,serif; font-size:34px; font-weight:300; margin-bottom:12px; color:#fff; }
    .cq-sent p { color:#BFC3C8; font-size:14px; margin-bottom:28px; line-height:1.7; }
    .cq-back { color:#C8A46B; font-size:12px; text-decoration:none; letter-spacing:0.1em; text-transform:uppercase; border-bottom:1px solid rgba(200,164,107,0.3); padding-bottom:2px; }


    .pac-container { background:#1a1a1a !important; border:1px solid #3a3a3a !important; border-radius:3px !important; box-shadow:0 4px 12px rgba(0,0,0,0.6) !important; font-family:var(--font-barlow),Arial,sans-serif !important; margin-top:4px !important; }
    .pac-item { padding:8px 12px !important; color:#BFC3C8 !important; font-size:13px !important; border-top:1px solid #2a2a2a !important; cursor:pointer !important; }
    .pac-item:hover, .pac-item-selected { background:#222 !important; }
    .pac-item-query { color:#fff !important; font-size:13px !important; }
    .pac-matched { color:#C8A46B !important; }
    .pac-icon { display:none !important; }

    @media (max-width:860px) {
      .cq-nav { padding:18px 20px; } .cq-nav-links { display:none; }
      .cq-header { padding:36px 20px 28px; } .cq-h1 { font-size:34px; }
      .cq-body { padding:28px 20px 60px; }
      .cq-g3 { grid-template-columns:1fr 1fr; }
      .cq-r1 { grid-template-columns:1fr 1fr; }
    }
    @media (max-width:500px) {
      .cq-g3,.cq-g2,.cq-r1,.cq-r2 { grid-template-columns:1fr; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="cq">
        <nav className="cq-nav">
          <Link href="/" className="cq-logo">ELITE ROUTE</Link>
          <div className="cq-nav-links">
            <Link href="/" className="cq-nl">Servicios</Link>
            <Link href="/tarifas" className="cq-nl">Tarifas</Link>
            <Link href="/b2b" className="cq-nl">Corporativo</Link>
            <Link href="/b2b/cotizar" className="cq-nl cq-nl-active">Cotizador B2B</Link>
          </div>
        </nav>

        <header className="cq-header">
          <p className="cq-kicker">Cuenta corporativa · Cotizador multi-servicio</p>
          <h1 className="cq-h1">Registra tus traslados<em>.</em></h1>
          <p className="cq-sub">
            Hasta {MAX_SERVICES} servicios, precio en tiempo real según la ruta.
            El desglose con IVA se envía directo a contabilidad.{" "}
            <Link href="/">¿Traslado individual? Cotizador principal →</Link>
          </p>
        </header>

        <div className="cq-body">
          {sent ? (
            <div className="cq-sent">
              <div style={{ fontSize:42, marginBottom:18 }}>✉</div>
              <h2>Solicitud enviada</h2>
              <p>Tu cliente de correo se abrió con la cotización completa.<br />Confirmamos precios en menos de 24 hrs.</p>
              <button className="cq-send" style={{ maxWidth:280, margin:"0 auto 24px" }} onClick={() => setSent(false)}>
                Agregar más servicios
              </button>
              <br />
              <Link href="/b2b" className="cq-back">← Volver a cuenta corporativa</Link>
            </div>
          ) : (
            <>
              {/* EMPRESA */}
              <section className="cq-sec">
                <p className="cq-sec-label">Datos de la empresa</p>
                <div className="cq-g3">
                  <div className="cq-f">
                    <label>Empresa *</label>
                    <input type="text" placeholder="Grupo Financiero XYZ" value={empresa.nombre}
                      onChange={(e) => updateEmpresa("nombre", e.target.value)} />
                  </div>
                  <div className="cq-f">
                    <label>RFC</label>
                    <input type="text" placeholder="GFX900101ABC" value={empresa.rfc}
                      onChange={(e) => updateEmpresa("rfc", e.target.value.toUpperCase())} />
                  </div>
                  <div className="cq-f">
                    <label>Correo *</label>
                    <input type="email" placeholder="coordinador@empresa.com" value={empresa.correo}
                      onChange={(e) => updateEmpresa("correo", e.target.value)} />
                  </div>
                </div>
                <div className="cq-g2">
                  <div className="cq-f">
                    <label>Responsable</label>
                    <input type="text" placeholder="Coordinador de viajes" value={empresa.responsable}
                      onChange={(e) => updateEmpresa("responsable", e.target.value)} />
                  </div>
                  <div className="cq-f">
                    <label>Teléfono</label>
                    <input type="tel" placeholder="55 0000 0000" value={empresa.telefono}
                      onChange={(e) => updateEmpresa("telefono", e.target.value)} />
                  </div>
                </div>
              </section>

              {/* SERVICIOS */}
              <section className="cq-sec">
                <div className="cq-svc-hdr">
                  <p className="cq-sec-label" style={{ marginBottom:0 }}>
                    Servicios ({services.length}/{MAX_SERVICES})
                  </p>
                  <button className="cq-add" onClick={addService} disabled={services.length >= MAX_SERVICES}>
                    + Agregar servicio
                  </button>
                </div>

                {services.map((s, idx) => (
                  <ServiceRow
                    key={s.id}
                    service={s}
                    index={idx}
                    showRemove={services.length > 1}
                    isLoaded={isLoaded}
                    onUpdate={updateService}
                    onRemove={removeService}
                  />
                ))}
              </section>

              {/* RESUMEN */}
              <section className="cq-sec">
                <p className="cq-sec-label">Resumen</p>
                <div className="cq-summary">
                  <div className="cq-sl">
                    <span>Subtotal sin IVA ({services.length} servicio{services.length !== 1 ? "s" : ""})</span>
                    <span>{fmt(totals.base)}</span>
                  </div>
                  <div className="cq-sl"><span>IVA 16%</span><span>{fmt(totals.iva)}</span></div>
                  <div className="cq-st"><span>Total</span><span>{fmt(totals.total)}</span></div>
                </div>

                <p className="cq-note">
                  {hasEstimates
                    ? "* Algunos servicios muestran tarifa mínima. El total se actualiza automáticamente al seleccionar origen y destino."
                    : "Precio calculado con la ruta real. IVA 16% desglosado por servicio."}
                </p>

                <button className="cq-send" onClick={handleSend} disabled={!canSend}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,12 2,6"/>
                  </svg>
                  Enviar solicitud de servicios
                </button>
                <p className="cq-send-note">
                  {canSend
                    ? "Se abrirá tu cliente de correo con el desglose completo pre-llenado."
                    : "Completa empresa*, correo* y todos los campos obligatorios (*) para enviar."}
                </p>
              </section>
            </>
          )}
        </div>

        <footer style={{ borderTop:"1px solid #1e1e1e", padding:"20px 56px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:11, color:"#555", letterSpacing:"0.06em" }}>Elite Route CDMX · business@eliteroute.mx</span>
          <Link href="/b2b" style={{ fontSize:11, color:"#C8A46B", textDecoration:"none", letterSpacing:"0.06em" }}>← Cuenta corporativa</Link>
        </footer>
      </div>
    </>
  );
}
