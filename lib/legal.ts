/**
 * Datos que sostienen las páginas legales.
 *
 * Todo lo que hay aquí es verificable contra el código del sitio: los datos
 * que se piden en el cotizador, los servicios que los procesan y los correos
 * que ya existen. Lo único que no se puede sacar del repositorio es la
 * identidad fiscal.
 *
 * PENDIENTE DEL DUEÑO — `domicilio`, `razonSocial` y `rfc` van vacíos a
 * propósito. La Ley Federal de Protección de Datos Personales en Posesión de
 * los Particulares (art. 16) pide identidad y domicilio del responsable en el
 * aviso de privacidad. Mientras estén vacíos, el aviso se publica con el
 * nombre comercial y el correo de contacto —que es cierto y suficiente para
 * ejercer derechos ARCO— y omite las líneas fiscales en lugar de inventarlas.
 */
export const LEGAL = {
  /** Nombre comercial. Cierto hoy. */
  responsable: "Elite Route",
  /** Razón social. Vacío hasta que el dueño la proporcione. */
  razonSocial: "",
  /** RFC. Vacío hasta que el dueño lo proporcione. */
  rfc: "",
  /** Domicilio fiscal. Vacío hasta que el dueño lo proporcione. */
  domicilio: "",

  sitio: "eliteroute.mx",
  correoPrivacidad: "contabilidad@eliteroute.mx",
  correoComercial: "business@eliteroute.mx",
  whatsapp: "+52 55 4358 2919",
  whatsappUrl: "https://wa.me/525543582919",

  /** Fecha de la última revisión de los textos legales. */
  actualizado: "25 de agosto de 2026",
  /** La misma fecha para la versión en inglés. */
  updated: "August 25, 2026",

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
