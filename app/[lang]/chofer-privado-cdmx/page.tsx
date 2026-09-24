import { notFound } from "next/navigation";
import ChauffeurPage, { chauffeurFaqs, chauffeurPriceRange } from "../../_components/ChauffeurPage";
import { pageMetadata } from "@/lib/seo";
import { isLang, path, SITE, url } from "@/lib/i18n";

/**
 * /es/chofer-privado-cdmx. Su gemela en inglés es
 * /en/private-chauffeur-mexico-city.
 */
const LANG = "es" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return pageMetadata(LANG, "chauffeur");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();

  const { low, high } = chauffeurPriceRange();
  const self = url(LANG, "chauffeur");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Chofer privado en Ciudad de México",
    description:
      "Chofer privado asignado y vehículo propio en Ciudad de México, por traslado, por horas o por día. Unidades aseguradas con monitoreo GPS y precio fijo con IVA.",
    serviceType: "Servicio de chofer privado",
    provider: { "@type": "LocalBusiness", "@id": `${SITE}/#business`, name: "Elite Route" },
    areaServed: { "@type": "City", name: "Ciudad de México" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "MXN",
      lowPrice: low,
      highPrice: high,
      url: self,
    },
    mainEntityOfPage: self,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE + path(LANG, "home") },
      { "@type": "ListItem", position: 2, name: "Transporte ejecutivo", item: SITE + path(LANG, "executive") },
      { "@type": "ListItem", position: 3, name: "Chofer privado", item: self },
    ],
  };

  // Las mismas preguntas que se ven en la página, sacadas del componente en
  // lugar de reescritas: un esquema que no coincide con lo visible le cuesta
  // al sitio entero los resultados enriquecidos.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: chauffeurFaqs(LANG).map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <ChauffeurPage lang={LANG} />
    </>
  );
}
