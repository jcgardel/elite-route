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
 * Los kilómetros y los minutos son los mismos que ya publicaba /tarifas: no
 * hay dos fuentes de verdad, y el precio de cada página lo calcula
 * `calculatePrice` en el momento, igual que en el resto del sitio.
 *
 * NADA de lo que se afirma aquí sobre una zona es inventado: son hechos
 * generales de la ciudad —dónde se concentran las oficinas, qué tan lejos
 * está cada aeropuerto— y todo lo que promete el servicio (precio fijo,
 * espera incluida, 6 horas de anticipación) ya lo prometen los términos.
 */
export type RouteKey =
  | "polanco"
  | "santafe"
  | "centro"
  | "satelite"
  | "aifa"
  | "toluca";

export const ROUTE_KEYS: readonly RouteKey[] = [
  "polanco",
  "santafe",
  "centro",
  "satelite",
  "aifa",
  "toluca",
];

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
  /** Distancia y duración estimadas. Las mismas que publica /tarifas. */
  km: number;
  minutes: number;
  es: Copy;
  en: Copy;
};

/** Lo que se repite en todas las fichas y no vale la pena escribir seis veces. */
const ESPERA_ES: readonly [string, string] = [
  "¿El chofer me espera si mi vuelo se retrasa?",
  "Sí, y sin costo. La tarifa de salida desde aeropuerto ya incluye el estacionamiento y el tiempo de espera. Danos tu número de vuelo al confirmar y lo monitoreamos.",
];
const ESPERA_EN: readonly [string, string] = [
  "Will the chauffeur wait if my flight is delayed?",
  "Yes, at no extra cost. The airport pickup fare already covers parking and waiting time. Give us your flight number when you confirm and we track it.",
];
const ANTICIPACION_ES: readonly [string, string] = [
  "¿Con cuánta anticipación tengo que reservar?",
  "Seis horas como mínimo. El cotizador no deja elegir un horario más cercano. Si necesitas algo más inmediato, escríbenos por WhatsApp y te decimos si hay unidad disponible.",
];
const ANTICIPACION_EN: readonly [string, string] = [
  "How far ahead do I need to book?",
  "Six hours minimum. The quote form will not let you pick a closer time. For anything more immediate, message us on WhatsApp and we will tell you whether a vehicle is free.",
];

