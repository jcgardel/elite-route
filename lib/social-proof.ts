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

/** Lo que dice la ficha hoy. Verificado el 27 de agosto de 2026. */
export const GOOGLE_RATING = "5.0";
export const GOOGLE_REVIEW_COUNT = 20;

export type Review = {
  /** Transcrita literalmente de la ficha. */
  quote: string;
  name: string;
  /** Cuántas reseñas ha escrito esa persona en Google. */
  count: number;
  initial: string;
};

/**
 * Sólo tres: Google no deja ver más sin sesión iniciada, y las otras
 * diecisiete tienen que salir del perfil de negocio del dueño. Faltan dos
 * para las cinco que pidió.
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
    quote: "Me encantó, servicio confiable y seguro.",
    name: "Nayeli Reyes H.",
    count: 3,
    initial: "N",
  },
];

/**
 * Las cifras que sólo Elite Route puede decir. Las dio el dueño; no se
 * calculan solas, así que si cambian hay que venir a cambiarlas aquí.
 */
export const YEARS_OPERATING = 4;
export const TRANSFERS_PER_YEAR = 600;
