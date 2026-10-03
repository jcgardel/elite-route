/**
 * GUÍA 3: Terminal 1 o Terminal 2 del AICM.
 *
 * POR QUÉ ES ÚTIL Y NO SÓLO TRÁFICO. Las dos terminales son edificios
 * separados y no se puede caminar de una a otra: hay que tomar el Aerotrén
 * —que exige pase de abordar del mismo día— o el autobús inter-terminal.
 * Alguien que lo descubre con la maleta en la mano y el vuelo en una hora ya
 * tiene un problema. Es exactamente el tipo de pregunta que se busca desde el
 * móvil, con prisa, y que casi nadie contesta de forma directa.
 *
 * DATOS VERIFICADOS EL 3 DE OCTUBRE DE 2026: reparto de aerolíneas por
 * terminal, horario y requisito del Aerotrén, y las puertas del autobús
 * inter-terminal. El reparto de aerolíneas es lo más volátil de todo el
 * contenido del sitio —cambia cuando una aerolínea se muda—, así que el texto
 * nombra sólo las grandes y le dice al lector que lo confirme en su pase de
 * abordar, que es la única fuente que no caduca.
 */
import type { Guia } from "./types";

export const GUIA_TERMINALES: Guia = {
  page: "guideTerminals",
  contenido: {
    en: {
      kicker: "Airport guide",
      title: "Mexico City Airport: Terminal 1 or Terminal 2?",
      h1: "AICM Terminal 1 or Terminal 2: how to tell, and how to move between them",
      description:
        "Which airlines use each AICM terminal, why you cannot walk between them, how the free Aerotrén works and what to do if you do not have a boarding pass yet.",
      intro:
        "Mexico City's airport has two terminals in two separate buildings, and people find this out at the worst possible moment. You cannot walk from one to the other. Here is how to know which one you need, how to cross if you are in the wrong one, and how much time to leave.",
      revisado: "Last checked: October 2026",
      indiceTitulo: "On this page",
      datos: [
        { valor: "2", etiqueta: "separate buildings" },
        { valor: "5 min", etiqueta: "on the Aerotrén" },
        { valor: "05:00–23:00", etiqueta: "Aerotrén hours" },
      ],
      secciones: [
        {
          id: "which-terminal",
          h2: "Which terminal is mine?",
          bloques: [
            {
              tipo: "p",
              texto:
                "The split follows airline alliances more than anything else. Terminal 2 is the SkyTeam building: Aeroméxico and Delta. Terminal 1 has American, United and most other international carriers, along with a long list of domestic and low-cost airlines.",
            },
            {
              tipo: "nota",
              texto:
                "Airlines do move between terminals, and when one does, every guide on the internet is wrong until it is updated — including this one. Your boarding pass states the terminal. That is the source to trust.",
            },
            {
              tipo: "p",
              texto:
                "If you are being picked up, send the terminal and not just the flight number. A driver waiting in the wrong building is the same as no driver at all.",
            },
          ],
        },
        {
          id: "aerotren",
          h2: "The Aerotrén: free, five minutes, one condition",
          bloques: [
            {
              tipo: "p",
              texto:
                "A small automated train links the two terminals. It is free, the ride takes under five minutes, and it runs from 05:00 to 23:00.",
            },
            {
              tipo: "p",
              texto:
                "The condition is that you must show a valid boarding pass for the same day, printed or on your phone. It was built for passengers connecting between flights, and that rule is enforced — not a formality you can talk your way around.",
            },
            {
              tipo: "tabla",
              encabezados: ["From", "Where to board"],
              filas: [
                ["Terminal 1", "Puente de Pilotos — up the escalators in Concourse D"],
                ["Terminal 2", "Concourse M, next to the domestic boarding area"],
              ],
            },
          ],
        },
        {
          id: "no-boarding-pass",
          h2: "No boarding pass? Take the inter-terminal bus",
          bloques: [
            {
              tipo: "p",
              texto:
                "If you have not checked in yet, if you are meeting someone, or if the Aerotrén is not running, the red inter-terminal buses do the same job with no boarding pass required.",
            },
            {
              tipo: "tabla",
              encabezados: ["Terminal", "Where the bus stops"],
              filas: [
                ["Terminal 1", "Near Door 7"],
                ["Terminal 2", "Near Door 4"],
              ],
            },
            {
              tipo: "p",
              texto:
                "It takes longer than the train — it drives on public roads, so traffic counts — and it is the option that catches people out on time. A taxi between terminals also works and is quick, but you are paying for a very short trip.",
            },
          ],
        },
        {
          id: "how-much-time",
          h2: "How much time to leave",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Crossing terminals with the Aerotrén: allow 30 minutes door to door, not five. The ride is short; finding the platform, queueing and walking the concourses is not.",
                "Crossing by bus: allow 45 to 60 minutes, more in rush hour.",
                "A connection that changes terminal: treat it as leaving and re-entering the airport. You clear security again on the other side.",
              ],
            },
            {
              tipo: "nota",
              texto:
                "If your itinerary has you landing in one terminal and departing from the other on a separate ticket, that is not a connection — it is two trips. Nobody will hold the second flight for you.",
            },
          ],
        },
        {
          id: "other-airport",
          h2: "And the other airport",
          bloques: [
            {
              tipo: "p",
              texto:
                "Mexico City is served by a second airport, Felipe Ángeles (AIFA), roughly 50 km north of the city and entirely separate from AICM. There is no train or quick shuttle between the two — crossing from one to the other is a road trip of well over an hour in normal traffic.",
            },
            {
              tipo: "p",
              texto:
                "Check the airport code on your ticket, not just the city. AICM is MEX; AIFA is NLU.",
            },
          ],
        },
      ],
      faqs: [
        [
          "Can I walk between Terminal 1 and Terminal 2 at Mexico City airport?",
          "No. They are separate buildings several kilometres apart. Use the Aerotrén if you have a boarding pass for that day, or the inter-terminal bus if you do not.",
        ],
        [
          "Is the Aerotrén free?",
          "Yes, it is free. The only requirement is a valid same-day boarding pass, printed or digital, which is checked before you board.",
        ],
        [
          "Which terminal does Aeroméxico use?",
          "Terminal 2, along with Delta. American and United are in Terminal 1, as are most other international airlines. Confirm on your boarding pass, since airlines do occasionally move.",
        ],
        [
          "How long does it take to change terminals?",
          "Allow about 30 minutes using the Aerotrén and 45 to 60 by bus, counting the walk to the platform or stop. The train ride itself is under five minutes.",
        ],
        [
          "Is AIFA the same as Mexico City airport?",
          "No. AIFA (code NLU) is a separate airport about 50 km north of the city. AICM (code MEX) is the one most international flights use. Getting them confused means an expensive hour on the road.",
        ],
      ],
      cta: {
        titulo: "Being met at the right terminal",
        copy: "Tell us the flight and we track it. Your chauffeur waits in the arrivals hall of the terminal you actually land in, with your name on a sign — and waits at no extra charge if the flight is late.",
        boton: "Get a quote",
      },
      relacionadas: [
        { page: "guideAirport", label: "How to get from Mexico City airport into the city" },
        { page: "airport", label: "Airport transfers: routes and fixed prices" },
        { page: "guideDayTrips", label: "Day trips from Mexico City with a driver" },
      ],
    },

    es: {
      kicker: "Guía de aeropuerto",
      title: "AICM: ¿Terminal 1 o Terminal 2?",
      h1: "AICM Terminal 1 o Terminal 2: cómo saber cuál es la tuya y cómo cambiar",
      description:
        "Qué aerolíneas usa cada terminal del AICM, por qué no se puede caminar de una a otra, cómo funciona el Aerotrén gratuito y qué hacer si todavía no tienes pase de abordar.",
      intro:
        "El aeropuerto de la Ciudad de México tiene dos terminales en dos edificios separados, y la gente se entera en el peor momento posible. No se puede caminar de una a otra. Esto es cómo saber cuál te toca, cómo cruzar si estás en la equivocada y cuánto tiempo dejar.",
      revisado: "Datos revisados: octubre de 2026",
      indiceTitulo: "En esta página",
      datos: [
        { valor: "2", etiqueta: "edificios separados" },
        { valor: "5 min", etiqueta: "en el Aerotrén" },
        { valor: "05:00–23:00", etiqueta: "horario del Aerotrén" },
      ],
      secciones: [
        {
          id: "which-terminal",
          h2: "¿Cuál es mi terminal?",
          bloques: [
            {
              tipo: "p",
              texto:
                "El reparto sigue más que nada a las alianzas. La Terminal 2 es el edificio de SkyTeam: Aeroméxico y Delta. En la Terminal 1 están American, United y casi todas las demás aerolíneas internacionales, además de una lista larga de nacionales y de bajo costo.",
            },
            {
              tipo: "nota",
              texto:
                "Las aerolíneas se cambian de terminal, y cuando una lo hace, todas las guías de internet quedan mal hasta que alguien las actualice, ésta incluida. Tu pase de abordar dice la terminal. Ésa es la fuente en la que hay que confiar.",
            },
            {
              tipo: "p",
              texto:
                "Si alguien va a recogerte, mándale la terminal y no sólo el número de vuelo. Un chofer esperando en el edificio equivocado es lo mismo que ningún chofer.",
            },
          ],
        },
        {
          id: "aerotren",
          h2: "El Aerotrén: gratis, cinco minutos, una condición",
          bloques: [
            {
              tipo: "p",
              texto:
                "Un tren automático pequeño conecta las dos terminales. Es gratuito, el trayecto dura menos de cinco minutos y opera de 05:00 a 23:00.",
            },
            {
              tipo: "p",
              texto:
                "La condición es enseñar un pase de abordar válido del mismo día, impreso o en el teléfono. Se hizo para pasajeros en conexión, y esa regla se aplica: no es un trámite que se pueda sortear hablando.",
            },
            {
              tipo: "tabla",
              encabezados: ["Desde", "Dónde se aborda"],
              filas: [
                ["Terminal 1", "Puente de Pilotos — subiendo por las escaleras de la Sala D"],
                ["Terminal 2", "Sala M, junto al área de abordaje nacional"],
              ],
            },
          ],
        },
        {
          id: "no-boarding-pass",
          h2: "¿Sin pase de abordar? El autobús inter-terminal",
          bloques: [
            {
              tipo: "p",
              texto:
                "Si todavía no documentas, si vas a encontrarte con alguien o si el Aerotrén no está operando, los autobuses rojos inter-terminal hacen lo mismo sin pedir pase de abordar.",
            },
            {
              tipo: "tabla",
              encabezados: ["Terminal", "Dónde para el autobús"],
              filas: [
                ["Terminal 1", "Cerca de la Puerta 7"],
                ["Terminal 2", "Cerca de la Puerta 4"],
              ],
            },
            {
              tipo: "p",
              texto:
                "Tarda más que el tren —circula por vialidades públicas, así que el tráfico cuenta— y es la opción con la que la gente se queda corta de tiempo. Un taxi entre terminales también sirve y es rápido, pero pagas por un trayecto muy corto.",
            },
          ],
        },
        {
          id: "how-much-time",
          h2: "Cuánto tiempo dejar",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Cambiar de terminal en Aerotrén: calcula 30 minutos de puerta a puerta, no cinco. El trayecto es corto; encontrar el andén, hacer fila y caminar las salas no lo es.",
                "Cambiar en autobús: calcula de 45 a 60 minutos, más en hora pico.",
                "Una conexión que cambia de terminal: trátala como salir y volver a entrar al aeropuerto. Del otro lado vuelves a pasar seguridad.",
              ],
            },
            {
              tipo: "nota",
              texto:
                "Si tu itinerario te hace aterrizar en una terminal y salir de la otra con boletos separados, eso no es una conexión: son dos viajes. Nadie va a detener el segundo vuelo por ti.",
            },
          ],
        },
        {
          id: "other-airport",
          h2: "Y el otro aeropuerto",
          bloques: [
            {
              tipo: "p",
              texto:
                "La Ciudad de México tiene un segundo aeropuerto, el Felipe Ángeles (AIFA), a unos 50 km al norte y completamente separado del AICM. No hay tren ni transporte rápido entre los dos: cruzar de uno a otro es un viaje por carretera de bastante más de una hora con tráfico normal.",
            },
            {
              tipo: "p",
              texto: "Revisa el código del aeropuerto en tu boleto, no sólo la ciudad. El AICM es MEX; el AIFA es NLU.",
            },
          ],
        },
      ],
      faqs: [
        [
          "¿Se puede caminar entre la Terminal 1 y la Terminal 2 del AICM?",
          "No. Son edificios separados a varios kilómetros. Usa el Aerotrén si tienes pase de abordar de ese día, o el autobús inter-terminal si no.",
        ],
        [
          "¿El Aerotrén es gratis?",
          "Sí, es gratuito. El único requisito es un pase de abordar válido del mismo día, impreso o digital, que se revisa antes de subir.",
        ],
        [
          "¿Qué terminal usa Aeroméxico?",
          "La Terminal 2, junto con Delta. American y United están en la Terminal 1, igual que casi todas las demás internacionales. Confírmalo en tu pase de abordar, porque las aerolíneas se cambian de vez en cuando.",
        ],
        [
          "¿Cuánto se tarda en cambiar de terminal?",
          "Calcula unos 30 minutos en Aerotrén y de 45 a 60 en autobús, contando la caminata al andén o a la parada. El trayecto en tren es de menos de cinco minutos.",
        ],
        [
          "¿El AIFA es el mismo aeropuerto de la CDMX?",
          "No. El AIFA (código NLU) es un aeropuerto distinto a unos 50 km al norte. El AICM (código MEX) es el que usan casi todos los vuelos internacionales. Confundirlos significa una hora cara de carretera.",
        ],
      ],
      cta: {
        titulo: "Que te reciban en la terminal correcta",
        copy: "Dinos el vuelo y lo monitoreamos. Tu chofer espera en la sala de llegadas de la terminal en la que de verdad aterrices, con tu nombre en un letrero, y espera sin costo extra si el vuelo se retrasa.",
        boton: "Cotizar",
      },
      relacionadas: [
        { page: "guideAirport", label: "Cómo llegar del aeropuerto de la CDMX a la ciudad" },
        { page: "airport", label: "Traslados de aeropuerto: rutas y precios fijos" },
        { page: "guideDayTrips", label: "Excursiones de un día desde la CDMX con chofer" },
      ],
    },
  },
};
