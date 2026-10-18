import type { Metadata } from "next";
import { alternates, url, type Lang, type Page } from "./i18n";
import { KM_POR_HORA } from "./service-limits";

/**
 * Título, descripción y palabras clave de cada página en cada idioma.
 *
 * Estaban repartidos entre seis archivos de página; ahora viven juntos
 * porque son lo mismo dicho dos veces y así se ve de un golpe si a una
 * versión le falta lo que la otra tiene. Los términos en español no son la
 * traducción de los ingleses: quien busca desde Estados Unidos escribe
 * "Mexico City airport transfer" y quien busca desde aquí escribe "traslado
 * aeropuerto CDMX". Cada idioma persigue las palabras de su propio mercado.
 */
type Copy = { title: string; description: string; keywords?: string };

const COPY: Partial<Record<Page, Record<Lang, Copy>>> = {
  home: {
    /**
     * LA PORTADA ES EL ÚNICO TÍTULO DEL SITIO QUE CONSERVA LA MARCA.
     *
     * En todas las demás se quitó el "| Elite Route" entre el 12 y el 15 de
     * octubre de 2026: Google ya enseña el nombre del sitio en su propio
     * renglón del resultado, y catorce caracteres de marca repetida sólo
     * servían para que se cortara el título. Aquí no, porque ésta es la
     * página del negocio y la primera que ve quien busca "Elite Route" por
     * su nombre.
     *
     * EN INGLÉS HUBO QUE ELEGIR, y el primer intento estaba mal. Medía 68 y
     * el presupuesto son 60: con la marca quedan 46 caracteres y "Private
     * Chauffeur & Executive Transfers in Mexico City" son 53. La primera
     * propuesta fue "Private Chauffeur in Mexico City | Elite Route", y al
     * construirla se vio que es un PREFIJO EXACTO del título de
     * `/en/private-chauffeur-mexico-city`, que dice "Private Chauffeur in
     * Mexico City | Fixed Price | Elite Route". Dos URLs peleando por la
     * misma frase con las mismas palabras, que era justo lo que esa opción
     * decía evitar.
     *
     * Lo que quedó separa los papeles: la portada lidera con "chauffeur" y
     * suma "airport transfers", el servicio que paga las facturas; la página
     * dedicada se queda "private chauffeur" para ella sola, y
     * `/en/mexico-city-airport-transfer` conserva los tres aeropuertos por
     * nombre. Ninguna es prefijo de otra.
     *
     * Se suelta "Executive Transfers", que lo tiene
     * `/en/executive-transportation-mexico-city`. Una portada no debería
     * competir contra sus propias páginas.
     *
     * De paso, el inglés pasa a tener la misma forma que el español: la
     * marca al final tras una barra, en vez de abrir con una raya.
     */
    en: {
      title: "Mexico City Chauffeur & Airport Transfers | Elite Route",
      description:
        "Book a private chauffeur in Mexico City. Airport transfers to AICM, AIFA and Toluca, hourly service and corporate accounts. Fixed price, VAT included.",
      keywords:
        "private chauffeur Mexico City, Mexico City airport transfer, AICM transfer, AIFA transfer, executive car service CDMX, private driver Mexico City, Toluca airport transfer",
    },
    es: {
      title: "Chofer Privado y Traslados Ejecutivos en CDMX | Elite Route",
      description:
        "Reserva un chofer privado en Ciudad de México. Traslados al AICM, AIFA y Toluca, servicio por horas y cuentas corporativas. Precio fijo con IVA incluido.",
      keywords:
        "chofer privado CDMX, traslado aeropuerto Ciudad de México, traslado AICM, traslado AIFA, transporte ejecutivo CDMX, chofer ejecutivo Ciudad de México",
    },
  },
  rates: {
    /**
     * 208 impresiones y CERO clics en los 28 días a septiembre de 2026.
     *
     * El título decía "Executive Transfer Rates", que es como lo diría la
     * empresa y no como lo busca el cliente: en inglés se pregunta "how
     * much", "cost" y "price", y al servicio se le llama "shuttle" o "car
     * service" antes que "transfer". Publicar el precio abierto es la ventaja
     * real frente a quien obliga a pedir cotización, así que conviene que se
     * note ya desde el resultado de búsqueda. Ver la nota larga en
     * `toluca.en` de `lib/routes.ts` para el porqué de "shuttle".
     */
    en: {
      title: "Mexico City Airport Shuttle Prices | Private Car",
      description:
        "How much a private airport shuttle costs in Mexico City. Fixed, VAT-included prices for AICM, AIFA and Toluca, charged per vehicle, not per seat.",
      keywords:
        "how much is a shuttle from Mexico City airport, Mexico City airport transfer price, private airport shuttle cost Mexico City, AICM to Polanco rate, private driver cost Mexico City",
    },
    es: {
      title: "Tarifas de Transporte Ejecutivo en CDMX | Elite Route",
      description:
        "Tarifas fijas de traslado ejecutivo en CDMX. Precios con IVA incluido para AICM, AIFA, Toluca y rutas corporativas. Sedan Lite, Executive, SUV Comfort y SUV Lux.",
      keywords:
        "tarifa traslado aeropuerto CDMX, precio chofer ejecutivo Ciudad de México, tarifa AICM Polanco, costo traslado AIFA CDMX, transporte ejecutivo precio, tarifa chofer privado CDMX",
    },
  },
  /**
   * El título persigue la frase literal que escribe el viajero extranjero —
   * "Teotihuacan day trip from Mexico City"— y no el nombre interno del
   * producto. Lleva "private driver" porque eso es lo que lo distingue de los
   * tours en autobús, que es contra quien compite en esa búsqueda.
   */
  teotihuacan: {
    en: {
      title: "Teotihuacan Day Trip from Mexico City | Private Driver",
      description:
        "Private car and chauffeur for a day at Teotihuacan. No group, no guide, no schedule: the driver waits while you walk the pyramids. Fixed price, VAT included.",
      keywords:
        "Teotihuacan day trip from Mexico City, private driver to Teotihuacan, Teotihuacan without a tour, Teotihuacan private transport, how to get to Teotihuacan from Mexico City",
    },
    es: {
      title: "Viaje a Teotihuacán desde CDMX con Chofer Privado",
      description:
        "Auto y chofer privado para un día en Teotihuacán. Sin grupo, sin guía y sin horarios: el chofer espera mientras recorres las pirámides. Precio fijo con IVA.",
      keywords:
        "viaje a Teotihuacán desde CDMX, chofer privado Teotihuacán, transporte privado a las pirámides, ir a Teotihuacán sin tour, Teotihuacán día completo",
    },
  },
  hourly: {
    en: {
      title: "Hourly Chauffeur Service in Mexico City | Elite Route",
      description:
        `Hire a private chauffeur by the hour in Mexico City. From three hours, ${KM_POR_HORA} km included per hour, fixed price with VAT. Car and driver stay with you between stops.`,
      keywords:
        "hourly chauffeur Mexico City, hourly car service Mexico City, private driver by the hour CDMX, chauffeur for a day Mexico City, car and driver hire Mexico City",
    },
    es: {
      title: "Chofer por Horas en CDMX | Precio Fijo con IVA | Elite Route",
      description:
        `Chofer privado por horas en Ciudad de México. Desde tres horas, ${KM_POR_HORA} km incluidos por hora y precio fijo con IVA. El auto y el chofer se quedan contigo.`,
      keywords:
        "chofer por horas CDMX, chofer privado por horas Ciudad de México, auto con chofer por horas, renta de chofer por día CDMX, chofer ejecutivo por horas, disposición de vehículo con chofer",
    },
  },
  chauffeur: {
    en: {
      title: "Private Chauffeur in Mexico City | Fixed Price | Elite Route",
      description:
        "Hire a private chauffeur in Mexico City: the same driver throughout, an insured and GPS-monitored vehicle, and a fixed price with VAT. By the trip, hour or day.",
      keywords:
        "private chauffeur Mexico City, private driver Mexico City, hire a chauffeur CDMX, personal driver Mexico City, chauffeur service Mexico City, car with driver Mexico City",
    },
    es: {
      title: "Chofer Privado en CDMX | Precio Fijo con IVA | Elite Route",
      description:
        "Chofer privado en Ciudad de México: el mismo conductor todo el servicio, unidad asegurada con GPS y precio fijo con IVA. Por traslado, por horas o por día.",
      keywords:
        "chofer privado CDMX, chofer privado Ciudad de México, contratar chofer privado, chofer particular CDMX, auto con chofer Ciudad de México, servicio de chofer privado",
    },
  },
  executive: {
    en: {
      title: "Executive Transportation in Mexico City | Elite Route",
      description:
        "Executive ground transportation in Mexico City: airport transfers, hourly service, full days and out-of-town routes. Own fleet, fixed price with VAT.",
      keywords:
        "executive transportation Mexico City, executive car service CDMX, executive transfers Mexico City, executive ground transportation Mexico, chauffeured transport CDMX",
    },
    es: {
      title: "Transporte Ejecutivo en CDMX | Los 4 Servicios | Elite Route",
      description:
        "Transporte ejecutivo en Ciudad de México: traslados al aeropuerto, servicio por horas, día completo y rutas foráneas. Flota propia y precio fijo con IVA.",
      keywords:
        "transporte ejecutivo CDMX, transporte ejecutivo Ciudad de México, servicio de transporte ejecutivo, traslados ejecutivos CDMX, transporte privado ejecutivo México",
    },
  },
  airport: {
    en: {
      title: "Mexico City Airport Transfers | AICM, AIFA and Toluca",
      description:
        "Private airport transfers in Mexico City from AICM, AIFA and Toluca. We track your flight, one hour of waiting is included and the price is fixed with VAT.",
      keywords:
        "Mexico City airport transfer, AICM airport transfer, AIFA airport transfer, Toluca airport transfer, airport pickup Mexico City, airport taxi Mexico City, private transfer Mexico City airport",
    },
    es: {
      title: "Traslados de Aeropuerto en CDMX | AICM, AIFA y Toluca",
      description:
        "Traslados privados desde y hacia los aeropuertos AICM, AIFA y Toluca. Monitoreamos tu vuelo, la primera hora de espera va incluida y el precio es fijo con IVA.",
      keywords:
        "traslado aeropuerto CDMX, transporte aeropuerto Ciudad de México, traslado AICM, traslado AIFA, traslado aeropuerto Toluca, taxi aeropuerto CDMX, recoger en el aeropuerto Ciudad de México",
    },
  },
  fleet: {
    en: {
      title: "Our Fleet: Which Vehicle to Choose | Elite Route",
      description:
        "The four vehicle categories at Elite Route in Mexico City: how many passengers and suitcases each really takes, and when not to choose it. Own insured fleet.",
      keywords:
        "executive car with driver Mexico City, SUV with chauffeur Mexico City, van with driver Mexico City, vehicle for 6 passengers with driver, Suburban with chauffeur CDMX, fleet executive transport Mexico City",
    },
    es: {
      title: "Nuestra Flota: Qué Vehículo Elegir | Elite Route",
      description:
        "Las cuatro categorías de vehículo de Elite Route en CDMX: cuántos pasajeros y cuántas maletas entran de verdad, y cuándo no elegirla. Flota propia y asegurada.",
      keywords:
        "auto con chofer CDMX, camioneta con chofer Ciudad de México, van para 6 personas con chofer, Suburban con chofer CDMX, suv ejecutiva con chofer, flota transporte ejecutivo CDMX",
    },
  },
  corporate: {
    en: {
      title: "Corporate Executive Transportation in Mexico City",
      description:
        "Corporate accounts for companies in Mexico City. Recurring routes, CFDI invoicing, insured GPS-monitored vehicles and card payment through Stripe.",
      keywords:
        "corporate transportation Mexico City, executive car service for companies, corporate ground transportation CDMX, business travel Mexico City",
    },
    es: {
      title: "Transporte Ejecutivo Corporativo CDMX | Elite Route B2B",
      description:
        "Cuenta corporativa para empresas en CDMX. Rutas recurrentes, factura electrónica CFDI, unidades aseguradas con GPS y pago con tarjeta vía Stripe.",
      keywords:
        "transporte ejecutivo corporativo CDMX, cuenta corporativa traslados, factura CFDI transporte, choferes para empresas Ciudad de México",
    },
  },
  quote: {
    en: {
      title: "Multi-Service Corporate Quote | Elite Route",
      description:
        "Quote up to 20 transfers at once with real-time pricing from the route. VAT breakdown sent straight to accounting; payment by card through Stripe.",
    },
    es: {
      title: "Cotizador Corporativo Multi-Servicio | Elite Route",
      description:
        "Cotiza hasta 20 traslados de una vez con precio en tiempo real según la ruta. El desglose con IVA se envía directo a contabilidad; pago con tarjeta vía Stripe.",
    },
  },
  privacy: {
    en: {
      title: "Privacy Notice | Elite Route",
      description:
        "How Elite Route collects, uses and protects the personal data of those who book a transfer, and how to exercise your ARCO rights.",
    },
    es: {
      title: "Aviso de Privacidad | Elite Route",
      description:
        "Cómo Elite Route recaba, usa y protege los datos personales de quien reserva un traslado, y cómo ejercer los derechos ARCO.",
    },
  },
  terms: {
    en: {
      title: "Terms of Service | Elite Route",
      description:
        "The terms that govern booking, paying for and taking an Elite Route transfer in Mexico City.",
    },
    es: {
      title: "Términos y Condiciones | Elite Route",
      description:
        "Los términos que rigen la reserva, el pago y la prestación de un traslado de Elite Route en Ciudad de México.",
    },
  },
};

