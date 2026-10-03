import Link from "next/link";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { path, type Lang } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";
import { guia, type GuideKey } from "@/lib/guides";
import type { Bloque } from "@/lib/guides";

/**
 * EL COMPONENTE DE LAS TRES GUÍAS.
 *
 * Uno solo y no tres, por la misma razón por la que `RoutePage` sirve a
 * dieciséis rutas: lo que cambia entre ellas es el contenido, no la página.
 * Tres componentes casi idénticos habrían significado arreglar cada detalle de
 * tipografía tres veces y que la tercera se quedara sin arreglar.
 *
 * DOS DECISIONES DE DISEÑO QUE NO SON DE ESTILO:
 *
 * 1. La llamada a la acción va AL FINAL, una sola vez, después de todo el
 *    contenido y del FAQ. Estas páginas sólo funcionan si el lector confía en
 *    ellas, y un botón de reservar cada dos párrafos le dice exactamente lo
 *    contrario: que esto es un anuncio disfrazado de guía. El enlace al
 *    cotizador vive en la barra de arriba para quien ya venía decidido.
 *
 * 2. La fecha de revisión se enseña. Varias afirmaciones de estas páginas
 *    caducan —reglas de aeropuerto, horarios, qué aerolínea usa qué terminal—
 *    y un consejo práctico sin fecha es un consejo en el que no se puede
 *    confiar. Decir cuándo se comprobó es lo que separa una guía útil del ruido
 *    que ya hay sobre estos temas.
 */

