import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://eliteroute.mx";
const SITE_NAME = "Elite Route";
const SITE_DESCRIPTION =
  "Tu chofer privado en Ciudad de México. Traslados al aeropuerto AICM, AIFA y Toluca, servicio por hora y transporte ejecutivo con tarifas fijas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Elite Route — Chofer Privado y Transporte Ejecutivo CDMX",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords:
    "chofer privado CDMX, transporte ejecutivo Ciudad de México, traslado aeropuerto AICM, traslado AIFA, servicio por hora chofer, transporte corporativo CDMX",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Elite Route — Chofer Privado y Transporte Ejecutivo CDMX",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite Route — Chofer Privado y Transporte Ejecutivo CDMX",
    description: SITE_DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  telephone: "+52-55-4358-2919",
  email: "business@eliteroute.mx",
  image: `${SITE_URL}/elite-route-logo.jpg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ciudad de México",
    addressRegion: "CDMX",
    addressCountry: "MX",
  },
  areaServed: [
    "Ciudad de México",
    "Estado de México",
    "Aeropuerto Internacional Benito Juárez",
    "Aeropuerto Internacional Felipe Ángeles",
    "Aeropuerto de Toluca",
  ],
  priceRange: "$$$$",
  openingHours: "Mo-Su 00:00-23:59",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