/**
 * El bloque `metadata` completo de una página: título, descripción, tarjeta
 * social, canonical y los hreflang que apuntan a la otra versión.
 *
 * El canonical y los hreflang los pone `alternates()` a partir de la ruta
 * real, así que no hay forma de que una página declare una URL que no existe.
 */
/**
 * La forma de los metadatos de una página, con el título y la descripción que
 * se le den.
 *
 * Está separada de `pageMetadata` porque no todas las páginas sacan su copy de
 * `COPY`: las guías lo llevan dentro de su propio contenido, donde se escribe
 * y se lee junto al texto que describe. Copiarlo aquí habría creado dos sitios
 * donde dice lo mismo, que es como empiezan a decir cosas distintas.
 */
export function metadataFrom(
  lang: Lang,
  page: Page,
  copy: { title: string; description: string; keywords?: string },
): Metadata {
  return {
    title: copy.title,
    description: copy.description,
    ...(copy.keywords ? { keywords: copy.keywords } : {}),
    alternates: alternates(lang, page),
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: url(lang, page),
      siteName: "Elite Route",
      locale: lang === "es" ? "es_MX" : "en_US",
      alternateLocale: lang === "es" ? "en_US" : "es_MX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
  };
}

/**
 * Las migas de pan en JSON-LD.
 *
 * Nueve páginas las necesitaban de golpe —las dos de precios, las dos
 * corporativas, las dos del cotizador y las cuatro legales— y escribir nueve
 * veces la misma lista a mano es pedir que se desalineen. El nombre de cada
 * escalón sale de aquí y la URL de `url()`, así que una miga no puede
 * apuntar a una ruta que no existe.
 *
 * Las veinte páginas que ya traían migas propias se quedan como están: su
 * último escalón es el nombre de la ruta o de la guía, que vive en su propio
 * contenido y no en una tabla de etiquetas.
 */
const MIGA: Partial<Record<Page, Record<Lang, string>>> = {
  home: { en: "Home", es: "Inicio" },
  rates: { en: "Rates", es: "Tarifas" },
  corporate: { en: "Corporate", es: "Corporativo" },
  quote: { en: "Corporate quote", es: "Cotizador corporativo" },
  terms: { en: "Terms of service", es: "Términos y condiciones" },
  privacy: { en: "Privacy notice", es: "Aviso de privacidad" },
};

export function breadcrumbLd(lang: Lang, trail: Page[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((page, i) => {
      const name = MIGA[page]?.[lang];
      if (!name) throw new Error(`Sin etiqueta de miga para ${page}/${lang}`);
      return { "@type": "ListItem", position: i + 1, name, item: url(lang, page) };
    }),
  };
}

export function pageMetadata(lang: Lang, page: Page): Metadata {
  const copy = COPY[page]?.[lang];
  if (!copy) throw new Error(`Sin copy de SEO para ${page}/${lang}`);
  return metadataFrom(lang, page, copy);
}
