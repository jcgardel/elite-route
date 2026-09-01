/**
 * Límites del formulario de reserva que el navegador y el servidor tienen
 * que respetar por igual.
 *
 * Vive aparte del tarifario porque no es información interna: es una regla
 * de captura, y la interfaz necesita conocerla para avisar antes de que el
 * cliente escriba de más en lugar de recortarle el texto sin decir nada.
 */

/**
 * Cuánto puede escribir el cliente en sus solicitudes extra.
 *
 * Trescientos caracteres alcanzan para lo que la gente pide de verdad —una
 * silla de bebé, una parada, un letrero con su nombre— y quedan lejos del
 * tope de 500 que Stripe acepta por cada dato de la reserva, así que el
 * texto llega entero al aviso del chofer sin recortes.
 */
export const NOTAS_MAX = 300;
