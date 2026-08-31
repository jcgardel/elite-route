"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { path, type Lang } from "@/lib/i18n";
import { track } from "@/lib/analytics";

/** Lo que la página de gracias necesita saber de la reserva. Vive aquí y no
 *  en la página porque es el componente que lo pinta. */
export type Booking = {
  folio: string;
  nombre: string;
  fecha: string;
  hora: string;
  servicio: string;
  origen: string;
  destino: string;
  vehiculo: string;
  notas: string;
  total: string;
  montoMxn: number;
  googleCalendarUrl: string | null;
  icsHref: string | null;
};

const TX = {
  es: {
    kicker: "Pago confirmado",
    folio: (f: string) => `Folio ${f}`,
    thanksNamed: (n: string) => `Gracias, ${n}.`,
    thanks: "Gracias por tu reserva.",
    copy: (agent: React.ReactNode) => (
      <>Tu pago quedó procesado y te enviamos la confirmación por correo. Un agente {agent}. Si prefieres resolverlo ahora mismo, escríbenos por WhatsApp.</>
    ),
    agent: "confirma la disponibilidad en los próximos minutos",
    when: "Fecha y hora",
    from: "Recogida",
    to: "Destino",
    vehicle: "Vehículo",
    notes: "Tus solicitudes",
    paid: "Pagado",
    wa: "Confirmar por WhatsApp",
    waSent: "Abrimos WhatsApp con tu mensaje. Si no se abrió, revisa que la app esté instalada.",
    waHint: "El mensaje ya lleva fecha, origen, destino, vehículo y número de pago.",
    ics: "Calendario (.ics)",
    invoice: "Solicitar factura CFDI",
    invoiceFallback: "Facturación: contabilidad@eliteroute.mx",
    home: "← Volver al inicio",
  },
  en: {
    kicker: "Payment confirmed",
    folio: (f: string) => `Ref. ${f}`,
    thanksNamed: (n: string) => `Thank you, ${n}.`,
    thanks: "Thank you for your booking.",
    copy: (agent: React.ReactNode) => (
      <>Your payment went through and the confirmation is on its way to your inbox. An agent {agent}. If you would rather settle it right now, message us on WhatsApp.</>
    ),
    agent: "confirms availability within the next few minutes",
    when: "Date and time",
    from: "Pickup",
    to: "Destination",
    vehicle: "Vehicle",
    notes: "Your requests",
    paid: "Paid",
    wa: "Confirm on WhatsApp",
    waSent: "We opened WhatsApp with your message. If nothing happened, check that the app is installed.",
    waHint: "The message already carries the date, pickup, destination, vehicle and payment reference.",
    ics: "Calendar (.ics)",
    invoice: "Request a CFDI invoice",
    invoiceFallback: "Invoicing: contabilidad@eliteroute.mx",
    home: "← Back to home",
  },
} as const;

/**
 * Página de gracias. Antes bloqueaba la salida del navegador con un aviso del
 * sistema y, en móvil, redirigía sola a WhatsApp a los cinco segundos: quien
 * acababa de pagar varios miles de pesos sentía que algo había salido mal.
 * Ahora el mensaje de WhatsApp se ofrece —no se impone— y la pantalla hace lo
 * que se espera de un servicio premium: dar el folio, el resumen del viaje y
 * la cita lista para el calendario. La confirmación por correo se envía sola
 * desde el webhook de Stripe, así que nada depende de retener al cliente aquí.
 */
