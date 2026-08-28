import { notFound } from "next/navigation";
import TarifasClient from "../../_components/TarifasClient";
import { pageMetadata } from "@/lib/seo";
import { isLang } from "@/lib/i18n";
import { tablasTarifas } from "@/lib/price-book";

/**
 * /es/tarifas. Su gemela en inglés es /en/rates.
 */
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "es" }];
}

export async function generateMetadata() {
  return pageMetadata("es", "rates");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== "es") notFound();
  return <TarifasClient lang={lang} tablas={tablasTarifas()} />;
}
