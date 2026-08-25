import { notFound } from "next/navigation";
import QuoteClient from "../../../_components/QuoteClient";
import { pageMetadata } from "@/lib/seo";
import { isLang } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export async function generateMetadata() {
  return pageMetadata("en", "quote");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== "en") notFound();
  return <QuoteClient lang={lang} />;
}
