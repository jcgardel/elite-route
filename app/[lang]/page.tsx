import { notFound } from "next/navigation";
import HomeClient from "../_components/HomeClient";
import { pageMetadata } from "@/lib/seo";
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
 * páginas — sin valoraciones, que necesitan reseñas verificables.
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
      <HomeClient lang={lang} />
    </>
  );
}
