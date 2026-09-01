import { notFound } from "next/navigation";
import QuoteClient from "../../../_components/QuoteClient";
import { pageMetadata } from "@/lib/seo";
import { isLang } from "@/lib/i18n";
import { tablasQuote } from "@/lib/price-book";

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "es" }];
}

export async function generateMetadata() {
  return pageMetadata("es", "quote");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== "es") notFound();
  return <QuoteClient lang={lang} tablas={tablasQuote()} />;
}
