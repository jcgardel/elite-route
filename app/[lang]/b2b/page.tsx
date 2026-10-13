import { notFound } from "next/navigation";
import B2bClient from "../../_components/B2bClient";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { isLang, SITE, url } from "@/lib/i18n";
import { tablasB2b } from "@/lib/price-book";

/**
 * /es/b2b. En inglés es /en/corporate.
 *
 * SIN `AggregateOffer`, aunque la página publique una tabla de precios. Lo
 * que se ofrece aquí es una cuenta corporativa —rutas recurrentes, factura
 * CFDI, términos de crédito—, y la tabla está para que el comprador calcule,
 * no para comprarla desde el resultado de búsqueda. El rango de precios lo
 * declara /tarifas, que es la página que sí vende traslados sueltos; medir lo
 * mismo dos veces es como empiezan a decir cosas distintas.
 */
const LANG = "es" as const;

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
    name: "Cuenta corporativa de transporte ejecutivo en CDMX",
    description:
      "Transporte ejecutivo para empresas en Ciudad de México: rutas recurrentes, factura electrónica CFDI, unidades aseguradas con monitoreo GPS y pago con tarjeta o transferencia.",
    serviceType: "Transporte ejecutivo corporativo",
    provider: { "@type": "LocalBusiness", "@id": `${SITE}/#business`, name: "Elite Route" },
    areaServed: { "@type": "City", name: "Ciudad de México" },
    audience: { "@type": "BusinessAudience", name: "Empresas" },
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
