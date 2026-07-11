import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Transporte Ejecutivo Corporativo CDMX | Elite Route B2B",
  description:
    "Cuenta corporativa para empresas en CDMX. Rutas recurrentes, factura electrónica CFDI, choferes verificados y pago con Stripe, Mercado Pago o transferencia bancaria.",
};

const WHATSAPP_B2B = "https://wa.me/525543582919?text=Hola%2C+me+interesa+una+cuenta+corporativa+para+mi+empresa.";

export default function B2BPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        .b-root { font-family: 'Barlow', 'Helvetica Neue', Arial, sans-serif; background: #080808; color: #fff; min-height: 100vh; }
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Cormorant+Garamond:wght@300;400&display=swap');

        /* NAV */
        .b-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 56px; border-bottom: 1px solid #1e1e1e; }
        .b-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; letter-spacing: 0.12em; color: #C8A46B; text-decoration: none; }
        .b-nav-links { display: flex; gap: 32px; align-items: center; }
        .b-nav-link { font-size: 11px; letter-spacing: 0.12em; color: #BFC3C8; text-transform: uppercase; text-decoration: none; transition: color 0.2s; }
        .b-nav-link:hover { color: #fff; }
        .b-nav-link-active { color: #C8A46B; border-bottom: 1px solid #C8A46B; padding-bottom: 2px; }
        .b-nav-cta { font-size: 11px; letter-spacing: 0.12em; color: #000; background: #C8A46B; padding: 10px 20px; text-transform: uppercase; text-decoration: none; font-weight: 700; transition: background 0.2s; }
        .b-nav-cta:hover { background: #b8924f; }

        /* HERO */
        .b-hero { padding: 88px 56px 72px; border-bottom: 1px solid #1e1e1e; }
        .b-kicker { font-size: 11px; letter-spacing: 0.22em; color: #C8A46B; text-transform: uppercase; margin-bottom: 18px; }
        .b-h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; font-size: 62px; line-height: 1.0; margin-bottom: 22px; }
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
        .b-h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; font-size: 38px; color: #fff; margin-bottom: 36px; }
        .b-h2 span { color: #C8A46B; }
        .b-trust-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #2e2e2e; border: 1px solid #2e2e2e; }
        .b-trust-cell { background: #080808; padding: 32px 28px; }
        .b-check { color: #C8A46B; font-size: 18px; margin-bottom: 16px; }
        .b-cell-title { font-weight: 600; font-size: 15px; margin-bottom: 8px; color: #fff; }
        .b-cell-copy { color: #BFC3C8; font-size: 13px; line-height: 1.65; }

        /* PAYMENT CELL */
        .b-payment-cell { background: #080808; padding: 32px 28px; display: flex; flex-direction: column; gap: 14px; }
        .b-payment-label { font-size: 10px; letter-spacing: 0.14em; color: #9a9a9a; text-transform: uppercase; margin-bottom: 4px; }
        .b-payment-methods { display: flex; flex-direction: column; gap: 10px; }
        .b-payment-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid #2e2e2e; width: fit-content; }
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
        .b-cta-h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; font-size: 46px; margin-bottom: 14px; }
        .b-cta-h2 span { color: #C8A46B; }
        .b-cta-copy { color: #BFC3C8; font-size: 14px; margin-bottom: 36px; }

        /* FOOTER */
        .b-footer { border-top: 1px solid #1e1e1e; padding: 24px 56px; display: flex; justify-content: space-between; align-items: center; }
        .b-footer-copy { font-size: 11px; color: #666; letter-spacing: 0.06em; }
        .b-footer-link { font-size: 11px; color: #C8A46B; text-decoration: none; letter-spacing: 0.06em; }

        @media (max-width: 900px) {
          .b-nav { padding: 18px 24px; }
          .b-nav-links { display: none; }
          .b-hero { padding: 56px 24px 48px; }
          .b-h1 { font-size: 42px; }
          .b-trust { padding: 48px 24px; }
          .b-trust-grid { grid-template-columns: 1fr; }
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
          <Link href="/" className="b-logo">ELITEROUTE</Link>
          <div className="b-nav-links">
            <Link href="/" className="b-nav-link">Servicios</Link>
            <Link href="/tarifas" className="b-nav-link">Tarifas</Link>
            <Link href="/b2b" className="b-nav-link b-nav-link-active">Corporativo</Link>
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-nav-cta">Contactar →</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="b-hero">
          <p className="b-kicker">Soluciones para empresas</p>
          <h1 className="b-h1">Tu equipo llega<br />a tiempo<span>.</span></h1>
          <p className="b-hero-copy">
            Transporte ejecutivo para empresas en CDMX. Rutas recurrentes, factura electrónica CFDI
            y cuenta corporativa centralizada con atención prioritaria 24/7.
          </p>
          <div className="b-hero-btns">
            <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-btn-primary">
              Solicitar cuenta corporativa →
            </a>
            <Link href="/tarifas" className="b-btn-ghost">Ver tarifas</Link>
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
              <div className="b-step-title">Reporte mensual</div>
              <div className="b-step-copy">Historial de viajes, facturas y resumen de gasto en un solo lugar.</div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="b-cta">
          <h2 className="b-cta-h2">¿Listo para empezar<span>?</span></h2>
          <p className="b-cta-copy">Escríbenos y en menos de 24 horas tienes tu cuenta activa.</p>
          <a href={WHATSAPP_B2B} target="_blank" rel="noopener noreferrer" className="b-btn-primary">
            Solicitar cuenta corporativa →
          </a>
        </section>

        {/* FOOTER */}
        <footer className="b-footer">
          <span className="b-footer-copy">Elite Route CDMX · eliteroute.mx</span>
          <Link href="/" className="b-footer-link">← Volver al cotizador</Link>
        </footer>

      </div>
    </>
  );
}
