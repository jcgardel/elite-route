import "server-only";

/**
 * Las distancias y duraciones de cada trayecto. Fuente única.
 *
 * Vivían repartidas en tres sitios —lib/routes.ts, RUTAS_DESDE/RUTAS_HACIA
 * y B2B_SECTIONS— y AICM–Polanco llegó a estar escrito cuatro veces. Ahora
 * están aquí y nada más.
 *
 * Y llevan `server-only` a propósito. No porque una distancia sea secreta
 * —cualquiera mide la ruta en un mapa— sino porque publicarla JUNTO al
 * precio entrega la tarifa por kilómetro resuelta. Hasta el 23 sep 2026 los
 * km viajaban dentro del JavaScript de /tarifas y /b2b: se comprobó
 * encontrando `km:15`, `km:22` y `km:80` en los chunks servidos. Este
 * archivo no puede cruzar al navegador; si alguien lo importa desde un
 * componente de cliente, el build falla, que es justo lo que se quiere.
 */

export type Leg = { km: number; min: number };

/**
 * LAS DISTANCIAS DE AEROPUERTO SE CORRIGIERON EL 5 DE OCTUBRE DE 2026.
 *
 * POR QUÉ. El dueño vio que las tablas publicadas del AIFA no cuadraban con
 * lo que cobra el cotizador. Al medirlo resultó ser general, no del AIFA: las
 * once rutas de aeropuerto declaraban entre un 7 % y un 48 % más kilómetros
 * de los reales, y la página anunciaba un precio MÁS CARO del que el checkout
 * acaba cobrando —porque el checkout siempre recalcula con la distancia que
 * mide Google en el momento—. Nadie pagó de más nunca; se ahuyentaba con un
 * precio que ni siquiera se cobraba.
 *
 * Que NO era un margen deliberado lo demuestra `delvalle`: declaraba 18 km
 * contra 19.1 reales, el único caso por debajo. Un margen de seguridad no
 * tiene excepciones a la baja.
 *
 * Toluca era el peor: 80 km declarados cuando el destino más lejano de la
 * ciudad está a 63.3.
 *
 * Medido contra la API de producción el 5 oct 2026 con direcciones precisas
 * —el nombre de una colonia a secas resuelve mal: "Santa Fe" llegó a dar 19.9
 * km desde el AICM, que es imposible—. Los destinos usados fueron puntos
 * identificables: Zócalo, Masaryk, Centro Santa Fe, Plaza Satélite, Jardín
 * Centenario, Parque Hundido, Centro Comercial Interlomas.
 *
 * B2B_LEGS se movió con las mismas cifras. Si sólo se corrigiera una de las
 * dos, /b2b y las fichas de ruta publicarían precios distintos del mismo
 * trayecto, que es el problema que esto vino a cerrar.
 *
 * LAS FORÁNEAS NO SE TOCARON, por decisión del dueño ese mismo día. Siguen
 * declarando más kilómetros que Google y, por tanto, siguen publicando un
 * precio por encima del que cobra el cotizador. Ver la nota de abajo.
 */

/**
 * AUDITORÍA DE LAS DISTANCIAS FORÁNEAS (3 oct 2026) Y LA DECISIÓN DEL DUEÑO.
 *
 * Se midieron las seis contra la API de Google en producción, desde el AICM, y
 * comparadas con lo declarado aquí:
 *
 *     Valle de Bravo  155 km declarados · 155.1 medidos ·   0 %
 *     Querétaro       220 · 215.8 · +1.9 %
 *     Puebla          135 · 127.5 · +5.9 %
 *     San Miguel      290 · 269.3 · +7.7 %
 *     Tepoztlán        97 ·  87.6 · +10.7 %
 *     Cuernavaca      105 ·  91.7 · +14.5 %
 *
 * El margen no es parejo, y eso se señaló: va de 0 a 14.5 %, que es el patrón
 * de números puestos en momentos distintos y no el de una política. Valle de
 * Bravo, el único que cuadra exacto, es justamente el que el dueño validó a
 * mano el 24 sep 2026 antes de escribir su página.
 *
 * EL DUEÑO LO RATIFICÓ EL 5 DE OCTUBRE DE 2026 al corregir las de
 * aeropuerto: las foráneas se quedan como están. No es un
 * descuido pendiente de arreglar: es una decisión tomada con los números
 * delante. Corregirlas a lo que mide Google habría bajado los precios entre
 * 1.5 % y 8 % según la ruta —hasta $554 en un San Miguel en Executive— y vez y
 * media eso en el viaje redondo.
 *
 * NO LAS "CORRIJAS" SIN PREGUNTARLE. De estos números salen todos los precios
 * foráneos del sitio, publicados en seis fichas, en /tarifas y en el cotizador.
 */

