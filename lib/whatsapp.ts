import "server-only";

/**
 * WHATSAPP CLOUD API, para el agente que contesta el +52 55 4358 2919.
 *
 * El número está en COEXISTENCIA (desde nov 2026): sigue en la app de
 * WhatsApp Business del dueño y, a la vez, en la API. Lo que el dueño
 * contesta desde el celular llega aquí como `smb_message_echoes`, y así el
 * agente sabe cuándo callarse. Ver lib/agente-whatsapp.ts.
 *
 * Dos formas de conectarse, según dónde se dio de alta el número:
 * - 360dialog (`D360_API_KEY`): el proveedor que hizo la conexión con
 *   coexistencia. Mismo formato de mensajes que Meta, otra URL y otra llave.
 * - Meta directo (`WA_META_TOKEN` + `WA_PHONE_NUMBER_ID`).
 *
 * No se reusan WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID a propósito:
 * esas mandan el aviso de pago al dueño (lib/payment-notifications.ts) y
 * configurarlas para el agente haría que el número se escribiera a sí mismo.
 */

function destino(): { url: string; headers: Record<string, string> } | null {
  const d360 = process.env.D360_API_KEY;
  if (d360) {
    return {
      url: "https://waba-v2.360dialog.io/messages",
      headers: { "D360-API-KEY": d360, "Content-Type": "application/json" },
    };
  }
  const token = process.env.WA_META_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;
  if (token && phoneId) {
    return {
      url: `https://graph.facebook.com/v23.0/${phoneId}/messages`,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    };
  }
  return null;
}

export function whatsappConfigurado() {
  return destino() !== null;
}

async function enviar(payload: Record<string, unknown>) {
  const d = destino();
  if (!d) throw new Error("WhatsApp sin configurar: falta D360_API_KEY o WA_META_TOKEN + WA_PHONE_NUMBER_ID");
  const res = await fetch(d.url, {
    method: "POST",
    headers: d.headers,
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", ...payload }),
  });
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ messages?: { id: string }[] }>;
}

/** Sólo dígitos, como los pide la API (5215512345678). */
export function soloDigitos(tel: string) {
  return tel.replace(/[^0-9]/g, "");
}

/** WhatsApp corta en 4096 caracteres; se parte por párrafos. */
function partir(texto: string, limite = 4000) {
  if (texto.length <= limite) return [texto];
  const partes: string[] = [];
  let actual = "";
  for (const p of texto.split("\n\n")) {
    if ((actual + "\n\n" + p).length > limite && actual) {
      partes.push(actual);
      actual = p;
    } else {
      actual = actual ? `${actual}\n\n${p}` : p;
    }
  }
  if (actual) partes.push(actual.slice(0, limite));
  return partes;
}

/** Texto libre. Sólo se puede dentro de las 24 h desde el último mensaje del cliente. */
export async function enviarTexto(to: string, texto: string) {
  for (const parte of partir(texto)) {
    await enviar({ to: soloDigitos(to), type: "text", text: { preview_url: true, body: parte } });
  }
}

/**
 * Plantilla aprobada por Meta: la única forma de escribirle a alguien que no
 * nos ha escrito en las últimas 24 h (los avisos a choferes).
 */
export async function enviarPlantilla(to: string, nombre: string, parametros: string[], idioma = "es_MX") {
  return enviar({
    to: soloDigitos(to),
    type: "template",
    template: {
      name: nombre,
      language: { code: idioma },
      components: parametros.length
        ? [{ type: "body", parameters: parametros.map((text) => ({ type: "text", text: text.slice(0, 1000) })) }]
        : [],
    },
  });
}

/** Palomitas azules + "escribiendo…" mientras el agente piensa. */
export async function marcarLeido(wamid: string) {
  try {
    await enviar({ status: "read", message_id: wamid, typing_indicator: { type: "text" } });
  } catch (error) {
    // Cosmético: si falla, la respuesta llega igual.
    console.error("WhatsApp marcar leído:", error);
  }
}

// ── Webhook ──────────────────────────────────────────────────────────────

export type MensajeEntrante = {
  wamid: string;
  de: string;
  nombre: string;
  texto: string;
};

export type EcoDelDueno = { para: string };

type Cambio = {
  field?: string;
  value?: {
    contacts?: { wa_id?: string; profile?: { name?: string } }[];
    messages?: {
      id: string;
      from: string;
      type: string;
      text?: { body?: string };
      button?: { text?: string };
      interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
      location?: { latitude?: number; longitude?: number; name?: string; address?: string };
      image?: { caption?: string };
      document?: { caption?: string };
    }[];
    message_echoes?: { to?: string }[];
  };
};

/**
 * Saca del aviso de Meta lo que le importa al agente. Lo que no es texto
 * (audio, sticker, foto sin pie) se convierte en una nota para que el agente
 * pida que se lo escriban, en vez de quedarse callado.
 */
export function leerWebhook(body: unknown): { mensajes: MensajeEntrante[]; ecos: EcoDelDueno[] } {
  const mensajes: MensajeEntrante[] = [];
  const ecos: EcoDelDueno[] = [];
  const entries = (body as { entry?: { changes?: Cambio[] }[] })?.entry || [];

  for (const entry of entries) {
    for (const cambio of entry.changes || []) {
      const v = cambio.value || {};
      if (cambio.field === "smb_message_echoes") {
        for (const e of v.message_echoes || []) if (e.to) ecos.push({ para: e.to });
        continue;
      }
      const nombre = v.contacts?.[0]?.profile?.name || "";
      for (const m of v.messages || []) {
        let texto = "";
        switch (m.type) {
          case "text":
            texto = m.text?.body || "";
            break;
          case "button":
            texto = m.button?.text || "";
            break;
          case "interactive":
            texto = m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || "";
            break;
          case "location": {
            const l = m.location || {};
            texto = `[Ubicación compartida] ${[l.name, l.address].filter(Boolean).join(", ")} (${l.latitude}, ${l.longitude})`;
            break;
          }
          case "image":
          case "document":
            texto = `[El cliente mandó ${m.type === "image" ? "una imagen" : "un documento"}]${
              (m.image?.caption || m.document?.caption) ? ` con el texto: ${m.image?.caption || m.document?.caption}` : ""
            }`;
            break;
          case "audio":
            texto = "[El cliente mandó una nota de voz; no se puede escuchar]";
            break;
          default:
            texto = `[El cliente mandó un mensaje de tipo ${m.type}]`;
        }
        mensajes.push({ wamid: m.id, de: m.from, nombre, texto });
      }
    }
  }
  return { mensajes, ecos };
}
