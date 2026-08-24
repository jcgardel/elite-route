import Link from "next/link";
import BrandMark from "./BrandMark";

export default function NotFound() {
  return (
    <main className="er-status-page">
      <section className="er-status-panel">
        <BrandMark variant="filete" size={22} className="er-status-logo" />
        <p className="er-status-kicker">Página no encontrada</p>
        <h1>404</h1>
        <p>
          La página que buscas no existe o fue movida.
          Regresa al inicio para cotizar tu traslado.
        </p>
        <Link href="/" className="er-status-link">
          Ir al inicio
        </Link>
        <Link href="/b2b/cotizar" className="er-status-link" style={{ marginTop: 8 }}>
          Cotizar servicios corporativos
        </Link>
      </section>
    </main>
  );
}
