import { notFound } from "next/navigation";
import TeotihuacanPage, { teotihuacanFaqs, teotihuacanPriceRange } from "../../_components/TeotihuacanPage";
import { pageMetadata } from "@/lib/seo";
import { isLang, path, SITE, url } from "@/lib/i18n";

/**
 * /en/teotihuacan-day-trip. Su gemela es /es/teotihuacan-desde-cdmx.
 *
 * El `Service` declara `Teotihuacán` como `areaServed` además de la ciudad:
 * la página no vende un traslado dentro de la CDMX, vende un día fuera.
 */
const LANG = "en" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return pageMetadata(LANG, "teotihuacan");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();

  const { low, high } = teotihuacanPriceRange();
  const self = url(LANG, "teotihuacan");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Teotihuacan day trip from Mexico City",
    description:
      "A private car and chauffeur for a day at Teotihuacan from Mexico City. The chauffeur waits while you visit; no group, no guide, fixed price including VAT.",
    serviceType: "Private day trip with chauffeur",
    provider: { "@type": "LocalBusiness", "@id": `${SITE}/#business`, name: "Elite Route" },
    areaServed: [
      { "@type": "City", name: "Ciudad de México" },
      { "@type": "Place", name: "Teotihuacán, Estado de México" },
    ],
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
      { "@type": "ListItem", position: 3, name: "Teotihuacan day trip", item: self },
    ],
  };

  // Las mismas preguntas que se ven en la página, sacadas del componente:
  // un esquema que no coincide con lo visible cuesta los resultados
  // enriquecidos de todo el sitio, no sólo los de esta página.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: teotihuacanFaqs(LANG).map(([q, a]) => ({
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
      <TeotihuacanPage lang={LANG} />
    </>
  );
}
