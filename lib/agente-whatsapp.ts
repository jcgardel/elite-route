import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./reservas";
import { CATEGORIES, vehicles, type Category } from "./booking";
import { CAPACIDAD } from "./vehicles";
import { contactoValido, cotizar, crearPago, type Cotizacion } from "./cotizacion";
import { RouteLookupError } from "./distance";
import { MIN_ADVANCE_HOURS } from "./booking-form";
import { HORAS_MAX, HORAS_MIN } from "./rate-tables";
import { REDONDO_HORAS_CORTESIA, REDONDO_HORAS_MAX } from "./service-limits";
import { enviarTexto } from "./whatsapp";

/**
 * EL AGENTE DE WHATSAPP del +52 55 4358 2919.
 *
 * Contesta a los clientes, les da el precio exacto (las mismas reglas que la
 * web, lib/cotizacion.ts) y les manda el link de pago de Stripe. Al pagar, la
 * reserva entra sola a Supabase y a la agenda por el webhook de Stripe, igual
 * que una reserva de la web: el agente nunca escribe reservas a mano.
 *
 * Lo que no puede resolver (cotizaciones especiales, quejas, cambios a una
 * reserva pagada) se lo pasa al dueño por Telegram y se calla en ese chat.
 *
 * HISTORIAL: se guarda sólo el texto de cada turno (cliente / agente), no los
 * bloques de herramientas ni de razonamiento. Así se puede recortar a los
 * últimos mensajes sin tocar nada que la API exija intacto.
 */

const MODELO = "claude-opus-5-5";
const MAX_MENSAJES = 40;
/** Un chat sin actividad en 48 h empieza de cero: es otro viaje. */
const OLVIDAR_TRAS_HORAS = 48;
/** Si el dueño contesta desde el celular, el agente se calla este tiempo. */
export const PAUSA_HUMANO_HORAS = 12;

type Turno = { role: "user" | "assistant"; content: string; at: string };
type Chat = { mensajes: Turno[]; pausado_hasta: string | null; nombre: string | null };

