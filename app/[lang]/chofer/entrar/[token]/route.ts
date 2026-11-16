import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_CHOFER, portalChofer } from "@/lib/portal-chofer";

/**
 * Link personal del chofer: valida el token, lo guarda en una cookie y manda
 * a /chofer. Así el chofer no escribe nada y el link no queda en la barra.
 */
export async function GET(req: Request, { params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang, token } = await params;
  const destino = new URL(`/${lang}/chofer`, req.url);

  if (await portalChofer(token)) {
    (await cookies()).set({
      name: COOKIE_CHOFER,
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    destino.searchParams.set("error", "1");
  }
  return NextResponse.redirect(destino, 303);
}
