"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Lang } from "./useLang";

/**
 * Aviso de instalación para iPhone.
 *
 * Safari no ofrece el botón de instalar que sí tiene Android: si nadie te
 * enseña el camino, nadie guarda el sitio en su pantalla de inicio. Esto lo
 * dice una vez, en una tarjeta que se puede cerrar y no vuelve.
 *
 * No aparece si ya está instalada, ni fuera de iOS, ni si el visitante la
 * cerró antes.
 */
const KEY = "er-install-hint";
const EVENT = "er-install-hint-change";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

function hidden(): boolean {
  try {
    if (window.localStorage.getItem(KEY) === "off") return true;
  } catch {
    return true;
  }
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const yaInstalada =
    nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  if (yaInstalada) return true;
  const ua = nav.userAgent;
  // iPadOS se anuncia como Mac: se distingue porque tiene puntos táctiles.
  // Se comprueba sobre el user agent y no sobre navigator.platform, que un
  // navegador emulando un teléfono deja en "MacIntel" y disparaba el aviso
  // en dispositivos que no son de Apple.
  const esIOS =
    /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && nav.maxTouchPoints > 1);
  // Sólo Safari puede añadir a la pantalla de inicio en iOS: en Chrome o
  // Firefox el consejo no lleva a ninguna parte.
  const otroNavegador = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return !esIOS || otroNavegador;
}

const TX = {
  es: {
    title: "Guárdala en tu pantalla de inicio",
    body: "Toca Compartir y luego «Añadir a pantalla de inicio». Se abre a pantalla completa, sin barras.",
    close: "Cerrar aviso",
  },
  en: {
    title: "Keep it on your home screen",
    body: "Tap Share, then “Add to Home Screen”. It opens full screen, without the browser bars.",
    close: "Dismiss",
  },
} as const;

export default function InstallHint({ lang }: { lang: Lang }) {
  const oculto = useSyncExternalStore(subscribe, hidden, () => true);

  const cerrar = useCallback(() => {
    try {
      window.localStorage.setItem(KEY, "off");
    } catch {
      // Sin almacenamiento el aviso vuelve en la siguiente visita. Aceptable.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  if (oculto) return null;
  const t = TX[lang];

  return (
    <>
      <style>{`
        .ih-card {
          position: fixed; left: 14px; right: 14px;
          bottom: calc(90px + env(safe-area-inset-bottom));
          z-index: 9998; display: flex; gap: 12px; align-items: flex-start;
          background: rgba(13,13,13,0.96); border: 1px solid rgba(200,164,107,0.40);
          padding: 14px 14px 15px; backdrop-filter: blur(12px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.55);
          animation: ih-in 420ms cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes ih-in { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform:none; } }
        @media (prefers-reduced-motion: reduce) { .ih-card { animation: none; } }
        @media (min-width: 700px) { .ih-card { display: none; } }

        .ih-icon { flex-shrink: 0; margin-top: 1px; }
        .ih-title {
          font-family: var(--font-barlow), sans-serif; font-weight: 600;
          font-size: 13.5px; color: #fff; margin: 0 0 3px;
        }
        .ih-body {
          font-family: var(--font-barlow), sans-serif; font-weight: 300;
          font-size: 12.5px; color: #BFC3C8; line-height: 1.5; margin: 0;
        }
        .ih-close {
          flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(200,164,107,0.35);
          color: #BFC3C8; font-size: 15px; line-height: 1; cursor: pointer; padding: 0;
        }
        .ih-close:hover { background: rgba(200,164,107,0.18); color: #fff; }
        .ih-close:focus-visible { outline: 2px solid #C8A46B; outline-offset: 2px; }
      `}</style>

      <aside className="ih-card">
        <svg className="ih-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#C8A46B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12" />
          <path d="M8 7l4-4 4 4" />
          <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="ih-title">{t.title}</p>
          <p className="ih-body">{t.body}</p>
        </div>
        <button type="button" className="ih-close" onClick={cerrar} aria-label={t.close}>×</button>
      </aside>
    </>
  );
}
