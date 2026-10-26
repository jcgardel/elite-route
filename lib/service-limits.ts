/**
 * Los límites del servicio por horas, en un solo sitio.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO. Hasta el 1 de octubre de 2026 el "20" de los
 * kilómetros incluidos estaba escrito a mano en nueve archivos: las dos
 * páginas por horas, la de Teotihuacán, la de tarifas, el cotizador, las dos
 * rutas que generan el JSON-LD, la API de checkout y los metadatos de SEO.
 * Subirlo a 25 obligaba a tocarlos todos y a confiar en no olvidarse de uno
 * —y olvidarse de uno significa que la página promete una cosa y el cotizador
 * cobra otra—. Ahora el número vive aquí y lo demás lo importa.
 *
 * SIN `server-only` A PROPÓSITO: el cotizador es un componente de cliente y
 * necesita estos valores para avisar antes de cobrar. Son dos números y una
 * lista de zonas, no el tarifario: no hay nada que proteger.
 */

import type { Category } from "@/lib/vehicles";

/**
 * Kilómetros incluidos por cada hora contratada.
 *
 * Subió de 20 a 25 el 1 de octubre de 2026. El número no es arbitrario: es el
 * techo que deja el servicio por horas cómodo en ciudad sin convertirlo en
 * una puerta trasera para los viajes foráneos.
 *
 * Un día completo urbano de verdad son unos 150 km en diez horas —15 km/h
 * reales, por el tráfico—, así que a 25 nadie se acerca al límite. En cambio,
 * para que un viaje redondo foráneo "cupiera" harían falta 27 km/h a
 * Cuernavaca, 31 a Valle de Bravo, 34 a Puebla, 44 a Querétaro y 49 a San
 * Miguel. Veinticinco se queda justo por debajo del primero.
 *
 * Eso importa porque por horas sale SIEMPRE más barato que el traslado: un
 * San Miguel ida y vuelta en High SUV son $25,016 en traslados contra $12,528
 * en doce horas. La mitad. El límite de kilómetros es lo que lo sostiene.
 */
export const KM_POR_HORA = 25;

/** El día completo. Lo fija también `calculatePrice` para el precio. */
export const HORAS_DIA_COMPLETO = 10;

/** Kilómetros incluidos en un bloque de N horas. */
export function kmIncluidos(horas: number) {
  return horas * KM_POR_HORA;
}

/**
 * DÓNDE APLICA EL SERVICIO POR HORAS: sólo Ciudad de México (desde el 17 oct
 * 2026; antes incluía AIFA y Toluca). **No aplica fuera de la ciudad**: AIFA,
 * Toluca y foráneos son cotización especial. Ver `RADIO_POR_HORAS_KM`.
 *
 * Es una regla de negocio, no una validación técnica: nadie puede impedir que
 * un pasajero le pida al chofer que salga a carretera. Lo que la sostiene en
 * la práctica es `KM_POR_HORA`, que hace que esos viajes no quepan. Por eso
 * las dos cosas viven juntas en este archivo: si alguien sube el kilometraje
 * sin leer esto, abre la puerta que esta regla quiere cerrar.
 */
export const ZONA_POR_HORAS = {
  es: "la Ciudad de México",
  en: "Mexico City",
} as const;

/**
 * DESDE EL 17 OCT 2026 EL SERVICIO POR HORAS ES SÓLO CDMX, decisión del
 * dueño. AIFA, Toluca y cualquier salida de la ciudad son cotización
 * especial.
 *
 * POR QUÉ SE VALIDA POR DISTANCIA. Hasta esa fecha el checkout medía la
 * distancia del origen al mismo origen —0 km— y el tope de `KM_POR_HORA`
 * nunca se aplicaba: cuatro horas de Executive ($2,784) alcanzaban para ir a
 * Cuernavaca, cuyo sencillo cuesta $4,126. Ahora la recogida se mide contra
 * un punto fijo de la ciudad, el Ángel —el mismo que usa `LEGS.aifa`—, y no
 * puede pasar de 40 km, el umbral que `detectZone` usa para "cdmx". AIFA
 * (~54 km) y Toluca (~56 km) quedan fuera solos.
 */
export const CENTRO_CDMX = "Ángel de la Independencia, Paseo de la Reforma, Ciudad de México";
export const RADIO_POR_HORAS_KM = 40;

export function dentroDeZonaPorHoras(kmAlCentro: number) {
  return kmAlCentro <= RADIO_POR_HORAS_KM;
}

/** La leyenda que la página tiene que hacer notar. */
export const LEYENDA_POR_HORAS = {
  es: "El servicio por horas aplica sólo dentro de la Ciudad de México. Si necesitas salir de la CDMX (AIFA, Toluca o foráneos), solicita una cotización especial.",
  en: "Hourly service applies only within Mexico City. If you need to leave the city (AIFA, Toluca or out of town), ask us for a special quote.",
} as const;

/**
 * EL VIAJE REDONDO FORÁNEO. Lo que el cliente necesita saber, y por eso vive
 * en este archivo y no en el tarifario: son dos hechos que se le dicen con
 * todas sus letras en el cotizador, no coeficientes que haya que proteger.
 *
 * Qué es: ir, pasar el día y volver con el mismo chofer, que espera. Se
 * ofrece en rutas de más de 70 km cuyo destino no sea un aeropuerto. Las dos
 * condiciones hacen falta y ninguna sobra: ver `admiteRedondo` más abajo, que
 * explica con números medidos por qué el kilometraje solo no alcanza.
 *
 * Las dos cifras las fijó el dueño el 2 de octubre de 2026, y la segunda no
 * es decorativa. La hora extra se cobra a la mitad de la tarifa por hora, y
 * sobre una base de 1.5× el traslado sencillo eso acaba superando el precio
 * de dos traslados sueltos si se acumulan suficientes horas. Se midieron las
 * veinte combinaciones de ruta y categoría: con tope de 8 sólo cruzan tres,
 * todas en Cuernavaca y sólo al llegar a la hora 8, por $15, $178 y $191. Sin
 * tope, a 12 horas el peor caso se iba a $1,757 por encima. El tope es lo que
 * mantiene honesta la oferta.
 */
