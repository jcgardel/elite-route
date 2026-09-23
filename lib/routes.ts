import type { Lang } from "./i18n";

/**
 * Las rutas que Elite Route hace todos los días, cada una con su página.
 *
 * Hasta ahora las seis vivían aplastadas dentro de /tarifas, en una tabla.
 * Quien busca "traslado AICM a Polanco precio" —que es como se busca de
 * verdad, con origen, destino y la palabra precio— aterrizaba en una página
 * sobre *todas* las tarifas y competía contra páginas dedicadas a esa ruta
 * exacta. Perdía siempre.
 *
 * Las duraciones son las mismas que ya publicaba /tarifas: no
 * hay dos fuentes de verdad, y el precio de cada página lo calcula
 * `calculatePrice` en el momento, igual que en el resto del sitio.
 *
 * NADA de lo que se afirma aquí sobre una zona es inventado: son hechos
 * generales de la ciudad —dónde se concentran las oficinas, qué tan lejos
 * está cada aeropuerto— y todo lo que promete el servicio (precio fijo,
 * espera incluida, 12 horas de anticipación) ya lo prometen los términos.
 */
export type RouteKey =
  | "polanco"
  | "santafe"
  | "centro"
  | "satelite"
  | "aifa"
  | "toluca"
  | "interlomas"
  | "coyoacan"
  | "delvalle"
  | "puebla"
  | "queretaro"
  | "cuernavaca"
  | "sanmiguel";

export const ROUTE_KEYS: readonly RouteKey[] = [
  "polanco",
  "santafe",
  "centro",
  "satelite",
  "aifa",
  "toluca",
  "interlomas",
  "coyoacan",
  "delvalle",
  "puebla",
  "queretaro",
  "cuernavaca",
  "sanmiguel",
];

/**
 * Las rutas foráneas no salen del aeropuerto: son Ciudad de México ↔ otra
 * ciudad. El recargo cubre estacionamiento y espera en terminal, así que
 * ahí no aplica y la tabla enseña un solo precio en vez de dos columnas.
 */
type Copy = {
  /** Lo que va en la URL. Distinto por idioma, como el resto del sitio. */
  slug: string;
  /** El nombre corto del aeropuerto tal como se dice en ese idioma. */
  airport: string;
  /** El destino, tal como se nombra en ese idioma. */
  zone: string;
  /** H1 de la página. */
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  /** Primer párrafo, el que responde antes de que haya que hacer scroll. */
  intro: string;
  /** Por qué esta ruta y no otra: lo que la hace distinta. */
  about: string;
  faqs: ReadonlyArray<readonly [string, string]>;
};

export type Route = {
  /** Sin recargo de aeropuerto: una sola columna de precio. */
  precioUnico?: true;
  /**
   * La distancia y la duración NO viven aquí: están en lib/distances.ts,
   * que es server-only. Este archivo lo importa TarifasClient —componente
   * de cliente— para armar los enlaces, así que todo lo que contenga viaja
   * al navegador. Hasta el 23 sep 2026 se iban con él los kilómetros de las
   * trece rutas, y con el precio publicado al lado eso entrega la tarifa.
   */
  es: Copy;
  en: Copy;
};

/** Lo que se repite en todas las fichas y no vale la pena escribir seis veces. */
const ESPERA_ES: readonly [string, string] = [
  "¿El chofer me espera si mi vuelo se retrasa?",
  "Sí, y sin costo. La tarifa de salida desde aeropuerto ya incluye el estacionamiento y el tiempo de espera, por largo que sea el retraso. Danos tu número de vuelo al confirmar y lo monitoreamos. Desde que aterrizas tienes 60 minutos de cortesía para encontrarte con el chofer, y hasta 30 más si nos avisas que sigues dentro del aeropuerto.",
];
const ESPERA_EN: readonly [string, string] = [
  "Will the chauffeur wait if my flight is delayed?",
  "Yes, at no extra cost. The airport pickup fare already covers parking and waiting time, however long the delay. Give us your flight number when you confirm and we track it. Once you land you have 60 courtesy minutes to meet your chauffeur, and up to 30 more if you let us know you are still inside the airport.",
];
const ANTICIPACION_ES: readonly [string, string] = [
  "¿Con cuánta anticipación tengo que reservar?",
  "Doce horas como mínimo. El cotizador no deja elegir un horario más cercano. Si necesitas algo más inmediato, escríbenos por WhatsApp y te decimos si hay unidad disponible.",
];
const ANTICIPACION_EN: readonly [string, string] = [
  "How far ahead do I need to book?",
  "Twelve hours minimum. The quote form will not let you pick a closer time. For anything more immediate, message us on WhatsApp and we will tell you whether a vehicle is free.",
];

