"use client";

import { track } from "@/lib/analytics";

/**
 * BIENVENIDA PARA QUIEN VISITA CDMX POR PRIMERA VEZ. Sólo en inglés (dueño,
 * 17 oct 2026): le habla al cliente extranjero. Vive en la portada en inglés,
 * después del cotizador, y en la página de traslado del aeropuerto en inglés,
 * antes de "cómo funciona la llegada".
 *
 * Todo lo que promete ya existe: monitoreo de vuelo, chofer en llegadas con
 * letrero y contacto por WhatsApp (sólo mensajes). El botón abre WhatsApp con
 * el texto escrito y se mide como clic_whatsapp con origen "bienvenida".
 */
const WHATSAPP_URL = `https://wa.me/525543582919?text=${encodeURIComponent(
  "Hi, I'm visiting Mexico City and would like help with my airport pickup.",
)}`;

export default function WelcomeEn({ origen }: { origen: string }) {
  return (
    <section className="wl" aria-labelledby={`wl-title-${origen}`}>
      <style>{`
        .wl { margin:58px 0 0; padding:44px 40px; background:#0B1220; border:1px solid rgba(199,164,106,0.35); text-align:center; }
        .wl-title { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:38px; line-height:1.15; color:#fff; margin:0 auto 16px; max-width:620px; text-wrap:balance; }
        .wl-copy { font-family:var(--font-barlow),sans-serif; color:#BFC3C8; font-size:15px; line-height:1.8; max-width:600px; margin:0 auto 14px; }
        .wl-sign { font-family:var(--font-barlow),sans-serif; color:#fff; font-size:15px; font-style:italic; margin:0 0 26px; }
        .wl-btn { display:inline-block; padding:14px 30px; background:#C7A46A; color:#0A0A0A; font-family:var(--font-barlow),sans-serif; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; text-decoration:none; transition:background 0.2s; }
        .wl-btn:hover { background:#b8924f; }
        .wl-btn:focus-visible { outline:2px solid #fff; outline-offset:3px; }
        @media (max-width:700px) { .wl { padding:34px 22px; margin-top:40px; } .wl-title { font-size:29px; } }
      `}</style>
      <h2 id={`wl-title-${origen}`} className="wl-title">A new city. A familiar feeling of care.</h2>
      <p className="wl-copy">
        Visiting Mexico City for the first time? We track your flight, your chauffeur waits in
        arrivals with a sign bearing your name, and our team stays in touch on WhatsApp so you
        always know what comes next.
      </p>
      <p className="wl-sign">Travel with confidence. We’ll take care of the ride.</p>
      <a
        className="wl-btn"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("clic_whatsapp", { origen })}
      >
        Talk to our team
      </a>
    </section>
  );
}
