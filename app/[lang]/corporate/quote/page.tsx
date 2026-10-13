import { notFound } from "next/navigation";
import QuoteClient from "../../../_components/QuoteClient";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { isLang } from "@/lib/i18n";
import { tablasQuote } from "@/lib/price-book";

/**
 * /en/corporate/quote. En español es /es/b2b/cotizar. Ver esa página para por
 * qué sólo lleva migas y por qué no lleva `noindex`.
 */
const LANG = "en" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return pageMetadata(LANG, "quote");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd(LANG, ["home", "corporate", "quote"])),
        }}
      />
      <QuoteClient lang={lang} tablas={tablasQuote()} />
    </>
  );
}