/** Trayectos entre el AICM y cada zona, más las rutas foráneas. */
export const LEGS = {
  centro: { km: 8.5, min: 25 },
  polanco: { km: 17.8, min: 33 },
  santafe: { km: 28.2, min: 44 },
  satelite: { km: 27.1, min: 40 },
  // "AIFA -> Ciudad de México" no tiene una distancia única: desde el AIFA,
  // el Zócalo son 41.8 km y Santa Fe 66.1. El dueño eligió el 5 oct 2026 el
  // ÁNGEL DE LA INDEPENDENCIA como punto representativo de la ciudad —53.7
  // km—, manteniendo "CDMX" como nombre de la página. Queda desviación por
  // diseño: es el precio de un punto céntrico, no de toda la ciudad.
  aifa: { km: 53.7, min: 55 },
  // Los dos destinos concretos del AIFA.
  //
  // `aifa` y `aifasantafe` YA NO COMPARTEN DISTANCIA. Hasta el 5 oct 2026
  // las dos declaraban 68 km, porque la distancia representativa del AIFA "a
  // la Ciudad de México" se había tomado del trayecto hasta Santa Fe —el
  // extremo más lejano de la ciudad—. Eso hacía que la página genérica
  // publicara el precio del destino más caro. Ahora cada una mide lo suyo y
  // las tablas dejan de ser idénticas.
  aifapolanco: { km: 51.1, min: 51 },
  aifasantafe: { km: 66.1, min: 61 },
  // Mismo criterio que `aifa`: el Ángel como punto de CDMX. Los 80 km que
  // declaraba hasta el 5 oct 2026 estaban por encima de TODOS los destinos
  // reales —Santa Fe 43.1, Polanco 54.1, Centro 63.3—, así que no eran un
  // margen sino un error.
  toluca: { km: 55.6, min: 61 },
  interlomas: { km: 27.8, min: 50 },
  coyoacan: { km: 17.1, min: 27 },
  delvalle: { km: 19.1, min: 28 },
  puebla: { km: 135, min: 120 },
  queretaro: { km: 220, min: 170 },
  cuernavaca: { km: 105, min: 95 },
  // Distancia y tiempo validados por el dueño el 24 sep 2026 antes de
  // escribir la página: el precio se publica en firme.
  vallebravo: { km: 155, min: 160 },
  sanmiguel: { km: 290, min: 230 },
  // Distancia validada por el dueño el 3 oct 2026, antes de escribir la
  // página: 97 km. Google mide 87.6 desde el AICM; la buena es la del dueño,
  // que es quien conoce la ruta que de verdad toman los choferes. Los minutos
  // son informativos y no mueven el precio —a esta distancia manda el
  // kilometraje, comprobado de 85 a 100 min—.
  tepoztlan: { km: 97, min: 90 },
} as const satisfies Record<string, Leg>;

export type LegKey = keyof typeof LEGS;

/** La matriz de la página corporativa: de cada aeropuerto a cada zona. */
export const B2B_LEGS: Record<string, Record<string, Leg | null>> = {
  MEX: {
    polanco: { km: 17.8, min: 33 },
    santafe: { km: 28.2, min: 44 },
    centro: { km: 8.5, min: 25 },
    sur: { km: 20.6, min: 31 },
  },
  NLU: {
    polanco: { km: 51.1, min: 51 },
    santafe: { km: 66.1, min: 61 },
    centro: { km: 41.8, min: 58 },
    sur: null,
  },
  TLC: {
    polanco: { km: 54.1, min: 56 },
    santafe: { km: 43.1, min: 38 },
    centro: { km: 63.3, min: 72 },
    sur: null,
  },
};
