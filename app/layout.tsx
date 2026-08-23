import type { Metadata, Viewport } from "next";
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

// Sin preload: es la fuente de etiquetas pequeñas, no de lo primero que se
// lee. Precargar las nueve variantes hacía competir 157 KB de tipografía con
// la imagen del hero en los primeros milisegundos.
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
  preload: false,
});

// 600 no se usa en ninguna hoja de estilos del proyecto.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  // Necesario para que la tarjeta generada en app/opengraph-image.tsx se
  // anuncie con URL absoluta.
  metadataBase: new URL("https://eliteroute.mx"),
  title: "Elite Route — Transporte Ejecutivo CDMX",
  description: "Tu chofer privado en Ciudad de México. Traslados al aeropuerto AICM, AIFA y Toluca, servicio por hora y transporte ejecutivo corporativo.",
  openGraph: {
    title: "Elite Route — Transporte Ejecutivo CDMX",
    description: "Tu chofer privado en Ciudad de México. Traslados al aeropuerto, servicio por hora y transporte ejecutivo.",
    url: "https://eliteroute.mx",
    siteName: "Elite Route",
    locale: "es_MX",
    type: "website",
  },
};

// Sin esto la barra del navegador sale clara en Android y en Safari iOS y
// corta el negro del sitio justo en el borde de la pantalla.
export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
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
