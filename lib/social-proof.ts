/**
 * La prueba social del negocio: la ficha de Google y las cifras del dueño.
 *
 * Vivía dentro de HomeClient, así que sólo la portada podía usarla. Pero la
 * portada no es donde llega la gente desde el buscador: llega a las páginas
 * de ruta, que hasta ahora enseñaban una tabla de precios sin una sola razón
 * para creer que detrás hay una empresa y no un sitio copiado. Esto se saca
 * aquí para que las dos lo compartan y no haya dos versiones del mismo dato.
 *
 * TODO lo de este archivo es verificable:
 *   · la calificación y el número de reseñas salen de la ficha real, y el
 *     enlace lleva a esa ficha para que cualquiera lo compruebe;
 *   · las reseñas están transcritas tal cual, sin traducir ni recortar —una
 *     reseña editada deja de ser la palabra de quien la escribió—;
 *   · las cifras del negocio las dio el dueño el 26 de agosto de 2026.
 *
 * Antes había aquí cinco testimonios inventados. Si alguna vez hace falta
 * rellenar un hueco, el hueco se queda vacío.
 */

export const GOOGLE_PLACE_ID = "ChIJwYyKBzB3-SYRmnY1eNB8Vf0";

/** La ficha "Elite Route MX" en Google Maps. */
export const GOOGLE_PLACE_URL =
  "https://www.google.com/maps/place/Elite+Route+MX/data=!4m7!3m6!1s0x26f97730078a8cc1:0xfd557cd07835769a!8m2!3d19.9422083!4d-99.440172!16s%2Fg%2F11zgs9m1dv!19s" +
  GOOGLE_PLACE_ID;

/** El formulario de Google para dejar una reseña en esa ficha. */
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;

/**
 * Lo que dice la ficha hoy. Verificado en Google Maps el 7 de septiembre de
 * 2026: eran 20 el 27 de agosto y ya son 27, así que este número envejece
 * solo. Conviene revisarlo cada cierto tiempo — decir menos reseñas de las
 * que hay es regalar prueba social que ya se ganó.
 */
export const GOOGLE_RATING = "5.0";
export const GOOGLE_REVIEW_COUNT = 27;

export type Review = {
  /** Transcrita literalmente de la ficha. */
  quote: string;
  name: string;
  /**
   * Cuántas reseñas ha escrito esa persona en Google. Opcional a propósito:
   * la ficha no lo enseña para todo el mundo, y de quien no lo enseña no hay
   * de dónde sacarlo. Cuando falta, la tarjeta se queda sin esa línea; nunca
   * se le pone un número aproximado.
   */
  count?: number;
  initial: string;
};

/**
 * Las cinco de la portada, transcritas de la ficha el 7 de septiembre de
 * 2026. Las tres primeras ya estaban; Fabiola y Laura son de esa misma
 * semana y la ficha las marcaba como NUEVA.
 *
 * De Laura no hay `count`: la ficha no lo enseña. Se queda sin esa línea
 * antes que inventarle un número.
 *
 * Quedan 22 en el perfil que Google no deja leer sin haber verificado la
 * ficha. Si algún día hacen falta más tarjetas, salen de ahí — no de aquí.
 */
export const REVIEWS: readonly Review[] = [
  {
    quote: "Seguridad y exclusividad, la mejor opción en transporte privado.",
    name: "Itzel Sanchez",
    count: 5,
    initial: "I",
  },
  {
    quote:
      "Lo que uno siempre espera de un servicio: puntualidad, amabilidad y un excelente servicio. Súper recomendado.",
    name: "Octavio Santos",
    count: 2,
    initial: "O",
  },
  {
    quote:
      "Excelente servicio, puntuales, atentos y limpieza perfecta en la unidad. Creo que si tu prioridad es discreción y un servicio premium, Elite Route MX es la primera opción.",
    name: "Fabiola Escalante Araiza",
    count: 1,
    initial: "F",
  },
  {
    quote: "Me encantó, servicio confiable y seguro.",
    name: "Nayeli Reyes H.",
    count: 3,
    initial: "N",
  },
  {
    quote:
      "Me encantó el servicio; el estado de las unidades, la puntualidad y amabilidad de los conductores. Sin duda los recomendaré y seguiré prefiriendo sus servicios.",
    name: "Laura García",
    initial: "L",
  },
];

/**
 * Las cifras que sólo Elite Route puede decir. Las dio el dueño; no se
 * calculan solas, así que si cambian hay que venir a cambiarlas aquí.
 *
 * Aquí y en ningún otro sitio: la portada las tenía escritas a mano aparte,
 * y el día que se actualizaron una sola de las dos versiones el sitio habría
 * dicho dos cifras distintas del mismo negocio en páginas contiguas.
 *
 * Actualizadas por el dueño el 31 de agosto de 2026 (antes: 4 años y 600).
 * "Experiencia en el sector" cuenta la trayectoria del dueño, que es más
 * larga que la vida de la marca; por eso el número sube más de lo que ha
 * pasado el tiempo.
 */
export const YEARS_OPERATING = 6;
export const TRANSFERS_PER_YEAR = 1200;