export default function SuccessClient({
  whatsAppUrl,
  invoiceRequestUrl,
  booking,
  lang,
}: {
  whatsAppUrl: string;
  invoiceRequestUrl: string | null;
  booking: Booking | null;
  lang: Lang;
}) {
  const [sent, setSent] = useState(false);
  const t = TX[lang];

  // Cierra el embudo con el importe real cobrado, no con el estimado del
  // cotizador. Se manda una sola vez por montaje y lleva el folio como
  // identificador: si el visitante recarga la página de gracias, GA4 tiene
  // con qué reconocer que es la misma reserva y no una segunda venta.
  const yaContado = useRef(false);
  useEffect(() => {
    if (yaContado.current || !booking) return;
    yaContado.current = true;
    track("reserva_pagada", {
      transaction_id: booking.folio,
      value: booking.montoMxn,
      currency: "MXN",
      vehiculo: booking.vehiculo,
      servicio: booking.servicio,
    });
  }, [booking]);

  function handleWhatsApp() {
    setSent(true);
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
  }

  const fechaLarga = booking?.fecha
    ? new Date(`${booking.fecha}T${booking.hora || "00:00"}`).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #080808; }

        /* 100svh y no 100vh: en iOS la barra de direcciones dejaba un salto. */
        .sc-page {
          min-height: 100svh;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px;
          background:
            linear-gradient(90deg, rgba(8,8,8,0.94), rgba(8,8,8,0.84)),
            url("/high-suv.webp") center / cover;
        }

        .sc-panel {
          width: 100%; max-width: 520px;
          background: rgba(13,13,13,0.94);
          border: 1px solid rgba(200,164,107,0.34);
          padding: 40px 36px;
          display: flex; flex-direction: column; gap: 20px;
          backdrop-filter: blur(10px);
        }
        @media (max-width: 520px) { .sc-panel { padding: 30px 22px; } .sc-title { font-size: 27px; } }

        .sc-check {
          width: 54px; height: 54px; border-radius: 50%;
          background: rgba(143,169,143,0.14);
          border: 1px solid rgba(143,169,143,0.45);
          display: flex; align-items: center; justify-content: center;
          color: #8FA98F; font-size: 25px; line-height: 1;
        }

        .sc-kicker {
          font-family: var(--font-barlow), sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: #C8A46B;
          display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
        }
        .sc-folio { color: #8B8B87; letter-spacing: 0.12em; font-weight: 600; }

        .sc-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 34px; font-weight: 300; color: #fff; line-height: 1.08;
          text-wrap: balance;
        }
        .sc-copy {
          font-family: var(--font-barlow), sans-serif;
          font-size: 14.5px; color: #BFC3C8; line-height: 1.7;
        }
        .sc-copy strong { color: #fff; font-weight: 600; }

        .sc-summary { border-top: 1px solid #222; }
        .sc-row {
          display: flex; justify-content: space-between; gap: 16px;
          padding: 11px 0; border-bottom: 1px solid #222;
          font-family: var(--font-barlow), sans-serif; font-size: 14px;
        }
        .sc-row dt { color: #8B8B87; flex-shrink: 0; }
        .sc-row dd { color: #fff; text-align: right; line-height: 1.45; }
        .sc-row--total dd {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 21px; font-variant-numeric: tabular-nums;
        }

        .sc-btn-wa {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; min-height: 52px; padding: 15px;
          background: #25D366; color: #06140b; border: none; cursor: pointer;
          font-family: var(--font-barlow), sans-serif;
          font-size: 15px; font-weight: 700; letter-spacing: 0.06em;
          text-decoration: none; transition: background 0.2s;
        }
        .sc-btn-wa:hover { background: #1fb85a; }

        .sc-cal { display: flex; gap: 10px; flex-wrap: wrap; }
        .sc-cal a {
          flex: 1 1 180px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          min-height: 46px; padding: 12px 14px;
          border: 1px solid rgba(200,164,107,0.45); color: #fff;
          font-family: var(--font-barlow), sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .sc-cal a:hover { background: #C8A46B; color: #0A0A0A; }

        .sc-note {
          font-family: var(--font-barlow), sans-serif;
          font-size: 12.5px; color: #8B8B87; line-height: 1.6;
        }
        .sc-note--sent { color: #8FA98F; }

        .sc-foot {
          border-top: 1px solid #222; padding-top: 18px;
          display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap;
          font-family: var(--font-barlow), sans-serif; font-size: 13px;
        }
        .sc-foot a { color: #C8A46B; text-decoration: none; }
        .sc-foot a:hover { color: #fff; }
        .sc-foot a.sc-home { color: #BFC3C8; }

        .sc-page a:focus-visible,
        .sc-page button:focus-visible { outline: 2px solid #C8A46B; outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .sc-page *, .sc-page *::before, .sc-page *::after {
            transition-duration: 0.01ms !important; animation-duration: 0.01ms !important;
          }
        }
      `}</style>

      <main className="sc-page">
        <div className="sc-panel">
          <div className="sc-check" aria-hidden="true">✓</div>

          <p className="sc-kicker">
            <span>{t.kicker}</span>
            {booking?.folio && <span className="sc-folio">{t.folio(booking.folio)}</span>}
          </p>

          <h1 className="sc-title">
            {booking?.nombre ? t.thanksNamed(booking.nombre) : t.thanks}
          </h1>

          <p className="sc-copy">
            {t.copy(<strong>{t.agent}</strong>)}
          </p>

          {booking && (
            <dl className="sc-summary">
              {fechaLarga && (
                <div className="sc-row">
                  <dt>{t.when}</dt>
                  <dd>{fechaLarga} · {booking.hora}h</dd>
                </div>
              )}
              {booking.origen && (
                <div className="sc-row">
                  <dt>{t.from}</dt>
                  <dd>{booking.origen}</dd>
                </div>
              )}
              {booking.destino && (
                <div className="sc-row">
                  <dt>{t.to}</dt>
                  <dd>{booking.destino}</dd>
                </div>
              )}
              {booking.vehiculo && (
                <div className="sc-row">
                  <dt>{t.vehicle}</dt>
                  <dd>{booking.vehiculo}</dd>
                </div>
              )}
              {/* Se le devuelven al cliente para que vea que quedaron
                  registradas: si no aparecen por ningún lado, la duda es si
                  alguien las leyó. */}
              {booking.notas && (
                <div className="sc-row">
                  <dt>{t.notes}</dt>
                  <dd>{booking.notas}</dd>
                </div>
              )}
              <div className="sc-row sc-row--total">
                <dt>{t.paid}</dt>
                <dd>{booking.total}</dd>
              </div>
            </dl>
          )}

          <button className="sc-btn-wa" onClick={handleWhatsApp} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.118 1.528 5.845L.057 23.486a.5.5 0 0 0 .614.614l5.588-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.513-5.187-1.408l-.37-.222-3.844 1.007 1.03-3.76-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            {t.wa}
          </button>

          <p className={`sc-note${sent ? " sc-note--sent" : ""}`}>
            {sent
              ? t.waSent
              : t.waHint}
          </p>

          {(booking?.googleCalendarUrl || booking?.icsHref) && (
            <div className="sc-cal">
              {booking.googleCalendarUrl && (
                <a href={booking.googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                  Google Calendar
                </a>
              )}
              {booking.icsHref && (
                <a href={booking.icsHref} download={`elite-route-${booking.folio}.ics`}>
                  {t.ics}
                </a>
              )}
            </div>
          )}

          <div className="sc-foot">
            {invoiceRequestUrl ? (
              <a href={invoiceRequestUrl}>{t.invoice}</a>
            ) : (
              <span className="sc-note">{t.invoiceFallback}</span>
            )}
            <Link className="sc-home" href={path(lang, "home")}>{t.home}</Link>
          </div>
        </div>
      </main>
    </>
  );
}
