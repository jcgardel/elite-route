import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Cormorant_Garamond } from "next/font/google";
import { notFound } from "next/navigation";
import { isLang, LANGS, SITE } from "@/lib/i18n";
import "../globals.css";

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
  // Necesario para que la tarjeta generada en opengraph-image.tsx se anuncie
  // con URL absoluta. Es www y no el ápex: el ápex responde 307.
  metadataBase: new URL(SITE),
  title: "Elite Route",
  description: "Executive transfers in Mexico City.",
};

// Sin esto la barra del navegador sale clara en Android y en Safari iOS y
// corta el negro del sitio justo en el borde de la pantalla.
export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

/**
 * Este es el layout raíz del sitio: no hay `app/layout.tsx` porque el idioma
 * tiene que estar en el `<html lang>` desde el servidor, y sólo el layout
 * raíz puede escribir esa etiqueta. Con el idioma en la ruta, cada versión
 * se sirve ya declarada como lo que es en vez de corregirse con JavaScript
 * después de pintar.
 */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${barlow.variable} ${barlowCondensed.variable} ${cormorant.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
