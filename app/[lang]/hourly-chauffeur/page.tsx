import { notFound } from "next/navigation";
import HourlyPage, { hourlyFaqs, hourlyPriceRange } from "../../_components/HourlyPage";
import { pageMetadata } from "@/lib/seo";
import { isLang, path, SITE, url } from "@/lib/i18n";

/**
 * /en/hourly-chauffeur. Su gemela en español es /es/chofer-por-horas: el
 * slug cambia porque quien busca en inglés escribe "hourly", no "por horas".
 */
const LANG = "en" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return pageMetadata(LANG, "hourly");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();

  const { low, high } = hourlyPriceRange();
  const self = url(LANG, "hourly");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Hourly chauffeur service in Mexico City",
    description:
      "A private chauffeur and vehicle at your disposal by the hour in Mexico City, with 20 km included per hour and a fixed price including VAT.",
    serviceType: "Hourly chauffeur service",
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
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + path(LANG, "home") },
      { "@type": "ListItem", position: 2, name: "Rates", item: SITE + path(LANG, "rates") },
      { "@type": "ListItem", position: 3, name: "Hourly chauffeur", item: self },
    ],
  };

  // Las mismas preguntas que se ven en la página, sacadas del componente en
  // lugar de reescritas: un esquema que no coincide con lo visible le cuesta
  // al sitio entero los resultados enriquecidos.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: hourlyFaqs(LANG).map(([q, a]) => ({
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
      <HourlyPage lang={LANG} />
    </>
  );
}