const styles = `
  .gd-root { background:#060606; color:#ECEAE6; min-height:100vh; font-family:var(--font-barlow),system-ui,sans-serif; font-weight:300; }

  .gd-nav { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 24px; border-bottom:1px solid #181818; position:sticky; top:0; background:rgba(6,6,6,0.92); backdrop-filter:blur(8px); z-index:10; }
  .gd-nav-right { display:flex; align-items:center; gap:18px; }
  .gd-nav-link { color:#BFC3C8; text-decoration:none; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; }
  .gd-nav-link:hover { color:#fff; }
  .gd-nav-cta { border:1px solid #C8A46B; color:#fff; text-decoration:none; font-weight:700; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; padding:9px 16px; border-radius:2px; }
  .gd-nav-cta:hover { background:#C8A46B; color:#0A0A0A; }

  .gd-wrap { max-width:760px; margin:0 auto; padding:44px 24px 72px; }

  .gd-kicker { color:#C8A46B; font-size:11px; letter-spacing:0.22em; text-transform:uppercase; margin:0 0 14px; }
  .gd-title { font-family:var(--font-cormorant),serif; font-size:clamp(32px,5.4vw,52px); font-weight:300; line-height:1.08; margin:0 0 18px; text-wrap:balance; }
  .gd-intro { color:#BFC3C8; font-size:18px; line-height:1.72; margin:0 0 10px; }
  .gd-revisado { color:#74746f; font-size:12.5px; letter-spacing:0.04em; margin:0 0 30px; }

  .gd-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin:0 0 38px; border-top:1px solid #1e1e1e; border-bottom:1px solid #1e1e1e; padding:22px 0; }
  .gd-fact-value { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:27px; color:#C8A46B; line-height:1; }
  .gd-fact-label { color:#8B8B87; font-size:11.5px; letter-spacing:0.1em; text-transform:uppercase; margin-top:7px; line-height:1.4; }

  .gd-toc { border:1px solid #1e1e1e; border-radius:3px; padding:18px 20px; margin:0 0 42px; background:rgba(255,255,255,0.02); }
  .gd-toc-title { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#C8A46B; margin:0 0 12px; }
  .gd-toc ol { margin:0; padding-left:20px; color:#BFC3C8; font-size:14.5px; line-height:1.95; }
  .gd-toc a { color:#BFC3C8; text-decoration:none; border-bottom:1px solid transparent; }
  .gd-toc a:hover { color:#fff; border-bottom-color:rgba(200,164,107,0.6); }
  .gd-toc li::marker { color:#C8A46B; }

  .gd-section { margin:0 0 42px; scroll-margin-top:90px; }
  .gd-h2 { font-family:var(--font-cormorant),serif; font-size:clamp(25px,3.6vw,33px); font-weight:300; color:#fff; margin:0 0 16px; line-height:1.18; text-wrap:balance; }
  .gd-p { color:#BFC3C8; font-size:16.5px; line-height:1.8; margin:0 0 16px; }
  .gd-ul { color:#BFC3C8; font-size:16.5px; line-height:1.8; margin:0 0 16px; padding-left:22px; }
  .gd-ul li { margin-bottom:11px; }
  .gd-ul li::marker { color:#C8A46B; }

  .gd-nota { border-left:2px solid #C8A46B; background:rgba(200,164,107,0.06); padding:15px 18px; margin:0 0 18px; color:#ECEAE6; font-size:15.5px; line-height:1.72; }

  .gd-table-wrap { overflow-x:auto; margin:0 0 18px; border:1px solid #1e1e1e; border-radius:3px; }
  .gd-table { width:100%; border-collapse:collapse; font-size:14.5px; min-width:520px; }
  .gd-table th { text-align:left; padding:13px 15px; background:rgba(255,255,255,0.03); color:#C8A46B; font-weight:600; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; border-bottom:1px solid #1e1e1e; white-space:nowrap; }
  .gd-table td { padding:13px 15px; border-bottom:1px solid #161616; color:#BFC3C8; line-height:1.55; vertical-align:top; }
  .gd-table tr:last-child td { border-bottom:none; }
  .gd-table td:first-child { color:#ECEAE6; font-weight:600; }

  .gd-faq { margin:0 0 42px; }
  .gd-faq-item { border-bottom:1px solid #1a1a1a; padding:18px 0; }
  .gd-faq-item:first-of-type { border-top:1px solid #1a1a1a; }
  .gd-faq-q { font-size:16.5px; color:#fff; font-weight:600; margin:0 0 9px; line-height:1.45; }
  .gd-faq-a { color:#BFC3C8; font-size:15.5px; line-height:1.78; margin:0; }

  .gd-cta { border:1px solid rgba(200,164,107,0.34); background:rgba(200,164,107,0.05); border-radius:3px; padding:26px 26px 28px; margin:0 0 42px; }
  .gd-cta-title { font-family:var(--font-cormorant),serif; font-size:26px; font-weight:300; color:#fff; margin:0 0 10px; line-height:1.2; }
  .gd-cta-copy { color:#BFC3C8; font-size:15.5px; line-height:1.72; margin:0 0 20px; }
  .gd-cta-btn { display:inline-block; background:#C8A46B; color:#0A0A0A; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; padding:14px 26px; border-radius:2px; }
  .gd-cta-btn:hover { background:#d9b67e; }

  .gd-rel { margin:0 0 46px; }
  .gd-rel-title { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#C8A46B; margin:0 0 14px; }
  .gd-rel ul { list-style:none; margin:0; padding:0; }
  .gd-rel li { border-top:1px solid #1a1a1a; }
  .gd-rel li:last-child { border-bottom:1px solid #1a1a1a; }
  .gd-rel a { display:block; padding:14px 0; color:#BFC3C8; text-decoration:none; font-size:15.5px; line-height:1.5; }
  .gd-rel a:hover { color:#fff; }

  .gd-foot { border-top:1px solid #1e1e1e; padding-top:24px; display:flex; flex-wrap:wrap; gap:18px; justify-content:space-between; }
  .gd-foot address { font-style:normal; color:#8B8B87; font-size:13px; line-height:1.7; }
  .gd-foot-name { display:block; color:#BFC3C8; }
  .gd-foot-contact { display:flex; flex-wrap:wrap; gap:14px; }
  .gd-foot a { color:#8B8B87; text-decoration:none; }
  .gd-foot a:hover { color:#C8A46B; }
  .gd-foot-links { display:flex; flex-wrap:wrap; gap:16px; font-size:13px; align-items:flex-start; }

  /* La barra de arriba no cabe en 375 px con marca, enlace, botón y selector
     de idioma: se sale 86 px y arrastra la página entera en horizontal. Es la
     misma regla que ya usan las páginas de ruta —se esconde el enlace de
     tarifas, que está repetido en el pie, y se encoge el botón—. */
  @media (max-width:700px) {
    .gd-nav { padding:16px 14px; gap:10px; }
    .gd-nav .er-brand-tagline { display:none; }
    .gd-nav-link { display:none; }
    .gd-nav-right { gap:8px; }
    .gd-nav-cta { font-size:10px; padding:8px 9px; letter-spacing:0.06em; }
  }

  @media (max-width:640px) {
    .gd-wrap { padding:32px 18px 56px; }
    .gd-facts { grid-template-columns:1fr; gap:18px; }
    .gd-fact-value { font-size:24px; }
    .gd-title { font-size:30px; }
    .gd-intro { font-size:16.5px; }
    .gd-p, .gd-ul { font-size:16px; }
  }
`;

