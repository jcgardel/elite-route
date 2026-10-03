/**
 * GUÍA 1: cómo salir del AICM hacia la ciudad.
 *
 * EL DATO QUE LA JUSTIFICA. La mayoría de las guías que hay en internet sobre
 * este tema están desactualizadas: dicen "pide un Uber en la puerta", y desde
 * 2026 eso ya no se puede. La Suprema Corte resolvió en noviembre de 2025 que
 * las aplicaciones de transporte no están autorizadas a operar dentro de los
 * aeropuertos, y desde marzo de 2026 la Guardia Nacional lo hace cumplir en el
 * AICM. El punto de encuentro quedó fuera del perímetro: entre 500 y 900
 * metros a pie desde la Terminal 1 y entre 500 y 1,200 desde la Terminal 2.
 *
 * Eso es exactamente lo que un viajero necesita saber y casi nadie le está
 * diciendo. Verificado el 3 de octubre de 2026 contra prensa mexicana y las
 * resoluciones citadas; va con fecha visible porque es un asunto en litigio y
 * puede volver a moverse.
 *
 * LO QUE NO HACE ESTA PÁGINA: dar miedo. El taxi autorizado es una opción
 * perfectamente buena y así se dice; el metro también, para quien viaja
 * ligero. Y se dice sin rodeos que el chofer reservado cuesta más que las
 * otras tres, porque es verdad y porque esconderlo se nota.
 *
 * Lo que la página NO hace, desde el ajuste del 3 de octubre de 2026, es
 * rematar recomendando el taxi autorizado. Las cuatro opciones están con sus
 * costos y sus inconvenientes para que el lector elija; la sección del chofer
 * explica qué compra esa diferencia y en qué casos la vale. Ver la nota sobre
 * dónde está la línea en ./types.ts.
 */
import type { Guia } from "./types";

