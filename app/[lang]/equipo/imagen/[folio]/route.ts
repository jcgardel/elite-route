import { cookies } from "next/headers";
import { COOKIE_EQUIPO, imagenChofer } from "@/lib/reservas";

/** La imagen del servicio para el chofer; sólo con la clave del equipo. */
export async function GET(_req: Request, { params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params;
  const clave = (await cookies()).get(COOKIE_EQUIPO)?.value || "";
  const img = await imagenChofer(clave, folio);
  if (!img) return new Response("No encontrada", { status: 404 });
  return new Response(new Uint8Array(img.datos), {
    headers: {
      "Content-Type": img.tipo,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
