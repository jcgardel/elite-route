import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LANG, isLang, LANG_COOKIE, type Lang } from "@/lib/i18n";

/**
 * La raíz del sitio no tiene contenido propio: manda a /en o a /es.
 *
 * Se decide en este orden y por esta razón:
 *
 *   1. La cookie, si el visitante ya eligió idioma con el selector. Una
 *      elección explícita gana siempre sobre cualquier deducción.
 *   2. El Accept-Language del navegador, que es lo que el visitante configuró
 *      en su sistema. A alguien con el teléfono en español no se le recibe en
 *      inglés.
 *   3. Inglés, que es el idioma por defecto del sitio.
 *
 * La redirección es 307 y no 301 a propósito: el destino depende de quién
 * pregunte, así que no puede quedar cacheada como permanente en el navegador
 * ni en un CDN.
 */
function negotiate(header: string | null): Lang | null {
  if (!header) return null;
  // "es-MX,es;q=0.9,en;q=0.8" → [["es-mx",1],["es",0.9],["en",0.8]]
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split("=")[1]) || 0 : 1 };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLang(base)) return base;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(LANG_COOKIE)?.value;
  const lang =
    (cookie && isLang(cookie) ? cookie : null) ??
    negotiate(request.headers.get("accept-language")) ??
    DEFAULT_LANG;

  const url = request.nextUrl.clone();
  url.pathname = `/${lang}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Sólo la raíz exacta. Todo lo demás —incluidos /en, /es, /api y los
  // archivos estáticos— no pasa por aquí.
  matcher: ["/"],
};