// ── Supabase ─────────────────────────────────────────────────────────────

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const token = process.env.RESERVAS_TOKEN;
  if (!token) throw new Error("falta RESERVAS_TOKEN");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token, ...args }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${fn} ${res.status}: ${await res.text()}`);
  const txt = await res.text();
  return (txt ? JSON.parse(txt) : null) as T;
}

/** false si Meta ya nos había mandado este mensaje (reintento). */
export const mensajeNuevo = (wamid: string) => rpc<boolean>("wa_mensaje_nuevo", { p_wamid: wamid });
export const pausarChat = (tel: string, horas: number) => rpc<null>("wa_chat_pausar", { p_tel: tel, p_horas: horas });
const leerChat = (tel: string) => rpc<Chat>("wa_chat_leer", { p_tel: tel });
const guardarChat = (tel: string, nombre: string, mensajes: Turno[]) =>
  rpc<null>("wa_chat_guardar", { p_tel: tel, p_nombre: nombre, p_mensajes: mensajes });

// ── Aviso al dueño ───────────────────────────────────────────────────────

async function avisarDueno(texto: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("Agente WhatsApp: no hay Telegram configurado para avisar:", texto);
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: texto.slice(0, 4000), disable_web_page_preview: true }),
  });
  if (!res.ok) console.error("Agente WhatsApp: Telegram", res.status, await res.text());
}

// ── Herramientas ─────────────────────────────────────────────────────────

const propiedadesServicio = {
  serviceType: {
    type: "string",
    enum: ["route", "hour", "day"],
    description: "route = traslado de A a B; hour = chofer por horas dentro de CDMX; day = día completo (10 h) dentro de CDMX.",
  },
  origin: { type: "string", description: "Dirección o lugar de recogida, lo más completo posible (colonia, ciudad). Para aeropuerto: 'AICM Terminal 1', 'AIFA', 'Aeropuerto de Toluca'." },
  destination: { type: "string", description: "Destino. Obligatorio en traslados (route); vacío en hour/day." },
  serviceDate: { type: "string", description: "Fecha AAAA-MM-DD." },
  serviceTime: { type: "string", description: "Hora de recogida HH:MM, 24 h, hora de CDMX." },
  rentalHours: { type: "integer", description: `Horas contratadas para hour (${HORAS_MIN}-${HORAS_MAX}). En route usa ${HORAS_MIN}.` },
  pasajeros: { type: "integer", description: "Número de pasajeros, si se sabe." },
  maletas: { type: "integer", description: "Número de maletas, si se sabe." },
  flightNumber: { type: "string", description: "Número de vuelo (ej. AM 123). Obligatorio si recoge o deja en aeropuerto." },
  redondo: { type: "boolean", description: "Viaje redondo foráneo con espera (sólo traslados largos fuera de CDMX)." },
  horasEspera: { type: "integer", description: `Horas de espera en el redondo (${REDONDO_HORAS_CORTESIA}-${REDONDO_HORAS_MAX}).` },
  escalade: { type: "boolean", description: "Garantizar Cadillac Escalade 2027 (+20 %, sólo SUV Lux)." },
  notes: { type: "string", description: "Peticiones especiales: silla de bebé, letrero con nombre, paradas, etc." },
} as const;

const herramientas: Anthropic.Tool[] = [
  {
    name: "cotizar",
    description:
      "Calcula el precio exacto de un servicio con las tarifas oficiales (distancia real, recargos de aeropuerto, tarifas de evento, disponibilidad). Úsala SIEMPRE antes de dar un precio; nunca inventes ni estimes precios. Si no indicas categorías, cotiza todas.",
    input_schema: {
      type: "object",
      properties: {
        ...propiedadesServicio,
        categorias: {
          type: "array",
          items: { type: "string", enum: [...CATEGORIES] },
          description: "Categorías a cotizar. Vacío = todas.",
        },
      },
      required: ["serviceType", "origin", "serviceDate", "serviceTime"],
    },
  },
  {
    name: "crear_link_pago",
    description:
      "Genera el link de pago con tarjeta (Stripe) para reservar. Úsala sólo cuando el cliente ya eligió categoría y confirmó los datos y el precio. Al pagar, la reserva queda confirmada sola.",
    input_schema: {
      type: "object",
      properties: {
        ...propiedadesServicio,
        category: { type: "string", enum: [...CATEGORIES] },
        fullName: { type: "string", description: "Nombre completo del pasajero principal." },
      },
      required: ["serviceType", "origin", "serviceDate", "serviceTime", "category", "fullName"],
    },
  },
  {
    name: "pasar_a_humano",
    description:
      "Pasa la conversación al equipo de Elite Route. Úsala cuando: piden algo que las herramientas no cubren (cotización especial, servicio fuera de CDMX por horas, grupos grandes, factura, pago en efectivo o transferencia), hay una queja, quieren cambiar o cancelar una reserva ya pagada, no hay unidades disponibles, o el cliente pide hablar con una persona. Después de usarla ya no contestes más en este chat.",
    input_schema: {
      type: "object",
      properties: {
        motivo: { type: "string", description: "Qué necesita el cliente, en una o dos frases, para que el equipo no tenga que leer todo." },
        resumen: { type: "string", description: "Datos del servicio que ya se juntaron (origen, destino, fecha, hora, pasajeros, precio cotizado)." },
      },
      required: ["motivo"],
    },
  },
];

type Contexto = { telefono: string; nombreWhatsapp: string; pasoAHumano: boolean; pendientes: Promise<unknown>[] };

function resumenCotizacion(c: Cotizacion) {
  return {
    categoria: c.category,
    nombre: c.vehicle,
    precio_mxn: c.price,
    servicio: c.serviceLabel,
    km: c.km,
    minutos_estimados: c.minutes,
    recoge_en_aeropuerto: c.airportPickup,
    deja_en_aeropuerto: c.airportDropoff,
  };
}

async function ejecutar(nombre: string, input: Record<string, unknown>, ctx: Contexto): Promise<unknown> {
  if (nombre === "cotizar") {
    const pedidas = Array.isArray(input.categorias) && input.categorias.length
      ? (input.categorias as Category[]).filter((c) => CATEGORIES.includes(c))
      : [...CATEGORIES];
    const resultados = [];
    for (const category of pedidas) {
      const r = await cotizar({ ...input, category, lang: "es" });
      resultados.push(r.ok ? resumenCotizacion(r) : { categoria: category, nombre: vehicles[category].name, error: r.error });
    }
    return resultados;
  }

  if (nombre === "crear_link_pago") {
    const fullName = String(input.fullName || "").trim();
    const phone = `+${ctx.telefono}`;
    if (!contactoValido(fullName, phone)) return { error: "Falta el nombre completo del pasajero." };
    const cot = await cotizar({ ...input, lang: "es" });
    if (!cot.ok) return { error: cot.error };
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.eliteroute.mx";
    const session = await crearPago(cot, { fullName, phone }, appUrl, { canal: "whatsapp" }, (p) => ctx.pendientes.push(p));
    return { url: session.url, precio_mxn: cot.price, categoria: cot.vehicle, servicio: cot.serviceLabel };
  }

  if (nombre === "pasar_a_humano") {
    ctx.pasoAHumano = true;
    await avisarDueno(
      [
        "🙋 El agente de WhatsApp pasó un chat",
        `Cliente: ${ctx.nombreWhatsapp || "sin nombre"} · +${ctx.telefono}`,
        `https://wa.me/${ctx.telefono}`,
        "",
        `Motivo: ${String(input.motivo || "")}`,
        input.resumen ? `Datos: ${String(input.resumen)}` : "",
      ].filter(Boolean).join("\n"),
    );
    return { ok: true, nota: "El equipo ya fue avisado. Despídete diciendo que en breve le escribe una persona." };
  }

  return { error: `Herramienta desconocida: ${nombre}` };
}

