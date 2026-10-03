import { notFound } from "next/navigation";
import GuidePage from "../../_components/GuidePage";
import { guia, guideMetadata } from "@/lib/guides";
import { isLang, path, SITE, url } from "@/lib/i18n";

/**
 * /es/aicm-terminal-1-o-terminal-2. Su gemela es /en/mexico-city-airport-terminal-1-or-2.
 *
 * El esquema es `Article` y no `Service`: esta página no vende un traslado,
 * explica cómo moverse. Marcarla como servicio le diría a Google que es lo
 * mismo que la página de tarifas, y lo que la hace valer es que no lo es.
 *
 * El `FAQPage` se arma con las MISMAS preguntas que se ven en pantalla, porque
 * salen del mismo contenido. Un esquema que no coincide con lo visible cuesta
 * los resultados enriquecidos de todo el sitio, no sólo los de esta página.
 */
const LANG = "es" as const;
const KEY = "terminals" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return guideMetadata(KEY, LANG);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();

  const c = guia(KEY, LANG);
  const self = url(LANG, "guideTerminals");

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.h1,
    description: c.description,
    inLanguage: "es-MX",
    author: { "@type": "Organization", "@id": `${SITE}/#business`, name: "Elite Route" },
    publisher: { "@type": "Organization", "@id": `${SITE}/#business`, name: "Elite Route" },
    mainEntityOfPage: self,
    url: self,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE + path(LANG, "home") },
      { "@type": "ListItem", position: 2, name: "Terminal 1 o 2", item: self },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <GuidePage lang={LANG} guideKey={KEY} />
    </>
  );
}