export const REDONDO_HORAS_CORTESIA = 2;
export const REDONDO_HORAS_MAX = 8;

/**
 * DESDE CUÁNTOS KILÓMETROS SE OFRECE EL VIAJE REDONDO.
 *
 * Bajó de 90 a 70 el 3 de octubre de 2026, y el 90 desapareció por una razón
 * medida, no por gusto. La primera versión preguntaba a `detectZone`, que
 * separa "foraneo" a partir de 90 km. Pero esa frontera mira los kilómetros
 * ENTRE EL PUNTO DE RECOGIDA Y EL DESTINO, y eso hace que el mismo destino se
 * comporte distinto según dónde se hospede el cliente. Medido en producción
 * contra la API real:
 *
 *     Tepoztlán   75.7 km desde el sur · 83.0 centro · 90.6 Polanco
 *     Cuernavaca  79.7 km desde el sur · 87.1 centro · 94.7 Polanco
 *
 * Con 90, un cliente en Coyoacán no podía reservar un redondo a Cuernavaca.
 *
 * Y NO SE PUEDE ARREGLAR SÓLO BAJANDO EL NÚMERO. El foráneo legítimo más corto
 * son 75.7 km (Tepoztlán desde el sur) y el aeropuerto más lejano que NO debe
 * venderse como redondo son los 80 km del AICM a Toluca. Se solapan: ningún
 * umbral separa esos dos casos. Por eso la condición lleva ahora una segunda
 * parte, que es la que de verdad excluye Toluca y el AIFA —que sean
 * aeropuertos— y deja al número sólo el trabajo de descartar un traslado corto.
 *
 * Lo que se acepta a cambio: un traslado larguísimo dentro de la ciudad podría
 * ofrecer redondo. No hace daño —es 1.5× con dos horas de espera, mejor trato
 * que dos traslados sueltos— y es mucho más raro que el caso que esto arregla.
 */
export const REDONDO_KM_MINIMO = 70;

/**
 * Si una ruta admite viaje redondo.
 *
 * `destinoEsAeropuerto` lo calcula quien llama, porque cada sitio tiene una
 * señal distinta: el servidor mira el texto de la dirección con
 * `isAirportAddress`, y la interfaz sabe además lo que Google confirmó como
 * terminal. Las dos se suman con OR y nunca se restan, igual que el recargo de
 * aeropuerto: marcar de más sólo QUITA el redondo, así que mentir aquí no
 * abarata nada.
 */
export function admiteRedondo(km: number, destinoEsAeropuerto: boolean) {
  return km > REDONDO_KM_MINIMO && !destinoEsAeropuerto;
}

/**
 * FECHAS BLOQUEADAS POR CATEGORÍA. Días en que una categoría no se vende en
 * línea, decisión del dueño. Se compara contra la fecha de inicio del
 * servicio (AAAA-MM-DD, hora de CDMX). Se valida en el cotizador y en
 * /api/checkout, que es el que de verdad impide el cobro.
 *
 * 20 oct 2026: SUV Lux bloqueada el fin de semana del GP de México
 * (30 oct – 1 nov 2026); esos servicios se cotizan aparte.
 * 26 oct 2026: se agrega el jueves 29 oct.
 */
export const FECHAS_BLOQUEADAS: Partial<Record<Category, readonly string[]>> = {
  suv: ["2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"],
};

export function categoriaBloqueada(cat: Category, fecha: string) {
  return FECHAS_BLOQUEADAS[cat]?.includes(fecha) ?? false;
}

/**
 * TARIFA DE EVENTO, decisión del dueño el 26 oct 2026 por el GP de México
 * (29 oct – 1 nov 2026). Multiplica el precio final con IVA según la fecha
 * de inicio del servicio: Sedan Lite +100 %, Executive y SUV Urban +80 %
 * (SUV Lux está bloqueada esos días). Por horas, mínimo de 8 horas.
 * Se aplica en el cotizador y en /api/checkout, que es el que cobra.
 */
export const TARIFA_EVENTO = {
  fechas: ["2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"],
  factor: { sedan: 2, executive: 1.8, minivan: 1.8 } as Partial<Record<Category, number>>,
  horasMin: 8,
} as const;

export function esFechaEvento(fecha: string) {
  return (TARIFA_EVENTO.fechas as readonly string[]).includes(fecha);
}

export function factorEvento(cat: Category, fecha: string) {
  return esFechaEvento(fecha) ? (TARIFA_EVENTO.factor[cat] ?? 1) : 1;
}

/** Precio con la tarifa de evento aplicada (si toca), redondeado a pesos. */
export function precioConEvento(precio: number, cat: Category, fecha: string) {
  return Math.round(precio * factorEvento(cat, fecha));
}

/** Horas mínimas del servicio por horas para esa fecha. */
export function horasMinimas(fecha: string, normal: number) {
  return esFechaEvento(fecha) ? Math.max(normal, TARIFA_EVENTO.horasMin) : normal;
}
