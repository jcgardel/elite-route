import { Barlow, Barlow_Condensed, Cormorant_Garamond } from "next/font/google";

/**
 * Las tres tipografías del sitio, en un solo sitio.
 *
 * Viven fuera del layout porque la página de 404 global no pasa por ningún
 * layout —no puede: no sabe en qué idioma está— y aun así tiene que pintar
 * con la misma letra que el resto. Next deduplica la descarga: declararlas
 * dos veces con la misma configuración no baja nada dos veces.
 */

// Auto-hospedadas por Next: evitan la petición a fonts.googleapis.com, que
// bloqueaba el render al venir de un @import dentro del CSS.
export const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

// Sin preload: es la fuente de etiquetas pequeñas, no de lo primero que se
// lee. Precargar las nueve variantes hacía competir 157 KB de tipografía con
// la imagen del hero en los primeros milisegundos.
export const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
  preload: false,
});

// 600 no se usa en ninguna hoja de estilos del proyecto.
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Las tres variables CSS juntas, para el className del <html>. */
export const fontVars = `${barlow.variable} ${barlowCondensed.variable} ${cormorant.variable}`;
