import { notFound } from "next/navigation";
import RoutePage from "../../../_components/RoutePage";
import { calculatePrice, tariffs, type Category } from "@/lib/booking";
import { isLang, path, SITE } from "@/lib/i18n";
import { ROUTE_KEYS, ROUTES, routeFromSlug, routePath, routeSlug } from "@/lib/routes";

const LANG = "en" as const;
const PARAM = "route";

export const dynamicParams = false;

/** Una página por ruta. Los slugs viven en lib/routes.ts, traducidos. */
export function generateStaticParams() {
  return ROUTE_KEYS.map((k) => ({ lang: LANG, [PARAM]: routeSlug(LANG, k) }));
}

type Props = { params: Promise<{ lang: string; route: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await params;
  const key = routeFromSlug(LANG, p.route);
  if (!isLang(p.lang) || p.lang !== LANG || !key) notFound();
  const c = ROUTES[key][LANG];

  return {
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: c.keywords,
    alternates: {
      canonical: SITE + routePath(LANG, key),
      languages: {
        en: SITE + routePath("en", key),
        "es-MX": SITE + routePath("es", key),
        "x-default": SITE,
      },
    },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: SITE + routePath(LANG, key),
      siteName: "Elite Route",
      locale: "en_US",
      alternateLocale: "es_MX",
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const p = await params;
  const key = routeFromSlug(LANG, p.route);
  if (!isLang(p.lang) || p.lang !== LANG || !key) notFound();

  const route = ROUTES[key];
  const c = route[LANG];
  const cats: Category[] = Object.keys(tariffs) as Category[];
  // El rango que se anuncia es el mismo que la tabla de la página: el más
  // barato sin recargo y el más caro con él. Inventar un precio en los datos
  // estructurados que no coincida con lo que se ve es justo lo que hace que
  // Google deje de creerte.
  const precios = cats.flatMap((cat) => [
    calculatePrice(route.km, route.minutes, cat, "route", 3, false),
    calculatePrice(route.km, route.minutes, cat, "route", 3, true),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: c.title,
    description: c.metaDescription,
    serviceType: "Private executive transfer",
    provider: { "@type": "LocalBusiness", "@id": `${SITE}/#business`, name: "Elite Route" },
    areaServed: { "@type": "City", name: "Ciudad de México" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "MXN",
      lowPrice: Math.min(...precios),
      highPrice: Math.max(...precios),
      offerCount: precios.length,
      url: SITE + routePath(LANG, key),
    },
    mainEntityOfPage: SITE + routePath(LANG, key),
  };

  // La miga de pan que Google pinta en lugar de la URL cruda. Los dos
  // escalones anteriores son páginas que existen y a las que esta misma
  // página enlaza al pie; una miga que invente un nivel intermedio —un
  // /transfers que no responde— es peor que no ponerla.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + path(LANG, "home") },
      { "@type": "ListItem", position: 2, name: "Rates", item: SITE + path(LANG, "rates") },
      { "@type": "ListItem", position: 3, name: c.title, item: SITE + routePath(LANG, key) },
    ],
  };

  // Las preguntas de la página, para que Google pueda mostrarlas desplegadas.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <RoutePage lang={LANG} routeKey={key} />
    </>
  );
}
