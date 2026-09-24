import { notFound } from "next/navigation";
import ExecutivePage, { executiveFaqs, executivePriceRange } from "../../_components/ExecutivePage";
import { pageMetadata } from "@/lib/seo";
import { isLang, path, SITE, url } from "@/lib/i18n";

/**
 * /en/executive-transportation-mexico-city. Su gemela en español es
 * /es/transporte-ejecutivo-cdmx.
 */
const LANG = "en" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return pageMetadata(LANG, "executive");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();

  const { low, high } = executivePriceRange();
  const self = url(LANG, "executive");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Executive transportation in Mexico City",
    description:
      "Chauffeured ground transport in Mexico City: airport and point-to-point transfers, hourly service, full days and out-of-town routes. Our own insured fleet and a fixed price including VAT.",
    serviceType: "Executive transportation",
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
      { "@type": "ListItem", position: 2, name: "Executive transportation", item: self },
    ],
  };

  // Las mismas preguntas que se ven en la página, sacadas del componente en
  // lugar de reescritas: un esquema que no coincide con lo visible le cuesta
  // al sitio entero los resultados enriquecidos.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: executiveFaqs(LANG).map(([q, a]) => ({
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
      <ExecutivePage lang={LANG} />
    </>
  );
}