export const ROUTES: Record<RouteKey, Route> = {
  polanco: {
    km: 22,
    minutes: 30,
    es: {
      slug: "aicm-polanco",
      airport: "AICM",
      zone: "Polanco",
      title: "Traslado del AICM a Polanco",
      metaTitle: "Traslado AICM a Polanco | Precio Fijo con IVA | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM a Polanco y Lomas de Chapultepec. 22 km, unos 30 minutos. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      keywords:
        "traslado AICM Polanco, taxi aeropuerto Polanco, chofer privado Polanco, transporte aeropuerto Lomas de Chapultepec, traslado aeropuerto Polanco precio",
      intro:
        "Veintidós kilómetros y unos treinta minutos sin tráfico entre las terminales del AICM y Polanco. El precio es fijo y con IVA incluido: no cambia si el tráfico se pone pesado ni si tu vuelo llega tarde.",
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
        "Private transfer from Mexico City International Airport (MEX/AICM) to Polanco and Lomas de Chapultepec. 22 km, about 30 minutes. Fixed price, VAT included, flight tracked, waiting covered.",
      keywords:
        "Mexico City airport to Polanco, MEX airport transfer Polanco, private driver Polanco, airport transfer Lomas de Chapultepec",
      intro:
        "Twenty-two kilometres and about thirty minutes without traffic between the AICM terminals and Polanco. The price is fixed and includes VAT: it does not change if traffic turns heavy or if your flight lands late.",
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
    km: 35,
    minutes: 50,
    es: {
      slug: "aicm-santa-fe",
      airport: "AICM",
      zone: "Santa Fe",
      title: "Traslado del AICM a Santa Fe",
      metaTitle: "Traslado AICM a Santa Fe | Precio Fijo con IVA | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM a Santa Fe e Interlomas. 35 km, unos 50 minutos. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      keywords:
        "traslado AICM Santa Fe, transporte aeropuerto Santa Fe CDMX, chofer privado Interlomas, traslado aeropuerto Santa Fe precio",
      intro:
        "Treinta y cinco kilómetros de punta a punta de la ciudad: es el traslado más largo dentro de la Ciudad de México y el que más castiga el tráfico. El precio es fijo, así que la hora a la que aterrices no cambia lo que pagas.",
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
        "Private transfer from Mexico City International Airport (MEX/AICM) to Santa Fe and Interlomas. 35 km, about 50 minutes. Fixed price, VAT included, flight tracked.",
      keywords:
        "Mexico City airport to Santa Fe, MEX airport transfer Santa Fe, private driver Interlomas, airport transfer Santa Fe price",
      intro:
        "Thirty-five kilometres from one end of the city to the other: the longest transfer inside Mexico City, and the one traffic punishes hardest. The price is fixed, so the hour you land does not change what you pay.",
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
    km: 15,
    minutes: 25,
    es: {
      slug: "aicm-centro-roma-condesa",
      airport: "AICM",
      zone: "Centro Histórico, Roma y Condesa",
      title: "Traslado del AICM al Centro, Roma y Condesa",
      metaTitle: "Traslado AICM a Centro, Roma y Condesa | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM al Centro Histórico, la Roma y la Condesa. 15 km, unos 25 minutos. Precio fijo con IVA y espera incluida.",
      keywords:
        "traslado AICM Centro Histórico, transporte aeropuerto Roma Condesa, chofer privado Condesa, taxi aeropuerto Centro CDMX",
      intro:
        "Quince kilómetros y unos veinticinco minutos: es la ruta más corta que hacemos desde el AICM. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
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
        "Private transfer from Mexico City International Airport (MEX/AICM) to Centro Histórico, Roma and Condesa. 15 km, about 25 minutes. Fixed price, VAT included.",
      keywords:
        "Mexico City airport to Roma Norte, MEX airport transfer Condesa, airport to downtown Mexico City, private driver Centro Historico",
      intro:
        "Fifteen kilometres and about twenty-five minutes: the shortest route we run from AICM. Fixed price with VAT, flight tracking and waiting included.",
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
    km: 30,
    minutes: 40,
    es: {
      slug: "aicm-satelite-naucalpan",
      airport: "AICM",
      zone: "Satélite y Naucalpan",
      title: "Traslado del AICM a Satélite y Naucalpan",
      metaTitle: "Traslado AICM a Satélite y Naucalpan | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado del aeropuerto AICM a Ciudad Satélite y Naucalpan. 30 km, unos 40 minutos. Precio fijo con IVA, monitoreo de vuelo y espera incluida.",
      keywords:
        "traslado AICM Satélite, transporte aeropuerto Naucalpan, chofer privado Ciudad Satélite, taxi aeropuerto Satélite precio",
      intro:
        "Treinta kilómetros hacia el norponiente, unos cuarenta minutos. Salir del aeropuerto hacia el Estado de México es de los trayectos donde más varía lo que te cobran; aquí el precio se fija antes de que subas.",
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
        "Private transfer from Mexico City International Airport (MEX/AICM) to Ciudad Satélite and Naucalpan. 30 km, about 40 minutes. Fixed price, VAT included.",
      keywords:
        "Mexico City airport to Satelite, MEX airport transfer Naucalpan, private driver Ciudad Satelite, airport transfer Estado de Mexico",
      intro:
        "Thirty kilometres to the north-west, about forty minutes. Leaving the airport for Estado de México is one of the trips where the fare varies most; here it is settled before you get in.",
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
    km: 68,
    minutes: 75,
    es: {
      slug: "aifa-cdmx",
      airport: "AIFA",
      zone: "Ciudad de México",
      title: "Traslado del AIFA a la Ciudad de México",
      metaTitle: "Traslado AIFA a CDMX | Precio Fijo con IVA | Elite Route",
      metaDescription:
        "Traslado privado del Aeropuerto Felipe Ángeles (AIFA) a cualquier zona de la Ciudad de México. 68 km, unos 75 minutos. Precio fijo con IVA y espera incluida.",
      keywords:
        "traslado AIFA CDMX, transporte aeropuerto Felipe Ángeles, chofer privado AIFA, cómo llegar del AIFA a la ciudad, traslado AIFA precio",
      intro:
        "Sesenta y ocho kilómetros y hora y cuarto de camino: el AIFA está lejos de la ciudad, y esa distancia es todo lo que hay que saber para entender por qué conviene llevar el traslado resuelto de antemano.",
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
        "Private transfer from Felipe Ángeles International Airport (NLU/AIFA) to any part of Mexico City. 68 km, about 75 minutes. Fixed price, VAT included, flight tracked.",
      keywords:
        "AIFA to Mexico City, Felipe Angeles airport transfer, NLU airport transfer, how to get from AIFA to Mexico City, AIFA private driver",
      intro:
        "Sixty-eight kilometres and an hour and a quarter on the road: AIFA sits well outside the city, and that distance is all you need to know to see why this transfer is worth arranging in advance.",
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
    km: 80,
    minutes: 85,
    es: {
      slug: "toluca-cdmx",
      airport: "Aeropuerto de Toluca",
      zone: "Ciudad de México",
      title: "Traslado del Aeropuerto de Toluca a la CDMX",
      metaTitle: "Traslado Aeropuerto de Toluca a CDMX | Precio Fijo | Elite Route",
      metaDescription:
        "Traslado privado del Aeropuerto Internacional de Toluca (TLC) a la Ciudad de México. 80 km, unos 85 minutos. Precio fijo con IVA y espera incluida.",
      keywords:
        "traslado Toluca CDMX, transporte aeropuerto Toluca, chofer privado aeropuerto Toluca, TLC a Ciudad de México, traslado Toluca precio",
      intro:
        "Ochenta kilómetros por carretera, alrededor de hora y media. Es el traslado más largo del catálogo y el que más agradece llevarse resuelto desde antes de despegar.",
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
        "Private transfer from Toluca International Airport (TLC) to Mexico City. 80 km, about 85 minutes. Fixed price, VAT included, flight tracked and waiting covered.",
      keywords:
        "Toluca airport to Mexico City, TLC airport transfer, Toluca private driver, Toluca to CDMX transfer price",
      intro:
        "Eighty kilometres of highway, around an hour and a half. The longest transfer we run, and the one that most rewards arranging before you take off.",
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
