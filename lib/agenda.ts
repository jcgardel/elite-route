import "server-only";
import { Redis } from "@upstash/redis";
import { HORAS_DIA_COMPLETO } from "./service-limits";
import { detectZone, vehicles, type Category } from "./vehicles";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./reservas";

/**
 * LA AGENDA DE UNIDADES: qué categoría está ocupada y cuándo.
 *
 * POR QUÉ EXISTE. SUV Lux es la categoría con flota limitada, y hasta el 21
 * de octubre de 2026 el cotizador vendía el mismo horario tantas veces como
 * alguien lo pidiera. El equipo lo descubría al validar, ya con el cobro
 * hecho, y tocaba reembolsar.
 *
 * LO QUE ESTO NO ES. No es un inventario completo del negocio: sólo ve las
 * reservas que pasan por el cotizador, que son el 31 % de las pagadas. Las
 * que se cotizan a mano por WhatsApp o por convenio NO entran aquí, así que
 * un hueco que esta agenda da por libre puede estar ocupado de verdad.
 *
 * POR ESO EL BLOQUEO MANDA A WHATSAPP EN LUGAR DE CERRAR LA PUERTA. Con la
 * salida a WhatsApp, equivocarse al bloquear ya no cuesta la venta: manda al
 * cliente al canal donde el equipo puede comprobar la disponibilidad real.
 * Y la validación humana de `lib/booking-status.ts` sigue existiendo: esto
 * la adelanta, no la sustituye.
 *
 * CUANDO LAS RESERVAS MANUALES ENTREN AQUÍ —desde un calendario compartido,
 * por ejemplo— esta agenda pasa a ser verdad completa y el bloqueo puede
 * volverse duro. El resto del código no tendría que cambiar: sólo quién
 * llama a `apartar`.
 */

/**
 * CUÁNTAS UNIDADES HAY POR CATEGORÍA. Una categoría que no aparece aquí no
 * tiene límite y nunca se bloquea.
 *
 * SUV LUX: UNA PROPIA Y UNA POR CONVENIO. Corregido por el dueño el 23 oct
 * 2026 (el 21 se había anotado que eran dos propias).
 *
 * Las dos se venden, pero no igual. La propia es firme. La del convenio
 * depende de que el aliado tenga la unidad libre ese día, así que una
 * reserva que cae sobre ella se vende como "sujeta a confirmación": el
 * cobro entra, pero el cliente sabe desde el formulario que el equipo tiene
 * que confirmarla, y el equipo sabe que tiene que preguntar al aliado. Eso
 * es lo que `hayHueco` devuelve en `sujetoAConfirmacion`.
 *
 * Con las dos tomadas no hay nada que prometer: ahí sí se bloquea y la
 * salida es WhatsApp. Si el convenio pasa a ser capacidad firme, FIRMES sube
 * a 2 y nada más cambia.
 */
// 24 oct 2026: el dueño quitó del sitio la venta "sujeta a confirmación" de
// la unidad de convenio (asustaba al cliente y costó una cancelación). En la
// web SUV Lux se vende con UNA unidad: si el horario choca, se bloquea sin
// aviso y la salida es WhatsApp. Para volver a vender el convenio: suv: 2.
export const UNIDADES: Partial<Record<Category, number>> = { suv: 1 };
/** De esas, cuántas son propias y se venden sin condición. */
export const UNIDADES_FIRMES: Partial<Record<Category, number>> = { suv: 1 };

export type Ventana = { inicio: number; fin: number };

type Servicio = {
  serviceDate: string;
  serviceTime: string;
  serviceType: "route" | "hour" | "day";
  minutes: number;
  rentalHours: number;
  km: number;
  redondo: boolean;
  horasEspera: number;
  /** Recoge en una terminal: el margen de ocupación es mayor. */
  airportPickup?: boolean;
};

