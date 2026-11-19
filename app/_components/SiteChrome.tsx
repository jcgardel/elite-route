"use client";

import Link from "next/link";
import { useState } from "react";
import BrandMark from "./BrandMark";
import LangToggle from "./LangToggle";
import { path, type Lang, type Page } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";

/**
 * ENCABEZADO Y PIE COMPARTIDOS (rediseño oscuro, nov 2026).
 *
 * Son los mismos de la portada —mismos enlaces, mismo teléfono, mismo botón
 * de cotizar— para que quien llega desde Google a una página interna vea el
 * mismo sitio. La portada conserva los suyos dentro de HomeClient porque ahí
 * los botones del menú controlan el cotizador; aquí todo son enlaces.
 *
 * Nada de comillas invertidas en los comentarios del CSS de abajo: vive en
 * una plantilla de texto y una comilla invertida la cierra.
 */

const TX = {
  es: {
    services: "Servicios", routes: "Rutas", fleet: "Flota", companies: "Empresas",
    about: "Nosotros", contact: "Contacto", quote: "Cotizar", menu: "Menú",
    call: "Llamar al +52 55 4358 2919",
    pay: "Pagos procesados por", billing: "Facturación CFDI", rights: "Elite Route MX · Ciudad de México",
    rates: "Tarifas", hourly: "Chofer por horas", airport: "Traslados de aeropuerto",
    chauffeur: "Chofer privado", executive: "Transporte ejecutivo", terms: "Términos", privacy: "Aviso de privacidad",
  },
  en: {
    services: "Services", routes: "Routes", fleet: "Fleet", companies: "Companies",
    about: "About", contact: "Contact", quote: "Get a quote", menu: "Menu",
    call: "Call +52 55 4358 2919",
    pay: "Payments processed by", billing: "CFDI invoicing", rights: "Elite Route MX · Mexico City",
    rates: "Rates", hourly: "Hourly chauffeur", airport: "Airport transfers",
    chauffeur: "Private chauffeur", executive: "Executive transportation", terms: "Terms", privacy: "Privacy",
  },
} as const;

const TEL = "+525543582919";

const styles = `
  .sc-top { position:sticky; top:0; z-index:60; background:rgba(8,13,18,0.86); backdrop-filter:saturate(140%) blur(14px); -webkit-backdrop-filter:saturate(140%) blur(14px); border-bottom:1px solid rgba(52,60,67,0.7); font-family:var(--font-manrope), system-ui, sans-serif; }
  .sc-nav { max-width:1320px; margin:0 auto; padding:0 32px; height:76px; display:flex; align-items:center; gap:28px; }
  .sc-brand { display:inline-flex; align-items:center; text-decoration:none; flex:none; }
  .sc-links { list-style:none; margin:0 0 0 auto; padding:0; display:flex; align-items:center; gap:30px; }
  .sc-links a { color:#B8BEC3; text-decoration:none; font-size:14px; font-weight:500; transition:color 0.18s ease; }
  .sc-links a:hover { color:#F7F7F5; }
  .sc-right { display:flex; align-items:center; gap:18px; flex:none; }
  .sc-tel { display:inline-flex; align-items:center; gap:8px; color:#F7F7F5; text-decoration:none; font-size:14px; font-weight:600; min-height:44px; }
  .sc-tel svg { color:#B8BEC3; }
  .sc-cta { display:inline-flex; align-items:center; min-height:44px; padding:0 20px; border-radius:10px; background:#D5B57A; color:#14181C; font-size:14px; font-weight:700; text-decoration:none; white-space:nowrap; transition:background 0.18s ease; }
  .sc-cta:hover { background:#E0C38D; }
  .sc-burger { display:none; width:44px; height:44px; align-items:center; justify-content:center; background:transparent; border:1px solid #343C43; border-radius:10px; color:#F7F7F5; cursor:pointer; }
  .sc-top a:focus-visible, .sc-top button:focus-visible, .sc-foot a:focus-visible { outline:2px solid #C8A76E; outline-offset:3px; border-radius:8px; }
  @media (max-width:1180px) { .sc-links { gap:22px; } .sc-tel-num { display:none; } }
  @media (max-width:960px) {
    .sc-links { display:none; }
    .sc-links[data-open="1"] { display:flex; flex-direction:column; align-items:stretch; gap:0; position:absolute; top:100%; left:0; right:0; margin:0; padding:8px 20px 18px; background:#080D12; border-bottom:1px solid #343C43; box-shadow:0 24px 40px -12px rgba(0,0,0,0.7); }
    .sc-links[data-open="1"] a { display:flex; align-items:center; min-height:52px; font-size:16px; color:#F7F7F5; border-bottom:1px solid #343C43; }
    .sc-burger { display:inline-flex; }
    .sc-right { margin-left:auto; gap:10px; }
    .sc-cta { display:none; }
  }
  @media (max-width:700px) {
    .sc-nav { padding:0 16px; height:64px; gap:12px; }
    .sc-top .er-brand-tagline { display:none; }
    .sc-tel { width:44px; justify-content:center; border:1px solid #343C43; border-radius:10px; }
    .sc-right { gap:8px; }
    .sc-top .lt-globe { display:none; }
    .sc-top .lt-btn { min-width:38px; padding-left:8px; padding-right:8px; letter-spacing:0.04em; }
  }
  @media (max-width:400px) {
    .sc-nav { padding:0 12px; gap:8px; }
    .sc-right { gap:6px; }
    .sc-top .lt-btn { min-width:34px; padding-left:5px; padding-right:5px; letter-spacing:0.02em; }
    .sc-top .sc-brand svg, .sc-top .sc-brand { max-width:150px; }
    .sc-tel, .sc-burger { width:42px; }
  }

  .sc-foot { border-top:1px solid #343C43; padding:34px 32px 96px; background:#080D12; color:#B8BEC3; font-family:var(--font-manrope), system-ui, sans-serif; }
  .sc-foot > * { max-width:1320px; margin-left:auto; margin-right:auto; }
  .sc-foot-pay { display:flex; justify-content:space-between; align-items:center; gap:18px; flex-wrap:wrap; padding-bottom:20px; border-bottom:1px solid #343C43; font-size:12.5px; }
  .sc-foot-pay p { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin:0; }
  .sc-stripe { display:inline-block; background:#635BFF; color:#fff; font-weight:700; font-size:12px; padding:2px 8px 3px; border-radius:4px; line-height:1.35; }
  .sc-card { font-weight:600; font-size:10px; letter-spacing:0.08em; color:#B8BEC3; border:1px solid #343C43; border-radius:3px; padding:2px 6px 1px; line-height:1.5; }
  .sc-foot a { color:#B8BEC3; text-decoration:none; }
  .sc-foot a:hover { color:#F7F7F5; }
  .sc-foot-id { display:flex; flex-direction:column; gap:5px; padding-top:20px; font-style:normal; font-size:13px; line-height:1.6; }
  .sc-foot-name { font-weight:700; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:#F7F7F5; }
  .sc-foot-contact { display:flex; flex-wrap:wrap; gap:6px 18px; }
  .sc-foot-contact a { color:#F7F7F5; border-bottom:1px solid #343C43; }
  .sc-foot-meta { display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap; margin-top:20px; padding-top:18px; border-top:1px solid #343C43; font-size:12px; }
  .sc-foot-links { display:flex; gap:22px; flex-wrap:wrap; }
  @media (max-width:700px) {
    .sc-foot { padding:30px 20px 96px; }
    .sc-foot-pay, .sc-foot-meta { flex-direction:column; align-items:flex-start; }
  }
`;

