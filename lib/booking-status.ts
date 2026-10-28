/**
 * Qué pasa después de pagar, dicho una sola vez.
 *
 * POR QUÉ EXISTE. Hasta el 17 de octubre de 2026 el sitio contaba cuatro
 * versiones distintas del mismo momento: la portada decía "confirmamos por
 * WhatsApp el mismo día", la página de gracias "un agente confirma en los
 * próximos minutos", el correo se titulaba "Tu traslado está confirmado" y la
 * página corporativa prometía "confirmación inmediata". Las cuatro no podían
 * ser ciertas a la vez.
 *
 * CAMBIO DEL 28 DE OCTUBRE DE 2026. Entre el 17 y el 28 el correo decía "pago
 * recibido, reserva en validación" y prometía una confirmación posterior por
 * WhatsApp o correo. Esa confirmación dependía de una persona y no siempre
 * salía: un cliente que pagó el 22 escribió el 28 amenazando con buscar otro
 * transporte porque "nadie confirmaba". Desde el 24 de octubre la web ya
 * bloquea los horarios sin unidad (lib/agenda.ts), así que un pago aceptado
 * es un servicio con unidad disponible y no hay nada que validar a mano.
 *
 * Lo que ocurre ahora (ver app/api/webhooks/stripe/route.ts):
 *   1. Stripe cobra y el webhook avisa al equipo y al cliente.
 *   2. El correo al cliente ES la confirmación. No se promete ningún mensaje
 *      posterior que dependa de que alguien se acuerde de mandarlo.
 *   3. Un día antes del servicio se mandan los datos del conductor y de la
 *      unidad.
 *
 * REGLA: pago recibido = reserva confirmada. El único mensaje pendiente que
 * se promete es el de los datos del conductor.
 *
 * Sin `server-only`: lo usan componentes de cliente y no hay nada que
 * proteger, son frases.
 */

export const DESPUES_DE_PAGAR = {
  es: {
    pagoRecibido: "Pago recibido",
    enValidacion: "Reserva confirmada",
    validacion:
      "Tu reserva está confirmada; este mensaje es tu comprobante. Cualquier cambio o duda, escríbenos por WhatsApp.",
    conductor:
      "Un día antes del servicio te enviamos por WhatsApp los datos del conductor y de la unidad (si reservas con menos anticipación, el mismo día).",
    /** Los tres pasos, para listas cortas junto al botón de pago. */
    pasos: [
      ["Pagas con Stripe", "Te enviamos el comprobante por correo."],
      ["Reserva confirmada", "Al instante, con el pago."],
      ["Datos del conductor", "Conductor y unidad asignados, un día antes del servicio."],
    ],
    pasosTitulo: "Qué pasa al pagar",
  },
  en: {
    pagoRecibido: "Payment received",
    enValidacion: "Booking confirmed",
    validacion:
      "Your booking is confirmed; this message is your confirmation. For any change or question, write to us on WhatsApp.",
    conductor:
      "One day before the service we send you the chauffeur's and vehicle's details over WhatsApp (if you book at shorter notice, on the same day).",
    pasos: [
      ["You pay through Stripe", "We email you the receipt."],
      ["Booking confirmed", "Instantly, with your payment."],
      ["Chauffeur details", "Your assigned chauffeur and vehicle, one day before the service."],
    ],
    pasosTitulo: "What happens when you pay",
  },
} as const;
