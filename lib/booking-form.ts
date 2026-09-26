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

/**
 * Cuánto puede medir un número de vuelo. Los reales rondan los 6 caracteres
 * ("AM234", "AA1234", "LH 500"); el tope es holgado a propósito.
 */
export const VUELO_MAX = 12;

/**
 * ¿Sirve esto como número de vuelo?
 *
 * Deliberadamente PERMISIVA. Un número de vuelo es un código de aerolínea
 * más una cifra —"AM234", "UA1234", "4O 110"— pero las combinaciones reales
 * son más raras de lo que parece: hay aerolíneas con dígito en el código,
 * otras con tres letras, y el pasajero lo escribe con espacio, sin él, o en
 * minúsculas. Una expresión estricta rechazaría vuelos que existen, y
 * rechazar una reserva buena cuesta mucho más que aceptar un dato flojo que
 * el equipo corrige por WhatsApp.
 *
 * Por eso sólo se exige que traiga **una letra y un dígito**: alcanza para
 * descartar "no sé", "-" o "lo mando luego", que es lo que de verdad llega
 * cuando un campo es obligatorio y el cliente no tiene el dato a mano.
 *
 * La comprueban el cotizador y la ruta de cobro. Si alguna vez se endurece,
 * hay que endurecerla aquí y en ningún otro sitio.
 */
export function esVueloValido(valor: string): boolean {
  const v = valor.trim();
  if (v.length < 3 || v.length > VUELO_MAX) return false;
  return /[A-Za-z]/.test(v) && /[0-9]/.test(v);
}
