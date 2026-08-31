/**
 * La medición del embudo: dónde entra la gente y en qué paso se cae.
 *
 * Hasta ahora el sitio no tenía ninguna analítica, así que no había forma de
 * saber si un cambio servía. Se mide para responder preguntas concretas
 * —cuántos empiezan a cotizar, cuántos llegan al precio, cuántos pagan— y no
 * para acumular datos por si acaso.
 *
 * DOS DECISIONES QUE NO SON DETALLE:
 *
 * 1. Medición sí, publicidad no. La etiqueta arranca con las señales de
 *    Google y la personalización de anuncios APAGADAS. Sin eso, GA4 alimenta
 *    audiencias publicitarias con los datos del visitante, que es otra cosa
 *    distinta de contar visitas y obligaría a pedir consentimiento explícito.
 *    Si algún día se hace remarketing, esto se cambia a conciencia y el aviso
 *    de privacidad se actualiza con ello.
 *
 * 2. Sin el identificador no se carga nada. Mientras `NEXT_PUBLIC_GA_ID` esté
 *    vacío no se pide ningún script ni se pone ninguna cookie: el sitio se
 *    comporta exactamente como antes. Así esto se puede desplegar hoy y
 *    encender cuando el identificador exista, sin tocar código.
 */

/** El identificador de la propiedad de GA4, con la forma G-XXXXXXXXXX. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/** Si no hay identificador, la analítica no existe. */
export const analyticsEnabled = GA_ID.length > 0;

/**
 * Los pasos del embudo, nombrados una sola vez.
 *
 * Están en español porque los va a leer el dueño en el panel de GA4, no un
 * programador. Un evento llamado `route_completed` obliga a traducir mentalmente
 * cada vez que se mira un informe.
 */
export type EventoEmbudo =
  /** Escribió algo en el cotizador: dejó de mirar y empezó a pedir. */
  | "cotizacion_iniciada"
  /** El servidor devolvió la ruta y el precio: pasó del paso 1 al 2. */
  | "ruta_completada"
  /** Eligió una categoría de vehículo. */
  | "vehiculo_seleccionado"
  /** Llegó al paso 3 y tiene el total con IVA delante. */
  | "precio_mostrado"
  /** Se fue a WhatsApp con la cotización armada en lugar de pagar. */
  | "clic_whatsapp"
  /** Pulsó pagar y se le mandó a Stripe. */
  | "pago_iniciado"
  /** Volvió de Stripe con el pago hecho. Cierra el embudo. */
  | "reserva_pagada";

type Gtag = (comando: string, ...resto: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

/**
 * Manda un evento, si hay a dónde mandarlo.
 *
 * Nunca lanza y nunca bloquea: medir es lo menos importante que hace esta
 * página, y un fallo del script de Google —un bloqueador de anuncios, una red
 * caída— no puede impedir que alguien reserve un traslado.
 */
export function track(evento: EventoEmbudo, parametros?: Record<string, unknown>) {
  if (!analyticsEnabled) return;
  try {
    window.gtag?.("event", evento, parametros);
  } catch {
    // Silencio a propósito: ver arriba.
  }
}
