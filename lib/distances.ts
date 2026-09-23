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

/** Trayectos entre el AICM y cada zona, más las rutas foráneas. */
export const LEGS = {
  centro: { km: 15, min: 25 },
  polanco: { km: 22, min: 30 },
  santafe: { km: 35, min: 50 },
  satelite: { km: 30, min: 40 },
  aifa: { km: 68, min: 75 },
  toluca: { km: 80, min: 85 },
  interlomas: { km: 38, min: 55 },
  coyoacan: { km: 22, min: 35 },
  delvalle: { km: 18, min: 30 },
  puebla: { km: 135, min: 120 },
  queretaro: { km: 220, min: 170 },
  cuernavaca: { km: 105, min: 95 },
  sanmiguel: { km: 290, min: 230 },
} as const satisfies Record<string, Leg>;

export type LegKey = keyof typeof LEGS;

/** La matriz de la página corporativa: de cada aeropuerto a cada zona. */
export const B2B_LEGS: Record<string, Record<string, Leg | null>> = {
  MEX: {
    polanco: { km: 22, min: 30 },
    santafe: { km: 35, min: 50 },
    centro: { km: 15, min: 25 },
    sur: { km: 25, min: 36 },
  },
  NLU: {
    polanco: { km: 55, min: 61 },
    santafe: { km: 68, min: 75 },
    centro: { km: 50, min: 56 },
    sur: null,
  },
  TLC: {
    polanco: { km: 65, min: 69 },
    santafe: { km: 45, min: 48 },
    centro: { km: 70, min: 74 },
    sur: null,
  },
};
