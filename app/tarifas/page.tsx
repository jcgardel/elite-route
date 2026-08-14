import type { Metadata } from "next";
import Link from "next/link";
import { calculatePrice, type Category } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Tarifas de Transporte Ejecutivo en CDMX | Elite Route",
  description:
    "Consulta las tarifas fijas de traslado ejecutivo en Ciudad de México. Precios con IVA incluido para aeropuerto AICM, AIFA, Toluca y rutas corporativas. Sedan, Executive, Minivan y SUV.",
  keywords:
    "tarifa traslado aeropuerto CDMX, precio chofer ejecutivo Ciudad de México, tarifa AICM Polanco, costo traslado AIFA CDMX, transporte ejecutivo precio, tarifa chofer privado CDMX",
  openGraph: {
    title: "Tarifas Elite Route — Transporte Ejecutivo CDMX",
    description:
      "Precios fijos con IVA incluido para traslados ejecutivos en Ciudad de México. AICM, AIFA, Toluca y rutas corporativas.",
    url: "https://eliteroute.mx/tarifas",
    siteName: "Elite Route",
    images: [{ url: "https://eliteroute.mx/executive.jpg", width: 1200, height: 630, alt: "Elite Route — Transporte ejecutivo CDMX" }],
    locale: "es_MX",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Elite Route",
  description:
    "Servicio de transporte ejecutivo privado en Ciudad de México. Traslados al aeropuerto AICM, AIFA y Toluca con choferes profesionales.",
  url: "https://eliteroute.mx",
  telephone: "+52-55-4358-2919",
  email: "business@eliteroute.mx",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ciudad de México",
    addressRegion: "CDMX",
    addressCountry: "MX",
  },
  areaServed: [
    "Ciudad de México",
    "Estado de México",
    "Aeropuerto Internacional Benito Juárez",
    "Aeropuerto Internacional Felipe Ángeles",
    "Aeropuerto de Toluca",
  ],
  priceRange: "$$$$",
  openingHours: "Mo-Su 00:00-23:59",
};

const styles = `

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0A0A; color: #fff; font-family: var(--font-barlow), sans-serif; font-weight: 300; }

  .tf-nav { max-width: 1180px; margin: 0 auto; padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; }
  .tf-logo { width: 160px; height: auto; display: block; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5)); }
  .tf-nav-cta { border: 1px solid #C8A46B; border-radius: 2px; padding: 10px 18px; color: #fff; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; transition: background 0.2s, color 0.2s; }
  .tf-nav-cta:hover { background: #C8A46B; color: #0A0A0A; }

  .tf-hero { border-bottom: 1px solid #1e1e1e; padding: 60px 28px 56px; text-align: center; max-width: 1180px; margin: 0 auto; }
  .tf-kicker { color: #C8A46B; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 16px; }
  .tf-title { font-family: var(--font-cormorant), serif; font-size: clamp(40px, 6vw, 72px); font-weight: 300; line-height: 1; margin-bottom: 20px; color: #fff; }
  .tf-subtitle { color: #BFC3C8; font-size: 17px; line-height: 1.7; max-width: 620px; margin: 0 auto 32px; }
  .tf-badge { display: inline-flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .tf-badge-item { font-size: 12px; color: #BFC3C8; letter-spacing: 0.1em; border-left: 2px solid #C8A46B; padding-left: 12px; text-align: left; }
  .tf-badge-val { color: #fff; font-weight: 600; display: block; font-size: 14px; margin-bottom: 2px; }

  .tf-main { max-width: 1180px; margin: 0 auto; padding: 0 28px 100px; }

  .tf-section { margin-top: 64px; }
  .tf-section-label { color: #C8A46B; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 12px; }
  .tf-section-title { font-family: var(--font-cormorant), serif; font-size: clamp(28px, 4vw, 46px); font-weight: 300; color: #fff; margin-bottom: 8px; line-height: 1.1; }
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
  .tf-table .tf-price { font-family: var(--font-cormorant), serif; font-size: 22px; font-weight: 400; white-space: nowrap; }
  .tf-table .tf-price-note { font-size: 10px; color: #9a9a9a; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-top: 2px; }
  .tf-cat-header { background: rgba(200,164,107,0.08) !important; }
  .tf-cat-name { font-family: var(--font-barlow-condensed), sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
  .tf-cat-tag { font-size: 11px; color: #9a9a9a; display: block; margin-top: 1px; font-weight: 400; letter-spacing: 0; text-transform: none; }

  .tf-note { background: rgba(200,164,107,0.08); border: 1px solid rgba(200,164,107,0.25); border-radius: 2px; padding: 14px 18px; font-size: 13px; color: #BFC3C8; line-height: 1.6; margin-top: 16px; }
  .tf-note strong { color: #C8A46B; }

  .tf-faq { margin-top: 64px; }
  .tf-faq-item { border-top: 1px solid #1e1e1e; padding: 22px 0; }
  .tf-faq-q { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 10px; }
  .tf-faq-a { color: #BFC3C8; font-size: 14px; line-height: 1.7; max-width: 780px; }

  .tf-cta { margin-top: 72px; border: 1px solid rgba(200,164,107,0.45); padding: 48px; text-align: center; background: rgba(255,255,255,0.02); }
  .tf-cta-title { font-family: var(--font-cormorant), serif; font-size: clamp(28px, 4vw, 48px); font-weight: 300; margin-bottom: 16px; }
  .tf-cta-copy { color: #BFC3C8; font-size: 16px; margin-bottom: 28px; line-height: 1.6; }
  .tf-cta-btn { display: inline-flex; align-items: center; justify-content: center; border: 1px solid #C8A46B; color: #fff; background: transparent; text-decoration: none; padding: 16px 36px; font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; transition: background 0.2s, color 0.2s; }
  .tf-cta-btn:hover { background: #C8A46B; color: #0A0A0A; }

  .tf-footer { text-align: center; padding: 32px 28px; border-top: 1px solid #1a1a1a; font-size: 11px; color: #555; letter-spacing: 0.06em; line-height: 1.8; }

  @media (max-width: 700px) {
    .tf-nav { padding: 18px; }
    .tf-logo { width: 130px; }
    .tf-hero { padding: 40px 18px 44px; }
    .tf-main { padding: 0 18px 64px; }
    .tf-cta { padding: 32px 20px; }
    .tf-badge { gap: 16px; }
  }
`;

