import { notFound } from "next/navigation";
import TeotihuacanPage, { teotihuacanFaqs, teotihuacanPriceRange } from "../../_components/TeotihuacanPage";
import { pageMetadata } from "@/lib/seo";
import { isLang, path, SITE, url } from "@/lib/i18n";

/**
 * /es/teotihuacan-desde-cdmx. Su gemela es /en/teotihuacan-day-trip.
 *
 * El `Service` declara `Teotihuacán` como `areaServed` además de la ciudad:
 * la página no vende un traslado dentro de la CDMX, vende un día fuera.
 */
const LANG = "es" as const;

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
    name: "Viaje a Teotihuacán desde la Ciudad de México",
    description:
      "Auto y chofer privado para un día en Teotihuacán desde la Ciudad de México. El chofer espera mientras recorres la zona; sin grupo, sin guía y con precio fijo con IVA.",
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
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE + path(LANG, "home") },
      { "@type": "ListItem", position: 2, name: "Tarifas", item: SITE + path(LANG, "rates") },
      { "@type": "ListItem", position: 3, name: "Teotihuacán", item: self },
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
