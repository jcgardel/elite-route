import { notFound } from "next/navigation";
import B2bClient from "../../_components/B2bClient";
import { pageMetadata } from "@/lib/seo";
import { isLang } from "@/lib/i18n";

/**
 * /es/b2b. En inglés es /en/corporate.
 */
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "es" }];
}

export async function generateMetadata() {
  return pageMetadata("es", "corporate");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== "es") notFound();
  return <B2bClient lang={lang} />;
}