// Precios calculados dinámicamente desde lib/booking.ts
// Si cambian las tarifas en tariffs, estos precios se actualizan automáticamente en el siguiente build.
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

const aeropuertoDesde = [
  { ruta: "AICM → Centro Histórico / Roma / Condesa", zona: "~15 km", km: 15, min: 25 },
  { ruta: "AICM → Polanco / Lomas de Chapultepec",   zona: "~22 km", km: 22, min: 30 },
  { ruta: "AICM → Santa Fe / Interlomas",             zona: "~35 km", km: 35, min: 50 },
  { ruta: "AICM → Satélite / Naucalpan",              zona: "~30 km", km: 30, min: 40 },
  { ruta: "AIFA → CDMX (cualquier zona)",             zona: "~68 km", km: 68, min: 75 },
  { ruta: "Aeropuerto Toluca → CDMX",                 zona: "~80 km", km: 80, min: 85 },
];

const aeropuertoHacia = [
  { ruta: "Centro Histórico / Roma / Condesa → AICM", km: 15, min: 25 },
  { ruta: "Polanco / Lomas → AICM",                   km: 22, min: 30 },
  { ruta: "Santa Fe / Interlomas → AICM",              km: 35, min: 50 },
  { ruta: "CDMX → AIFA",                              km: 68, min: 75 },
  { ruta: "CDMX → Aeropuerto Toluca",                 km: 80, min: 85 },
];

const porHora = [
  { horas: "2 horas",            hours: 2 },
  { horas: "3 horas",            hours: 3 },
  { horas: "4 horas",            hours: 4 },
  { horas: "5 horas",            hours: 5 },
  { horas: "6 horas",            hours: 6 },
  { horas: "Día completo (10 hrs)", hours: 10 },
];

