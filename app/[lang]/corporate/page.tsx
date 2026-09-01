import { notFound } from "next/navigation";
import B2bClient from "../../_components/B2bClient";
import { pageMetadata } from "@/lib/seo";
import { isLang } from "@/lib/i18n";
import { tablasB2b } from "@/lib/price-book";

/**
 * /en/corporate. En español es /es/b2b, que es como la conoce el mercado
 * mexicano y como está enlazada desde fuera.
 */
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export async function generateMetadata() {
  return pageMetadata("en", "corporate");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== "en") notFound();
  return <B2bClient lang={lang} tablas={tablasB2b()} />;
}
