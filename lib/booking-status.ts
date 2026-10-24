/**
 * Qué pasa después de pagar, dicho una sola vez.
 *
 * POR QUÉ EXISTE. Hasta el 17 de octubre de 2026 el sitio contaba cuatro
 * versiones distintas del mismo momento: la portada decía "confirmamos por
 * WhatsApp el mismo día", la página de gracias "un agente confirma en los
 * próximos minutos", el correo se titulaba "Tu traslado está confirmado" y la
 * página corporativa prometía "confirmación inmediata". Las cuatro no podían
 * ser ciertas a la vez, y la del correo era la peor: presentaba como
 * confirmado un servicio que todavía tenía que validar operación.
 *
 * Lo que de verdad ocurre (ver app/api/webhooks/stripe/route.ts):
 *   1. Stripe cobra y el webhook avisa al equipo y al cliente.
 *   2. El equipo valida disponibilidad y confirma por WhatsApp o correo el
 *      mismo día. Sin disponibilidad, se reembolsa el importe completo
 *      (términos, "Qué es una reserva").
 *   3. Un día antes del servicio se mandan los datos del conductor y de la
 *      unidad.
 *
 * REGLA: pago recibido NO es servicio confirmado. Ningún texto del sitio
 * dice "confirmado" hasta que el equipo lo valida.
 *
 * Sin `server-only`: lo usan componentes de cliente y no hay nada que
 * proteger, son frases.
 */

export const DESPUES_DE_PAGAR = {
  es: {
    pagoRecibido: "Pago recibido",
    enValidacion: "Reserva recibida",
    validacion:
      "Tu reserva quedó registrada. Te enviamos la confirmación por WhatsApp o correo.",
    conductor:
      "Un día antes del servicio te enviamos por WhatsApp los datos del conductor y de la unidad (si reservas con menos anticipación, al confirmar).",
    /** Los tres pasos, para listas cortas junto al botón de pago. */
    pasos: [
      ["Pagas con Stripe", "Te enviamos el comprobante por correo."],
      ["Confirmamos tu reserva", "Por WhatsApp o correo."],
      ["Datos del conductor", "Conductor y unidad asignados, un día antes del servicio."],
    ],
    pasosTitulo: "Qué pasa al pagar",
  },
  en: {
    pagoRecibido: "Payment received",
    enValidacion: "Booking received",
    validacion:
      "Your booking is registered. We send you the confirmation over WhatsApp or email.",
    conductor:
      "One day before the service we send you the chauffeur's and vehicle's details over WhatsApp (if you book at shorter notice, when we confirm).",
    pasos: [
      ["You pay through Stripe", "We email you the receipt."],
      ["We confirm your booking", "Over WhatsApp or email."],
      ["Chauffeur details", "Your assigned chauffeur and vehicle, one day before the service."],
    ],
    pasosTitulo: "What happens when you pay",
  },
} as const;