export const ROUTES: Record<RouteKey, Route> = {
  polanco: {
    es: {
      slug: "aicm-polanco",
      airport: "AICM",
      zone: "Polanco",
      title: "Traslado del AICM a Polanco",
      metaTitle: "Traslado AICM a Polanco | Precio Fijo con IVA | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM a Polanco y Lomas de Chapultepec. Unos 30 minutos. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      keywords:
        "traslado AICM Polanco, taxi aeropuerto Polanco, chofer privado Polanco, transporte aeropuerto Lomas de Chapultepec, traslado aeropuerto Polanco precio",
      intro:
        "Unos treinta minutos sin tráfico entre las terminales del AICM y Polanco. El precio es fijo y con IVA incluido: no cambia si el tráfico se pone pesado ni si tu vuelo llega tarde.",
      about:
        "Polanco y Lomas de Chapultepec concentran buena parte de los hoteles de negocios y las oficinas corporativas de la ciudad, así que es la ruta que más piden los viajeros que aterrizan en el AICM por trabajo. El tráfico decide el tiempo: a media mañana o a la salida de oficinas los treinta minutos se pueden convertir en cincuenta, y la tarifa no se mueve por eso.",
      faqs: [
        [
          "¿Cuánto tarda el traslado del AICM a Polanco?",
          "Unos 30 minutos sin tráfico. En hora pico puede llegar a 50. El precio es el mismo en los dos casos: no se cobra el tiempo detenido.",
        ],
        ESPERA_ES,
        [
          "¿Recogen en Terminal 1 y en Terminal 2?",
          "En las dos. Al confirmar la reserva nos dices la terminal y coordinamos el punto de encuentro por WhatsApp.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-airport-polanco",
      airport: "Mexico City International Airport (AICM)",
      zone: "Polanco",
      title: "Airport transfer to Polanco",
      metaTitle: "Mexico City Airport to Polanco Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private transfer from Mexico City International Airport (MEX/AICM) to Polanco and Lomas de Chapultepec. About 30 minutes. Fixed price, VAT included, flight tracked, waiting covered.",
      keywords:
        "Mexico City airport to Polanco, MEX airport transfer Polanco, private driver Polanco, airport transfer Lomas de Chapultepec",
      intro:
        "About thirty minutes without traffic between the AICM terminals and Polanco. The price is fixed and includes VAT: it does not change if traffic turns heavy or if your flight lands late.",
      about:
        "Polanco and Lomas de Chapultepec hold much of the city's business hotels and corporate offices, which makes this the route most often requested by travellers landing at AICM for work. Traffic decides the time: mid-morning or at the end of the working day the thirty minutes can stretch to fifty, and the fare does not move for it.",
      faqs: [
        [
          "How long does the airport to Polanco transfer take?",
          "About 30 minutes without traffic. At rush hour it can reach 50. The price is the same either way — time spent standing still is not charged.",
        ],
        ESPERA_EN,
        [
          "Do you pick up at both Terminal 1 and Terminal 2?",
          "Both. When you confirm the booking you tell us the terminal, and we agree the meeting point over WhatsApp.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  santafe: {
    es: {
      slug: "aicm-santa-fe",
      airport: "AICM",
      zone: "Santa Fe",
      title: "Traslado del AICM a Santa Fe",
      metaTitle: "Traslado AICM a Santa Fe | Precio Fijo con IVA | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM a Santa Fe e Interlomas. Unos 50 minutos. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      keywords:
        "traslado AICM Santa Fe, transporte aeropuerto Santa Fe CDMX, chofer privado Interlomas, traslado aeropuerto Santa Fe precio",
      intro:
        "De punta a punta de la ciudad: es el traslado más largo dentro de la Ciudad de México y el que más castiga el tráfico. El precio es fijo, así que la hora a la que aterrices no cambia lo que pagas.",
      about:
        "Santa Fe es el distrito corporativo del poniente, y llegar ahí desde el AICM significa cruzar la ciudad entera. Es justo la ruta donde un taxi con taxímetro se vuelve impredecible: cincuenta minutos en un buen día, mucho más si se atraviesa la hora pico. Aquí el precio fijo no es un detalle de mercadotecnia, es la diferencia entre saber y no saber cuánto vas a pagar.",
      faqs: [
        [
          "¿Cuánto tarda el traslado del AICM a Santa Fe?",
          "Unos 50 minutos sin tráfico. En hora pico puede pasar de una hora y media. La tarifa no cambia por eso.",
        ],
        ESPERA_ES,
        [
          "¿También hacen Interlomas y Bosques de las Lomas?",
          "Sí, entran en la misma zona y en la misma tarifa. Si tu destino queda notablemente más lejos, el cotizador lo detecta con la dirección exacta.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-airport-santa-fe",
      airport: "Mexico City International Airport (AICM)",
      zone: "Santa Fe",
      title: "Airport transfer to Santa Fe",
      metaTitle: "Mexico City Airport to Santa Fe Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private transfer from Mexico City International Airport (MEX/AICM) to Santa Fe and Interlomas. About 50 minutes. Fixed price, VAT included, flight tracked.",
      keywords:
        "Mexico City airport to Santa Fe, MEX airport transfer Santa Fe, private driver Interlomas, airport transfer Santa Fe price",
      intro:
        "From one end of the city to the other: the longest transfer inside Mexico City, and the one traffic punishes hardest. The price is fixed, so the hour you land does not change what you pay.",
      about:
        "Santa Fe is the corporate district on the western edge, and reaching it from AICM means crossing the entire city. This is exactly the route where a metered taxi turns unpredictable: fifty minutes on a good day, considerably more through rush hour. Here a fixed price is not a marketing detail — it is the difference between knowing and not knowing what you will pay.",
      faqs: [
        [
          "How long does the airport to Santa Fe transfer take?",
          "About 50 minutes without traffic. At rush hour it can pass an hour and a half. The fare does not change for it.",
        ],
        ESPERA_EN,
        [
          "Do you also cover Interlomas and Bosques de las Lomas?",
          "Yes, they fall in the same zone and the same fare. If your destination sits noticeably further out, the quote form detects it from the exact address.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  centro: {
    es: {
      slug: "aicm-centro-roma-condesa",
      airport: "AICM",
      zone: "Centro Histórico, Roma y Condesa",
      title: "Traslado del AICM al Centro, Roma y Condesa",
      metaTitle: "Traslado AICM a Centro, Roma y Condesa | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM al Centro Histórico, la Roma y la Condesa. Unos 25 minutos. Precio fijo con IVA y espera incluida.",
      keywords:
        "traslado AICM Centro Histórico, transporte aeropuerto Roma Condesa, chofer privado Condesa, taxi aeropuerto Centro CDMX",
      intro:
        "Unos veinticinco minutos: es la ruta más corta que hacemos desde el AICM. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      about:
        "El Centro Histórico, la Roma y la Condesa son la zona a la que llega quien viene por turismo o por una estancia corta, y también la más cercana al aeropuerto. Ser la más corta no la hace la más simple: son calles estrechas, de un solo sentido y con carga y descarga a media mañana. Un chofer que conoce la zona ahorra más tiempo aquí que en una autopista.",
      faqs: [
        [
          "¿Cuánto tarda el traslado del AICM al Centro?",
          "Unos 25 minutos sin tráfico. Es la ruta más corta desde el aeropuerto.",
        ],
        ESPERA_ES,
        [
          "¿Pueden llegar hasta la puerta del hotel en calles cerradas?",
          "En lo que la autoridad permita ese día. En el Centro hay calles peatonales y cierres por eventos; si tu dirección queda dentro de una, el chofer te deja en el punto accesible más cercano y te acompaña con el equipaje.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-airport-downtown",
      airport: "Mexico City International Airport (AICM)",
      zone: "Centro Histórico, Roma and Condesa",
      title: "Airport transfer to Downtown, Roma and Condesa",
      metaTitle: "Mexico City Airport to Downtown, Roma & Condesa | Elite Route",
      metaDescription:
        "Private transfer from Mexico City International Airport (MEX/AICM) to Centro Histórico, Roma and Condesa. About 25 minutes. Fixed price, VAT included.",
      keywords:
        "Mexico City airport to Roma Norte, MEX airport transfer Condesa, airport to downtown Mexico City, private driver Centro Historico",
      intro:
        "About twenty-five minutes: the shortest route we run from AICM. Fixed price with VAT, flight tracking and waiting included.",
      about:
        "Centro Histórico, Roma and Condesa are where visitors on a short stay tend to land, and the closest of our zones to the airport. Shortest does not mean simplest: narrow one-way streets, and loading and unloading through the middle of the morning. A chauffeur who knows these blocks saves more time here than on a motorway.",
      faqs: [
        [
          "How long does the airport to downtown transfer take?",
          "About 25 minutes without traffic. It is the shortest route from the airport.",
        ],
        ESPERA_EN,
        [
          "Can you reach the hotel door on closed streets?",
          "As far as the authorities allow that day. Downtown has pedestrian streets and closures for events; if your address falls inside one, the chauffeur drops you at the nearest accessible point and walks you over with the luggage.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  satelite: {
    es: {
      slug: "aicm-satelite-naucalpan",
      airport: "AICM",
      zone: "Satélite y Naucalpan",
      title: "Traslado del AICM a Satélite y Naucalpan",
      metaTitle: "Traslado AICM a Satélite y Naucalpan | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM a Ciudad Satélite y Naucalpan. Unos 40 minutos. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      keywords:
        "traslado AICM Satélite, transporte aeropuerto Naucalpan, chofer privado Ciudad Satélite, taxi aeropuerto Satélite precio",
      intro:
        "Hacia el norponiente, unos cuarenta minutos. Salir del aeropuerto hacia el Estado de México es de los trayectos donde más varía lo que te cobran; aquí el precio se fija antes de que subas.",
      about:
        "Satélite y Naucalpan quedan ya en el Estado de México, cruzando el Periférico. Es una ruta habitual de trabajo —parques industriales y corporativos del norponiente— y una donde el transporte por aplicación suele encarecerse justo en las horas en que la gente la necesita. La tarifa se calcula por la distancia real de tu dirección, no por la hora del día.",
      faqs: [
        [
          "¿Cuánto tarda el traslado del AICM a Satélite?",
          "Unos 40 minutos sin tráfico. El Periférico en hora pico lo alarga bastante, y el precio no cambia por eso.",
        ],
        ESPERA_ES,
        [
          "¿Cubren todo el norponiente del Estado de México?",
          "Sí. Tlalnepantla, Atizapán y Lomas Verdes entran en el mismo tipo de trayecto. El cotizador calcula la distancia exacta de la dirección que escribas.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-airport-satelite",
      airport: "Mexico City International Airport (AICM)",
      zone: "Satélite and Naucalpan",
      title: "Airport transfer to Satélite and Naucalpan",
      metaTitle: "Mexico City Airport to Satélite & Naucalpan | Elite Route",
      metaDescription:
        "Private transfer from Mexico City International Airport (MEX/AICM) to Ciudad Satélite and Naucalpan. About 40 minutes. Fixed price, VAT included.",
      keywords:
        "Mexico City airport to Satelite, MEX airport transfer Naucalpan, private driver Ciudad Satelite, airport transfer Estado de Mexico",
      intro:
        "To the north-west, about forty minutes. Leaving the airport for Estado de México is one of the trips where the fare varies most; here it is settled before you get in.",
      about:
        "Satélite and Naucalpan sit in Estado de México, across the Periférico ring road. It is a routine work run — the industrial parks and corporate offices of the north-west — and one where ride-hailing tends to surge at exactly the hours people need it. The fare is calculated from the real distance to your address, not from the time of day.",
      faqs: [
        [
          "How long does the airport to Satélite transfer take?",
          "About 40 minutes without traffic. The Periférico at rush hour stretches it considerably, and the price does not change for it.",
        ],
        ESPERA_EN,
        [
          "Do you cover the whole north-west of Estado de México?",
          "Yes. Tlalnepantla, Atizapán and Lomas Verdes fall into the same kind of trip. The quote form works out the exact distance to whatever address you enter.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  aifa: {
    es: {
      slug: "aifa-cdmx",
      airport: "AIFA",
      zone: "Ciudad de México",
      title: "Traslado del AIFA a la Ciudad de México",
      metaTitle: "Traslado AIFA a CDMX | Precio Fijo con IVA | Elite Route",
      metaDescription:
        "Traslado privado del Aeropuerto Felipe Ángeles (AIFA) a cualquier zona de la Ciudad de México. Unos 75 minutos. Precio fijo con IVA y espera incluida.",
      keywords:
        "traslado AIFA CDMX, transporte aeropuerto Felipe Ángeles, chofer privado AIFA, cómo llegar del AIFA a la ciudad, traslado AIFA precio",
      intro:
        "Hora y cuarto de camino: el AIFA está lejos de la ciudad, y esa distancia es todo lo que hay que saber para entender por qué conviene llevar el traslado resuelto de antemano.",
      about:
        "El Aeropuerto Internacional Felipe Ángeles queda en Zumpango, al norte del Estado de México, y la oferta de transporte a la salida es bastante más delgada que en el AICM. Llegar sin nada arreglado a las once de la noche es una mala idea. Reservar antes fija el precio, garantiza la unidad y pone a alguien esperándote con tu nombre en cuanto salgas.",
      faqs: [
        [
          "¿Cuánto tarda el traslado del AIFA a la Ciudad de México?",
          "Alrededor de 75 minutos hasta el centro de la ciudad, según la zona exacta. Es el trayecto más largo que hacemos con regularidad.",
        ],
        ESPERA_ES,
        [
          "¿Llegan a cualquier zona de la CDMX desde el AIFA?",
          "Sí. La tarifa base cubre la ciudad; si tu destino queda al sur o al poniente la distancia crece y el cotizador lo refleja con la dirección exacta.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "aifa-mexico-city",
      airport: "Felipe Ángeles Airport (AIFA)",
      zone: "Mexico City",
      title: "AIFA airport transfer to Mexico City",
      metaTitle: "AIFA Airport to Mexico City Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private transfer from Felipe Ángeles International Airport (NLU/AIFA) to any part of Mexico City. About 75 minutes. Fixed price, VAT included, flight tracked.",
      keywords:
        "AIFA to Mexico City, Felipe Angeles airport transfer, NLU airport transfer, how to get from AIFA to Mexico City, AIFA private driver",
      intro:
        "An hour and a quarter on the road: AIFA sits well outside the city, and that distance is all you need to know to see why this transfer is worth arranging in advance.",
      about:
        "Felipe Ángeles International Airport is in Zumpango, north of Mexico City in Estado de México, and the ground transport waiting outside is considerably thinner than at AICM. Arriving with nothing arranged at eleven at night is a bad idea. Booking ahead fixes the price, guarantees the vehicle, and puts someone holding your name at the door.",
      faqs: [
        [
          "How long does the AIFA to Mexico City transfer take?",
          "Around 75 minutes to the centre of the city, depending on the exact area. It is the longest run we make regularly.",
        ],
        ESPERA_EN,
        [
          "Do you reach any part of Mexico City from AIFA?",
          "Yes. The base fare covers the city; if your destination lies south or west the distance grows and the quote form reflects it from the exact address.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  toluca: {
    es: {
      slug: "toluca-cdmx",
      airport: "Aeropuerto de Toluca",
      zone: "Ciudad de México",
      title: "Traslado del Aeropuerto de Toluca a la CDMX",
      metaTitle: "Traslado Aeropuerto de Toluca a CDMX | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado del Aeropuerto Internacional de Toluca (TLC) a la Ciudad de México. Unos 85 minutos. Precio fijo con IVA y espera incluida.",
      keywords:
        "traslado Toluca CDMX, transporte aeropuerto Toluca, chofer privado aeropuerto Toluca, TLC a Ciudad de México, traslado Toluca precio",
      intro:
        "Alrededor de hora y media por carretera. Es el traslado más largo del catálogo y el que más agradece llevarse resuelto desde antes de despegar.",
      about:
        "El Aeropuerto Internacional de Toluca recibe sobre todo vuelos privados y de bajo costo, y está fuera de la ciudad: se llega por la carretera México-Toluca, cruzando la sierra. No es un trayecto que convenga improvisar de noche ni con equipaje. El precio se fija antes y no cambia por el tráfico de la salida a Constituyentes, que es donde suele perderse el tiempo.",
      faqs: [
        [
          "¿Cuánto tarda el traslado del Aeropuerto de Toluca a la CDMX?",
          "Alrededor de 85 minutos hasta el poniente de la ciudad. Hacia el centro o el sur, más. La tarifa se calcula por la distancia real de tu dirección.",
        ],
        ESPERA_ES,
        [
          "¿Hacen también el traslado de la CDMX al Aeropuerto de Toluca?",
          "Sí, en los dos sentidos. La salida hacia el aeropuerto cuesta menos porque no incluye el cargo de estacionamiento y espera.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "toluca-airport-mexico-city",
      airport: "Toluca Airport",
      zone: "Mexico City",
      title: "Toluca airport transfer to Mexico City",
      metaTitle: "Toluca Airport to Mexico City Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private transfer from Toluca International Airport (TLC) to Mexico City. About 85 minutes. Fixed price, VAT included, flight tracked and waiting covered.",
      keywords:
        "Toluca airport to Mexico City, TLC airport transfer, Toluca private driver, Toluca to CDMX transfer price",
      intro:
        "Around an hour and a half of highway. The longest transfer we run, and the one that most rewards arranging before you take off.",
      about:
        "Toluca International Airport handles mostly private and low-cost flights, and it sits outside the city: the way in is the México–Toluca highway, over the mountains. Not a trip to improvise at night or with luggage. The price is settled beforehand and does not move with the traffic on the Constituyentes approach, which is where the time usually goes.",
      faqs: [
        [
          "How long does the Toluca airport to Mexico City transfer take?",
          "Around 85 minutes to the west of the city. To the centre or the south, longer. The fare is worked out from the real distance to your address.",
        ],
        ESPERA_EN,
        [
          "Do you also run Mexico City to Toluca airport?",
          "Yes, both directions. The run towards the airport costs less because it carries no parking and waiting charge.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },
  interlomas: {
    es: {
      slug: "aicm-interlomas-huixquilucan",
      airport: "AICM",
      zone: "Interlomas",
      title: "Traslado del AICM a Interlomas",
      metaTitle: "Traslado AICM a Interlomas y Huixquilucan | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM a Interlomas, Huixquilucan y Bosques de las Lomas. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      keywords:
        "traslado AICM Interlomas, transporte aeropuerto Huixquilucan, chofer privado Interlomas, traslado aeropuerto Bosques de las Lomas",
      intro:
        "De punta a punta de la ciudad: del oriente, donde está el AICM, al poniente alto. Sin tráfico son unos cincuenta y cinco minutos; en hora pico, bastante más. El precio no cambia por eso.",
      about:
        "Interlomas y Huixquilucan crecieron como zona corporativa y residencial sin dejar de estar lejos del aeropuerto, y el trayecto cruza la ciudad entera por el Periférico o por Reforma. Es de las rutas donde más se nota llevar chofer: son casi dos horas de manejo en hora pico que el pasajero no tiene que hacer.",
      faqs: [
        [
          "¿Cuánto se tarda del AICM a Interlomas?",
          "Unos 55 minutos con tráfico ligero. A media tarde entre semana puede pasar de la hora y media. El precio es el mismo en los dos casos.",
        ],
        ESPERA_ES,
        [
          "¿Llegan también a Bosques de las Lomas y Santa Fe?",
          "Sí. Bosques de las Lomas entra en esta misma tarifa; Santa Fe tiene su propia página porque la distancia es distinta.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-airport-interlomas",
      airport: "Mexico City International Airport (AICM)",
      zone: "Interlomas",
      title: "Airport transfer to Interlomas",
      metaTitle: "Mexico City Airport to Interlomas Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private transfer from Mexico City International Airport (MEX/AICM) to Interlomas, Huixquilucan and Bosques de las Lomas. Fixed price, VAT included.",
      keywords:
        "Mexico City airport to Interlomas, MEX airport transfer Huixquilucan, private driver Interlomas, airport transfer Bosques de las Lomas",
      intro:
        "From one end of the city to the other: from the east, where the AICM sits, to the high western side. Without traffic it is about fifty-five minutes; at rush hour, considerably more. The price does not change for that.",
      about:
        "Interlomas and Huixquilucan grew into a corporate and residential district without getting any closer to the airport, and the drive crosses the whole city along the Periférico or Reforma. It is one of the routes where a chauffeur earns their keep: at rush hour it is close to two hours of driving the passenger does not have to do.",
      faqs: [
        [
          "How long does the AICM to Interlomas transfer take?",
          "About 55 minutes in light traffic. On a weekday afternoon it can pass an hour and a half. The price is the same either way.",
        ],
        ESPERA_EN,
        [
          "Do you also serve Bosques de las Lomas and Santa Fe?",
          "Yes. Bosques de las Lomas falls under this same fare; Santa Fe has its own page because the distance is different.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  coyoacan: {
    es: {
      slug: "aicm-coyoacan-san-angel",
      airport: "AICM",
      zone: "Coyoacán y San Ángel",
      title: "Traslado del AICM a Coyoacán y San Ángel",
      metaTitle: "Traslado AICM a Coyoacán y San Ángel | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM a Coyoacán, San Ángel y Ciudad Universitaria. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      keywords:
        "traslado AICM Coyoacán, transporte aeropuerto San Ángel, chofer privado Coyoacán, traslado aeropuerto Ciudad Universitaria",
      intro:
        "Hacia el sur por Viaducto y Tlalpan, unos treinta y cinco minutos sin tráfico, y el precio incluye IVA y no se mueve si el camino se complica.",
      about:
        "El sur de la ciudad recibe un tipo de viajero distinto: congresos en Ciudad Universitaria, hoteles pequeños en Coyoacán, visitas a los museos de San Ángel. Es una zona de calles estrechas y sentidos cambiantes donde llegar con chofer evita dar vueltas buscando dónde dejar el coche.",
      faqs: [
        [
          "¿Cuánto tarda el traslado del AICM a Coyoacán?",
          "Unos 35 minutos sin tráfico por Viaducto y Calzada de Tlalpan. En hora pico puede llegar a una hora.",
        ],
        ESPERA_ES,
        [
          "¿Cubren Ciudad Universitaria y el Pedregal?",
          "Sí, los dos entran en esta tarifa junto con Coyoacán y San Ángel. Si el destino queda más al sur, el cotizador calcula el precio exacto.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-airport-coyoacan",
      airport: "Mexico City International Airport (AICM)",
      zone: "Coyoacán and San Ángel",
      title: "Airport transfer to Coyoacán and San Ángel",
      metaTitle: "Mexico City Airport to Coyoacán Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private transfer from Mexico City International Airport (MEX/AICM) to Coyoacán, San Ángel and Ciudad Universitaria. Fixed price, VAT included.",
      keywords:
        "Mexico City airport to Coyoacan, MEX airport transfer San Angel, private driver Coyoacan, airport transfer UNAM",
      intro:
        "South along Viaducto and Tlalpan, about thirty-five minutes without traffic, VAT included, and the price does not move if the drive gets complicated.",
      about:
        "The south of the city draws a different traveller: conferences at Ciudad Universitaria, small hotels in Coyoacán, the museums of San Ángel. It is a district of narrow streets and shifting one-ways where arriving with a chauffeur saves circling for somewhere to leave the car.",
      faqs: [
        [
          "How long does the AICM to Coyoacán transfer take?",
          "About 35 minutes without traffic, along Viaducto and Calzada de Tlalpan. At rush hour it can reach an hour.",
        ],
        ESPERA_EN,
        [
          "Do you cover Ciudad Universitaria and Pedregal?",
          "Yes, both fall under this fare along with Coyoacán and San Ángel. For destinations further south, the quote form gives the exact price.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  delvalle: {
    es: {
      slug: "aicm-del-valle-insurgentes-sur",
      airport: "AICM",
      zone: "Del Valle e Insurgentes Sur",
      title: "Traslado del AICM a Del Valle e Insurgentes Sur",
      metaTitle: "Traslado AICM a Del Valle e Insurgentes Sur | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM a Del Valle, Insurgentes Sur y Nápoles. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      keywords:
        "traslado AICM Del Valle, transporte aeropuerto Insurgentes Sur, chofer privado Nápoles, traslado aeropuerto World Trade Center",
      intro:
        "La ruta más corta de las que publicamos: media hora sin tráfico entre las terminales y el corredor de Insurgentes Sur, con precio fijo e IVA incluido.",
      about:
        "Insurgentes Sur concentra oficinas, el World Trade Center y buena parte de las agencias y despachos de la ciudad, así que es una ruta de lunes a viernes y de maleta de mano. Al ser corta, el mínimo de cada categoría pesa más que la distancia: por eso el Sedan cuesta aquí casi lo mismo que en trayectos algo más largos.",
      faqs: [
        [
          "¿Cuánto tarda el traslado del AICM a Del Valle?",
          "Unos 30 minutos sin tráfico por Viaducto. Es de las rutas más rápidas desde el aeropuerto.",
        ],
        ESPERA_ES,
        [
          "¿Entra el World Trade Center y la colonia Nápoles?",
          "Sí. Nápoles, Del Valle y el tramo de Insurgentes Sur hasta Mixcoac comparten esta tarifa.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-airport-del-valle",
      airport: "Mexico City International Airport (AICM)",
      zone: "Del Valle and Insurgentes Sur",
      title: "Airport transfer to Del Valle and Insurgentes Sur",
      metaTitle: "Mexico City Airport to Del Valle Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private transfer from Mexico City International Airport (MEX/AICM) to Del Valle, Insurgentes Sur and Nápoles. Fixed price, VAT included.",
      keywords:
        "Mexico City airport to Del Valle, MEX airport transfer Insurgentes Sur, private driver Napoles, airport transfer World Trade Center",
      intro:
        "The shortest route we publish: half an hour without traffic between the terminals and the Insurgentes Sur corridor, at a fixed price with VAT included.",
      about:
        "Insurgentes Sur holds offices, the World Trade Center and much of the city's agency and professional-services world, which makes this a Monday-to-Friday, carry-on-only route. Being short, each category's minimum weighs more than the distance — which is why the Sedan costs about the same here as on somewhat longer trips.",
      faqs: [
        [
          "How long does the AICM to Del Valle transfer take?",
          "About 30 minutes without traffic, along Viaducto. It is one of the quickest routes from the airport.",
        ],
        ESPERA_EN,
        [
          "Does it include the World Trade Center and Nápoles?",
          "Yes. Nápoles, Del Valle and the stretch of Insurgentes Sur down to Mixcoac share this fare.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  puebla: {
    precioUnico: true,
    es: {
      slug: "cdmx-puebla",
      airport: "Ciudad de México",
      zone: "Puebla",
      title: "Traslado de Ciudad de México a Puebla",
      metaTitle: "Traslado privado CDMX a Puebla | Precio Fijo con IVA | Elite Route",
      metaDescription:
        "Traslado privado de Ciudad de México a Puebla con chofer. Unas dos horas por la autopista. Precio fijo con IVA incluido, sin cargo por esperas razonables.",
      keywords:
        "traslado CDMX Puebla, chofer privado a Puebla, transporte ejecutivo Puebla, viaje privado México Puebla precio",
      intro:
        "Unas dos horas de camino por la México-Puebla, precio cerrado con IVA y sin recargo de aeropuerto: esta ruta no sale de la terminal.",
      about:
        "Puebla está lo bastante cerca para ir y volver en el día y lo bastante lejos para que manejarlo uno mismo arruine la jornada. Es la foránea que más piden las empresas, normalmente para una reunión de mañana con regreso por la tarde. El chofer espera durante la estancia si el servicio se contrata por el día.",
      faqs: [
        [
          "¿Cuánto tarda el viaje de CDMX a Puebla?",
          "Unas dos horas por la autopista en condiciones normales. La salida de la ciudad es lo que más varía según la hora.",
        ],
        [
          "¿El precio incluye casetas?",
          "Sí. El precio que ves es final: incluye IVA, casetas y combustible. No hay nada que liquidar al llegar.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-puebla",
      airport: "Mexico City",
      zone: "Puebla",
      title: "Private transfer from Mexico City to Puebla",
      metaTitle: "Mexico City to Puebla Private Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private chauffeured transfer from Mexico City to Puebla. About two hours by motorway. Fixed price including VAT and tolls.",
      keywords:
        "Mexico City to Puebla transfer, private driver Puebla, executive transport Puebla, chauffeur Mexico City Puebla",
      intro:
        "About two hours on the road along the México-Puebla motorway, at a closed price including VAT, with no airport surcharge — this route does not start at a terminal.",
      about:
        "Puebla is close enough for a same-day return and far enough that driving yourself ruins the working day. It is the intercity route companies ask for most, usually a morning meeting with an afternoon return. The chauffeur waits through the stay when the service is booked by the day.",
      faqs: [
        [
          "How long is the drive from Mexico City to Puebla?",
          "About two hours by motorway under normal conditions. Getting out of the city is the part that varies most with the hour.",
        ],
        [
          "Are tolls included in the price?",
          "Yes. The price you see is final: VAT, tolls and fuel included. There is nothing to settle on arrival.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  queretaro: {
    precioUnico: true,
    es: {
      slug: "cdmx-queretaro",
      airport: "Ciudad de México",
      zone: "Querétaro",
      title: "Traslado de Ciudad de México a Querétaro",
      metaTitle: "Traslado privado CDMX a Querétaro | Precio Fijo con IVA | Elite Route",
      metaDescription:
        "Traslado privado de Ciudad de México a Querétaro con chofer. Unas tres horas. Precio fijo con IVA, casetas incluidas.",
      keywords:
        "traslado CDMX Querétaro, chofer privado Querétaro, transporte ejecutivo Querétaro, viaje privado México Querétaro",
      intro:
        "Cerca de tres horas de camino por la México-Querétaro, con precio cerrado, IVA y casetas incluidas.",
      about:
        "El corredor industrial del Bajío mueve un tipo de viaje muy concreto: directivos que van a planta por el día y vuelven de noche. Tres horas por lado son demasiado para manejar antes de una junta, y el vuelo no siempre compensa por lo que se pierde en el aeropuerto.",
      faqs: [
        [
          "¿Cuánto tarda el viaje de CDMX a Querétaro?",
          "Unas tres horas por la autopista. Es un trayecto parejo salvo la salida de la ciudad.",
        ],
        [
          "¿Conviene contratar el día completo?",
          "Si hay reunión y regreso el mismo día, normalmente sí: el servicio por día deja al chofer disponible durante la estancia en vez de cobrar dos viajes sueltos.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-queretaro",
      airport: "Mexico City",
      zone: "Querétaro",
      title: "Private transfer from Mexico City to Querétaro",
      metaTitle: "Mexico City to Queretaro Private Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private chauffeured transfer from Mexico City to Querétaro. About three hours. Fixed price including VAT and tolls.",
      keywords:
        "Mexico City to Queretaro transfer, private driver Queretaro, executive transport Queretaro, Bajio chauffeur",
      intro:
        "Close to three hours on the road along the México-Querétaro motorway, at a closed price with VAT and tolls included.",
      about:
        "The Bajío industrial corridor generates a very specific kind of trip: directors visiting a plant for the day and returning at night. Three hours each way is too much to drive before a meeting, and flying does not always pay once airport time is counted.",
      faqs: [
        [
          "How long is the drive from Mexico City to Querétaro?",
          "About three hours by motorway. It is a steady run except for getting out of the city.",
        ],
        [
          "Is the full-day service worth it?",
          "For a meeting with a same-day return, usually yes: the day service keeps the chauffeur available throughout the stay instead of charging two separate trips.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  cuernavaca: {
    precioUnico: true,
    es: {
      slug: "cdmx-cuernavaca",
      airport: "Ciudad de México",
      zone: "Cuernavaca",
      title: "Traslado de Ciudad de México a Cuernavaca",
      metaTitle: "Traslado privado CDMX a Cuernavaca | Precio Fijo con IVA | Elite Route",
      metaDescription:
        "Traslado privado de Ciudad de México a Cuernavaca con chofer. Alrededor de hora y media. Precio fijo con IVA y casetas incluidas.",
      keywords:
        "traslado CDMX Cuernavaca, chofer privado Cuernavaca, transporte ejecutivo Morelos, viaje privado México Cuernavaca",
      intro:
        "Alrededor de hora y media por la autopista del sol, con precio cerrado, IVA y casetas incluidas.",
      about:
        "Cuernavaca es la escapada corta de la Ciudad de México y también sede de eventos y bodas de fin de semana. La bajada es rápida y la subida de regreso, los domingos por la tarde, es justo cuando nadie quiere manejar.",
      faqs: [
        [
          "¿Cuánto tarda el viaje de CDMX a Cuernavaca?",
          "Hora y media aproximadamente. Los domingos por la tarde el regreso puede alargarse bastante por el tráfico de la autopista.",
        ],
        [
          "¿Hacen el viaje redondo el mismo día?",
          "Sí. Para ida y vuelta en el día suele salir mejor el servicio por horas, porque el chofer se queda disponible en vez de cobrarse dos traslados.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-cuernavaca",
      airport: "Mexico City",
      zone: "Cuernavaca",
      title: "Private transfer from Mexico City to Cuernavaca",
      metaTitle: "Mexico City to Cuernavaca Private Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private chauffeured transfer from Mexico City to Cuernavaca. Around an hour and a half. Fixed price including VAT and tolls.",
      keywords:
        "Mexico City to Cuernavaca transfer, private driver Cuernavaca, executive transport Morelos, chauffeur Cuernavaca",
      intro:
        "Around an hour and a half along the Autopista del Sol, at a closed price with VAT and tolls included.",
      about:
        "Cuernavaca is Mexico City's short escape and a weekend venue for events and weddings. The drive down is quick; the climb back on a Sunday afternoon is exactly when nobody wants to be at the wheel.",
      faqs: [
        [
          "How long is the drive from Mexico City to Cuernavaca?",
          "About an hour and a half. On Sunday afternoons the return can stretch considerably with motorway traffic.",
        ],
        [
          "Do you do the round trip in one day?",
          "Yes. For a same-day return the hourly service usually works out better, since the chauffeur stays available instead of charging two separate transfers.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

  sanmiguel: {
    precioUnico: true,
    es: {
      slug: "cdmx-san-miguel-de-allende",
      airport: "Ciudad de México",
      zone: "San Miguel de Allende",
      title: "Traslado de Ciudad de México a San Miguel de Allende",
      metaTitle: "Traslado privado CDMX a San Miguel de Allende | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado de Ciudad de México a San Miguel de Allende con chofer. Unas cuatro horas. Precio fijo con IVA y casetas incluidas.",
      keywords:
        "traslado CDMX San Miguel de Allende, chofer privado San Miguel, transporte aeropuerto San Miguel de Allende, viaje privado a San Miguel",
      intro:
        "Cerca de cuatro horas de camino. Precio cerrado, con IVA y casetas incluidas, y sin recargo de aeropuerto.",
      about:
        "San Miguel de Allende recibe sobre todo viajeros que aterrizan en Ciudad de México y no quieren un segundo vuelo ni cuatro horas de autobús. Es la ruta más larga que publicamos, y la que más agradece salir temprano: el tramo final por el Bajío se disfruta con luz.",
      faqs: [
        [
          "¿Cuánto tarda el viaje de CDMX a San Miguel de Allende?",
          "Alrededor de cuatro horas por autopista, con una parada breve si el pasajero la pide.",
        ],
        [
          "¿Recogen directamente en el aeropuerto?",
          "Sí, y es lo más común en esta ruta. Danos el número de vuelo al reservar para monitorear la llegada.",
        ],
        ANTICIPACION_ES,
      ],
    },
    en: {
      slug: "mexico-city-san-miguel-de-allende",
      airport: "Mexico City",
      zone: "San Miguel de Allende",
      title: "Private transfer from Mexico City to San Miguel de Allende",
      metaTitle: "Mexico City to San Miguel de Allende Transfer | Fixed Price | Elite Route",
      metaDescription:
        "Private chauffeured transfer from Mexico City to San Miguel de Allende. About four hours. Fixed price including VAT and tolls.",
      keywords:
        "Mexico City to San Miguel de Allende transfer, private driver San Miguel, airport transfer San Miguel de Allende, chauffeur Bajio",
      intro:
        "Close to four hours on the road. A closed price, VAT and tolls included, with no airport surcharge.",
      about:
        "San Miguel de Allende mostly receives travellers who land in Mexico City and want neither a second flight nor four hours on a coach. It is the longest route we publish, and the one that rewards an early start: the final stretch through the Bajío is better seen in daylight.",
      faqs: [
        [
          "How long is the drive from Mexico City to San Miguel de Allende?",
          "Around four hours by motorway, with a short stop if the passenger asks for one.",
        ],
        [
          "Do you pick up directly at the airport?",
          "Yes, and it is the most common arrangement on this route. Give us the flight number when booking so we can track the arrival.",
        ],
        ANTICIPACION_EN,
      ],
    },
  },

};

/** El slug de una ruta en un idioma. */
export function routeSlug(lang: Lang, key: RouteKey): string {
  return ROUTES[key][lang].slug;
}

/** El segmento que va antes del slug: /es/traslados/… y /en/transfers/… */
export const ROUTE_SEGMENT: Record<Lang, string> = {
  es: "traslados",
  en: "transfers",
};

/** La ruta interna de la página de una ruta. */
export function routePath(lang: Lang, key: RouteKey): string {
  return `/${lang}/${ROUTE_SEGMENT[lang]}/${routeSlug(lang, key)}`;
}

/** De un slug a su ruta, para resolver la página. */
export function routeFromSlug(lang: Lang, slug: string): RouteKey | null {
  return ROUTE_KEYS.find((k) => ROUTES[k][lang].slug === slug) ?? null;
}
