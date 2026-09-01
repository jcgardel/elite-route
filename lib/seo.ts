import type { Metadata } from "next";
import { alternates, url, type Lang, type Page } from "./i18n";

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
    en: {
      title: "Elite Route — Private Chauffeur & Executive Transfers in Mexico City",
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
    en: {
      title: "Executive Transfer Rates in Mexico City | Elite Route",
      description:
        "Fixed rates for executive transfers in Mexico City. VAT-included prices for AICM, AIFA and Toluca airports and corporate routes. Sedan, Executive, Minivan and High SUV.",
      keywords:
        "Mexico City airport transfer price, AICM to Polanco rate, executive car service rates Mexico City, private driver cost Mexico City",
    },
    es: {
      title: "Tarifas de Transporte Ejecutivo en CDMX | Elite Route",
      description:
        "Consulta las tarifas fijas de traslado ejecutivo en Ciudad de México. Precios con IVA incluido para aeropuerto AICM, AIFA, Toluca y rutas corporativas. Sedan, Executive, Minivan y High SUV.",
      keywords:
        "tarifa traslado aeropuerto CDMX, precio chofer ejecutivo Ciudad de México, tarifa AICM Polanco, costo traslado AIFA CDMX, transporte ejecutivo precio, tarifa chofer privado CDMX",
    },
  },
  hourly: {
    en: {
      title: "Hourly Chauffeur Service in Mexico City | Elite Route",
      description:
        "Hire a private chauffeur by the hour in Mexico City. From two hours, 20 km included per hour, fixed price with VAT. Car and driver stay with you between stops.",
      keywords:
        "hourly chauffeur Mexico City, hourly car service Mexico City, private driver by the hour CDMX, chauffeur for a day Mexico City, car and driver hire Mexico City",
    },
    es: {
      title: "Chofer por Horas en CDMX | Precio Fijo con IVA | Elite Route",
      description:
        "Contrata un chofer privado por horas en Ciudad de México. Desde dos horas, 20 km incluidos por hora y precio fijo con IVA. El auto y el chofer se quedan contigo entre parada y parada.",
      keywords:
        "chofer por horas CDMX, chofer privado por horas Ciudad de México, auto con chofer por horas, renta de chofer por día CDMX, chofer ejecutivo por horas, disposición de vehículo con chofer",
    },
  },
  corporate: {
    en: {
      title: "Corporate Executive Transportation in Mexico City | Elite Route",
      description:
        "Corporate accounts for companies in Mexico City. Recurring routes, CFDI electronic invoicing, vetted chauffeurs and payment by card or bank transfer.",
      keywords:
        "corporate transportation Mexico City, executive car service for companies, corporate ground transportation CDMX, business travel Mexico City",
    },
    es: {
      title: "Transporte Ejecutivo Corporativo CDMX | Elite Route B2B",
      description:
        "Cuenta corporativa para empresas en CDMX. Rutas recurrentes, factura electrónica CFDI, choferes verificados y pago con tarjeta o transferencia bancaria.",
      keywords:
        "transporte ejecutivo corporativo CDMX, cuenta corporativa traslados, factura CFDI transporte, choferes para empresas Ciudad de México",
    },
  },
  quote: {
    en: {
      title: "Multi-Service Corporate Quote | Elite Route",
      description:
        "Quote up to 20 transfers at once with real-time pricing from the route. VAT breakdown sent straight to accounting, with credit terms available.",
    },
    es: {
      title: "Cotizador Corporativo Multi-Servicio | Elite Route",
      description:
        "Cotiza hasta 20 traslados de una vez con precio en tiempo real según la ruta. El desglose con IVA se envía directo a contabilidad, con términos de crédito disponibles.",
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
export function pageMetadata(lang: Lang, page: Page): Metadata {
  const copy = COPY[page]?.[lang];
  if (!copy) throw new Error(`Sin copy de SEO para ${page}/${lang}`);

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
