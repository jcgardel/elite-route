/**
 * Las rutas del sitio en los dos idiomas.
 *
 * Antes el idioma vivía en localStorage: la misma URL servía español o inglés
 * según lo que el visitante hubiera tocado. Eso significaba que Google sólo
 * podía indexar una versión, que nadie podía compartir «la página en inglés»
 * y que el idioma de una página dependía del historial del navegador. Ahora
 * cada idioma tiene su propia URL y el idioma es una propiedad de la
 * dirección, no del dispositivo.
 *
 * Los slugs están traducidos a propósito: quien busca en inglés escribe
 * "rates", no "tarifas". Este archivo es el único lugar donde se decide cómo
 * se escribe cada ruta — nada en la interfaz arma una URL a mano.
 */
export type Lang = "en" | "es";

export const LANGS = ["en", "es"] as const;

/** El idioma que se sirve cuando el visitante no expresa preferencia. */
export const DEFAULT_LANG: Lang = "en";

/** El host que responde 200. El ápex manda 307 a www, así que los canonical
 *  y los hreflang tienen que apuntar aquí: un hreflang que redirige es un
 *  hreflang que Google ignora. */
export const SITE = "https://www.eliteroute.mx";

/** Cookie que recuerda el idioma para resolver la raíz del sitio. */
export const LANG_COOKIE = "er-lang";

export type Page =
  | "home"
  | "rates"
  | "hourly"
  | "corporate"
  | "quote"
  | "privacy"
  | "terms"
  | "success"
  | "cancel";

const SLUGS: Record<Page, Record<Lang, string>> = {
  home: { en: "", es: "" },
  rates: { en: "rates", es: "tarifas" },
  // Quien busca esto escribe "chofer por horas cdmx" o "hourly car service
  // Mexico City". Hasta ahora esa búsqueda caía en /tarifas, que habla de
  // todos los servicios a la vez y por eso no gana ninguno.
  hourly: { en: "hourly-chauffeur", es: "chofer-por-horas" },
  corporate: { en: "corporate", es: "b2b" },
  quote: { en: "corporate/quote", es: "b2b/cotizar" },
  privacy: { en: "privacy", es: "privacidad" },
  terms: { en: "terms", es: "terminos" },
  // Las páginas de resultado de pago no son contenido que se busque: no
  // necesitan una palabra distinta por idioma, sólo el prefijo.
  success: { en: "success", es: "success" },
  cancel: { en: "cancel", es: "cancel" },
};

/** La ruta interna de una página. Es lo que va en cada href del sitio. */
export function path(lang: Lang, page: Page): string {
  const slug = SLUGS[page][lang];
  return slug ? `/${lang}/${slug}` : `/${lang}`;
}

/** La misma ruta, absoluta. Para canonical, hreflang, sitemap y Stripe. */
export function url(lang: Lang, page: Page): string {
  return SITE + path(lang, page);
}

export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "es" : "en";
}

export function isLang(value: string): value is Lang {
  return value === "en" || value === "es";
}

/**
 * El bloque de alternates de una página, listo para el `metadata` de Next.
 *
 * `x-default` apunta a la raíz porque es la única URL que negocia idioma: a
 * quien llegue sin preferencia declarada se le manda a la versión que le
 * corresponde en lugar de imponerle una.
 */
export function alternates(lang: Lang, page: Page) {
  return {
    canonical: url(lang, page),
    languages: {
      en: url("en", page),
      "es-MX": url("es", page),
      "x-default": SITE,
    },
  };
}

/**
 * Las rutas que existían antes de que el idioma viviera en la URL, con su
 * destino. Todas eran páginas en español, así que todas caen del lado
 * español: mandar a inglés lo que Google indexó en español rompería la
 * correspondencia entre lo que el buscador tiene guardado y lo que encuentra.
 */
export const LEGACY_ROUTES: ReadonlyArray<{ from: string; to: string }> = [
  { from: "/tarifas", to: path("es", "rates") },
  { from: "/b2b", to: path("es", "corporate") },
  { from: "/b2b/cotizar", to: path("es", "quote") },
  { from: "/privacidad", to: path("es", "privacy") },
  { from: "/terminos", to: path("es", "terms") },
];
