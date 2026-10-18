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

import { type AirportCode, type Category } from "./vehicles";
import { REDONDO_HORAS_CORTESIA, REDONDO_HORAS_MAX } from "./service-limits";

export {
  type AirportCode,
  type Category,
  airportCodeOf,
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
 * TECHO DEL RECARGO DE AEROPUERTO, en pesos ya CON IVA — tal como el cliente
 * lo ve sumado en su tarifa.
 *
 * El recargo sigue siendo del 25%, pero deja de crecer al llegar aquí. Lo
 * decidió el dueño el 30 de septiembre de 2026, y la razón es que un
 * porcentaje cobraba mal un costo que es FIJO: el recargo paga el
 * estacionamiento en terminal y la espera del chofer, que cuestan lo mismo
 * vaya el pasajero a Polanco o a San Miguel de Allende. Sin techo, el mismo
 * estacionamiento y la misma hora de espera salían en $430 en un AIFA–CDMX
 * en Sedan y en $3,127 en un San Miguel en SUV. Siete veces más por lo mismo.
 *
 * DE DÓNDE SALEN ESTOS NÚMEROS. De las tarifas por hora de este mismo
 * archivo: Sedan cobra ~$232 la hora adicional, Executive ~$464, Minivan
 * ~$534 y SUV ~$696. Un techo cubre entonces el estacionamiento (unos $200)
 * más la espera que de verdad se absorbe. Son valores de negocio, no se
 * derivan unos de otros, y el dueño los puede mover sin tocar nada más.
 *
 * REGLA ÚTIL PARA AJUSTARLOS: el techo empieza a morder en una tarifa de
 * exactamente CUATRO VECES su valor, porque el 25% de 4x es x. Con $400, el
 * recargo crece normal hasta una tarifa de $1,600 y de ahí se congela.
 *
 * Un techo nunca encarece: lo peor que puede pasar es que no se aplique.
 */
export const RECARGO_AEROPUERTO_MAX: Record<Category, number> = {
  sedan: 400,
  executive: 400,
  minivan: 400,
  suv: 600,
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

/**
 * ALZA DEL TRASLADO HACIA EL AEROPUERTO, decidida por el dueño el 12 de
 * octubre de 2026: 12 % en Sedan y Minivan, 18 % en Executive y High SUV.
 *
 * Hasta esa fecha llegar a una terminal NO movía el precio: el recargo cubre
 * estacionamiento y espera AL SALIR, y se consideraba que el viaje de ida no
 * los necesita. El dueño decidió que sí tiene un costo propio.
 */
export const ALZA_HACIA_AEROPUERTO: Record<Category, number> = {
  sedan: 1.12,
  minivan: 1.12,
  executive: 1.18,
  suv: 1.18,
};

/**
 * RECOGER EN EL AEROPUERTO SIEMPRE CUESTA AL MENOS UN 5 % MÁS QUE LLEVAR.
 *
 * POR QUÉ HACE FALTA ESTE TECHO. El recargo de salida está topado en pesos
 * —$400, $600 en High SUV— pero el alza de ida es un porcentaje. En cuanto la
 * tarifa crece lo suficiente, el porcentaje sigue subiendo y el tope se queda
 * quieto, así que el viaje HACIA el aeropuerto acaba costando más que el de
 * vuelta. Medido el 12 oct 2026: pasaba en 8 de 44 combinaciones, todas en
 * AIFA y Toluca.
 *
 * El punto exacto en que se invierte sale de `CAP / (1.05 × alza − 1)`:
 * $2,273 en Sedan y Minivan, $1,674 en Executive —la más frágil, mismo tope
 * que Sedan pero 18 %— y $2,510 en High SUV.
 *
 * Eso es contraintuitivo para el cliente: la salida incluye monitoreo de
 * vuelo, estacionamiento y espera por retrasos, servicios que la ida no
 * lleva. Pagar más por menos se nota al comparar las dos columnas de
 * /tarifas.
 *
 * El alza se aplica entera donde cabe —30 de 44 combinaciones— y sólo se
 * recorta donde rompería esta regla. Se autoajusta: si cambia el tope del
 * recargo o una distancia, la brecha se mantiene sola.
 */
export const BRECHA_MINIMA_AEROPUERTO = 1.05;

/**
 * MÍNIMOS DE TRASLADO CON AEROPUERTO, en pesos CON IVA —el precio final que
 * ve el cliente—. Decisión del dueño, 17 oct 2026, sólo para High SUV.
 * Una categoría sin valor aquí se queda con el mínimo de la fórmula.
 */
export const MINIMO_DESDE_AEROPUERTO: Partial<Record<Category, number>> = { suv: 2750 };
export const MINIMO_HACIA_AEROPUERTO: Partial<Record<Category, number>> = { suv: 2450 };

/**
 * TARIFA POR ZONA DE SUV LUX EN TRASLADOS DE AEROPUERTO, en pesos CON IVA.
 * Decisión del dueño, 18 oct 2026, tras comparar contra la competencia: SUV
 * Lux estaba muy por debajo del mercado.
 *
 * Cada punto es [km, desde el aeropuerto, hacia el aeropuerto], con los km
 * medidos de `LEGS` / `B2B_LEGS` (lib/distances.ts) para la zona que nombra
 * el comentario. El kilómetro 0 es el mínimo de la categoría. Entre dos
 * puntos se interpola y se redondea a $50; pasado el último punto el precio
 * se queda plano. En todos los casos manda el MAYOR entre esto y la fórmula,
 * así que la tabla sólo puede subir un precio, nunca bajarlo.
 *
 * Toluca–Santa Fe va a $4,750 / $4,450 y no a los $4,250 / $3,950 de la
 * primera propuesta: con estos últimos la ida a Toluca quedaba por debajo de
 * lo que ya se cobraba ($4,042) y la unidad regresa vacía.
 */
const SUV_LUX_AEROPUERTO: Record<AirportCode, ReadonlyArray<readonly [number, number, number]>> = {
  MEX: [
    [8.5, 2750, 2450], // Centro / Roma / Condesa
    [17.8, 2950, 2650], // Polanco / Lomas
    [27.1, 3550, 3250], // Satélite / Naucalpan
    [28.2, 3650, 3350], // Santa Fe / Interlomas
  ],
  NLU: [
    [41.8, 4950, 4650], // Centro / Roma / Condesa
    [51.1, 5150, 4850], // Polanco / Lomas
    [66.1, 5650, 5350], // Santa Fe / Interlomas
  ],
  TLC: [
    [43.1, 4750, 4450], // Santa Fe
    [54.1, 4950, 4650], // Polanco / Lomas
    [63.3, 5250, 4950], // Centro / Roma / Condesa
  ],
};

function tarifaZonaSuvLux(km: number, aeropuerto: AirportCode, hacia: boolean): number {
  const col = hacia ? 2 : 1;
  const puntos: ReadonlyArray<readonly [number, number, number]> = [
    [0, MINIMO_DESDE_AEROPUERTO.suv!, MINIMO_HACIA_AEROPUERTO.suv!],
    ...SUV_LUX_AEROPUERTO[aeropuerto],
  ];
  const ultimo = puntos[puntos.length - 1];
  if (km >= ultimo[0]) return ultimo[col];
  const i = puntos.findIndex((p) => p[0] > km);
  const [a, b] = [puntos[i - 1], puntos[i]];
  const valor = a[col] + ((km - a[0]) / (b[0] - a[0])) * (b[col] - a[col]);
  return Math.round(valor / 50) * 50;
}

/**
 * PRECIO POR HORA CON IVA, para las categorías que lo tienen fijo. Decisión
 * del dueño, 18 oct 2026: SUV Lux a $1,050 la hora (3 h $3,150 · 10 h
 * $10,500). Sólo mueve el servicio por horas y por día; la fórmula de los
 * traslados y la hora de espera del redondo siguen saliendo de `tariffs`.
 */
const PRECIO_HORA_CON_IVA: Partial<Record<Category, number>> = { suv: 1050 };

/**
 * AJUSTE DE FORÁNEOS, decidido por el dueño el 18 oct 2026 tras compararlos
 * contra la competencia. Aplica a traslados de más de `FORANEO_KM` (el mismo
 * corte que `detectZone`) y se hace sobre la BASE, así que el recargo de
 * aeropuerto, el alza de ida y el viaje redondo lo heredan solos.
 *
 * - Sedan Lite: +12 %. Estaba ~30 % abajo de los traslados en plataforma.
 * - SUV Lux: piso de $6,800 + $12 por km (con IVA, redondeado a $50). Sube
 *   los foráneos cortos —Tepoztlán, Cuernavaca, Puebla, Valle— que estaban
 *   30-45 % abajo del mercado, y no toca Querétaro ni San Miguel, donde la
 *   fórmula ya queda por encima del piso.
 *
 * Entra en rampa desde `FORANEO_RAMPA_DESDE`: sin ella, SUV Lux saltaba de
 * $5,346 a $7,900 al cruzar los 90 km.
 */
const FORANEO_KM = 90;
/** Donde empieza a entrar el ajuste: entre aquí y `FORANEO_KM` sube en rampa,
 *  para que dos direcciones a 89 y 91 km no cambien de precio de golpe. */
const FORANEO_RAMPA_DESDE = 70;
const AJUSTE_FORANEO: Partial<Record<Category, number>> = { sedan: 1.12 };
const PISO_FORANEO: Partial<Record<Category, (km: number) => number>> = {
  suv: (km) => Math.round((6800 + 12 * km) / 50) * 50,
};

export function calculatePrice(
  km: number,
  minutes: number,
  category: Category,
  serviceType: "route" | "hour" | "day",
  rentalHours: number,
  airport = false,
  haciaAeropuerto = false,
  aeropuerto: AirportCode = "MEX",
) {
  const tariff = tariffs[category];
  const horaFija = PRECIO_HORA_CON_IVA[category];
  let base = 0;

  if (serviceType === "hour") {
    base = horaFija ? (rentalHours * horaFija) / 1.16 : Math.max(rentalHours * tariff.hour, tariff.min);
  } else if (serviceType === "day") {
    base = horaFija ? (10 * horaFija) / 1.16 : Math.max(10 * tariff.hour, tariff.min);
  } else {
    const hours = Math.ceil((minutes / 60) * 2) / 2;
    base = Math.max(kmCost(km, tariff.km, category), hours * tariff.hour, tariff.min);
    if (km > FORANEO_RAMPA_DESDE) {
      const t = Math.min(1, (km - FORANEO_RAMPA_DESDE) / (FORANEO_KM - FORANEO_RAMPA_DESDE));
      base *= 1 + ((AJUSTE_FORANEO[category] ?? 1) - 1) * t;
      const piso = PISO_FORANEO[category]?.(km);
      if (piso) base = Math.max(base, base + (piso / 1.16 - base) * t);
    }
  }

  // El 25% de siempre, pero con techo. Se divide entre 1.16 porque
  // `RECARGO_AEROPUERTO_MAX` está expresado con IVA —que es como lo ve el
  // cliente— y aquí todavía estamos trabajando sobre la base sin impuesto.
  const conRecargo = () =>
    Math.round((base + Math.min(base * 0.25, RECARGO_AEROPUERTO_MAX[category] / 1.16)) * 1.16);

  // Salida de terminal en traslado, con el mínimo de la categoría si lo tiene.
  // La tabla por zona de SUV Lux sólo puede subir el precio: manda el mayor.
  const zona = (hacia: boolean) =>
    category === "suv" && serviceType === "route" ? tarifaZonaSuvLux(km, aeropuerto, hacia) : 0;

  const desde = () =>
    serviceType === "route"
      ? Math.max(conRecargo(), MINIMO_DESDE_AEROPUERTO[category] ?? 0, zona(false))
      : conRecargo();

  if (airport) return desde();

  const sinRecargo = Math.round(base * 1.16);

  // El viaje HACIA la terminal. `serviceType` se mira porque por horas y por
  // día no hay un destino que sea un aeropuerto: el recorrido es libre.
  if (haciaAeropuerto && serviceType === "route") {
    const pedido = Math.round(sinRecargo * ALZA_HACIA_AEROPUERTO[category]);
    // El techo se calcula contra el precio de salida REAL de esta misma ruta,
    // no contra una tabla aparte: así la brecha se mantiene aunque cambien el
    // tope del recargo, la tarifa por kilómetro o la distancia.
    const techo = Math.floor(desde() / BRECHA_MINIMA_AEROPUERTO);
    return Math.max(Math.min(pedido, techo), MINIMO_HACIA_AEROPUERTO[category] ?? 0, zona(true));
  }

  return sinRecargo;
}

/**
 * EL FACTOR DEL VIAJE REDONDO. Interno: vive aquí y no en service-limits.ts
 * porque es la fórmula, no el hecho. Al cliente se le enseña el importe.
 *
 * Que sea 1.5 y no 2 es la oferta entera: ir y volver cuesta vez y media el
 * traslado sencillo en lugar de dos, y con dos horas de espera incluidas. Lo
 * que lo hace rentable es que el chofer no vuelve vacío —en dos traslados
 * sueltos sí, dos veces—, así que la mitad que se descuenta es un costo que
 * de verdad no se incurre.
 */
const REDONDO_FACTOR = 1.5;

/**
 * Lo que cuesta cada hora de espera por encima de las de cortesía, con IVA.
 *
 * Es la mitad de la tarifa por hora de la categoría: el chofer está parado,
 * no conduciendo. Sale de `tariffs` y no de una tabla aparte justamente para
 * que siga a la tarifa por hora si el dueño la mueve. Hoy da $232 en Sedan,
 * $348 en Executive, $336 en Minivan y $522 en High SUV.
 */
export function precioHoraExtraRedondo(category: Category) {
  return Math.round(tariffs[category].hour * 0.5 * 1.16);
}

/**
 * Precio del viaje redondo foráneo: ida y vuelta el mismo día, con el chofer
 * esperando.
 *
 * Se construye SOBRE `calculatePrice` y no en paralelo a él, para que el
 * redondo no pueda desviarse del sencillo que publica cada página de ruta.
 * `airport` va en false a propósito: ninguna foránea sale de una terminal, y
 * el recargo de estacionamiento y espera no aplica.
 *
 * Las horas se recortan contra el tope antes de cobrar, así que pedir más de
 * la cuenta nunca encarece de más: lo peor que pasa es que se cobre el tope.
 * La validación de que el cliente no pida más vive en quien llama; esto sólo
 * garantiza que el importe sea el correcto pase lo que pase.
 */
export function precioRedondo(
  km: number,
  minutes: number,
  category: Category,
  horasEspera: number,
  airport = false,
) {
  const sencillo = calculatePrice(km, minutes, category, "route", 0, false);
  const base = Math.round(sencillo * REDONDO_FACTOR);

  // EL RECARGO DE AEROPUERTO SE SUMA UNA VEZ, NO VEZ Y MEDIA. Un redondo que
  // empieza en el AICM —Cuernavaca, Puebla y las demás se cotizan desde ahí—
  // sí paga estacionamiento en terminal y espera por retraso del vuelo, pero
  // los paga AL RECOGER, una sola vez. Multiplicarlos por 1.5 cobraría media
  // hora de espera y medio estacionamiento que nadie incurre: hasta $300 de
  // más. Por eso la base se calcula limpia y el recargo entra aparte.
  //
  // Esto además no mueve la comparación contra dos traslados sueltos: de ida
  // se paga el recargo y de vuelta no, así que la diferencia sigue siendo
  // medio traslado a favor del cliente, igual que sin aeropuerto.
  const recargo = airport
    ? calculatePrice(km, minutes, category, "route", 0, true) - sencillo
    : 0;

  const horas = Math.min(Math.max(horasEspera, REDONDO_HORAS_CORTESIA), REDONDO_HORAS_MAX);
  const extras = horas - REDONDO_HORAS_CORTESIA;
  return base + recargo + extras * precioHoraExtraRedondo(category);
}