// ── Instrucciones ────────────────────────────────────────────────────────

const flota = CATEGORIES.map((c) => {
  const v = vehicles[c];
  return `- ${v.name} (${c}): ${v.tag}. Hasta ${CAPACIDAD[c].pax} pasajeros y ${CAPACIDAD[c].maletas} maletas${v.noteEs ? ` (${v.noteEs})` : ""}.`;
}).join("\n");

const SISTEMA = `Eres el asistente de Elite Route, una empresa de transporte ejecutivo con chofer privado en la Ciudad de México (eliteroute.mx). Atiendes por WhatsApp a clientes que quieren cotizar o reservar.

Tu trabajo:
1. Entender qué servicio necesitan: traslado de A a B, chofer por horas o día completo.
2. Juntar los datos que faltan: origen, destino, fecha, hora, pasajeros y maletas, y número de vuelo si es aeropuerto. Pide lo que falte de forma natural, pocas cosas a la vez.
3. Cotizar con la herramienta "cotizar" y presentar las opciones con su precio en pesos (MXN). Recomienda la categoría según pasajeros y maletas.
4. Cuando el cliente elija y confirme, pedir su nombre completo y mandar el link de pago con "crear_link_pago". Explica que al pagar la reserva queda confirmada y le llega la confirmación.

Flota:
${flota}
La Cadillac Escalade 2027 se puede garantizar dentro de SUV Lux por +20 %.

Reglas:
- Nunca des un precio que no salga de la herramienta "cotizar". Si cambia algún dato, vuelve a cotizar.
- Los servicios se reservan con al menos ${MIN_ADVANCE_HOURS} horas de anticipación. Si es para antes, pasa a humano.
- El chofer por horas es de ${HORAS_MIN} a ${HORAS_MAX} horas y sólo dentro de la CDMX.
- Los precios incluyen chofer, combustible y casetas del trayecto; el pago es con tarjeta por el link.
- Si la herramienta devuelve "sin_unidades" para una categoría, ofrece las otras; si ninguna sirve, pasa a humano.
- Si no sabes algo de la empresa (políticas, facturas, formas de pago distintas a tarjeta), no lo inventes: pasa a humano.
- Contesta en el idioma del cliente (español o inglés). Mensajes cortos, cordiales y profesionales, como un buen ejecutivo de atención por WhatsApp. Usa *negritas* de WhatsApp para los precios. Nada de markdown con # ni tablas.
- Interpreta fechas relativas ("mañana", "el viernes") con la fecha actual que se te da, y confírmalas con día y fecha.
- Si el mensaje es claramente de otra cosa (proveedores, spam, choferes buscando trabajo), contesta breve y pasa a humano si parece importante.`;

// ── Turno ────────────────────────────────────────────────────────────────