const HORA = 3600_000;
/**
 * MÁRGENES, fijados por el dueño el 23 oct 2026. Antes era una hora pareja.
 *
 * Recoger en aeropuerto se come dos horas por lado: el chofer entra antes
 * para estacionarse y esperar en llegadas, y el vuelo puede retrasarse sin
 * que eso libere la unidad. Todo lo demás —salidas al aeropuerto, ciudad,
 * por horas— lleva noventa minutos: posicionamiento y regreso.
 */
// 24 oct 2026: el dueño lo amplió a dos horas y media para todo servicio.
const MARGEN_AEROPUERTO = 2.5 * HORA;
const MARGEN = 2.5 * HORA;

/**
 * CUÁNTO TIEMPO DEJA OCUPADA LA UNIDAD UN SERVICIO.
 *
 * No es la duración del trayecto: un AICM→Polanco de 35 minutos se come el
 * posicionamiento, el viaje y el regreso. Se añade un margen por delante y
 * otro por detrás: ver MARGEN y MARGEN_AEROPUERTO.
 *
 * Las fechas se construyen igual que en app/api/checkout/route.ts, con el
 * mismo `new Date("YYYY-MM-DDTHH:mm")`. Lo que importa aquí es la comparación
 * entre ventanas, y las dos se arman igual, así que la zona horaria del
 * servidor no cambia el resultado.
 */
export function ventanaDeOcupacion(s: Servicio): Ventana | null {
  const inicio = new Date(`${s.serviceDate}T${s.serviceTime}`).getTime();
  if (!Number.isFinite(inicio)) return null;
  const m = s.airportPickup ? MARGEN_AEROPUERTO : MARGEN;

  // Foráneo sencillo: el día entero. La unidad sale y no vuelve a tiempo
  // para nada más.
  // `detectZone` es la misma regla que usa el precio: no se repite el 90 aquí.
  if (s.serviceType === "route" && !s.redondo && detectZone(s.km) === "foraneo") {
    const dia = new Date(`${s.serviceDate}T00:00`).getTime();
    return { inicio: dia, fin: dia + 24 * HORA - 1 };
  }

  if (s.serviceType === "route" && s.redondo) {
    // Ida, espera y vuelta. Puede cruzar la medianoche y está bien: la
    // comprobación mira todos los días que toca la ventana.
    const viaje = 2 * s.minutes * 60_000 + s.horasEspera * HORA;
    return { inicio: inicio - m, fin: inicio + viaje + m };
  }

  if (s.serviceType === "hour" || s.serviceType === "day") {
    const horas = s.serviceType === "day" ? HORAS_DIA_COMPLETO : s.rentalHours;
    return { inicio: inicio - m, fin: inicio + horas * HORA + m };
  }

  return { inicio: inicio - m, fin: inicio + s.minutes * 60_000 + m };
}

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * Los días que toca una ventana, para saber qué claves leer y escribir.
 *
 * TODO EN UTC, A PROPÓSITO. La clave del día es un cajón, no una fecha que
 * nadie vaya a leer: lo único que importa es que apuntar y consultar usen el
 * MISMO cajón y que los cajones cubran la ventana entera. Mezclar
 * `setHours` (local) con `toISOString` (UTC), como estaba al escribirlo,
 * funciona en Vercel —que corre en UTC— y se rompe en cualquier máquina con
 * otra zona, justo en las reservas de madrugada.
 */
