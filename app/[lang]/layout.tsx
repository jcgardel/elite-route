import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { fontVars } from "../fonts";
import { isLang, LANGS, SITE } from "@/lib/i18n";
import "../globals.css";
import Analytics from "../_components/Analytics";

export const metadata: Metadata = {
  // Necesario para que la tarjeta generada en opengraph-image.tsx se anuncie
  // con URL absoluta. Es www y no el ápex: el ápex responde 307.
  metadataBase: new URL(SITE),
  title: "Elite Route",
  description: "Executive transfers in Mexico City.",
  // Lo que le demuestra a Google que el sitio es nuestro y abre Search
  // Console. No se puede quitar aunque la verificación ya esté hecha: Google
  // la revisa cada tanto y sin la etiqueta la propiedad se pierde.
  verification: {
    google: "rBrvdJP68ssqzcZBTKp0vrS_cusNoVzIXM5mz6jMGho",
  },
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
      className={fontVars}
    >
      <head>
        {/* El SDK de Maps se pide cuando el cotizador entra en pantalla, y
            para entonces conviene tener el saludo con Google ya hecho: sin
            esto, la primera petición carga además con la resolución de DNS
            y el apretón de manos TLS. */}
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
