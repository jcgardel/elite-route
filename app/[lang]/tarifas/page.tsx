import { notFound } from "next/navigation";
import TarifasClient from "../../_components/TarifasClient";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { isLang, SITE, url } from "@/lib/i18n";
import { rangoTarifas, tablasTarifas } from "@/lib/price-book";
import { RATES_FAQS } from "@/lib/rates-faqs";

/**
 * /es/tarifas. Su gemela en inglés es /en/rates.
 *
 * Los tres bloques de JSON-LD se añadieron el 12 de octubre de 2026: la
 * página llevaba las cuatro tablas de precios y diez preguntas frecuentes a
 * la vista y no declaraba ni una. Las veinte páginas de ruta y de guía ya lo
 * hacían; ésta, que es la que más precio enseña, no.
 *
 * `lowPrice` y `highPrice` salen de `rangoTarifas()`, que lee el mismo objeto
 * que pinta las tablas. Nunca a mano: ver la nota en lib/price-book.ts.
 */
const LANG = "es" as const;

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
    name: "Traslados ejecutivos con precio fijo en Ciudad de México",
    description:
      "Tarifas fijas con IVA para traslados desde y hacia los aeropuertos AICM, AIFA y Toluca, bloques de servicio por horas y viajes redondos a destinos foráneos. El precio es por vehículo, no por asiento.",
    serviceType: "Transporte ejecutivo privado",
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

  // Las mismas preguntas que se ven en la página, sacadas del componente en
  // lugar de reescritas.
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
