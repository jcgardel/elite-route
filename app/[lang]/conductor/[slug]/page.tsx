import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CHOFERES } from "@/lib/choferes";

/**
 * Tarjeta del conductor para el cliente. El link va en el mensaje de
 * WhatsApp de /equipo: con og:image, WhatsApp muestra la tarjeta completa
 * (foto del chofer, auto y placas) como vista previa del mensaje.
 */
const deSlug = (slug: string) => CHOFERES.find((c) => c.tarjeta === slug);

export function generateStaticParams() {
  return CHOFERES.map((c) => ({ slug: c.tarjeta }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const c = deSlug(slug);
  if (!c) return {};
  const en = lang === "en";
  const titulo = `${en ? "Your chauffeur" : "Su conductor"}: ${c.nombre} · EliteRoute`;
  const detalle = `${c.auto} · ${c.color} · ${en ? "Plates" : "Placas"} ${c.placa}`;
  const imagen = { url: `/choferes/${c.tarjeta}.jpg`, width: 1200, height: 900, alt: titulo };
  return {
    title: titulo,
    description: detalle,
    robots: { index: false, follow: false },
    openGraph: { title: titulo, description: detalle, images: [imagen], type: "website" },
    twitter: { card: "summary_large_image", title: titulo, description: detalle, images: [imagen] },
  };
}

export default async function ConductorPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { slug } = await params;
  const c = deSlug(slug);
  if (!c) notFound();
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#0A0A0A", padding: 16 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/choferes/${c.tarjeta}.jpg`}
        alt={`${c.nombre} · ${c.auto} · ${c.placa}`}
        width={1200}
        height={900}
        style={{ width: "100%", maxWidth: 900, height: "auto", borderRadius: 12 }}
      />
    </main>
  );
}
