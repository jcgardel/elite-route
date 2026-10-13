import { notFound } from "next/navigation";
import TarifasClient from "../../_components/TarifasClient";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { isLang, SITE, url } from "@/lib/i18n";
import { rangoTarifas, tablasTarifas } from "@/lib/price-book";
import { RATES_FAQS } from "@/lib/rates-faqs";

/**
 * /en/rates. Su gemela en español es /es/tarifas: el slug cambia porque
 * quien busca en inglés escribe "rates", no "tarifas".
 *
 * Ver la nota de /es/tarifas para por qué los tres bloques de JSON-LD
 * llegaron el 12 de octubre de 2026 y de dónde salen `lowPrice` y
 * `highPrice`.
 */
const LANG = "en" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return pageMetadata(LANG, "rates");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();

  const { low, high } = rangoTarifas();
  const self = url(LANG, "rates");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Fixed-price executive transfers in Mexico City",
    description:
      "Fixed, VAT-included prices for transfers from and to the AICM, AIFA and Toluca airports, hourly blocks and out-of-town round trips. Charged per vehicle, not per seat.",
    serviceType: "Private executive transportation",
    provider: { "@type": "LocalBusiness", "@id": `${SITE}/#business`, name: "Elite Route" },
    areaServed: { "@type": "City", name: "Mexico City" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "MXN",
      lowPrice: low,
      highPrice: high,
      url: self,
    },
    mainEntityOfPage: self,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: RATES_FAQS[LANG].map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(LANG, ["home", "rates"])) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <TarifasClient lang={lang} tablas={tablasTarifas()} />
    </>
  );
}
