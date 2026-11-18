import { notFound } from "next/navigation";
import AboutPage from "../../_components/AboutPage";
import { pageMetadata } from "@/lib/seo";
import { isLang, path, SITE, url } from "@/lib/i18n";

/**
 * /en/about. Su gemela en el otro idioma es /es/nosotros.
 */
const LANG = "en" as const;

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: LANG }];
}

export async function generateMetadata() {
  return pageMetadata(LANG, "about");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang !== LANG) notFound();
  const self = url(LANG, "about");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: self,
    mainEntity: { "@type": "LocalBusiness", "@id": `${SITE}/#business`, name: "Elite Route" },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + path(LANG, "home") },
      { "@type": "ListItem", position: 2, name: "About us", item: self },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <AboutPage lang={LANG} />
    </>
  );
}
