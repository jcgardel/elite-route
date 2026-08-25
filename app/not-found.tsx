import Link from "next/link";
import BrandMark from "./_components/BrandMark";
import { fontVars } from "./fonts";
import { path } from "@/lib/i18n";
import "./globals.css";

/**
 * El 404 de una dirección que no existe en ningún idioma.
 *
 * No pasa por ningún layout: el layout raíz vive bajo [lang] y una URL que
 * no empieza por /en o /es nunca llega a él. Next le pone un <html> y un
 * <body> por defecto, así que aquí no se declaran —hacerlo provoca un
 * desajuste de hidratación— y las variables de tipografía se cuelgan de un
 * contenedor: son variables CSS, heredan igual.
 *
 * Sin este archivo saldría la pantalla blanca por defecto de Next, que no se
 * parece en nada al sitio y no lleva a ninguna parte.
 *
 * Habla los dos idiomas a la vez: es la única página que no puede saber de
 * dónde viene el visitante.
 */
export const metadata = {
  title: "404 · Elite Route",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className={fontVars}>
      <main className="er-status-page">
        <section className="er-status-panel">
          <BrandMark variant="filete" size={22} className="er-status-logo" />
          <p className="er-status-kicker">Page not found · Página no encontrada</p>
          <h1>404</h1>
          <p>
            The page you are looking for does not exist or has moved.
            <br />
            La página que buscas no existe o fue movida.
          </p>
          <Link href={path("en", "home")} className="er-status-link">
            Go to the home page
          </Link>
          <Link href={path("es", "home")} className="er-status-link" style={{ marginTop: 8 }}>
            Ir al inicio en español
          </Link>
        </section>
      </main>
    </div>
  );
}
