import { notFound } from "next/navigation";
import TarifasClient from "../../_components/TarifasClient";
import { pageMetadata } from "@/lib/seo";
import { isLang } from "@/lib/i18n";

/**
 * /en/rates. Su gemela en español es /es/tarifas: el slug cambia porque
 * quien busca en inglés escribe "rates", no "tarifas".
 */
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export async function generateMetadata() {
  return pageMetadata("en", "rates");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== "en") notFound();
  return <TarifasClient lang={lang} />;
}
