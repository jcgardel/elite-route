import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Transporte Ejecutivo Corporativo CDMX | Elite Route B2B",
  description:
    "Cuenta corporativa para empresas en CDMX. Rutas recurrentes, factura electrónica CFDI, choferes verificados y pago con Stripe, Mercado Pago o transferencia bancaria.",
  openGraph: {
    title: "Transporte Ejecutivo Corporativo CDMX | Elite Route",
    description: "Cuenta corporativa, factura CFDI y choferes verificados en CDMX.",
    url: "https://eliteroute.mx/b2b",
    siteName: "Elite Route",
    images: [{ url: "https://eliteroute.mx/executive.jpg", width: 1200, height: 630, alt: "Elite Route — Ejecutivo BMW Mercedes CDMX" }],
    locale: "es_MX",
    type: "website",
  },
};

const WHATSAPP_B2B = "https://wa.me/525543582919?text=Hola%2C+me+interesa+una+cuenta+corporativa+para+mi+empresa.";

export default function B2BPage() {
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
          .b-steps { grid-template-columns: 1fr; }
          .b-hero-btns { flex-direction: column; }
          .b-cta-h2 { font-size: 32px; }
        }
      `}</style>

      <div className="b-root">

        {/* NAV */}
        <nav className="b-nav">
          <Link href="/" className="b-logo">ELITE ROUTE</Link>
          <div className="b-nav-links">
            <Link href="/" className="b-nav-link">Inicio</Link>
            <Link href="/tarifas" className="b-nav-link">Tarifas</Link>
            <Link href="/b2b" className="b-nav-link b-nav-link-active">Corporativo</Link>
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-nav-cta">Contactar →</a>
          </div>
          <button
            className="b-hamburger"
            aria-label="Abrir menú"
            id="b-hamburger-btn"
          >
            <span /><span /><span />
          </button>
        </nav>
        <div id="b-mobile-menu" className="b-mobile-menu">
          <Link href="/" className="b-mobile-link">Inicio</Link>
          <Link href="/tarifas" className="b-mobile-link">Tarifas</Link>
          <Link href="/b2b" className="b-mobile-link" style={{color:"#C8A46B"}}>Corporativo</Link>
          <Link href="/b2b/cotizar" className="b-mobile-link">Cotizar servicios</Link>
          <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-mobile-link b-mobile-link-cta">Contactar →</a>
        </div>

        {/* HERO */}
        <section className="b-hero">
          <p className="b-kicker">Soluciones para empresas</p>
          <h1 className="b-h1">Tu equipo llega<br />a tiempo<span>.</span></h1>
          <p className="b-hero-copy">
            Transporte ejecutivo para empresas en CDMX. Rutas recurrentes, factura electrónica CFDI
            y cuenta corporativa centralizada con atención prioritaria 24/7.
          </p>
          <div className="b-hero-btns">
            <Link href="/b2b/cotizar" className="b-btn-primary">
              Cotizar servicios →
            </Link>
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-btn-ghost">
              Hablar con un asesor
            </a>
          </div>
        </section>

        {/* TRUST GRID */}
        <section className="b-trust">
          <p className="b-section-kicker">Estándar corporativo</p>
          <h2 className="b-h2">Diseñado para empresas<span>.</span></h2>
          <div className="b-trust-grid">

            <div className="b-trust-cell">
              <div className="b-check">✓</div>
              <div className="b-cell-title">Factura electrónica CFDI</div>
              <div className="b-cell-copy">CFDI disponible por cada servicio. Proceso directo con tu área administrativa sin fricciones.</div>
            </div>

            <div className="b-trust-cell">
              <div className="b-check">✓</div>
              <div className="b-cell-title">Confirmación inmediata</div>
              <div className="b-cell-copy">Reserva confirmada al instante. Sin llamadas, sin esperas, sin incertidumbre para tu coordinador de viajes.</div>
            </div>

            <div className="b-trust-cell">
              <div className="b-check">✓</div>
              <div className="b-cell-title">Monitoreo de vuelo</div>
              <div className="b-cell-copy">Tu chofer rastrea el vuelo en tiempo real. Llegamos cuando tú llegas, sin cargos por demora.</div>
            </div>

            <div className="b-trust-cell">
              <div className="b-check">✓</div>
              <div className="b-cell-title">Choferes verificados</div>
              <div className="b-cell-copy">Licencia profesional, antecedentes verificados y capacitación continua en etiqueta ejecutiva.</div>
            </div>

            <div className="b-trust-cell">
              <div className="b-check">✓</div>
              <div className="b-cell-title">Flota asegurada</div>
              <div className="b-cell-copy">Todos los vehículos con seguro de cobertura amplia y mantenimiento preventivo certificado.</div>
            </div>

            <div className="b-trust-cell">
              <div className="b-check">✓</div>
              <div className="b-cell-title">Ingreso directo al aeropuerto</div>
              <div className="b-cell-copy">Tu chofer ingresa a la zona de llegadas con tablet / iPad mostrando tu nombre. Sin confusiones, sin esperas en el exterior.</div>
            </div>

            <div className="b-trust-cell">
              <div className="b-check">✓</div>
              <div className="b-cell-title">Tarjeta digital del conductor</div>
              <div className="b-cell-copy">Antes de cada traslado recibes foto del chofer, modelo del vehículo y placas. Cero incertidumbre para tu equipo.</div>
            </div>

            {/* PAYMENT CELL */}
            <div className="b-payment-cell">
              <div>
                <div className="b-payment-label">Métodos de pago aceptados</div>
                <div className="b-payment-methods">
                  <div className="b-payment-badge">
                    <div className="b-payment-dot" style={{ background: "#635BFF" }} />
                    <span className="b-payment-name" style={{ color: "#635BFF" }}>Stripe</span>
                    <span style={{ color: "#666", fontSize: "11px" }}>· Tarjeta</span>
                  </div>
                  <div className="b-payment-badge">
                    <div className="b-payment-dot" style={{ background: "#009EE3" }} />
                    <span className="b-payment-name" style={{ color: "#009EE3" }}>Mercado Pago</span>
                    <span style={{ color: "#666", fontSize: "11px" }}>· Tarjeta / wallet</span>
                  </div>
                  <div className="b-payment-badge">
                    <div className="b-payment-dot" style={{ background: "#C8A46B" }} />
                    <span className="b-payment-name" style={{ color: "#C8A46B" }}>Transferencia</span>
                    <span style={{ color: "#666", fontSize: "11px" }}>· SPEI / CoDi</span>
                  </div>
                </div>
              </div>
              <div className="b-payment-sub">Encriptación de grado bancario. Pago empresarial con referencia para conciliación contable.</div>
            </div>

          </div>
        </section>

        {/* TARIFAS AEROPUERTOS */}
        <section className="b-trust" style={{borderBottom:"1px solid #1e1e1e"}}>
          <p className="b-section-kicker">Tarifas corporativas · Aeropuertos</p>
          <h2 className="b-h2">Precios fijos en los 3 aeropuertos<span>.</span></h2>
          <p style={{color:"#BFC3C8",fontSize:"14px",marginBottom:"40px",maxWidth:"580px",lineHeight:"1.7"}}>
            IVA incluido. Sin cargos ocultos. Recargo aeropuerto incluye ingreso a zona de llegadas, espera y estacionamiento.
          </p>

          {[
            {
              airport:"AICM · Benito Juárez",
              code:"MEX",
              note:"El aeropuerto más cercano al centro de CDMX.",
              rows:[
                {cat:"Sedán",sub:"Nissan / VW",polanco:"$1,015",santafe:"$1,421",centro:"$1,015",sur:"$1,015"},
                {cat:"Ejecutivo",sub:"BMW / Mercedes / Tesla",polanco:"$1,754",santafe:"$2,791",centro:"$1,378",sur:"$1,993"},
                {cat:"Minivan",sub:"Captiva · 7 pax",polanco:"$1,595",santafe:"$2,538",centro:"$1,595",sur:"$1,813"},
                {cat:"High SUV",sub:"Suburban / Escalade",polanco:"$2,345",santafe:"$3,730",centro:"$2,320",sur:"$2,664"},
              ],
              cols:["→ Polanco","→ Santa Fe","→ Centro","→ Pedregal / Sur"],
            },
            {
              airport:"AIFA · Felipe Ángeles",
              code:"NLU",
              note:"~55 km al norte de CDMX. Zona industrial Tultitlán.",
              rows:[
                {cat:"Sedán",sub:"Nissan / VW",polanco:"$2,233",santafe:"$2,760",centro:"$2,030",sur:""},
                {cat:"Ejecutivo",sub:"BMW / Mercedes / Tesla",polanco:"$4,386",santafe:"$5,423",centro:"$3,988",sur:""},
                {cat:"Minivan",sub:"Captiva · 7 pax",polanco:"$3,988",santafe:"$4,930",centro:"$3,625",sur:""},
                {cat:"High SUV",sub:"Suburban / Escalade",polanco:"$5,862",santafe:"$7,247",centro:"$5,329",sur:""},
              ],
              cols:["→ Polanco","→ Santa Fe","→ Centro CDMX","→ Consultar"],
            },
            {
              airport:"Aeropuerto Toluca",
              code:"TLC",
              note:"~65 km al poniente. Conexión directa a Santa Fe.",
              rows:[
                {cat:"Sedán",sub:"Nissan / VW",polanco:"$2,639",santafe:"$1,827",centro:"$2,842",sur:""},
                {cat:"Ejecutivo",sub:"BMW / Mercedes / Tesla",polanco:"$5,184",santafe:"$3,589",centro:"$5,583",sur:""},
                {cat:"Minivan",sub:"Captiva · 7 pax",polanco:"$4,713",santafe:"$3,263",centro:"$5,075",sur:""},
                {cat:"High SUV",sub:"Suburban / Escalade",polanco:"$6,927",santafe:"$4,796",centro:"$7,460",sur:""},
              ],
              cols:["→ Polanco","→ Santa Fe","→ Centro CDMX","→ Consultar"],
            },
          ].map((section,si)=>(
            <div key={si} style={{marginBottom: si < 2 ? "48px" : 0}}>
              <div style={{display:"flex",alignItems:"baseline",gap:"12px",marginBottom:"6px"}}>
                <span style={{color:"#fff",fontWeight:600,fontSize:"16px"}}>{section.airport}</span>
                <span style={{color:"#C8A46B",fontSize:"11px",letterSpacing:"0.14em"}}>{section.code}</span>
              </div>
              <p style={{color:"#666",fontSize:"12px",marginBottom:"16px"}}>{section.note}</p>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",minWidth:"680px"}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #2e2e2e"}}>
                      <th style={{textAlign:"left",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.1em",textTransform:"uppercase",fontSize:"11px"}}>Categoría</th>
                      {section.cols.map((c,i)=>(
                        <th key={i} style={{textAlign:"right",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.08em",textTransform:"uppercase",fontSize:"11px"}}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((r,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #1a1a1a"}}>
                        <td style={{padding:"14px",color:"#fff"}}>
                          <div style={{fontWeight:600,marginBottom:"2px"}}>{r.cat}</div>
                          <div style={{color:"#555",fontSize:"11px"}}>{r.sub}</div>
                        </td>
                        <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600}}>{r.polanco}</td>
                        <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600}}>{r.santafe}</td>
                        <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600}}>{r.centro}</td>
                        <td style={{textAlign:"right",padding:"14px",color:"#555",fontSize:"12px"}}>{r.sur || "Cotizar"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div style={{marginTop:"48px",borderTop:"1px solid #2e2e2e",paddingTop:"32px"}}>
            <div style={{color:"#fff",fontWeight:600,fontSize:"15px",marginBottom:"6px"}}>Servicio por hora · CDMX</div>
            <p style={{color:"#666",fontSize:"12px",marginBottom:"16px"}}>Mínimo 2 horas. Chofer a disposición durante las horas contratadas. IVA incluido.</p>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",minWidth:"480px"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #2e2e2e"}}>
                    <th style={{textAlign:"left",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.1em",textTransform:"uppercase",fontSize:"11px"}}>Categoría</th>
                    <th style={{textAlign:"right",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.1em",textTransform:"uppercase",fontSize:"11px"}}>Tarifa / hora c/IVA</th>
                    <th style={{textAlign:"right",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.1em",textTransform:"uppercase",fontSize:"11px"}}>2 horas</th>
                    <th style={{textAlign:"right",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.1em",textTransform:"uppercase",fontSize:"11px"}}>4 horas</th>
                    <th style={{textAlign:"right",padding:"10px 14px",color:"#9a9a9a",fontWeight:400,letterSpacing:"0.1em",textTransform:"uppercase",fontSize:"11px"}}>8 horas</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {cat:"Sedán",sub:"Nissan / VW",hrIva:"$522",h2:"$1,044",h4:"$2,088",h8:"$4,176"},
                    {cat:"Ejecutivo",sub:"BMW / Mercedes / Tesla",hrIva:"$754",h2:"$1,508",h4:"$3,016",h8:"$6,032"},
                    {cat:"Minivan",sub:"Captiva · 7 pax",hrIva:"$812",h2:"$1,624",h4:"$3,248",h8:"$6,496"},
                    {cat:"High SUV",sub:"Suburban / Escalade",hrIva:"$1,392",h2:"$2,784",h4:"$5,568",h8:"$11,136"},
                  ].map((r,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #1a1a1a"}}>
                      <td style={{padding:"14px",color:"#fff"}}>
                        <div style={{fontWeight:600,marginBottom:"2px"}}>{r.cat}</div>
                        <div style={{color:"#555",fontSize:"11px"}}>{r.sub}</div>
                      </td>
                      <td style={{textAlign:"right",padding:"14px",color:"#BFC3C8"}}>{r.hrIva}</td>
                      <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600}}>{r.h2}</td>
                      <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600}}>{r.h4}</td>
                      <td style={{textAlign:"right",padding:"14px",color:"#C8A46B",fontWeight:600}}>{r.h8}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{color:"#555",fontSize:"11px",marginTop:"32px",letterSpacing:"0.06em",lineHeight:"1.8"}}>
            Todos los precios incluyen IVA · Recargo aeropuerto incluido (ingreso a zona de llegadas, espera y estacionamiento) · Distancias y tiempos estimados sujetos a tráfico
          </p>
        </section>

        {/* PROCESO */}
        <section className="b-proceso">
          <p className="b-section-kicker">Cómo funciona</p>
          <h2 className="b-h2">Tu cuenta activa en 24 hrs<span>.</span></h2>
          <div className="b-steps">
            <div className="b-step">
              <div className="b-step-num">01</div>
              <div className="b-step-title">Contacto</div>
              <div className="b-step-copy">Nos escribes por WhatsApp con los datos de tu empresa y necesidades de transporte.</div>
            </div>
            <div className="b-step">
              <div className="b-step-num">02</div>
              <div className="b-step-title">Cuenta corporativa</div>
              <div className="b-step-copy">Configuramos tarifas fijas, datos de facturación y método de pago preferido.</div>
            </div>
            <div className="b-step">
              <div className="b-step-num">03</div>
              <div className="b-step-title">Reservas</div>
              <div className="b-step-copy">Tu equipo reserva directo en eliteroute.mx o por WhatsApp. Confirmación inmediata.</div>
            </div>
            <div className="b-step">
              <div className="b-step-num">04</div>
              <div className="b-step-title">Seguimiento 24/7</div>
              <div className="b-step-copy">Atención directa por WhatsApp. Confirmaciones, cambios de último momento y facturas en minutos.</div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="b-cta">
          <h2 className="b-cta-h2">¿Listo para empezar<span>?</span></h2>
          <p className="b-cta-copy">Escríbenos y en menos de 24 horas tienes tu cuenta activa.</p>
          <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap"}}>
            <Link href="/b2b/cotizar" className="b-btn-primary">
              Cotizar servicios →
            </Link>
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-btn-ghost">
              Solicitar cuenta corporativa
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="b-footer">
          <span className="b-footer-copy">Elite Route CDMX · eliteroute.mx</span>
          <Link href="/" className="b-footer-link">← Volver al cotizador</Link>
        </footer>

      </div>

      {/* HAMBURGER SCRIPT */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('b-hamburger-btn')?.addEventListener('click', function() {
          document.getElementById('b-mobile-menu')?.classList.toggle('open');
        });
      `}} />

      {/* WHATSAPP FLOTANTE */}
      <a
        href={WHATSAPP_B2B}
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
