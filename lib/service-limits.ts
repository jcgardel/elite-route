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
