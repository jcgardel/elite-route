import { notFound } from "next/navigation";
import HomeClient from "../_components/HomeClient";
import { pageMetadata } from "@/lib/seo";
import { tablasCotizador } from "@/lib/price-book";
import { isLang, LANGS, path, SITE, type Lang } from "@/lib/i18n";
import { ROUTES, ROUTE_KEYS, routePath } from "@/lib/routes";

export const dynamicParams = false;
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "home");
}

/**
 * Lo que alimenta la ficha de negocio de Google: qué es Elite Route, dónde
 * opera y cómo se le contacta. Sólo datos que el sitio ya sostiene en otras
 * páginas.
 *
 * Sigue sin `aggregateRating`. Ya hay reseñas verificables —5.0 sobre 20 en
 * la ficha de Google—, pero Google no acepta que un negocio publique su
 * propia calificación en su propio sitio. Sus normas de fragmentos de reseña
 * lo llaman "autoservicio" y dejan la página fuera del formato de estrellas,
 * tanto si el dato va en los datos estructurados como si viene de un widget
 * de reseñas incrustado. Las estrellas del buscador salen de la ficha, no de
 * aquí. Lo que sí suma es `sameAs`: le dice a Google que este sitio y esa
 * ficha son el mismo negocio.
 *
 * VA EN LAS DOS PORTADAS desde el 12 de octubre de 2026. Antes iba sólo en la
 * española, con el argumento de que es la ficha de un negocio y no de una
 * página, y que declararla dos veces con el mismo `@id` no aportaba nada. La
 * auditoría de ese día encontró el efecto real: /en no declaraba ningún dato
 * estructurado, y era la única página comercial del sitio en ese estado. Dos
 * URLs alternas emparejadas por hreflang que declaran la misma entidad con el
 * mismo `@id` es el patrón normal, no contenido duplicado: Google las trata
 * como versiones de lo mismo, que es lo que son. El dueño lo aprobó.
 *
 * `logo` llegó el mismo día, por la misma auditoría. Apunta a `/icon.svg`,
 * que es la marca del sitio. Es una marca mínima, no un logotipo trabajado:
 * rellena la propiedad y no hace milagros.
 *
 * Y SIGUE SIN `address`, que es lo que alguien va a querer añadir al mirar
 * esto. Se propuso el 4 de octubre de 2026 —falta la A de las tres señales
 * NAP que Google cruza entre el sitio y la ficha— y el dueño decidió DEJARLO
 * FUERA con el argumento delante.
 *
 * El motivo no es técnico: `LEGAL.domicilio` es la casa del dueño. Ver la
 * nota del pie en HomeClient.tsx, que ya lo había decidido para el texto
 * visible. El aviso de privacidad sí lo publica, porque la ley se lo exige,
 * pero un párrafo legal y un bloque de datos estructurados no pesan igual:
 * esto es legible por máquina y lo copian los rastreadores y los agregadores
 * como el domicilio del negocio. Google Business además permite registrar el
 * domicilio para verificarse y mantenerlo oculto en la ficha pública, que es
 * lo normal en un negocio sin local.
 *
 * Qué se pierde: poco. La dirección pesa como señal de posicionamiento en un
 * negocio CON local. En uno de área de servicio pesan más la zona, la
 * categoría y las reseñas, que es donde está el trabajo pendiente.
 *
 * NO LO AÑADAS SIN PREGUNTARLE.
 */
const NEGOCIO = {
  es: {
    description:
      "Transporte ejecutivo privado en Ciudad de México: traslados al aeropuerto AICM, AIFA y Toluca, servicio por horas y cuentas corporativas.",
    paymentAccepted: "Tarjeta de crédito, tarjeta de débito",
    city: "Ciudad de México",
    airports: [
      "Aeropuerto Internacional Benito Juárez (AICM)",
      "Aeropuerto Internacional Felipe Ángeles (AIFA)",
      "Aeropuerto Internacional de Toluca",
    ],
  },
  en: {
    description:
      "Private executive transportation in Mexico City: airport transfers to AICM, AIFA and Toluca, hourly chauffeur service and corporate accounts.",
    paymentAccepted: "Credit card, debit card",
    city: "Mexico City",
    airports: [
      "Mexico City International Airport (AICM)",
      "Felipe Ángeles International Airport (AIFA)",
      "Toluca International Airport",
    ],
  },
} as const;

