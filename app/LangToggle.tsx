"use client";

import type { Lang } from "./useLang";

/**
 * El selector ES/EN de las páginas interiores. La portada tiene el suyo
 * dentro de su propia hoja de estilos; este existe para que Tarifas y
 * Corporativo no tengan que copiarlo.
 */
export default function LangToggle({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (next: Lang) => void;
}) {
  return (
    <>
      <style>{`
        .lt-toggle { display:flex; border:1px solid rgba(200,164,107,0.45); border-radius:2px; overflow:hidden; flex-shrink:0; }
        .lt-btn {
          padding:6px 10px; min-height:36px; font-size:11px; font-weight:700;
          letter-spacing:0.1em; text-transform:uppercase; border:none;
          background:transparent; color:#BFC3C8; cursor:pointer;
          font-family:var(--font-barlow),sans-serif; transition:background 0.2s, color 0.2s;
        }
        .lt-btn.on { background:#C8A46B; color:#0A0A0A; }
        .lt-btn:hover:not(.on) { color:#fff; }
        .lt-btn:focus-visible { outline:2px solid #C8A46B; outline-offset:2px; }
      `}</style>
      <div className="lt-toggle" aria-label="Idioma / Language">
        <button type="button" className={`lt-btn${lang === "es" ? " on" : ""}`} onClick={() => setLang("es")}>ES</button>
        <button type="button" className={`lt-btn${lang === "en" ? " on" : ""}`} onClick={() => setLang("en")}>EN</button>
      </div>
    </>
  );
}