const faqs = [
  {
    q: "¿Los precios incluyen IVA?",
    a: "Sí. Todos los precios que ves en esta página y en el cotizador incluyen IVA (16%). No hay cargos ocultos ni sorpresas al final del servicio.",
  },
  {
    q: "¿Por qué los traslados desde el aeropuerto cuestan más que hacia el aeropuerto?",
    a: "Los traslados de salida desde cualquier aeropuerto incluyen un cargo por estacionamiento y tiempo de espera por posibles retrasos de vuelo. Nuestro chofer monitorea tu vuelo en tiempo real y espera el tiempo necesario sin costo adicional.",
  },
  {
    q: "¿Qué pasa si mi vuelo se retrasa?",
    a: "Nada. El cargo por espera ya está incluido en la tarifa de salida desde aeropuerto. Tu chofer espera el tiempo que sea necesario sin cobrar extra.",
  },
  {
    q: "¿Puedo pagar con tarjeta de crédito o débito?",
    a: "Sí. Aceptamos todas las tarjetas de crédito y débito mediante pago seguro con Stripe. También puedes coordinar tu reserva por WhatsApp.",
  },
  {
    q: "¿Emiten factura?",
    a: "Sí. Emitimos factura CFDI para todos los servicios. Escríbenos a contabilidad@eliteroute.mx con tus datos fiscales.",
  },
  {
    q: "¿Cuánto tiempo de anticipación necesito para reservar?",
    a: "Se requiere un mínimo de 6 horas de anticipación para confirmar tu reserva. Para servicios en horario de madrugada o rutas foráneas, lo ideal es reservar con 24 horas de antelación.",
  },
  {
    q: "¿Cuál es la diferencia entre Sedan, Executive y SUV?",
    a: "Sedan: ideal para 1-3 pasajeros con equipaje ligero. Executive: vehículos premium para 1-3 pasajeros, mayor confort y espacio. Minivan: grupos de 4-6 personas con equipaje amplio. HIGH SUV: el nivel más alto de lujo para 1-6 pasajeros.",
  },
  {
    q: "¿Hacen traslados a Querétaro, Cuernavaca u otras ciudades?",
    a: "Sí. Cubrimos rutas foráneas a cualquier destino desde Ciudad de México. Escríbenos a business@eliteroute.mx o usa el cotizador para calcular el precio exacto.",
  },
];

