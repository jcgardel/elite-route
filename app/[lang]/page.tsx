import { notFound } from "next/navigation";
import HomeClient from "../_components/HomeClient";
import { pageMetadata } from "@/lib/seo";
import { tablasCotizador } from "@/lib/price-book";
import { isLang, LANGS, SITE } from "@/lib/i18n";

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
      <HomeClient lang={lang} tablas={tablasCotizador()} />
    </>
  );
}
