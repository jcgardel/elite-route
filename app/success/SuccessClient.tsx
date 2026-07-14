"use client";

import { useEffect, useState } from "react";

const COUNTDOWN_SECONDS = 5;

export default function SuccessClient({
  whatsAppUrl,
  invoiceRequestUrl,
}: {
  whatsAppUrl: string;
  invoiceRequestUrl: string | null;
}) {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [isMobile, setIsMobile] = useState(false);
  const [sent, setSent] = useState(false);

  // Detectar móvil en el cliente
  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
  }, []);

  // Bloquear cierre/navegación hasta que se confirme por WhatsApp
  useEffect(() => {
    if (sent) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [sent]);

  // Countdown solo en móvil
  useEffect(() => {
    if (!isMobile || sent) return;
    if (seconds <= 0) {
      window.location.href = whatsAppUrl;
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [isMobile, seconds, sent, whatsAppUrl]);

  function handleWhatsApp() {
    setSent(true);
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Barlow:wght@400;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #080808; }

        /* OVERLAY BLOQUEANTE */
        .sc-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(8,8,8,0.97);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: sc-fade 0.3s ease;
        }
        @keyframes sc-fade { from { opacity: 0 } to { opacity: 1 } }

        .sc-panel {
          background: #0f0f0f;
          border: 1px solid #2e2e2e;
          max-width: 480px; width: 100%;
          padding: 48px 40px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .sc-check {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(37,211,102,0.12);
          border: 1px solid rgba(37,211,102,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
        }

        .sc-kicker {
          font-family: 'Barlow', sans-serif;
          font-size: 11px; letter-spacing: 0.2em; color: #C8A46B;
          text-transform: uppercase;
        }

        .sc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 300; color: #fff; line-height: 1.1;
        }

        .sc-copy {
          font-family: 'Barlow', sans-serif;
          font-size: 14px; color: #BFC3C8; line-height: 1.7;
        }

        .sc-copy strong { color: #fff; }

        .sc-countdown {
          font-family: 'Barlow', sans-serif;
          font-size: 13px; color: #9a9a9a;
          background: rgba(200,164,107,0.08);
          border: 1px solid rgba(200,164,107,0.2);
          padding: 10px 20px;
          width: 100%;
        }
        .sc-countdown span { color: #C8A46B; font-weight: 700; font-size: 15px; }

        .sc-btn-wa {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 20px 24px;
          background: #1DB954; color: #fff;
          font-family: 'Barlow', sans-serif;
          font-size: 15px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; text-decoration: none;
          border: none; cursor: pointer;
          box-shadow: 0 0 0 3px rgba(29,185,84,0.2), 0 0 24px rgba(29,185,84,0.15);
          transition: background 0.2s, box-shadow 0.2s;
          animation: sc-pulse 2.5s ease-in-out infinite;
        }
        .sc-btn-wa:hover { background: #17a349; box-shadow: 0 0 0 4px rgba(29,185,84,0.3), 0 0 32px rgba(29,185,84,0.25); }
        @keyframes sc-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(29,185,84,0.2), 0 0 24px rgba(29,185,84,0.15); }
          50% { box-shadow: 0 0 0 6px rgba(29,185,84,0.12), 0 0 36px rgba(29,185,84,0.28); }
        }

        .sc-divider {
          width: 100%; height: 1px; background: #1e1e1e;
        }

        .sc-invoice {
          font-family: 'Barlow', sans-serif;
          font-size: 12px; color: #666;
        }
        .sc-invoice a { color: #C8A46B; text-decoration: none; }
        .sc-invoice a:hover { color: #fff; }

        /* ESTADO ENVIADO */
        .sc-sent-panel {
          max-width: 480px; width: 100%;
          padding: 48px 40px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
        }
        .sc-home-link {
          font-family: 'Barlow', sans-serif;
          font-size: 12px; color: #C8A46B; text-decoration: none;
          letter-spacing: 0.1em; text-transform: uppercase;
          border-bottom: 1px solid rgba(200,164,107,0.3);
          padding-bottom: 2px;
        }
        .sc-home-link:hover { color: #fff; }

        @media (max-width: 540px) {
          .sc-panel, .sc-sent-panel { padding: 36px 24px; }
          .sc-title { font-size: 26px; }
        }
      `}</style>

      <div className="sc-overlay">
        {sent ? (
          /* Estado confirmado — ya mandó el WhatsApp */
          <div className="sc-sent-panel">
            <div className="sc-check">✓</div>
            <p className="sc-kicker">Confirmación enviada</p>
            <h1 className="sc-title">¡Listo! Nos vemos pronto.</h1>
            <p className="sc-copy">
              Recibimos tu mensaje en WhatsApp. Un agente confirmará
              tu traslado en los próximos minutos.
            </p>
            {invoiceRequestUrl && (
              <>
                <div className="sc-divider" />
                <p className="sc-invoice">
                  ¿Necesitas factura CFDI?{" "}
                  <a href={invoiceRequestUrl}>Solicitar factura</a>
                </p>
              </>
            )}
            <a href="/" className="sc-home-link">← Volver al inicio</a>
          </div>
        ) : (
          /* Modal bloqueante principal */
          <div className="sc-panel">
            <div className="sc-check">💳</div>
            <p className="sc-kicker">Pago confirmado</p>
            <h1 className="sc-title">Un paso más para asegurar tu traslado</h1>
            <p className="sc-copy">
              Tu pago fue procesado exitosamente. Para <strong>confirmar la disponibilidad
              y activar el servicio</strong>, necesitamos que envíes la confirmación
              por WhatsApp ahora.
            </p>

            {isMobile && !sent && (
              <div className="sc-countdown">
                Abriendo WhatsApp en <span>{seconds}</span> seg...
              </div>
            )}

            <button className="sc-btn-wa" onClick={handleWhatsApp}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.118 1.528 5.845L.057 23.486a.5.5 0 0 0 .614.614l5.588-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.513-5.187-1.408l-.37-.222-3.844 1.007 1.03-3.76-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Enviar confirmación por WhatsApp
            </button>

            <p className="sc-copy" style={{ fontSize: "12px", color: "#555" }}>
              El mensaje incluye: fecha, origen, destino, vehículo y número de confirmación de pago.
            </p>

            {invoiceRequestUrl && (
              <>
                <div className="sc-divider" />
                <p className="sc-invoice">
                  ¿Necesitas factura CFDI?{" "}
                  <a href={invoiceRequestUrl}>Solicitar factura por email</a>
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
