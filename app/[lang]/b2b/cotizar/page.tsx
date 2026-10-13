import { notFound } from "next/navigation";
import QuoteClient from "../../../_components/QuoteClient";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { isLang } from "@/lib/i18n";
import { tablasQuote } from "@/lib/price-book";

/**
 * /es/b2b/cotizar. En inglés es /en/corporate/quote.
 *
 * Sólo migas de pan. Es un formulario: no hay servicio que declarar que no
 * declare ya /es/b2b, ni preguntas frecuentes que reflejar. Lo que le faltaba
 * era decirle a Google dónde cuelga, y eso sí importa en una página a tres
 * niveles de la portada.
 *
 * NO LLEVA `noindex`, aunque sea delgada. Está indexada y recibe enlaces
 * internos; sacarla del índice sin mirar antes su tráfico es exactamente lo
 * que el dueño pidió no hacer.
 */
const LANG = "es" as const;

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
