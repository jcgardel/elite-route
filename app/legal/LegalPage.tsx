import Link from "next/link";
import BrandMark from "../BrandMark";
import { LEGAL } from "@/lib/legal";

/**
 * Marco compartido por el aviso de privacidad y los términos: misma
 * tipografía, mismo negro y mismo oro que el resto del sitio, con el ancho
 * de línea de un documento y no el de una portada.
 */
export default function LegalPage({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        .lg-root { background:#0A0A0A; color:#ECEAE6; min-height:100vh; font-family:var(--font-barlow),sans-serif; font-weight:300; line-height:1.7; }
        .lg-nav { max-width:820px; margin:0 auto; padding:26px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .lg-nav a { text-decoration:none; }
        .lg-nav-cta { border:1px solid #C8A46B; color:#fff; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; padding:11px 16px; }
        .lg-nav-cta:hover { background:#C8A46B; color:#0A0A0A; }

        .lg-wrap { max-width:820px; margin:0 auto; padding:24px 24px 100px; }
        .lg-kicker { color:#C8A46B; font-family:var(--font-barlow-condensed),sans-serif; font-weight:600; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; margin:0 0 16px; }
        .lg-title { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:clamp(38px,6vw,60px); line-height:1.04; margin:0 0 20px; text-wrap:balance; }
        .lg-intro { color:#BFC3C8; font-size:17px; max-width:62ch; margin:0; }
        .lg-updated { color:#8B8B87; font-size:13px; margin:22px 0 0; padding-top:22px; border-top:1px solid #232323; }

        .lg-body { margin-top:44px; }
        .lg-body h2 { font-family:var(--font-cormorant),Georgia,serif; font-weight:300; font-size:30px; line-height:1.15; margin:52px 0 14px; color:#fff; text-wrap:balance; }
        .lg-body h2:first-child { margin-top:0; }
        .lg-body h3 { font-family:var(--font-barlow-condensed),sans-serif; font-weight:700; font-size:16px; letter-spacing:0.06em; text-transform:uppercase; margin:30px 0 10px; color:#ECEAE6; }
        .lg-body p { color:#BFC3C8; font-size:16px; max-width:66ch; margin:0 0 16px; }
        .lg-body strong { color:#fff; font-weight:600; }
        .lg-body ul { color:#BFC3C8; font-size:16px; max-width:66ch; margin:0 0 16px; padding-left:20px; }
        .lg-body li { margin-bottom:9px; }
        .lg-body li::marker { color:#C8A46B; }
        .lg-body a { color:#C8A46B; text-decoration:none; overflow-wrap:anywhere; }
        .lg-body a:hover { color:#fff; }

        .lg-table { width:100%; border-collapse:collapse; margin:0 0 16px; font-size:15px; }
        .lg-table td { border-bottom:1px solid #232323; padding:12px 0; color:#BFC3C8; vertical-align:top; }
        .lg-table td:first-child { color:#fff; width:34%; padding-right:20px; }
        .lg-table tr:last-child td { border-bottom:none; }

        .lg-foot { border-top:1px solid rgba(200,164,107,0.28); margin-top:64px; padding-top:24px; display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; font-size:13px; color:#8B8B87; }
        .lg-foot a { color:#C8A46B; text-decoration:none; }
        .lg-foot a:hover { color:#fff; }

        .lg-root a:focus-visible { outline:2px solid #C8A46B; outline-offset:3px; }
        @media (max-width:600px) { .lg-table td:first-child { width:42%; } }
      `}</style>

      <div className="lg-root">
        <nav className="lg-nav">
          <Link href="/" aria-label="Elite Route"><BrandMark size={16} /></Link>
          <Link href="/#quote" className="lg-nav-cta">Cotizar traslado</Link>
        </nav>

        <main className="lg-wrap">
          <p className="lg-kicker">{kicker}</p>
          <h1 className="lg-title">{title}</h1>
          <p className="lg-intro">{intro}</p>
          <p className="lg-updated">Última actualización: {LEGAL.actualizado}</p>

          <div className="lg-body">{children}</div>

          <div className="lg-foot">
            <span>{LEGAL.responsable} · {LEGAL.sitio}</span>
            <span>
              <Link href="/privacidad">Aviso de privacidad</Link>
              {" · "}
              <Link href="/terminos">Términos</Link>
              {" · "}
              <Link href="/tarifas">Tarifas</Link>
            </span>
          </div>
        </main>
      </div>
    </>
  );
}
