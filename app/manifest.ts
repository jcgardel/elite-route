import type { MetadataRoute } from "next";

/**
 * Con esto el sitio se puede guardar en la pantalla de inicio y abrirse sin
 * las barras del navegador —unos 110 px que en un teléfono son la diferencia
 * entre ver el cotizador entero o no—, con icono propio y con permiso para
 * mandar notificaciones desde iOS 16.4.
 *
 * Los iconos ya existen desde que se rehizo la marca: icon.svg y apple-icon
 * salen del mismo símbolo, así que aquí no hay ningún archivo nuevo.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elite Route — Private Chauffeur",
    short_name: "Elite Route",
    description: "Executive transfers in Mexico City. Airport, hourly and corporate transportation.",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#0A0A0A",
    orientation: "portrait",
    lang: "en",
    dir: "ltr",
    categories: ["travel", "business"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