function ahoraCdmx() {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date());
}

let cliente: Anthropic | null = null;
const claude = () => (cliente ??= new Anthropic());

/**
 * Atiende un mensaje del cliente: lee su historial, deja que Claude use las
 * herramientas hasta tener respuesta, la manda por WhatsApp y guarda el turno.
 */
export async function atenderMensaje(telefono: string, nombreWhatsapp: string, texto: string) {
  const chat = await leerChat(telefono);
  if (chat.pausado_hasta && new Date(chat.pausado_hasta) > new Date()) return;

  // Un chat viejo empieza de cero.
  const ultimo = chat.mensajes.at(-1);
  const historial =
    ultimo && Date.now() - new Date(ultimo.at).getTime() > OLVIDAR_TRAS_HORAS * 3600000 ? [] : chat.mensajes;

  const ahora = new Date().toISOString();
  const turnos: Turno[] = [...historial, { role: "user", content: texto, at: ahora }];

  // La API pide que la conversación empiece con el cliente y alterne; los
  // mensajes seguidos del mismo lado se juntan.
  const recortados = turnos.slice(-MAX_MENSAJES);
  while (recortados.length && recortados[0].role !== "user") recortados.shift();
  const mensajes: Anthropic.Beta.BetaMessageParam[] = [];
  for (const t of recortados) {
    const prev = mensajes.at(-1);
    if (prev && prev.role === t.role && typeof prev.content === "string") prev.content += `\n\n${t.content}`;
    else mensajes.push({ role: t.role, content: t.content });
  }

  const ctx: Contexto = { telefono, nombreWhatsapp, pasoAHumano: false, pendientes: [] };
  const contexto = `Fecha y hora actual en CDMX: ${ahoraCdmx()}. Nombre de WhatsApp del cliente: ${nombreWhatsapp || "desconocido"}. Teléfono: +${telefono}.`;

  // El dato que cambia en cada turno va al final, como mensaje de sistema,
  // para no romper la caché del historial. Se queda en la conversación de
  // este turno: quitarlo entre vueltas contaría como editar el historial.
  mensajes.push({ role: "system", content: contexto });

  let respuesta = "";
  for (let vuelta = 0; vuelta < 8; vuelta++) {
    const res = await claude().beta.messages.create({
      model: MODELO,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      cache_control: { type: "ephemeral" },
      system: SISTEMA,
      tools: herramientas,
      messages: mensajes,
    });

    if (res.stop_reason === "refusal") {
      respuesta = "";
      ctx.pasoAHumano = true;
      await avisarDueno(`El agente de WhatsApp no pudo contestar a +${telefono}. Revisa el chat: https://wa.me/${telefono}`);
      break;
    }

    const textos = res.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text);
    const usos = res.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");

    if (res.stop_reason !== "tool_use" || !usos.length) {
      respuesta = textos.join("\n\n").trim();
      break;
    }

    mensajes.push({ role: "assistant", content: res.content });
    const resultados: Anthropic.Beta.BetaToolResultBlockParam[] = await Promise.all(
      usos.map(async (u) => {
        try {
          const salida = await ejecutar(u.name, (u.input || {}) as Record<string, unknown>, ctx);
          return { type: "tool_result" as const, tool_use_id: u.id, content: JSON.stringify(salida) };
        } catch (error) {
          console.error(`Agente WhatsApp: herramienta ${u.name}`, error);
          const msg = error instanceof RouteLookupError
            ? "No se encontró la ruta. Pide al cliente la dirección más completa (colonia, ciudad) o un lugar conocido."
            : "Falló la herramienta. Intenta de nuevo o pasa a humano.";
          return { type: "tool_result" as const, tool_use_id: u.id, content: msg, is_error: true };
        }
      }),
    );
    mensajes.push({ role: "user", content: resultados });
  }

  if (respuesta) await enviarTexto(telefono, respuesta);
  if (ctx.pasoAHumano) await pausarChat(telefono, 24);
  await Promise.allSettled(ctx.pendientes);

  await guardarChat(
    telefono,
    nombreWhatsapp,
    [...turnos, ...(respuesta ? [{ role: "assistant" as const, content: respuesta, at: new Date().toISOString() }] : [])].slice(-MAX_MENSAJES * 2),
  );
}
