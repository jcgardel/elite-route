/**
 * El tarifario y el cálculo del precio. INFORMACIÓN INTERNA DEL NEGOCIO.
 *
 * `import "server-only"` no es decorativo: hace que la compilación falle si
 * alguien importa este archivo desde un componente marcado con "use client".
 * Es la única garantía que sobrevive al olvido, y hace falta porque esto ya
 * pasó una vez: cuatro componentes de cliente importaban de aquí, y todo lo
 * que un componente de cliente importa se empaqueta en el JavaScript que
 * descarga cada visitante. El costo por kilómetro de cada categoría, la
 * tarifa por hora, el mínimo y los descuentos por tramo viajaban en texto
 * plano al navegador de cualquiera que abriera el sitio.
 *
 * Lo que la interfaz necesita para pintar —nombres, capacidades, flota— vive
 * en lib/vehicles.ts, que sí puede cruzar al navegador. La regla: si sirve
 * para CALCULAR un precio, va aquí; si sólo sirve para MOSTRARLO, va allá.
 *
 * Los precios ya calculados no son secretos: están publicados en /tarifas y
 * en cada página de ruta. Lo que no puede salir es la fórmula que los
 * produce. Por eso el servidor manda números, no coeficientes.
 *
 * Nota honesta sobre el alcance: publicar precios fijos permite deducir parte
 * del tarifario con álgebra —dos horas de Sedan son $928, que es 800 × 1.16,
 * de donde salen los $400 por hora—. Esto quita el tarifario de la vista y de
 * las manos de un curioso; no lo vuelve indeducible para quien se siente a
 * hacer cuentas. Esa parte es inseparable de publicar precios.
 */
import "server-only";

import { type Category } from "./vehicles";

export {
  type Category,
  type ServiceType,
  type Zone,
  CATEGORIES,
  detectZone,
  isAirportAddress,
  isAirportPlace,
  serviceTypeLabel,
  serviceTypeLabelEs,
  vehicles,
  zoneLabel,
  zoneLabelEs,
} from "./vehicles";

/**
 * Costo por kilómetro, tarifa por hora y mínimo de cada categoría.
 *
 * Los nombres y capacidades ya no están aquí: se duplicaban con la interfaz y
 * eran justo lo que obligaba a los componentes de cliente a importar este
 * archivo. Ahora viven en lib/vehicles.ts.
 */
export const tariffs: Record<Category, { km: number; hour: number; min: number }> = {
  sedan: { km: 28, hour: 400, min: 600 },
  executive: { km: 55, hour: 600, min: 800 },
  minivan: { km: 50, hour: 580, min: 700 },
  suv: { km: 73.5, hour: 900, min: 1200 },
};

/**
 * Profundidad del descuento en los tramos medio (25-90 km) y largo (90 km+)
 * por categoría. Sedan se queda con el descuento original; Executive,
 * Minivan y HIGH SUV llevan uno más profundo para foráneos largos (AIFA,
 * Toluca, Querétaro, Acapulco, etc.) — decisión explícita del negocio, no
 * se derivan unas de otras.
 */
const kmDiscount: Record<Category, { mid: number; far: number }> = {
  sedan: { mid: 0.65, far: 0.50 }, // -35% / -50%
  executive: { mid: 0.58, far: 0.42 }, // -42% / -58%
  minivan: { mid: 0.58, far: 0.42 },
  suv: { mid: 0.58, far: 0.42 },
};

/**
 * Costo del tramo por kilómetro con descuento escalonado, como una tabla
 * de ISR: cada tramo de distancia paga su propia tarifa, no la tarifa
 * completa aplicada retroactivamente a todo el viaje. Así un viaje más
 * largo nunca puede salir más barato que uno más corto.
 *   0-25 km   → tarifa plena
 *   25-90 km  → ese tramo con el descuento "mid" de la categoría
 *   90 km+    → ese tramo con el descuento "far" de la categoría
 */
function kmCost(km: number, ratePerKm: number, category: Category): number {
  const { mid, far } = kmDiscount[category];
  const corta = Math.min(km, 25);
  const media = Math.max(0, Math.min(km, 90) - 25);
  const larga = Math.max(0, km - 90);
  return corta * ratePerKm + media * ratePerKm * mid + larga * ratePerKm * far;
}

export function calculatePrice(
  km: number,
  minutes: number,
  category: Category,
  serviceType: "route" | "hour" | "day",
  rentalHours: number,
  airport = false,
) {
  const tariff = tariffs[category];
  let base = 0;

  if (serviceType === "hour") {
    base = Math.max(rentalHours * tariff.hour, tariff.min);
  } else if (serviceType === "day") {
    base = Math.max(10 * tariff.hour, tariff.min);
  } else {
    const hours = Math.ceil((minutes / 60) * 2) / 2;
    base = Math.max(kmCost(km, tariff.km, category), hours * tariff.hour, tariff.min);
  }

  if (airport) base *= 1.25;
  return Math.round(base * 1.16);
}
