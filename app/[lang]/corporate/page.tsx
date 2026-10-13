import { notFound } from "next/navigation";
import B2bClient from "../../_components/B2bClient";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { isLang, SITE, url } from "@/lib/i18n";
import { tablasB2b } from "@/lib/price-book";

/**
 * /en/corporate. En español es /es/b2b, que es como la conoce el mercado
 * mexicano y como está enlazada desde fuera.
 *
 * Ver /es/b2b para por qué no lleva `AggregateOffer` teniendo una tabla de
 * precios delante.
 */
const LANG = "en" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return pageMetadata(LANG, "corporate");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();

  const self = url(LANG, "corporate");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Corporate executive transportation account in Mexico City",
    description:
      "Executive ground transportation for companies in Mexico City: recurring routes, CFDI electronic invoicing, insured GPS-monitored vehicles and payment by card or bank transfer.",
    serviceType: "Corporate executive transportation",
    provider: { "@type": "LocalBusiness", "@id": `${SITE}/#business`, name: "Elite Route" },
    areaServed: { "@type": "City", name: "Mexico City" },
    audience: { "@type": "BusinessAudience", name: "Companies" },
    mainEntityOfPage: self,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(LANG, ["home", "corporate"])) }}
      />
      <B2bClient lang={lang} tablas={tablasB2b()} />
    </>
  );
}