function Bloques({ bloques }: { bloques: Bloque[] }) {
  return (
    <>
      {bloques.map((b, i) => {
        if (b.tipo === "p") return <p key={i} className="gd-p">{b.texto}</p>;
        if (b.tipo === "nota") return <p key={i} className="gd-nota">{b.texto}</p>;
        if (b.tipo === "lista") {
          return (
            <ul key={i} className="gd-ul">
              {b.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          );
        }
        return (
          <div key={i} className="gd-table-wrap">
            <table className="gd-table">
              <thead>
                <tr>{b.encabezados.map((h, j) => <th key={j}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {b.filas.map((fila, j) => (
                  <tr key={j}>{fila.map((celda, k) => <td key={k}>{celda}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}

export default function GuidePage({ lang, guideKey }: { lang: Lang; guideKey: GuideKey }) {
  const t = guia(guideKey, lang);
  const home = path(lang, "home");
  const quote = `${home}#quote`;
  const navQuote = lang === "es" ? "Cotizar" : "Get a quote";
  const navRates = lang === "es" ? "Tarifas" : "Rates";

  return (
    <div className="gd-root">
      <style>{styles}</style>

      <nav className="gd-nav">
        <Link href={home} aria-label="Elite Route">
          <BrandMark size={17} compact={14} />
        </Link>
        <div className="gd-nav-right">
          <Link href={path(lang, "rates")} className="gd-nav-link">{navRates}</Link>
          <Link href={quote} className="gd-nav-cta">{navQuote}</Link>
          <LangToggle lang={lang} page={GUIDE_PAGE[guideKey]} />
        </div>
      </nav>

      <main className="gd-wrap">
        <p className="gd-kicker">{t.kicker}</p>
        <h1 className="gd-title">{t.h1}</h1>
        <p className="gd-intro">{t.intro}</p>
        <p className="gd-revisado">{t.revisado}</p>

        <div className="gd-facts">
          {t.datos.map((d) => (
            <div key={d.etiqueta}>
              <div className="gd-fact-value">{d.valor}</div>
              <div className="gd-fact-label">{d.etiqueta}</div>
            </div>
          ))}
        </div>

        <nav className="gd-toc" aria-label={t.indiceTitulo}>
          <p className="gd-toc-title">{t.indiceTitulo}</p>
          <ol>
            {t.secciones.map((s) => (
              <li key={s.id}><a href={`#${s.id}`}>{s.h2}</a></li>
            ))}
          </ol>
        </nav>

        {t.secciones.map((s) => (
          <section key={s.id} id={s.id} className="gd-section">
            <h2 className="gd-h2">{s.h2}</h2>
            <Bloques bloques={s.bloques} />
          </section>
        ))}

        <section className="gd-faq" aria-labelledby="faq-title">
          <h2 className="gd-h2" id="faq-title">
            {lang === "es" ? "Preguntas frecuentes" : "Frequently asked questions"}
          </h2>
          {t.faqs.map(([q, a]) => (
            <div key={q} className="gd-faq-item">
              <p className="gd-faq-q">{q}</p>
              <p className="gd-faq-a">{a}</p>
            </div>
          ))}
        </section>

        {/* Una sola vez, y aquí: ver la nota de arriba. */}
        <section className="gd-cta">
          <h2 className="gd-cta-title">{t.cta.titulo}</h2>
          <p className="gd-cta-copy">{t.cta.copy}</p>
          <Link className="gd-cta-btn" href={quote}>{t.cta.boton}</Link>
        </section>

        <section className="gd-rel">
          <p className="gd-rel-title">{lang === "es" ? "Seguir leyendo" : "Keep reading"}</p>
          <ul>
            {t.relacionadas.map((r) => (
              <li key={r.label}>
                <Link href={path(lang, r.page)}>{r.label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <footer className="gd-foot">
          <address>
            <span className="gd-foot-name">{LEGAL.responsable}</span>
            <span className="gd-foot-contact">
              <a href={LEGAL.whatsappUrl} target="_blank" rel="noopener noreferrer">{LEGAL.whatsapp}</a>
              <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>
            </span>
          </address>
          <div className="gd-foot-links">
            <Link href={path(lang, "rates")}>{lang === "es" ? "Tarifas" : "Rates"}</Link>
            <Link href={path(lang, "terms")}>{lang === "es" ? "Términos" : "Terms"}</Link>
            <Link href={path(lang, "privacy")}>{lang === "es" ? "Privacidad" : "Privacy"}</Link>
            <Link href={home}>eliteroute.mx</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

/** El `Page` de i18n de cada guía, para que el selector de idioma lleve a la
 *  misma guía en el otro idioma y no a la portada. */
const GUIDE_PAGE = {
  airport: "guideAirport",
  dayTrips: "guideDayTrips",
  terminals: "guideTerminals",
} as const;
