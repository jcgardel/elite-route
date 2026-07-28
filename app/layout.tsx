import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Auto-hospedadas por Next: evitan la petición a fonts.googleapis.com, que
// bloqueaba el render al venir de un @import dentro del CSS.
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

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
    <html
      lang="es"
      className={`${barlow.variable} ${barlowCondensed.variable} ${cormorant.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