function diasQueToca(v: Ventana): string[] {
  const dias: string[] = [];
  const d = new Date(v.inicio);
  d.setUTCHours(0, 0, 0, 0);
  while (d.getTime() <= v.fin) {
    dias.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dias.length ? dias : [new Date(v.inicio).toISOString().slice(0, 10)];
}

const clave = (c: Category, dia: string) => `agenda:${c}:${dia}`;
/** Noventa días: pasado el servicio, el apunte ya no sirve para nada. */
const TTL = 90 * 24 * 3600;

type Apunte = { inicio: number; fin: number; id: string };

/**
 * Apunta una unidad como ocupada. Lo llama el webhook de Stripe cuando el
 * cobro entra, no el checkout: una sesión de pago abierta y abandonada no
 * debe bloquear a nadie.
 */
export async function apartar(categoria: Category, v: Ventana, id: string) {
  if (!UNIDADES[categoria]) return { apuntado: false, motivo: "categoría sin límite" };
  const redis = getRedis();
  if (!redis) return { apuntado: false, motivo: "sin redis" };
  const apunte: Apunte = { inicio: v.inicio, fin: v.fin, id };
  for (const dia of diasQueToca(v)) {
    const k = clave(categoria, dia);
    await redis.sadd(k, JSON.stringify(apunte));
    await redis.expire(k, TTL);
  }
  return { apuntado: true };
}

export type Hueco = {
  /** Queda alguna unidad, firme o por convenio. */
  libre: boolean;
  /** Las firmes ya están tomadas: lo que queda es la del convenio. */
  sujetoAConfirmacion: boolean;
  ocupadas: number;
  unidades: number;
};

const sinLimite = (unidades = 0): Hueco => ({
  libre: true, sujetoAConfirmacion: false, ocupadas: 0, unidades,
});

/**
 * Quita un apunte. Para corregir una reserva manual mal metida o una que se
 * canceló. Hace falta la misma ventana con la que se apuntó: el apunte se
 * guarda como texto y sólo se borra el texto idéntico.
 */
export async function liberar(categoria: Category, v: Ventana, id: string) {
  const redis = getRedis();
  if (!redis) return { liberado: false, motivo: "sin redis" };
  const apunte: Apunte = { inicio: v.inicio, fin: v.fin, id };
  let n = 0;
  for (const dia of diasQueToca(v)) n += await redis.srem(clave(categoria, dia), JSON.stringify(apunte));
  return { liberado: n > 0 };
}

/** Los apuntes de una categoría entre dos fechas (AAAA-MM-DD), sin repetir. */
export async function listar(categoria: Category, desde: string, hasta: string) {
  const redis = getRedis();
  if (!redis) return [];
  const vistos = new Map<string, Apunte>();
  const d = new Date(`${desde}T00:00:00Z`);
  const fin = new Date(`${hasta}T00:00:00Z`).getTime();
  while (d.getTime() <= fin) {
    for (const c of await redis.smembers(clave(categoria, d.toISOString().slice(0, 10)))) {
      const a: Apunte = typeof c === "string" ? JSON.parse(c) : (c as Apunte);
      vistos.set(a.id, a);
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return [...vistos.values()].sort((x, y) => x.inicio - y.inicio);
}

/**
 * DÍAS BLOQUEADOS A MANO, ambos inclusive. Para cuando la unidad ya está
 * comprometida fuera de la web y no hay token de /api/agenda a la mano.
 * Se arman con el mismo `new Date("YYYY-MM-DDTHH:mm")` que las ventanas.
 */
const BLOQUEOS: { categoria: Category; desde: string; hasta: string }[] = [
  // 7 nov 2026: SUV Lux comprometida el sáb 14 y dom 15 nov (boda en Puebla).
  { categoria: "suv", desde: "2026-11-14", hasta: "2026-11-15" },
];

function bloqueadoAMano(categoria: Category, v: Ventana) {
  return BLOQUEOS.some((b) => {
    if (b.categoria !== categoria) return false;
    const inicio = new Date(`${b.desde}T00:00`).getTime();
    const fin = new Date(`${b.hasta}T00:00`).getTime() + 24 * HORA - 1;
    return v.inicio <= fin && inicio <= v.fin;
  });
}

/**
 * SERVICIOS AGENDADOS FUERA DE LA WEB (8 nov 2026, decisión del dueño). Lee
 * de Supabase lo que ya ocupa la categoría —Blacklane, WhatsApp, corporativo—
 * con el mismo criterio que la vista /equipo: confirmada, con anticipo, con
 * chofer, o pendiente de pago pero agendada. La función sólo devuelve horas,
 * nunca datos del cliente.
 *
 * Duración cuando la fila no la trae: traslado de una hora, día de 10. El
 * margen de 2.5 h por lado se suma igual que a las reservas de la web.
 */
type Ocupacion = {
  servicio: string; tipo: string | null; horas: number | string | null;
  minutos: number | null; zona: string | null; aeropuerto: boolean | null;
};

async function ventanasSupabase(categoria: Category, v: Ventana): Promise<Ventana[]> {
  const dia = (t: number) => new Date(t).toISOString().slice(0, 10);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ocupacion_categoria`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_categoria: vehicles[categoria].name, p_desde: dia(v.inicio), p_hasta: dia(v.fin) }),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`Supabase ocupacion_categoria ${res.status}`);
  const filas = (await res.json()) as Ocupacion[];
  return filas.flatMap((f) => {
    const [fecha, hora] = f.servicio.replace(" ", "T").split("T");
    const tipo = f.tipo === "hour" || f.tipo === "day" ? f.tipo : "route";
    const w = ventanaDeOcupacion({
      serviceDate: fecha,
      serviceTime: hora.slice(0, 5),
      serviceType: tipo,
      minutes: f.minutos ?? 60,
      rentalHours: Number(f.horas) || (tipo === "day" ? HORAS_DIA_COMPLETO : 3),
      km: 0,
      redondo: false,
      horasEspera: 0,
      airportPickup: Boolean(f.aeropuerto),
    });
    if (!w) return [];
    // Día completo o por horas con más horas que el estándar (p. ej. 12 h).
    if (tipo === "day" && Number(f.horas) > HORAS_DIA_COMPLETO) {
      w.fin += (Number(f.horas) - HORAS_DIA_COMPLETO) * HORA;
    }
    // Foráneo agendado: el día entero, como los foráneos de la web.
    if (tipo === "route" && f.zona?.startsWith("for")) {
      const d0 = new Date(`${fecha}T00:00`).getTime();
      return [{ inicio: d0, fin: d0 + 24 * HORA - 1 }];
    }
    return [w];
  });
}

/**
 * Cuántas unidades de esa categoría están ya comprometidas en la ventana, y
 * si queda alguna libre. Ante cualquier fallo contesta que SÍ hay hueco: un
 * Redis caído no puede dejar de vender.
 */
export async function hayHueco(categoria: Category, v: Ventana): Promise<Hueco> {
  const unidades = UNIDADES[categoria];
  if (!unidades) return sinLimite();
  if (bloqueadoAMano(categoria, v)) {
    return { libre: false, sujetoAConfirmacion: false, ocupadas: unidades, unidades };
  }
  const firmes = UNIDADES_FIRMES[categoria] ?? unidades;
  const vistos = new Set<string>();
  try {
    (await ventanasSupabase(categoria, v)).forEach((a, i) => {
      if (a.inicio <= v.fin && v.inicio <= a.fin) vistos.add(`db:${i}`);
    });
  } catch {
    // Supabase caído no deja de vender: sigue con lo que tenga Redis.
  }
  const redis = getRedis();
  if (!redis) {
    const ocupadas = vistos.size;
    return ocupadas
      ? { libre: ocupadas < unidades, sujetoAConfirmacion: ocupadas >= firmes && ocupadas < unidades, ocupadas, unidades }
      : sinLimite(unidades);
  }
  try {
    for (const dia of diasQueToca(v)) {
      const crudos = await redis.smembers(clave(categoria, dia));
      for (const c of crudos) {
        const a: Apunte = typeof c === "string" ? JSON.parse(c) : (c as Apunte);
        // Se solapan si una empieza antes de que la otra acabe, por los dos lados.
        if (a.inicio <= v.fin && v.inicio <= a.fin) vistos.add(a.id);
      }
    }
    const ocupadas = vistos.size;
    return {
      libre: ocupadas < unidades,
      sujetoAConfirmacion: ocupadas >= firmes && ocupadas < unidades,
      ocupadas,
      unidades,
    };
  } catch {
    const ocupadas = vistos.size;
    return ocupadas
      ? { libre: ocupadas < unidades, sujetoAConfirmacion: ocupadas >= firmes && ocupadas < unidades, ocupadas, unidades }
      : sinLimite(unidades);
  }
}
