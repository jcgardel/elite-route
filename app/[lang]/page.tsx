import { notFound } from "next/navigation";
import HomeClient from "../_components/HomeClient";
import { pageMetadata } from "@/lib/seo";
import { tablasCotizador } from "@/lib/price-book";
import { isLang, LANGS, SITE, type Lang } from "@/lib/i18n";
import { ROUTES, ROUTE_KEYS, routePath } from "@/lib/routes";

export const dynamicParams = false;
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "home");
}

/**
 * Lo que alimenta la ficha de negocio de Google: qué es Elite Route, dónde
 * opera y cómo se le contacta. Sólo datos que el sitio ya sostiene en otras
 * páginas.
 *
 * Sigue sin `aggregateRating`, y ahora por un motivo distinto del de antes:
 * ya hay reseñas verificables —5.0 sobre 20 en la ficha de Google—, pero
 * Google no acepta que un negocio publique su propia calificación en su
 * propio sitio. Sus normas de fragmentos de reseña lo llaman "autoservicio"
 * y dejan la página fuera del formato de estrellas, tanto si el dato va en
 * los datos estructurados como si viene de un widget de reseñas incrustado.
 * Las estrellas del buscador salen de la ficha, no de aquí. Lo que sí suma
 * es `sameAs`: le dice a Google que este sitio y esa ficha son el mismo
 * negocio, que es justo lo que hace que la ficha y el dominio se refuercen.
 *
 * Va una sola vez, en la portada en español: es una ficha de un negocio, no
 * de una página, y declararla dos veces con el mismo @id no aporta nada.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE}/#business`,
  name: "Elite Route",
  description:
    "Transporte ejecutivo privado en Ciudad de México: traslados al aeropuerto AICM, AIFA y Toluca, servicio por horas y cuentas corporativas.",
  url: SITE,
  telephone: "+52-55-4358-2919",
  email: "business@eliteroute.mx",
  image: `${SITE}/executive.webp`,
  priceRange: "$$$",
  currenciesAccepted: "MXN",
  paymentAccepted: "Tarjeta de crédito, tarjeta de débito",
  sameAs: [
    "https://www.google.com/maps/place/?q=place_id:ChIJwYyKBzB3-SYRmnY1eNB8Vf0",
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  areaServed: [
    { "@type": "City", name: "Ciudad de México" },
    { "@type": "Airport", name: "Aeropuerto Internacional Benito Juárez (AICM)", iataCode: "MEX" },
    { "@type": "Airport", name: "Aeropuerto Internacional Felipe Ángeles (AIFA)", iataCode: "NLU" },
    { "@type": "Airport", name: "Aeropuerto Internacional de Toluca", iataCode: "TLC" },
  ],
};

/**
 * Las 16 rutas, reducidas a lo único que la portada necesita: un enlace y una
 * etiqueta.
 *
 * POR QUÉ SE RESUELVE AQUÍ Y NO EN EL COMPONENTE DE CLIENTE. `lib/routes.ts`
 * lleva el texto completo de cada ruta en los dos idiomas —títulos, metas,
 * párrafos y preguntas frecuentes—, y todo lo que importa un componente de
 * cliente se descarga en el navegador del visitante. Importarlo allí metería
 * decenas de miles de caracteres de texto en el JavaScript de la portada para
 * pintar dieciséis enlaces. Es el mismo motivo por el que los precios bajan
 * ya calculados.
 *
 * `precioUnico` separa los viajes foráneos de los traslados de aeropuerto,
 * que es como la portada los agrupa.
 */
function enlacesDeRuta(lang: Lang) {
  /**
   * "Mexico City International Airport (AICM)" se queda en "AICM".
   *
   * En inglés ese nombre completo abre ocho de las dieciséis etiquetas, y
   * repetido en una rejilla partía casi todas en dos renglones: cuarenta
   * caracteres idénticos antes de llegar a lo único que distingue una fila de
   * otra, que es el destino. El nombre largo sigue estando donde importa para
   * el buscador, que es la propia página de la ruta.
   */
  const corto = (nombre: string) => nombre.match(/\(([A-Z]{3,5})\)/)?.[1] ?? nombre;

  return ROUTE_KEYS.map((key) => ({
    href: routePath(lang, key),
    label: `${corto(ROUTES[key][lang].airport)} → ${ROUTES[key][lang].zone}`,
    foranea: ROUTES[key].precioUnico === true,
  }));
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <>
      {lang === "es" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* El fondo del hero vive dentro del CSS, así que el navegador lo
          descubre tarde: es la imagen más grande de la primera pantalla. */}
      <link rel="preload" as="image" href="/high-suv.webp" fetchPriority="high" />
      {/* Los precios por horas y de día completo se resuelven aquí, en el
          servidor, y bajan ya calculados. El cotizador no puede calcularlos
          por su cuenta sin arrastrar el tarifario al navegador. */}
      <HomeClient lang={lang} tablas={tablasCotizador()} rutas={enlacesDeRuta(lang)} />
    </>
  );
}
