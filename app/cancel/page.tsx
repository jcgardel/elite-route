import Link from "next/link";
import BrandMark from "../BrandMark";
import SetLang from "../SetLang";

export default function CancelPage() {
  return (
    <>
      <SetLang lang="es" />
      <main className="er-status-page">
      <section className="er-status-panel">
        <BrandMark variant="filete" size={22} className="er-status-logo" />
        <p className="er-status-kicker">Pago no completado</p>
        <h1>Tu cotización sigue disponible.</h1>
        <p>
          Puedes regresar al cotizador, revisar los detalles del servicio e intentar el pago nuevamente.
        </p>
        <Link href="/#quote" className="er-status-link">Volver al cotizador</Link>
      </section>
      </main>
    </>
  );
}
