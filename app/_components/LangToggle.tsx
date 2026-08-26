"use client";

import Link from "next/link";
import { LANG_COOKIE, path, type Lang, type Page } from "@/lib/i18n";

/**
 * El selector ES/EN. Ya no cambia un estado: son dos enlaces a la misma
 * página en el otro idioma, así que el idioma se puede compartir, guardar en
 * favoritos y encontrar en un buscador.
 *
 * Al elegir se guarda una cookie. No sirve para pintar la página —eso lo
 * decide la URL— sino para que la raíz del sitio sepa a dónde mandar al
 * visitante la próxima vez que llegue sin idioma en la dirección.
 *
 * `prefetch={false}`: son dos enlaces presentes en todas las páginas y llevan
 * a una versión del sitio que casi nadie abre en la misma sesión; precargarla
 * costaría un documento entero por página vista.
 */
function remember(next: Lang) {
  try {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Sin cookies la raíz negocia por Accept-Language. Aceptable.
  }
}

export default function LangToggle({
  lang,
  page,
  hrefs,
}: {
  lang: Lang;
  /** Una de las páginas del catálogo. */
  page?: Page;
  /**
   * Las dos direcciones a mano, para las páginas que no están en el catálogo
   * —las de ruta, que llevan un slug distinto por idioma—. Gana sobre `page`.
   */
  hrefs?: Record<Lang, string>;
}) {
  const to = (l: Lang) => hrefs?.[l] ?? (page ? path(l, page) : `/${l}`);
  return (
    <>
      <style>{`
        .lt-toggle { display:flex; border:1px solid rgba(200,164,107,0.45); border-radius:2px; overflow:hidden; flex-shrink:0; }
        .lt-btn {
          display:flex; align-items:center; justify-content:center;
          padding:7px 11px; min-height:44px; font-size:11px; font-weight:700;
          letter-spacing:0.1em; text-transform:uppercase; border:none;
          background:transparent; color:#BFC3C8; cursor:pointer; text-decoration:none;
          font-family:var(--font-barlow),sans-serif; transition:background 0.2s, color 0.2s;
        }
        .lt-btn.on { background:#C8A46B; color:#0A0A0A; }
        .lt-btn:hover:not(.on) { color:#fff; }
        .lt-btn:focus-visible { outline:2px solid #C8A46B; outline-offset:2px; }
      `}</style>
      <div className="lt-toggle">
        <Link
          href={to("es")}
          hrefLang="es"
          prefetch={false}
          onClick={() => remember("es")}
          aria-current={lang === "es" ? "page" : undefined}
          className={`lt-btn${lang === "es" ? " on" : ""}`}
        >
          <span className="er-sr">Ver en español</span>
          <span aria-hidden="true">ES</span>
        </Link>
        <Link
          href={to("en")}
          hrefLang="en"
          prefetch={false}
          onClick={() => remember("en")}
          aria-current={lang === "en" ? "page" : undefined}
          className={`lt-btn${lang === "en" ? " on" : ""}`}
        >
          <span className="er-sr">View in English</span>
          <span aria-hidden="true">EN</span>
        </Link>
      </div>
    </>
  );
}
