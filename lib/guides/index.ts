/**
 * El registro de guías. Ver `./types.ts` para por qué existen estas páginas.
 *
 * `server-only` porque la tabla de excursiones saca sus tiempos de
 * `lib/distances.ts`, que no puede cruzar al navegador: publicar una distancia
 * junto a un precio entrega la tarifa por kilómetro. Las guías son
 * componentes de servidor, así que no estorba.
 */
import "server-only";

import type { Lang } from "../i18n";
import { metadataFrom } from "../seo";
import type { ContenidoGuia, Guia } from "./types";
import { GUIA_AEROPUERTO } from "./airport";
import { GUIA_EXCURSIONES } from "./day-trips";
import { GUIA_TERMINALES } from "./terminals";

export type { Bloque, ContenidoGuia, Guia, Seccion } from "./types";

export type GuideKey = "airport" | "dayTrips" | "terminals";

export const GUIAS: Record<GuideKey, Guia> = {
  airport: GUIA_AEROPUERTO,
  dayTrips: GUIA_EXCURSIONES,
  terminals: GUIA_TERMINALES,
};

export const GUIDE_KEYS = Object.keys(GUIAS) as GuideKey[];

export function guia(key: GuideKey, lang: Lang): ContenidoGuia {
  return GUIAS[key].contenido[lang];
}

/**
 * Los metadatos de una guía, sacados de su propio contenido. Ver
 * `metadataFrom` en lib/seo.ts para por qué no pasan por `COPY`.
 */
export function guideMetadata(key: GuideKey, lang: Lang) {
  const g = GUIAS[key];
  const c = g.contenido[lang];
  return metadataFrom(lang, g.page, { title: c.title, description: c.description });
}