export const GUIA_AEROPUERTO: Guia = {
  page: "guideAirport",
  contenido: {
    en: {
      kicker: "Airport guide",
      title: "Getting from Mexico City Airport (AICM) into the City",
      h1: "How to get from Mexico City airport into the city",
      description:
        "Four ways out of AICM compared: authorized taxis, Uber and DiDi, the Metro and a pre-booked driver. What each really costs, how long it takes, and the 2026 rule change most guides still get wrong.",
      intro:
        "You have four realistic ways out of Mexico City International Airport. One of them changed in 2026 and most travel guides have not caught up, which is why people land expecting to order a car at the door and find out they cannot. Here is what each option actually costs, where you catch it, and which one fits the way you are travelling.",
      revisado: "Last checked: October 2026",
      indiceTitulo: "On this page",
      datos: [
        { valor: "4", etiqueta: "ways into the city" },
        { valor: "30–60", etiqueta: "minutes to most areas" },
        { valor: "2026", etiqueta: "ride-hailing rules changed" },
      ],
      secciones: [
        {
          id: "short-answer",
          h2: "The short answer",
          bloques: [
            {
              tipo: "tabla",
              encabezados: ["Option", "Typical cost", "Where you catch it", "Best for"],
              filas: [
                [
                  "Authorized taxi",
                  "$260–450 MXN",
                  "A counter inside the terminal",
                  "Landing without a plan",
                ],
                [
                  "Uber / DiDi",
                  "$150–300 MXN",
                  "Outside the airport perimeter — a 500 m to 1.2 km walk",
                  "Light luggage, no hurry",
                ],
                [
                  "Metro",
                  "$5 MXN",
                  "Terminal Aérea station, Line 5",
                  "Almost no luggage, daytime",
                ],
                [
                  "Pre-booked driver",
                  "Fixed, quoted before you fly",
                  "Meets you inside arrivals",
                  "Night arrivals, groups, luggage, tight schedules",
                ],
              ],
            },
            {
              tipo: "p",
              texto:
                "Which one is right depends on one question: how much does a smooth arrival matter on this particular trip? If you are travelling light in daylight and nothing is scheduled, the authorized taxi counter inside the terminal works with no preparation at all. If you are landing at night, with luggage, with family, or with somewhere to be, arranging the car before you fly removes every variable at once.",
            },
          ],
        },
        {
          id: "authorized-taxis",
          h2: "Authorized taxis, and how they actually work",
          bloques: [
            {
              tipo: "p",
              texto:
                "This is not like hailing a cab on the street. You buy the ride first, at a marked counter inside the terminal, and you pay a fixed price for a zone rather than a metered fare. You are handed a ticket, you walk out to the taxi rank, and you give the ticket to the driver.",
            },
            {
              tipo: "p",
              texto:
                "The price depends on the zone you are going to, not on traffic, so a bad traffic day costs you time but not money. As a rough guide, Centro Histórico runs about $260–320 MXN, Roma and Condesa about $300–380, and Polanco about $380–450. Tell the counter the neighbourhood, not the street address — the zones are what they price.",
            },
            {
              tipo: "nota",
              texto:
                "Pay at the counter, never to someone who approaches you in the hall. If a person offers you a ride before you have reached a counter or an official rank, walk past them. This is the single most common way visitors get overcharged here.",
            },
            {
              tipo: "p",
              texto:
                "The main drawback is that you join a queue at the rank, and at peak arrival times — late evening, when the long-haul flights land together — that queue is real.",
            },
          ],
        },
        {
          id: "uber-didi",
          h2: "What changed with Uber and DiDi",
          bloques: [
            {
              tipo: "p",
              texto:
                "This is the part most guides get wrong. Mexico's Supreme Court ruled in November 2025 that ride-hailing apps are not authorized to operate inside the country's airports, and since March 2026 the rule has been actively enforced at AICM, with National Guard officers at the terminal access points.",
            },
            {
              tipo: "p",
              texto:
                "In practice this does not mean the apps stop working. It means the pickup point moves outside the airport perimeter. You order the car, and then you walk to meet it: roughly 500 to 900 metres from Terminal 1, and 500 metres to 1.2 kilometres from Terminal 2, along airport roadways rather than a pedestrian route.",
            },
            {
              tipo: "nota",
              texto:
                "With two suitcases, a child, or a 1 a.m. arrival, that walk is the whole story. The fare is still the cheapest of the door-to-door options — it is the twenty minutes of dragging luggage along an access road that decides whether it is worth it.",
            },
            {
              tipo: "p",
              texto:
                "This is also a live legal dispute: the platforms have fought it in court repeatedly and the enforcement has come and gone. Check the current situation before you fly rather than trusting any article, this one included.",
            },
          ],
        },
        {
          id: "metro",
          h2: "The Metro — when it genuinely works",
          bloques: [
            {
              tipo: "p",
              texto:
                "Line 5 has a station called Terminal Aérea, a short walk from Terminal 1. A ride costs about $5 MXN, which is roughly fifty times less than any other option on this page, and in heavy traffic it can be faster than a car.",
            },
            {
              tipo: "p",
              texto:
                "The catch is luggage. The Metro is genuinely crowded, there are no lifts at many stations, and large suitcases are discouraged outright. If you are arriving with a carry-on and nothing else, in daylight, it is a perfectly sensible way into the city. With checked bags it is not.",
            },
          ],
        },
        {
          id: "private-driver",
          h2: "Booking a driver in advance",
          bloques: [
            {
              tipo: "p",
              texto:
                "The fourth option is to arrange the car before you fly. Someone is waiting in the arrivals hall with your name on a sign, the price is agreed before you land, and if the flight is delayed the driver is still there.",
            },
            {
              tipo: "p",
              texto:
                "It costs more than the other three, and what the difference buys is specific: the plane is tracked, so a delay moves the pickup instead of losing it; the wait is absorbed when immigration takes an hour longer than it should; the price is agreed in advance and a queue cannot change it; and there is nothing to negotiate in a language you may not speak after eleven hours in the air.",
            },
            {
              tipo: "p",
              texto:
                "It earns its price in specific situations, and they are more common than people expect: arriving after dark, travelling with children or a lot of luggage, a group of four or more where the cost per person stops being the point, a first visit where you would rather not improvise, or any trip where being late is expensive. If none of those apply to you, the options above will do the job.",
            },
          ],
        },
        {
          id: "watch-out",
          h2: "Three things worth knowing before you land",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Terminal 1 and Terminal 2 are separate buildings and you cannot walk between them. If you booked a connection or someone is meeting you, confirm the terminal first.",
                "Mexico City has a second airport, Felipe Ángeles (AIFA), about 50 km north. It is not the same place as AICM, and ending up at the wrong one is an expensive mistake.",
                "ATMs inside the terminal give you pesos at a far better rate than the currency exchange desks. Take out enough for a taxi before you leave the building.",
              ],
            },
          ],
        },
      ],
      faqs: [
        [
          "Is it safe to take a taxi from Mexico City airport?",
          "Yes, if you use an authorized taxi bought at a counter inside the terminal. That is the system the airport operates and it is the normal way to leave. What you should not do is accept a ride from someone who approaches you in the hall before you reach a counter or an official rank.",
        ],
        [
          "Can I still order an Uber at Mexico City airport?",
          "The app works, but since 2026 the pickup is outside the airport perimeter, not at the terminal door. Expect to walk 500 metres to over a kilometre with your luggage. The rule has been contested in court more than once, so check the current situation before you travel.",
        ],
        [
          "How long does it take to get from AICM to the city centre?",
          "Usually 30 to 60 minutes depending on the area and the traffic. Centro Histórico is the closest of the common destinations; Polanco and Santa Fe take longer, and Santa Fe in rush hour can take well over an hour.",
        ],
        [
          "Should I pay in pesos or dollars?",
          "Pesos. Paying in dollars at the airport means accepting whatever exchange rate the seller chooses, and it is always worse than the ATM. Withdraw pesos inside the terminal before you leave.",
        ],
        [
          "Do I need to book a driver in advance?",
          "Not for a simple daytime arrival — the authorized taxi counter handles that. Book ahead when the arrival is not simple: a night landing, a group, a lot of luggage, a first visit, or anything scheduled soon after you land. What you are buying is a fixed price, someone waiting in arrivals and no queue.",
        ],
      ],
      cta: {
        titulo: "If a fixed price and someone waiting is what you want",
        copy: "We track the flight, meet you inside arrivals with a name sign, and the price you see is the price you pay — including VAT, tolls and fuel. Get a quote in under a minute.",
        boton: "Get a quote",
      },
      relacionadas: [
        { page: "guideTerminals", label: "Terminal 1 or Terminal 2? How to tell, and how to move between them" },
        { page: "airport", label: "Airport transfers: routes and fixed prices" },
        { page: "rates", label: "All rates" },
      ],
    },

    es: {
      kicker: "Guía de aeropuerto",
      title: "Cómo salir del aeropuerto de la CDMX hacia la ciudad",
      h1: "Cómo llegar del aeropuerto de la CDMX a la ciudad",
      description:
        "Las cuatro formas de salir del AICM comparadas: taxi autorizado, Uber y DiDi, metro y chofer reservado. Lo que cuesta cada una, cuánto tarda y el cambio de 2026 que casi ninguna guía ha actualizado.",
      intro:
        "Hay cuatro formas realistas de salir del Aeropuerto Internacional de la Ciudad de México. Una de ellas cambió en 2026 y la mayoría de las guías no se ha enterado, así que mucha gente aterriza esperando pedir un coche en la puerta y se encuentra con que no puede. Esto es lo que cuesta cada opción, dónde se toma y cuál le conviene a quién.",
      revisado: "Datos revisados: octubre de 2026",
      indiceTitulo: "En esta página",
      datos: [
        { valor: "4", etiqueta: "formas de salir" },
        { valor: "30–60", etiqueta: "minutos a casi toda la ciudad" },
        { valor: "2026", etiqueta: "cambiaron las reglas de las apps" },
      ],
      secciones: [
        {
          id: "short-answer",
          h2: "La respuesta corta",
          bloques: [
            {
              tipo: "tabla",
              encabezados: ["Opción", "Costo típico", "Dónde se toma", "Para quién"],
              filas: [
                ["Taxi autorizado", "$260–450 MXN", "Un mostrador dentro de la terminal", "Llegar sin plan"],
                [
                  "Uber / DiDi",
                  "$150–300 MXN",
                  "Fuera del perímetro: entre 500 m y 1.2 km a pie",
                  "Poco equipaje y sin prisa",
                ],
                ["Metro", "$5 MXN", "Estación Terminal Aérea, Línea 5", "Casi sin equipaje y de día"],
                [
                  "Chofer reservado",
                  "Cerrado, cotizado antes de volar",
                  "Te recibe dentro, en llegadas",
                  "Vuelos de noche, grupos, equipaje, agendas apretadas",
                ],
              ],
            },
            {
              tipo: "p",
              texto:
                "Cuál te conviene depende de una pregunta: cuánto importa una llegada sin fricción en este viaje concreto. Si viajas ligero, de día y no tienes nada agendado, el mostrador de taxi autorizado dentro de la terminal funciona sin preparar nada. Si aterrizas de noche, con equipaje, con familia o con algo a lo que llegar, dejar el coche arreglado antes de volar te quita todas las variables de golpe.",
            },
          ],
        },
        {
          id: "authorized-taxis",
          h2: "El taxi autorizado y cómo funciona de verdad",
          bloques: [
            {
              tipo: "p",
              texto:
                "No es como parar un taxi en la calle. Primero compras el viaje en un mostrador señalizado dentro de la terminal y pagas una tarifa fija por zona, no un taxímetro. Te dan un boleto, sales al sitio de taxis y se lo entregas al chofer.",
            },
            {
              tipo: "p",
              texto:
                "El precio depende de la zona a la que vas, no del tráfico, así que un día malo te cuesta tiempo pero no dinero. Como referencia: al Centro Histórico ronda los $260–320 MXN, a la Roma y la Condesa unos $300–380, y a Polanco unos $380–450. Dile al mostrador la colonia, no la calle: lo que tarifican son las zonas.",
            },
            {
              tipo: "nota",
              texto:
                "Paga en el mostrador, nunca a alguien que se te acerque en el pasillo. Si una persona te ofrece viaje antes de que llegues a un mostrador o a un sitio oficial, sigue de largo. Es la forma más común en que a un visitante le cobran de más.",
            },
            {
              tipo: "p",
              texto:
                "La desventaja es la fila en el sitio de taxis, y en las horas pico —la noche, cuando aterrizan juntos los vuelos largos— esa fila es real.",
            },
          ],
        },
        {
          id: "uber-didi",
          h2: "Qué cambió con Uber y DiDi",
          bloques: [
            {
              tipo: "p",
              texto:
                "Aquí es donde casi todas las guías se equivocan. La Suprema Corte resolvió en noviembre de 2025 que las aplicaciones de transporte no están autorizadas para operar dentro de los aeropuertos del país, y desde marzo de 2026 la regla se aplica en el AICM con presencia de la Guardia Nacional en los accesos.",
            },
            {
              tipo: "p",
              texto:
                "En la práctica no significa que las apps dejen de funcionar. Significa que el punto de encuentro se movió fuera del perímetro: pides el coche y caminas a encontrarlo, entre 500 y 900 metros desde la Terminal 1 y entre 500 metros y 1.2 kilómetros desde la Terminal 2, por vialidades del aeropuerto y no por un andador peatonal.",
            },
            {
              tipo: "nota",
              texto:
                "Con dos maletas, un niño o un vuelo que llega a la una de la mañana, esa caminata es toda la historia. La tarifa sigue siendo la más barata de las opciones puerta a puerta; lo que decide es si quieres arrastrar el equipaje veinte minutos por una vialidad.",
            },
            {
              tipo: "p",
              texto:
                "Además es un asunto todavía en litigio: las plataformas lo han peleado en tribunales varias veces y la aplicación de la regla ha ido y venido. Confirma cómo está antes de volar en lugar de fiarte de cualquier artículo, este incluido.",
            },
          ],
        },
        {
          id: "metro",
          h2: "El metro, y cuándo sí conviene",
          bloques: [
            {
              tipo: "p",
              texto:
                "La Línea 5 tiene la estación Terminal Aérea, a poca distancia a pie de la Terminal 1. El viaje cuesta unos $5 MXN —como cincuenta veces menos que cualquier otra opción de esta página— y con tráfico pesado puede ser más rápido que un coche.",
            },
            {
              tipo: "p",
              texto:
                "El problema es el equipaje. El metro va lleno de verdad, muchas estaciones no tienen elevador y las maletas grandes están desaconsejadas. Si llegas con una maleta de mano y nada más, de día, es una forma perfectamente razonable de entrar a la ciudad. Con equipaje documentado, no.",
            },
          ],
        },
        {
          id: "private-driver",
          h2: "Reservar un chofer por adelantado",
          bloques: [
            {
              tipo: "p",
              texto:
                "La cuarta opción es dejar el coche arreglado antes de volar. Alguien te espera en la sala de llegadas con tu nombre en un letrero, el precio queda cerrado antes de que aterrices y, si el vuelo se retrasa, el chofer sigue ahí.",
            },
            {
              tipo: "p",
              texto:
                "Cuesta más que las otras tres, y lo que compra esa diferencia es concreto: se monitorea el vuelo, así que un retraso mueve la recogida en lugar de perderla; se absorbe la espera cuando migración tarda una hora de más; el precio queda cerrado de antemano y ninguna fila lo mueve; y no hay nada que negociar en un idioma que quizá no hablas después de once horas de vuelo.",
            },
            {
              tipo: "p",
              texto:
                "Se gana su precio en casos concretos, y son más comunes de lo que la gente cree: llegar de noche, viajar con niños o con mucho equipaje, un grupo de cuatro o más donde el costo por persona deja de ser el punto, una primera visita en la que prefieres no improvisar, o cualquier viaje en el que llegar tarde sale caro. Si no estás en ninguno de esos casos, con las opciones de arriba resuelves.",
            },
          ],
        },
        {
          id: "watch-out",
          h2: "Tres cosas que conviene saber antes de aterrizar",
          bloques: [
            {
              tipo: "lista",
              items: [
                "La Terminal 1 y la Terminal 2 son edificios separados y no se puede caminar de una a otra. Si tienes conexión o alguien te recoge, confirma primero la terminal.",
                "La Ciudad de México tiene un segundo aeropuerto, el Felipe Ángeles (AIFA), a unos 50 km al norte. No es el mismo sitio que el AICM, y equivocarse de aeropuerto sale caro.",
                "Los cajeros de dentro de la terminal te dan pesos a mucho mejor tipo de cambio que las casas de cambio. Saca lo del taxi antes de salir del edificio.",
              ],
            },
          ],
        },
      ],
      faqs: [
        [
          "¿Es seguro tomar un taxi en el aeropuerto de la CDMX?",
          "Sí, si usas un taxi autorizado comprado en un mostrador dentro de la terminal. Ése es el sistema que opera el aeropuerto y es la forma normal de salir. Lo que no debes hacer es aceptar un viaje de alguien que se te acerque en el pasillo antes de llegar a un mostrador o a un sitio oficial.",
        ],
        [
          "¿Todavía puedo pedir un Uber en el aeropuerto?",
          "La aplicación funciona, pero desde 2026 el punto de encuentro está fuera del perímetro del aeropuerto, no en la puerta de la terminal. Cuenta con caminar entre 500 metros y más de un kilómetro con tu equipaje. La regla se ha peleado en tribunales más de una vez, así que confirma cómo está antes de viajar.",
        ],
        [
          "¿Cuánto se tarda del AICM al centro?",
          "Normalmente de 30 a 60 minutos según la zona y el tráfico. El Centro Histórico es el más cercano de los destinos comunes; Polanco y Santa Fe tardan más, y Santa Fe en hora pico puede pasar bastante de la hora.",
        ],
        [
          "¿Pago en pesos o en dólares?",
          "En pesos. Pagar en dólares en el aeropuerto es aceptar el tipo de cambio que elija quien cobra, y siempre es peor que el del cajero. Saca pesos dentro de la terminal antes de salir.",
        ],
        [
          "¿Hace falta reservar un chofer con anticipación?",
          "Para una llegada sencilla de día, no: el mostrador de taxi autorizado lo resuelve. Reserva antes cuando la llegada no sea sencilla: vuelo de noche, grupo, mucho equipaje, primera visita, o algo agendado poco después de aterrizar. Lo que compras es precio cerrado, alguien esperándote en llegadas y no hacer fila.",
        ],
      ],
      cta: {
        titulo: "Si lo que quieres es precio cerrado y alguien esperándote",
        copy: "Monitoreamos el vuelo, te recibimos dentro de llegadas con un letrero con tu nombre, y el precio que ves es el que pagas: IVA, casetas y combustible incluidos. Cotiza en menos de un minuto.",
        boton: "Cotizar",
      },
      relacionadas: [
        { page: "guideTerminals", label: "¿Terminal 1 o Terminal 2? Cómo saberlo y cómo cambiar de una a otra" },
        { page: "airport", label: "Traslados de aeropuerto: rutas y precios fijos" },
        { page: "rates", label: "Todas las tarifas" },
      ],
    },
  },
};
