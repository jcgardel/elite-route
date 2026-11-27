import { NextResponse, after } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { leerWebhook, marcarLeido, soloDigitos } from "@/lib/whatsapp";
import { atenderMensaje, mensajeNuevo, pausarChat, PAUSA_HUMANO_HORAS } from "@/lib/agente-whatsapp";
import { choferPorTel } from "@/lib/choferes";

/**
 * Webhook de WhatsApp: aquí llegan los mensajes del +52 55 4358 2919.
 *
 * Contesta 200 de inmediato y atiende después (`after`): Meta reintenta si
 * no recibe respuesta rápido, y el agente tarda unos segundos en pensar.
 * Los reintentos se descartan con `wa_mensaje_nuevo` en Supabase.
 *
 * Autenticación, la que haya configurada:
 * - Meta directo: firma `X-Hub-Signature-256` con `WA_APP_SECRET`.
 * - 360dialog: no firma; la URL registrada lleva `?token=WA_WEBHOOK_TOKEN`.
 */
export const maxDuration = 60;

function autorizado(req: Request, crudo: string) {
  const secreto = process.env.WA_APP_SECRET;
  if (secreto) {
    const firma = req.headers.get("x-hub-signature-256") || "";
    const esperada = `sha256=${createHmac("sha256", secreto).update(crudo).digest("hex")}`;
    return firma.length === esperada.length && timingSafeEqual(Buffer.from(firma), Buffer.from(esperada));
  }
  const token = process.env.WA_WEBHOOK_TOKEN;
  return Boolean(token) && new URL(req.url).searchParams.get("token") === token;
}

/** Verificación de Meta al registrar el webhook. */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const token = process.env.WA_WEBHOOK_TOKEN;
  if (token && p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === token) {
    return new NextResponse(p.get("hub.challenge") || "", { status: 200 });
  }
  return new NextResponse(null, { status: 403 });
}

export async function POST(req: Request) {
  const crudo = await req.text();
  if (!autorizado(req, crudo)) return new NextResponse(null, { status: 401 });

  let body: unknown;
  try {
    body = JSON.parse(crudo);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const { mensajes, ecos } = leerWebhook(body);

  after(async () => {
    // El dueño contestó desde el celular: el agente se hace a un lado.
    for (const e of ecos) {
      await pausarChat(soloDigitos(e.para), PAUSA_HUMANO_HORAS).catch((err) =>
        console.error("Agente WhatsApp: pausar chat", err),
      );
    }

    for (const m of mensajes) {
      try {
        if (!(await mensajeNuevo(m.wamid))) continue;
        // Los choferes también escriben a este número: eso lo ve el equipo.
        if (choferPorTel(m.de)) continue;
        await marcarLeido(m.wamid);
        await atenderMensaje(soloDigitos(m.de), m.nombre, m.texto);
      } catch (error) {
        console.error("Agente WhatsApp: no se atendió el mensaje", m.wamid, error);
      }
    }
  });

  return new NextResponse(null, { status: 200 });
}
