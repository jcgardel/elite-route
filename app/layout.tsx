import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elite Route — Transporte Ejecutivo CDMX",
  description: "Tu chofer privado en Ciudad de México. Traslados al aeropuerto AICM, AIFA y Toluca, servicio por hora y transporte ejecutivo corporativo.",
  openGraph: {
    title: "Elite Route — Transporte Ejecutivo CDMX",
    description: "Tu chofer privado en Ciudad de México. Traslados al aeropuerto, servicio por hora y transporte ejecutivo.",
    url: "https://eliteroute.mx",
    siteName: "Elite Route",
    images: [{ url: "https://eliteroute.mx/executive.jpg", width: 1200, height: 630, alt: "Elite Route — Transporte ejecutivo Ciudad de México" }],
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