export default function TarifasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <style>{styles}</style>

      {/* NAV */}
      <nav>
        <div className="tf-nav">
          <Link href="/">
            <img className="tf-logo" src="/elite-route-logo.png" alt="Elite Route" />
          </Link>
          <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
            <Link href="/b2b" style={{fontSize:"11px",letterSpacing:"0.12em",color:"#BFC3C8",textDecoration:"none",textTransform:"uppercase"}}>Corporativo</Link>
            <Link className="tf-nav-cta" href="/#quote">Cotizar ahora</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="tf-hero">
        <p className="tf-kicker">Elite Route · Ciudad de México</p>
        <h1 className="tf-title">Tarifas de transporte<br />ejecutivo en CDMX</h1>
        <p className="tf-subtitle">
          Precios fijos con IVA incluido. Sin cargos por tráfico, sin sorpresas.
          Traslados al aeropuerto AICM, AIFA, Toluca y rutas corporativas.
        </p>
        <div className="tf-badge">
          <div className="tf-badge-item">
            <span className="tf-badge-val">IVA incluido</span>
            Precio final sin cargos ocultos
          </div>
          <div className="tf-badge-item">
            <span className="tf-badge-val">Precio fijo</span>
            Sin variaciones por tráfico
          </div>
          <div className="tf-badge-item">
            <span className="tf-badge-val">Factura CFDI</span>
            Para empresas y particulares
          </div>
          <div className="tf-badge-item">
            <span className="tf-badge-val">24 / 7</span>
            Disponibilidad todos los días
          </div>
        </div>
      </div>

      <main className="tf-main">

        {/* TRASLADOS DESDE AEROPUERTO */}
        <section className="tf-section" aria-labelledby="desde-aeropuerto">
          <p className="tf-section-label">Salida desde aeropuerto</p>
          <h2 className="tf-section-title" id="desde-aeropuerto">
            Traslado desde AICM, AIFA y Toluca
          </h2>
          <p className="tf-section-copy">
            Incluye monitoreo de vuelo, espera por retrasos y cargo de estacionamiento.
            Tu chofer espera el tiempo necesario sin costo adicional.
          </p>
          <div className="tf-table-wrap">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Ruta</th>
                  <th>Sedan</th>
                  <th>Executive</th>
                  <th>Minivan</th>
                  <th>HIGH SUV</th>
                </tr>
              </thead>
              <tbody>
                {aeropuertoDesde.map((r) => (
                  <tr key={r.ruta}>
                    <td>
                      <div className="tf-route">
                        <strong>{r.ruta}</strong>
                        {r.zona}
                      </div>
                    </td>
                    {cats.map((cat) => (
                      <td key={cat}>
                        <span className="tf-price">{p(r.km, r.min, cat, true)}</span>
                        <span className="tf-price-note">MXN c/IVA</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tf-note">
            <strong>✈️ Espera incluida:</strong> Monitoreamos tu vuelo en tiempo real. Si llega tarde, tu chofer espera sin costo extra.
          </p>
        </section>

        {/* TRASLADOS HACIA AEROPUERTO */}
        <section className="tf-section" aria-labelledby="hacia-aeropuerto">
          <p className="tf-section-label">Traslado hacia aeropuerto</p>
          <h2 className="tf-section-title" id="hacia-aeropuerto">
            CDMX → AICM, AIFA y Toluca
          </h2>
          <p className="tf-section-copy">
            Precio directo sin espera en aeropuerto. Reserva con al menos
            6 horas de anticipación para garantizar disponibilidad.
          </p>
          <div className="tf-table-wrap">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Ruta</th>
                  <th>Sedan</th>
                  <th>Executive</th>
                  <th>Minivan</th>
                  <th>HIGH SUV</th>
                </tr>
              </thead>
              <tbody>
                {aeropuertoHacia.map((r) => (
                  <tr key={r.ruta}>
                    <td>
                      <div className="tf-route">
                        <strong>{r.ruta}</strong>
                      </div>
                    </td>
                    {cats.map((cat) => (
                      <td key={cat}>
                        <span className="tf-price">{p(r.km, r.min, cat, false)}</span>
                        <span className="tf-price-note">MXN c/IVA</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SERVICIO POR HORA */}
        <section className="tf-section" aria-labelledby="por-hora">
          <p className="tf-section-label">Servicio por hora y día completo</p>
          <h2 className="tf-section-title" id="por-hora">
            Chofer por horas en CDMX
          </h2>
          <p className="tf-section-copy">
            Tu chofer permanece disponible durante las horas contratadas. Incluye
            20 km por hora. Ideal para reuniones, eventos o días de trabajo intenso.
          </p>
          <div className="tf-table-wrap">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Duración</th>
                  <th>Sedan</th>
                  <th>Executive</th>
                  <th>Minivan</th>
                  <th>HIGH SUV</th>
                </tr>
              </thead>
              <tbody>
                {porHora.map((r) => (
                  <tr key={r.horas}>
                    <td style={{ fontWeight: r.horas.includes("completo") ? 600 : 400, color: r.horas.includes("completo") ? "#C8A46B" : "#fff" }}>
                      {r.horas}
                    </td>
                    {cats.map((cat) => (
                      <td key={cat}>
                        <span className="tf-price">{ph(r.hours, cat)}</span>
                        <span className="tf-price-note">MXN c/IVA</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="tf-section tf-faq" aria-labelledby="faq">
          <p className="tf-section-label">Preguntas frecuentes</p>
          <h2 className="tf-section-title" id="faq" style={{ marginBottom: 32 }}>
            Todo lo que necesitas saber
          </h2>
          {faqs.map((f) => (
            <div className="tf-faq-item" key={f.q}>
              <p className="tf-faq-q">{f.q}</p>
              <p className="tf-faq-a">{f.a}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <div className="tf-cta">
          <h2 className="tf-cta-title">¿Quieres saber el precio exacto de tu ruta?</h2>
          <p className="tf-cta-copy">
            Usa el cotizador — calcula el precio en segundos con tu origen y destino real,
            incluyendo distancia, tiempo y categoría de vehículo.
          </p>
          <Link className="tf-cta-btn" href="/#quote">
            Cotizar mi traslado →
          </Link>
        </div>

      </main>

      <footer className="tf-footer">
        Elite Route CDMX · Transporte ejecutivo privado<br />
        business@eliteroute.mx · contabilidad@eliteroute.mx<br />
        <Link href="/" style={{ color: "#C8A46B", textDecoration: "none" }}>eliteroute.mx</Link>
      </footer>

      {/* WHATSAPP FLOTANTE */}
      <a
        href="https://wa.me/525543582919?text=Hola%2C+quisiera+cotizar+un+traslado."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        style={{position:"fixed",bottom:"24px",right:"24px",zIndex:9999,width:"54px",height:"54px",borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(0,0,0,0.45)"}}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.118 1.528 5.845L.057 23.486a.5.5 0 0 0 .614.614l5.588-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.513-5.187-1.408l-.37-.222-3.844 1.007 1.03-3.76-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
    </>
  );
}
