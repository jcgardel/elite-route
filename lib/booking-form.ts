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

/**
 * Con cuánta anticipación se puede reservar, en horas.
 *
 * Lo comprueban el cotizador (antes de pedir precio) y la ruta de cobro
 * (antes de crear la sesión de Stripe). Vive aquí para que las dos miren el
 * mismo número: cuando estaban escritos por separado, cambiar uno dejaba al
 * otro aceptando reservas que el equipo no podía cubrir.
 *
 * Los textos del sitio —términos, FAQ, páginas de ruta— dicen este mismo
 * número a mano. Si cambia, hay que cambiarlos también.
 */
export const MIN_ADVANCE_HOURS = 12;
