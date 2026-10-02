import { detectZone } from "./vehicles";

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
 * ofrece SÓLO en las rutas foráneas —las que pasan de 90 km, que es la misma
 * línea con la que `detectZone` separa "foraneo"—. No es una elección de
 * estilo: por debajo de esos 90 km están el AIFA (68) y Toluca (80), donde lo
 * que corresponde es el servicio por horas. Cuernavaca, la foránea más corta,
 * son 105. La frontera no parte ninguna ruta por la mitad.
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
 * Si una ruta de ida admite viaje redondo, por su distancia.
 *
 * Se pregunta a `detectZone` en vez de comparar contra un 90 escrito aquí.
 * Tener el número dos veces es tener dos números: el día que alguien mueva la
 * frontera de zona, esto la seguiría en silencio o —peor— dejaría de seguirla
 * sin que nada falle. Que es justo lo que le pasó al kilometraje por hora
 * hasta que se consolidó en este archivo.
 */
export function admiteRedondo(km: number) {
  return detectZone(km) === "foraneo";
}
