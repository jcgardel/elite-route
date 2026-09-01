/**
 * Datos que sostienen las páginas legales.
 *
 * Todo lo que hay aquí es verificable contra el código del sitio: los datos
 * que se piden en el cotizador, los servicios que los procesan y los correos
 * que ya existen. Lo único que no se puede sacar del repositorio es la
 * identidad fiscal.
 *
 * IDENTIDAD DEL RESPONSABLE — decidido por el dueño el 26 de agosto de 2026.
 * La Ley Federal de Protección de Datos Personales en Posesión de los
 * Particulares (art. 16) pide identidad y domicilio del responsable. Se
 * publica el **nombre comercial** y el **domicilio**, y se dejan fuera la
 * razón social y el RFC: son datos personales del dueño y la ley no obliga a
 * exponerlos cuando el responsable ya queda identificado y localizable.
 *
 * Quien quiera ejercer sus derechos ARCO tiene las tres vías que la ley
 * espera: un nombre, un domicilio físico y un correo de contacto.
 *
 * `razonSocial` y `rfc` se quedan vacíos **a propósito**, no por pendiente.
 * Si algún día se llenan, las páginas los pintan solas —el código ya lo
 * contempla— pero es una decisión del dueño, no un olvido.
 */
export const LEGAL = {
  /** Nombre comercial con el que se identifica al responsable. */
  responsable: "ELITE ROUTE MX",
  /** Vacío a propósito: dato personal del dueño. Ver la nota de arriba. */
  razonSocial: "",
  /** Vacío a propósito: dato personal del dueño. Ver la nota de arriba. */
  rfc: "",
  /** Domicilio donde se puede ejercer ARCO. */
  domicilio: "Lago Zurich 244, Ampliación Granada, Miguel Hidalgo, 11529, Ciudad de México",

  sitio: "eliteroute.mx",
  correoPrivacidad: "contabilidad@eliteroute.mx",
  correoComercial: "business@eliteroute.mx",
  whatsapp: "+52 55 4358 2919",
  whatsappUrl: "https://wa.me/525543582919",

  /** Fecha de la última revisión de los textos legales. */
  actualizado: "31 de agosto de 2026",
  /** La misma fecha para la versión en inglés. */
  updated: "August 31, 2026",

  /**
   * Terceros que tratan datos del cliente. Cada uno está en el código:
   * Google Maps en el autocompletado y el cálculo de ruta, Stripe en el
   * cobro, Resend en los correos, Upstash en el límite de peticiones y
   * Vercel en el alojamiento. WhatsApp entra porque la confirmación del
   * traslado se hace por ahí.
   */
  encargados: [
    {
      nombre: "Stripe",
      para: "Procesar el pago con tarjeta. Los datos de la tarjeta se capturan en Stripe y nunca pasan por este sitio.",
      forWhat: "Card payment processing. Card details are captured by Stripe and never pass through this site.",
    },
    {
      nombre: "Google Maps Platform",
      para: "Sugerir direcciones y calcular la distancia y duración de la ruta.",
      forWhat: "Address suggestions and route distance and duration.",
    },
    {
      nombre: "WhatsApp (Meta)",
      para: "Confirmar el traslado y coordinar la recogida.",
      forWhat: "Confirming the transfer and coordinating pickup.",
    },
    {
      nombre: "Resend",
      para: "Enviar el correo de confirmación de la reserva.",
      forWhat: "Sending the booking confirmation email.",
    },
    {
      nombre: "Google Analytics",
      para: "Contar visitas y saber en qué paso del cotizador se queda la gente. Está configurado sólo para medir: las señales de publicidad y la personalización de anuncios están desactivadas, así que estos datos no alimentan audiencias publicitarias.",
      forWhat: "Counting visits and seeing where people stop in the quote form. It is configured for measurement only: Google's advertising signals and ad personalisation are switched off, so this data does not feed advertising audiences.",
    },
    {
      nombre: "Vercel",
      para: "Alojar el sitio y registrar los accesos técnicos.",
      forWhat: "Hosting the site and recording technical access logs.",
    },
    {
      nombre: "Upstash",
      para: "Limitar las peticiones al cotizador para evitar abuso.",
      forWhat: "Rate-limiting quote requests to prevent abuse.",
    },
  ],
} as const;
