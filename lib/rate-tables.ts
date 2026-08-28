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

/** Un tramo con la distancia y el tiempo que usa la tabla. */
export type Leg = { km: number; min: number };

/** Salidas desde aeropuerto que publica /tarifas. */
export const RUTAS_DESDE = [
  { key: "centro", zona: "~15 km", km: 15, min: 25 },
  { key: "polanco", zona: "~22 km", km: 22, min: 30 },
  { key: "santafe", zona: "~35 km", km: 35, min: 50 },
  { key: "satelite", zona: "~30 km", km: 30, min: 40 },
  { key: "aifa", zona: "~68 km", km: 68, min: 75 },
  { key: "toluca", zona: "~80 km", km: 80, min: 85 },
] as const;

/** Trayectos hacia el aeropuerto, sin el recargo de espera. */
export const RUTAS_HACIA = [
  { key: "centro", km: 15, min: 25 },
  { key: "santafe", km: 35, min: 50 },
  { key: "polanco", km: 22, min: 30 },
  { key: "aifa", km: 68, min: 75 },
  { key: "toluca", km: 80, min: 85 },
] as const;

/** Los bloques por hora de /tarifas. El 10 es el día completo. */
export const DURACIONES = [2, 3, 4, 5, 6, 10] as const;

/** Rutas de la página corporativa, agrupadas por aeropuerto de salida. */
export const B2B_SECTIONS: ReadonlyArray<{
  airport: string;
  code: string;
  routes: { polanco: Leg | null; santafe: Leg | null; centro: Leg | null; sur: Leg | null };
}> = [
  {
    airport: "AICM · Benito Juárez",
    code: "MEX",
    routes: {
      polanco: { km: 22, min: 30 },
      santafe: { km: 35, min: 50 },
      centro: { km: 15, min: 25 },
      sur: { km: 25, min: 36 },
    },
  },
  {
    airport: "AIFA · Felipe Ángeles",
    code: "NLU",
    routes: {
      polanco: { km: 55, min: 61 },
      santafe: { km: 68, min: 75 },
      centro: { km: 50, min: 56 },
      sur: null,
    },
  },
  {
    airport: "Aeropuerto Toluca",
    code: "TLC",
    routes: {
      polanco: { km: 65, min: 69 },
      santafe: { km: 45, min: 48 },
      centro: { km: 70, min: 74 },
      sur: null,
    },
  },
];

/** Los bloques por hora que ofrece la página corporativa. */
export const B2B_HORAS = [1, 2, 4, 8] as const;

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
  horas: Record<number, PrecioPorCategoria>;
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