const IATA = ["MEX", "NLU", "TLC"] as const;

function fichaDeNegocio(lang: Lang) {
  const n = NEGOCIO[lang];
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE}/#business`,
    name: "Elite Route",
    description: n.description,
    url: SITE,
    telephone: "+52-55-4358-2919",
    email: "business@eliteroute.mx",
    image: `${SITE}/executive.webp`,
    logo: `${SITE}/icon.svg`,
    priceRange: "$$$",
    currenciesAccepted: "MXN",
    paymentAccepted: n.paymentAccepted,
    sameAs: [
      "https://www.google.com/maps/place/?q=place_id:ChIJwYyKBzB3-SYRmnY1eNB8Vf0",
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    areaServed: [
      { "@type": "City", name: n.city },
      ...n.airports.map((name, i) => ({ "@type": "Airport", name, iataCode: IATA[i] })),
    ],
  };
}

/**
 * Las 16 rutas, reducidas a lo único que la portada necesita: un enlace y una
 * etiqueta.
 *
 * POR QUÉ SE RESUELVE AQUÍ Y NO EN EL COMPONENTE DE CLIENTE. `lib/routes.ts`
 * lleva el texto completo de cada ruta en los dos idiomas —títulos, metas,
 * párrafos y preguntas frecuentes—, y todo lo que importa un componente de
 * cliente se descarga en el navegador del visitante. Importarlo allí metería
 * decenas de miles de caracteres de texto en el JavaScript de la portada para
 * pintar dieciséis enlaces. Es el mismo motivo por el que los precios bajan
 * ya calculados.
 *
 * `precioUnico` separa los viajes foráneos de los traslados de aeropuerto,
 * que es como la portada los agrupa.
 */
function enlacesDeRuta(lang: Lang) {
  /**
   * "Mexico City International Airport (AICM)" se queda en "AICM".
   *
   * En inglés ese nombre completo abre ocho de las dieciséis etiquetas, y
   * repetido en una rejilla partía casi todas en dos renglones: cuarenta
   * caracteres idénticos antes de llegar a lo único que distingue una fila de
   * otra, que es el destino. El nombre largo sigue estando donde importa para
   * el buscador, que es la propia página de la ruta.
   */
  const corto = (nombre: string) => nombre.match(/\(([A-Z]{3,5})\)/)?.[1] ?? nombre;

  return ROUTE_KEYS.map((key) => ({
    href: routePath(lang, key),
    label: `${corto(ROUTES[key][lang].airport)} → ${ROUTES[key][lang].zone}`,
    foranea: ROUTES[key].precioUnico === true,
  }));
}

/**
 * Los enlaces a las tres guías, resueltos en el servidor por el mismo motivo
 * que los de ruta: su contenido vive en `lib/guides`, que es `server-only`
 * porque la tabla de excursiones saca sus tiempos de `lib/distances.ts`.
 *
 * La portada enseña el título corto, no el H1 completo de cada guía: en una
 * lista de tres, un titular de doce palabras deja de leerse.
 */
function enlacesDeGuia(lang: Lang) {
  const corto = {
    en: {
      guideAirport: "Getting from the airport into the city",
      guideDayTrips: "Day trips with a driver — what fits in a day",
      guideTerminals: "Terminal 1 or Terminal 2?",
    },
    es: {
      guideAirport: "Cómo salir del aeropuerto hacia la ciudad",
      guideDayTrips: "Excursiones de un día — qué cabe de verdad",
      guideTerminals: "¿Terminal 1 o Terminal 2?",
    },
  } as const;
  return (["guideAirport", "guideDayTrips", "guideTerminals"] as const).map((page) => ({
    href: path(lang, page),
    label: corto[lang][page],
  }));
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fichaDeNegocio(lang)) }}
      />
      {/* El fondo del hero vive dentro del CSS, así que el navegador lo
          descubre tarde: es la imagen más grande de la primera pantalla. */}
      <link rel="preload" as="image" href="/high-suv.webp" fetchPriority="high" />
      {/* Los precios por horas y de día completo se resuelven aquí, en el
          servidor, y bajan ya calculados. El cotizador no puede calcularlos
          por su cuenta sin arrastrar el tarifario al navegador. */}
      <HomeClient
        lang={lang}
        tablas={tablasCotizador()}
        rutas={enlacesDeRuta(lang)}
        guias={enlacesDeGuia(lang)}
      />
    </>
  );
}
