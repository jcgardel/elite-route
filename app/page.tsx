import type { Metadata } from "next";
import HomeClient from "./HomeClient";

// La portada abre en inglés, así que los metadatos hablan el mismo idioma:
// un título en español sobre una página en inglés es justo la discordancia
// que Google castiga. Los términos en español siguen vivos en `keywords` y,
// sobre todo, en /tarifas y /b2b, que son páginas enteras en español.
export const metadata: Metadata = {
  title: "Elite Route — Private Chauffeur & Executive Transfers in Mexico City",
  description:
    "Book a private chauffeur in Mexico City. Airport transfers to AICM, AIFA and Toluca, hourly service and corporate accounts. Fixed price, VAT included.",
  keywords:
    "private chauffeur Mexico City, Mexico City airport transfer, AICM transfer, AIFA transfer, executive car service CDMX, chofer privado CDMX, traslado aeropuerto Ciudad de México, transporte ejecutivo CDMX, traslado AICM, traslado AIFA",
  openGraph: {
    title: "Elite Route — Private Chauffeur & Executive Transfers in Mexico City",
    description:
      "Your private chauffeur in Mexico City. Airport transfers, hourly service and executive transportation. Fixed price, VAT included.",
    url: "https://eliteroute.mx",
    siteName: "Elite Route",
    locale: "en_US",
    alternateLocale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite Route — Private Chauffeur in Mexico City",
    description: "Executive airport and city transfers. Fixed price, VAT included.",
  },
  alternates: {
    canonical: "https://eliteroute.mx",
  },
};

// Lo que alimenta la ficha de negocio de Google: qué es Elite Route, dónde
// opera y cómo se le contacta. Sólo datos que el sitio ya sostiene en otras
// páginas — sin valoraciones, que necesitan reseñas verificables.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://eliteroute.mx/#business",
  name: "Elite Route",
  description:
    "Transporte ejecutivo privado en Ciudad de México: traslados al aeropuerto AICM, AIFA y Toluca, servicio por horas y cuentas corporativas.",
  url: "https://eliteroute.mx",
  telephone: "+52-55-4358-2919",
  email: "business@eliteroute.mx",
  image: "https://eliteroute.mx/executive.webp",
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
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Traslado al aeropuerto", serviceType: "Traslado ejecutivo" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Servicio por horas", serviceType: "Chofer privado por horas" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cuentas corporativas", serviceType: "Transporte ejecutivo corporativo" } },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* El fondo del hero vive dentro del CSS, así que el navegador lo
          descubre tarde: es la imagen más grande de la primera pantalla. */}
      <link rel="preload" as="image" href="/high-suv.webp" fetchPriority="high" />
      <HomeClient />
    </>
  );
}
