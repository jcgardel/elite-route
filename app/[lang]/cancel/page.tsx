import Link from "next/link";
import { notFound } from "next/navigation";
import BrandMark from "../../_components/BrandMark";
import { isLang, LANGS, path } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/** Sin indexar: es el resultado de un pago abandonado, no contenido. */
export const metadata = { robots: { index: false, follow: false } };

const TX = {
  es: {
    kicker: "Pago no completado",
    title: "Tu cotización sigue disponible.",
    copy: "Puedes regresar al cotizador, revisar los detalles del servicio e intentar el pago nuevamente.",
    back: "Volver al cotizador",
  },
  en: {
    kicker: "Payment not completed",
    title: "Your quote is still there.",
    copy: "You can go back to the quote form, review the details of the service and try the payment again.",
    back: "Back to the quote form",
  },
} as const;

export default async function CancelPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = TX[lang];

  return (
    <main className="er-status-page">
      <section className="er-status-panel">
        <BrandMark variant="filete" size={22} className="er-status-logo" />
        <p className="er-status-kicker">{t.kicker}</p>
        <h1>{t.title}</h1>
        <p>{t.copy}</p>
        <Link href={`${path(lang, "home")}#quote`} className="er-status-link">{t.back}</Link>
      </section>
    </main>
  );
}
