import { notFound } from "next/navigation";
import RoutePage from "../../../_components/RoutePage";
import { calculatePrice } from "@/lib/booking";
import { CATEGORIES, type Category } from "@/lib/vehicles";
import { isLang, path, SITE } from "@/lib/i18n";
import { ROUTE_KEYS, ROUTES, routeFromSlug, routePath, routeSlug } from "@/lib/routes";
import { LEGS } from "@/lib/distances";

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
  const cats: readonly Category[] = CATEGORIES;
  // El rango que se anuncia es EXACTAMENTE el de la tabla de la página.
  // Inventar un precio en los datos estructurados que no coincida con lo que
  // se ve es justo lo que hace que Google deje de creerte.
  //
  // Por eso se mira `precioUnico`: esas rutas no salen de una terminal, así
  // que su tabla enseña UNA columna sin el recargo de aeropuerto y la
  // variante con recargo no existe para ellas. Hasta el 24 sep 2026 se
  // calculaban las dos y el tope anunciado no estaba en ninguna parte de la
  // página: San Miguel declaraba $15,635 cuando su precio más alto visible
  // era $12,508.
  const leg = LEGS[key];
  const precios = cats.flatMap((cat) =>
    route.precioUnico === true
      ? [calculatePrice(leg.km, leg.min, cat, "route", 0, false)]
      : [
          calculatePrice(leg.km, leg.min, cat, "route", 0, false),
          calculatePrice(leg.km, leg.min, cat, "route", 0, true),
        ],
  );

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
