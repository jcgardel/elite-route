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
 * DÓNDE APLICA EL SERVICIO POR HORAS, decidido por el dueño el 1 de octubre
 * de 2026: Ciudad de México y los aeropuertos de AIFA y Toluca. **No aplica a
 * zonas foráneas** —Puebla, Querétaro, Cuernavaca, Valle de Bravo, San
 * Miguel—, que se cotizan como traslado o como viaje redondo.
 *
 * Es una regla de negocio, no una validación técnica: nadie puede impedir que
 * un pasajero le pida al chofer que salga a carretera. Lo que la sostiene en
 * la práctica es `KM_POR_HORA`, que hace que esos viajes no quepan. Por eso
 * las dos cosas viven juntas en este archivo: si alguien sube el kilometraje
 * sin leer esto, abre la puerta que esta regla quiere cerrar.
 */
export const ZONA_POR_HORAS = {
  es: "Ciudad de México, Aeropuerto de Toluca y AIFA",
  en: "Mexico City, Toluca Airport and AIFA",
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
