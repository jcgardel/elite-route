import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Elite Route — Chofer Privado y Transporte Ejecutivo CDMX",
  description:
    "Reserva tu chofer privado en Ciudad de México. Traslados al aeropuerto AICM, AIFA y Toluca, servicio por horas y transporte ejecutivo corporativo. Precio fijo, IVA incluido.",
  keywords:
    "chofer privado CDMX, traslado aeropuerto Ciudad de México, transporte ejecutivo CDMX, chofer ejecutivo México, traslado AICM, traslado AIFA, chofer por horas CDMX",
  openGraph: {
    title: "Elite Route — Chofer Privado y Transporte Ejecutivo CDMX",
    description:
      "Tu chofer privado en Ciudad de México. Traslados al aeropuerto, servicio por hora y transporte ejecutivo corporativo. Precio fijo, IVA incluido.",
    url: "https://eliteroute.mx",
    siteName: "Elite Route",
    images: [
      {
        url: "https://eliteroute.mx/executive.jpg",
        width: 1200,
        height: 630,
        alt: "Elite Route — Transporte ejecutivo Ciudad de México",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite Route — Chofer Privado CDMX",
    description: "Traslados ejecutivos al aeropuerto y por la ciudad. Precio fijo, IVA incluido.",
    images: ["https://eliteroute.mx/executive.jpg"],
  },
  alternates: {
    canonical: "https://eliteroute.mx",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
