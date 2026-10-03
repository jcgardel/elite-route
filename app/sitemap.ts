import type { MetadataRoute } from "next";
import { LANGS, SITE, url, type Page } from "@/lib/i18n";
import { ROUTE_KEYS, routePath } from "@/lib/routes";

/**
 * El sitemap con las dos versiones de cada página y sus enlaces cruzados.
 *
 * `alternates.languages` es la forma de decirle a Google, desde el sitemap,
 * que /en/rates y /es/tarifas son la misma página en dos idiomas y no dos
 * páginas compitiendo entre sí. Sin eso, dos versiones de un mismo contenido
 * se estorban en los resultados.
 *
 * Las páginas de resultado de pago no entran: no son contenido, y robots.txt
 * ya las excluye.
 */
const PAGES: Array<{ page: Page; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = [
  { page: "home", priority: 1, changeFrequency: "weekly" },
  { page: "rates", priority: 0.8, changeFrequency: "monthly" },
  // Prioridad alta por el mismo motivo que las rutas: persigue una búsqueda
  // con intención de compra —"chofer por horas cdmx"— que hasta ahora caía
  // en /tarifas y competía ahí con todo lo demás.
  { page: "hourly", priority: 0.9, changeFrequency: "monthly" },
  // Misma prioridad que las demás de intención de compra. Persigue una
  // demanda medida: la reserva más grande de las primeras cinco fue
  // justamente un día a Teotihuacán, y el sitio no lo mencionaba.
  { page: "teotihuacan", priority: 0.9, changeFrequency: "monthly" },
  // Las dos búsquedas genéricas del sector. Prioridad alta por la misma
  // razón que las rutas: son intención de compra y hasta ahora caían en la
  // portada, que es un cotizador y no una respuesta.
  { page: "chauffeur", priority: 0.9, changeFrequency: "monthly" },
  { page: "executive", priority: 0.9, changeFrequency: "monthly" },
  // La genérica de aeropuerto, que es la búsqueda con más intención de
  // compra del negocio.
  { page: "airport", priority: 0.9, changeFrequency: "monthly" },
  // Más baja que las de servicio: la flota se consulta ANTES de reservar,
  // pero nadie busca "flota" con la tarjeta en la mano.
  { page: "fleet", priority: 0.7, changeFrequency: "monthly" },
  // LAS GUÍAS. Prioridad 0.8: por debajo de las páginas de servicio, que son
  // las que convierten, y por encima de la flota. No persiguen intención de
  // compra sino la búsqueda anterior —cómo salir del aeropuerto, qué cabe en
  // un día—, y ése es el tráfico que hoy no llega: las 56 URLs que había eran
  // todas comerciales. `weekly` porque llevan datos que caducan y que hay que
  // volver a revisar, no porque cambien solas.
  { page: "guideAirport", priority: 0.8, changeFrequency: "weekly" },
  { page: "guideDayTrips", priority: 0.8, changeFrequency: "weekly" },
  { page: "guideTerminals", priority: 0.8, changeFrequency: "weekly" },
  { page: "corporate", priority: 0.7, changeFrequency: "monthly" },
  { page: "quote", priority: 0.6, changeFrequency: "monthly" },
  { page: "terms", priority: 0.3, changeFrequency: "yearly" },
  { page: "privacy", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const paginas = PAGES.flatMap(({ page, priority, changeFrequency }) =>
    LANGS.map((lang) => ({
      url: url(lang, page),
      lastModified: now,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: url("en", page),
          "es-MX": url("es", page),
        },
      },
    })),
  );

  // Una página por ruta y por idioma. Prioridad alta: son las que persiguen
  // las búsquedas con intención de compra —origen, destino y precio— y las
  // que deberían traer el tráfico que hoy no llega.
  const rutas = ROUTE_KEYS.flatMap((key) =>
    LANGS.map((lang) => ({
      url: SITE + routePath(lang, key),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          en: SITE + routePath("en", key),
          "es-MX": SITE + routePath("es", key),
        },
      },
    })),
  );

  return [...paginas, ...rutas];
}
