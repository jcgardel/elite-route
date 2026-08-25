import type { MetadataRoute } from "next";
import { LANGS, url, type Page } from "@/lib/i18n";

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
  { page: "corporate", priority: 0.7, changeFrequency: "monthly" },
  { page: "quote", priority: 0.6, changeFrequency: "monthly" },
  { page: "terms", priority: 0.3, changeFrequency: "yearly" },
  { page: "privacy", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PAGES.flatMap(({ page, priority, changeFrequency }) =>
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
}
