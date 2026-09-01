/**
 * Resuelve las tablas de precios en el servidor, para que la interfaz reciba
 * números en lugar de la fórmula que los produce.
 *
 * Cada función de aquí la llama una página de servidor y pasa el resultado
 * como prop al componente que pinta la tabla. Así el componente sigue siendo
 * de cliente —necesita estado, autocompletado, pestañas— sin tener que
 * importar el tarifario.
 */
import "server-only";

import { calculatePrice } from "./booking";
import {
  B2B_HORAS,
  B2B_SECTIONS,
  DURACIONES,
  HORAS_MAX,
  HORAS_MIN,
  RUTAS_DESDE,
  RUTAS_HACIA,
  type PrecioPorCategoria,
  type TablasB2b,
  type TablasCotizador,
  type TablasQuote,
  type TablasTarifas,
} from "./rate-tables";
import { CATEGORIES, type Category } from "./vehicles";

function porCategoria(fn: (cat: Category) => number): PrecioPorCategoria {
  return Object.fromEntries(CATEGORIES.map((c) => [c, fn(c)])) as PrecioPorCategoria;
}

const ruta = (km: number, min: number, airport: boolean) =>
  porCategoria((c) => calculatePrice(km, min, c, "route", 0, airport));

const bloque = (h: number) =>
  porCategoria((c) => calculatePrice(0, 0, c, h === 10 ? "day" : "hour", h));

/** Las tres tablas de /tarifas y /rates. */
export function tablasTarifas(): TablasTarifas {
  return {
    // La salida desde aeropuerto lleva el recargo de estacionamiento y
    // espera; el trayecto hacia el aeropuerto no.
    desde: Object.fromEntries(RUTAS_DESDE.map((r) => [r.key, ruta(r.km, r.min, true)])),
    hacia: Object.fromEntries(RUTAS_HACIA.map((r) => [r.key, ruta(r.km, r.min, false)])),
    horas: Object.fromEntries(DURACIONES.map((h) => [h, bloque(h)])),
  };
}

/** Las tablas de la página corporativa. */
export function tablasB2b(): TablasB2b {
  const rutas: Record<string, PrecioPorCategoria> = {};
  for (const s of B2B_SECTIONS) {
    for (const [destino, leg] of Object.entries(s.routes)) {
      if (leg) rutas[`${s.code}:${destino}`] = ruta(leg.km, leg.min, true);
    }
  }
  return {
    rutas,
    horas: Object.fromEntries(B2B_HORAS.map((h) => [h, bloque(h)])),
  };
}

/**
 * Lo que el cotizador de la portada puede mostrar sin conocer todavía una
 * ruta: el precio por horas y el de día completo, que no dependen de la
 * distancia. El precio de un traslado sí depende de la ruta, así que ese
 * llega con la respuesta de /api/maps.
 */
export function tablasCotizador(): TablasCotizador {
  const horas: Record<number, PrecioPorCategoria> = {};
  for (let h = HORAS_MIN; h <= HORAS_MAX; h++) horas[h] = bloque(h);
  return { horas, dia: bloque(10) };
}

/**
 * El mínimo de cada categoría, que el cotizador corporativo enseña como
 * referencia mientras el renglón todavía no tiene ruta. Sale del mismo
 * `calculatePrice` con distancia cero: sin kilómetros ni minutos, la cuenta
 * cae en el mínimo de la categoría.
 */
export function tablasQuote(): TablasQuote {
  return { minimo: ruta(0, 0, false), minimoAeropuerto: ruta(0, 0, true) };
}
