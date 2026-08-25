import Link from "next/link";
import BrandMark from "../_components/BrandMark";
import { DEFAULT_LANG, path } from "@/lib/i18n";

/**
 * El 404 de dentro de un idioma.
 *
 * No puede leer los params —Next lo renderiza sin ellos— así que habla el
 * idioma por defecto y ofrece las dos salidas útiles. Es la única página del
 * sitio que no puede saber en qué idioma llegó el visitante.
 */
export default function NotFound() {
  const lang = DEFAULT_LANG;
  return (
    <main className="er-status-page">
      <section className="er-status-panel">
        <BrandMark variant="filete" size={22} className="er-status-logo" />
        <p className="er-status-kicker">Page not found · Página no encontrada</p>
        <h1>404</h1>
        <p>
          The page you are looking for does not exist or has moved.<br />
          La página que buscas no existe o fue movida.
        </p>
        <Link href={path(lang, "home")} className="er-status-link">
          Go to the home page
        </Link>
        <Link href={path("es", "home")} className="er-status-link" style={{ marginTop: 8 }}>
          Ir al inicio en español
        </Link>
      </section>
    </main>
  );
}
