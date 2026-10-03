/**
 * LAS GUÍAS PARA EL VIAJERO. Contenido, no tarifario.
 *
 * POR QUÉ EXISTEN. Hasta el 3 de octubre de 2026 las 56 URLs del sitio eran
 * todas comerciales: cada una contesta "quiero un traslado". Pero quien vuela
 * de Londres a la Ciudad de México no busca eso todavía; busca "is it safe to
 * take a taxi from Mexico City airport" o "how do I get from the airport to
 * Polanco". Esa es la conversación en la que se decide cómo se va a mover, y
 * el sitio llegaba tarde a ella.
 *
 * LA REGLA DE ESTAS PÁGINAS: son útiles aunque el lector no reserve nada. Si
 * una sección sólo tiene sentido como argumento de venta, sobra. Los datos
 * duros van completos aunque no favorezcan —la guía del aeropuerto dice que
 * el chofer reservado cuesta más que las otras tres opciones, y la de
 * excursiones publica las casi ocho horas de coche que son San Miguel ida y
 * vuelta—, porque un viajero que detecta que le están escondiendo algo deja
 * de leer.
 *
 * DÓNDE ESTÁ LA LÍNEA, decidida por el dueño el 3 de octubre de 2026: dar el
 * dato completo, sí; recomendar al competidor, no. La primera versión de
 * estas páginas cerraba diciéndole al lector que tomara un taxi autorizado y
 * que no hiciera San Miguel en un día. Los números eran correctos y el
 * consejo editorial sobraba: una guía de una empresa de transporte puede
 * decir cuánto tarda cada cosa sin escribir la frase que manda al cliente a
 * otro sitio. Los tiempos y los costos siguen ahí enteros; lo que se quitó
 * fue el veredicto en contra.
 *
 * SOBRE LOS DATOS QUE CADUCAN. Varias afirmaciones de aquí —reglas de
 * aplicaciones de transporte, horarios, qué aerolínea usa qué terminal—
 * cambian. Cada guía lleva su fecha de revisión visible y, donde el dato es
 * volátil, el texto dice que conviene confirmarlo. Publicar un consejo
 * práctico equivocado es peor que no publicarlo.
 */
import type { Lang, Page } from "../i18n";

/** Un bloque de contenido dentro de una sección. */
export type Bloque =
  | { tipo: "p"; texto: string }
  | { tipo: "lista"; items: string[] }
  /** Un aviso destacado. Para lo que de verdad cambia una decisión. */
  | { tipo: "nota"; texto: string }
  | { tipo: "tabla"; encabezados: string[]; filas: string[][] };

export type Seccion = {
  /** Ancla para el índice y para enlazar desde fuera. */
  id: string;
  h2: string;
  bloques: Bloque[];
};

export type ContenidoGuia = {
  kicker: string;
  title: string;
  /** El H1. Separado del `title` de metadatos: uno persigue la búsqueda, el
   *  otro se lee en la página. */
  h1: string;
  intro: string;
  description: string;
  /** Tres datos duros arriba, como en las páginas de ruta. */
  datos: Array<{ valor: string; etiqueta: string }>;
  secciones: Seccion[];
  faqs: Array<[string, string]>;
  /** La llamada a la acción del final. Una sola, y después del contenido. */
  cta: { titulo: string; copy: string; boton: string };
  /** Qué más leer. El enlazado interno es la mitad del valor de una guía. */
  relacionadas: Array<{ page: Page; label: string }>;
  /** Cuándo se revisaron los datos de esta guía, tal como se enseña. */
  revisado: string;
  indiceTitulo: string;
};

export type Guia = {
  /** La página de i18n que le corresponde, para canonical, hreflang y URL. */
  page: Page;
  contenido: Record<Lang, ContenidoGuia>;
};
