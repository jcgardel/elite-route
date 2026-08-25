import type { Metadata } from "next";
import TarifasClient from "./TarifasClient";

export const metadata: Metadata = {
  title: "Tarifas de Transporte Ejecutivo en CDMX | Elite Route",
  description:
    "Consulta las tarifas fijas de traslado ejecutivo en Ciudad de México. Precios con IVA incluido para aeropuerto AICM, AIFA, Toluca y rutas corporativas. Sedan, Executive, Minivan y High SUV.",
  keywords:
    "tarifa traslado aeropuerto CDMX, precio chofer ejecutivo Ciudad de México, tarifa AICM Polanco, costo traslado AIFA CDMX, transporte ejecutivo precio, tarifa chofer privado CDMX",
  openGraph: {
    title: "Tarifas Elite Route — Transporte Ejecutivo CDMX",
    description:
      "Precios fijos con IVA incluido para traslados ejecutivos en Ciudad de México. AICM, AIFA, Toluca y rutas corporativas.",
    url: "https://eliteroute.mx/tarifas",
    siteName: "Elite Route",
    locale: "es_MX",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Elite Route",
  description:
    "Servicio de transporte ejecutivo privado en Ciudad de México. Traslados al aeropuerto AICM, AIFA y Toluca con choferes profesionales.",
  url: "https://eliteroute.mx",
  telephone: "+52-55-4358-2919",
  email: "business@eliteroute.mx",
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

/**
 * Los metadatos de esta página se quedan en español a propósito: es la que
 * trae el tráfico de "tarifa traslado aeropuerto CDMX" y compañía. El
 * contenido sí es bilingüe — ver TarifasClient.
 */
export default function TarifasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TarifasClient />
    </>
  );
}
