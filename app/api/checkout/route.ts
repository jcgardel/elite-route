import { NextResponse, after } from "next/server";
import { getCheckoutLimiter, getIp } from "@/lib/rate-limit";
import { RouteLookupError } from "@/lib/distance";
import { contactoValido, cotizar, crearPago } from "@/lib/cotizacion";

/**
 * Pago del cotizador de la web. Las reglas de precio y disponibilidad viven
 * en lib/cotizacion.ts, compartidas con el agente de WhatsApp.
 */
export async function POST(req: Request) {
  const limiter = getCheckoutLimiter();
  if (limiter) {
    const { success } = await limiter.limit(getIp(req));
    if (!success) {
      return NextResponse.json({ error: "Demasiadas solicitudes, espera un momento" }, { status: 429 });
    }
  }

  try {
    const body = await req.json();
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();

    // Antes de cotizar: la cotización consulta Google Maps.
    if (!contactoValido(fullName, phone)) {
      return NextResponse.json({ error: "Datos de contacto inválidos" }, { status: 400 });
    }

    const cot = await cotizar(body);
    if (!cot.ok) {
      const { ok: _ok, status, ...resto } = cot;
      void _ok;
      return NextResponse.json(resto, { status });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    // Para que el webhook pueda atribuir la conversión en GA4.
    // Ver lib/analytics-server.ts. Se recortan por si llegan raros.
    const extra: Record<string, string> = {
      ...(body.gaClientId ? { gaClientId: String(body.gaClientId).slice(0, 40) } : {}),
      ...(body.gaSessionId ? { gaSessionId: String(body.gaSessionId).slice(0, 20) } : {}),
    };

    const session = await crearPago(cot, { fullName, phone }, appUrl, extra, (p) => after(() => p));
    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Sin distancia confiable no se cobra: mejor pedir que reintente.
    if (error instanceof RouteLookupError) {
      console.error("Checkout route lookup error:", error.status, error.message);
      return NextResponse.json(
        { error: "No pudimos verificar la ruta. Revisa las direcciones e intenta de nuevo." },
        { status: error.status === "NO_KEY" ? 500 : 400 },
      );
    }

    console.error("Stripe checkout error:", error);
    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ error: "Falta configurar STRIPE_SECRET_KEY" }, { status: 500 });
    }
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}
