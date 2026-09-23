/**
 * Los kilómetros y las duraciones que publican las tablas de precios.
 *
 * Vivían dentro de los componentes que las pintan, y eso obligaba a esos
 * componentes a calcular el precio ellos mismos —y por tanto a importar el
 * tarifario y arrastrarlo al navegador—. Ahora la definición vive aquí, la
 * comparten el componente y su página, y el precio lo calcula el servidor.
 *
 * Nada de este archivo es información interna: una distancia y una duración
 * son datos del mapa, y las horas de un bloque ya están publicadas. Puede
 * cruzar al navegador sin problema.
 */
import type { Category } from "./vehicles";

/**
 * Este archivo SÍ cruza al navegador: lo importan cuatro componentes de
 * cliente. Por eso desde el 23 sep 2026 no contiene distancias: sólo las
 * claves de cada fila y las etiquetas. Los kilómetros viven en
 * lib/distances.ts, que es server-only, porque publicarlos junto al precio
 * entrega la tarifa por kilómetro.
 */

/** Salidas desde aeropuerto que publica /tarifas, en orden. */
export const RUTAS_DESDE = [
  { key: "centro" },
  { key: "polanco" },
  { key: "santafe" },
  { key: "satelite" },
  { key: "aifa" },
  { key: "toluca" },
] as const;

/** Trayectos hacia el aeropuerto, sin el recargo de espera. */
export const RUTAS_HACIA = [
  { key: "centro" },
  { key: "santafe" },
  { key: "polanco" },
  { key: "aifa" },
  { key: "toluca" },
] as const;

/** Los bloques por hora de /tarifas. El 10 es el día completo. */
export const DURACIONES = [2, 3, 4, 5, 6, 10] as const;

/**
 * Las secciones de la página corporativa: qué aeropuertos se publican y qué
 * zonas tiene cada uno. Las distancias están en lib/distances.ts.
 */
export const B2B_SECTIONS: ReadonlyArray<{
  airport: string;
  code: string;
  zones: ReadonlyArray<"polanco" | "santafe" | "centro" | "sur">;
}> = [
  { airport: "AICM · Benito Juárez", code: "MEX", zones: ["polanco", "santafe", "centro", "sur"] },
  { airport: "AIFA · Felipe Ángeles", code: "NLU", zones: ["polanco", "santafe", "centro"] },
  { airport: "Aeropuerto Toluca", code: "TLC", zones: ["polanco", "santafe", "centro"] },
];

/**
 * Los bloques por hora que ofrece la página corporativa.
 *
 * Sin el 1: el servicio mínimo es de dos horas, así que un bloque de una
 * hora es un precio que nadie puede comprar. Además engañaba —el mínimo de
 * cada categoría es mayor que su tarifa horaria, así que "una hora" costaba
 * el mínimo—. La tarifa por hora va aparte, en `tarifaHora`.
 */
export const B2B_HORAS = [2, 4, 8] as const;

/**
 * El rango de horas que deja elegir el cotizador de la portada. El precio de
 * cada combinación se calcula en el servidor y baja ya resuelto, así que el
 * rango tiene que ser finito y conocido de antemano.
 */
export const HORAS_MIN = 2;
export const HORAS_MAX = 24;

/** Precios ya calculados que el servidor entrega a la interfaz. */
export type PrecioPorCategoria = Record<Category, number>;

/** Las tablas que necesita /tarifas, con el precio ya resuelto. */
export type TablasTarifas = {
  desde: Record<string, PrecioPorCategoria>;
  hacia: Record<string, PrecioPorCategoria>;
  horas: Record<number, PrecioPorCategoria>;
};

/** Las tablas que necesita la página corporativa. */
export type TablasB2b = {
  /** Indexado por `${code}:${destino}`, p. ej. "MEX:polanco". */
  rutas: Record<string, PrecioPorCategoria>;
  /** Lo que cuesta cada bloque completo: 2, 4 y 8 horas. */
  horas: Record<number, PrecioPorCategoria>;
  /** Lo que cuesta una hora dentro de un bloque, con IVA. */
  tarifaHora: PrecioPorCategoria;
};

/** Lo que necesita el cotizador de la portada antes de conocer una ruta. */
export type TablasCotizador = {
  /** Indexado por número de horas, de HORAS_MIN a HORAS_MAX. */
  horas: Record<number, PrecioPorCategoria>;
  dia: PrecioPorCategoria;
};

/** Lo que necesita el cotizador corporativo mientras no hay ruta: el mínimo
 *  de cada categoría, con y sin recargo de aeropuerto. */
export type TablasQuote = {
  minimo: PrecioPorCategoria;
  minimoAeropuerto: PrecioPorCategoria;
};