type Toggle = { page?: Page; hrefs?: Record<Lang, string> };

export function SiteHeader({ lang, toggle }: { lang: Lang; toggle: Toggle }) {
  const t = TX[lang];
  const [open, setOpen] = useState(false);
  const home = path(lang, "home");
  return (
    <>
      <style>{styles}</style>
      <header className="sc-top">
        <nav className="sc-nav" aria-label="Elite Route">
          <Link href={home} className="sc-brand" aria-label="Elite Route">
            <BrandMark size={19} compact={15} />
          </Link>
          <ul className="sc-links" id="sc-menu" data-open={open ? "1" : "0"} onClick={() => setOpen(false)}>
            <li><Link href={path(lang, "executive")}>{t.services}</Link></li>
            <li><Link href={`${home}#rutas`}>{t.routes}</Link></li>
            <li><Link href={path(lang, "fleet")}>{t.fleet}</Link></li>
            <li><Link href={path(lang, "corporate")}>{t.companies}</Link></li>
            <li><Link href={path(lang, "about")}>{t.about}</Link></li>
            <li><Link href={`${home}#contacto`}>{t.contact}</Link></li>
          </ul>
          <div className="sc-right">
            <a className="sc-tel" href={`tel:${TEL}`} aria-label={t.call}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>
              <span className="sc-tel-num">{LEGAL.whatsapp}</span>
            </a>
            <LangToggle lang={lang} page={toggle.page} hrefs={toggle.hrefs} />
            <Link className="sc-cta" href={`${home}#quote`}>{t.quote}</Link>
            <button type="button" className="sc-burger" aria-expanded={open} aria-controls="sc-menu" aria-label={t.menu} onClick={() => setOpen((v) => !v)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">{open ? <path d="M6 6l12 12M18 6 6 18"/> : <path d="M4 7h16M4 12h16M4 17h16"/>}</svg>
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const t = TX[lang];
  return (
    <footer className="sc-foot">
      <div className="sc-foot-pay">
        <p>
          <span>{t.pay}</span>
          <span className="sc-stripe">stripe</span>
          <span className="sc-card">VISA</span>
          <span className="sc-card">MASTERCARD</span>
          <span className="sc-card">AMEX</span>
        </p>
        <a href="mailto:contabilidad@eliteroute.mx">{t.billing} · contabilidad@eliteroute.mx</a>
      </div>
      {/* Sin domicilio, a propósito: es la casa del dueño (ver HomeClient). */}
      <address className="sc-foot-id">
        <span className="sc-foot-name">{LEGAL.responsable}</span>
        <span className="sc-foot-contact">
          <a href={`tel:${TEL}`}>{LEGAL.whatsapp}</a>
          <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>
        </span>
      </address>
      <div className="sc-foot-meta">
        <span>{t.rights}</span>
        <div className="sc-foot-links">
          <Link href={path(lang, "rates")}>{t.rates}</Link>
          <Link href={path(lang, "hourly")}>{t.hourly}</Link>
          <Link href={path(lang, "airport")}>{t.airport}</Link>
          <Link href={path(lang, "chauffeur")}>{t.chauffeur}</Link>
          <Link href={path(lang, "executive")}>{t.executive}</Link>
          <Link href={path(lang, "fleet")}>{t.fleet}</Link>
          <Link href={path(lang, "about")}>{t.about}</Link>
          <Link href={path(lang, "corporate")}>{t.companies}</Link>
          <Link href={path(lang, "terms")}>{t.terms}</Link>
          <Link href={path(lang, "privacy")}>{t.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
