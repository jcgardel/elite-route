import { notFound } from "next/navigation";
import FleetPage, { fleetFaqs, fleetPriceRange } from "../../_components/FleetPage";
import { pageMetadata } from "@/lib/seo";
import { isLang, path, SITE, url } from "@/lib/i18n";

/**
 * /en/fleet. Su gemela en el otro idioma es /es/flota.
 */
const LANG = "en" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return pageMetadata(LANG, "fleet");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();

  // El rango son los cuatro "desde" que la página enseña, uno por categoría.
  // Ni un peso más: declarar un precio que no está en la página es lo que le
  // cuesta al sitio entero los resultados enriquecidos.
  const { low, high } = fleetPriceRange();
  const self = url(LANG, "fleet");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Elite Route fleet in Mexico City",
    description:
      "Four chauffeured vehicle categories in Mexico City — Sedan, Executive, Minivan and High SUV — all our own vehicles, insured and GPS-monitored.",
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
      { "@type": "ListItem", position: 2, name: "Executive transportation", item: SITE + path(LANG, "executive") },
      { "@type": "ListItem", position: 3, name: "Fleet", item: self },
    ],
  };

  // Las mismas preguntas que se ven en la página, sacadas del componente en
  // lugar de reescritas: un esquema que no coincide con lo visible le cuesta
  // al sitio entero los resultados enriquecidos.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: fleetFaqs(LANG).map(([q, a]) => ({
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
      <FleetPage lang={LANG} />
    </>
  );
}
