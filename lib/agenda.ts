import "server-only";
import { Redis } from "@upstash/redis";
import { HORAS_DIA_COMPLETO } from "./service-limits";
import { detectZone, type Category } from "./vehicles";

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
 * SUV LUX SON DOS, Y SE VENDEN DOS. Confirmado por el dueño el 21 oct 2026.
 *
 * HAY UNA TERCERA POR CONVENIO CON OTRO OPERADOR Y NO SE CUENTA AQUÍ, a
 * propósito: está sujeta a disponibilidad del aliado, así que venderla en
 * línea sería prometer una unidad que puede no existir el día del servicio.
 * Ese es justo el caso que cubre la salida a WhatsApp: cuando las dos
 * propias están tomadas, el cliente llega al equipo, que sí puede preguntar
 * por la del convenio y cerrarla a mano si la hay. El bloqueo no pierde esa
 * venta, la pasa a quien puede confirmarla.
 *
 * Si algún día el convenio pasa a ser capacidad firme, este número sube a 3
 * y nada más cambia.
 */
export const UNIDADES: Partial<Record<Category, number>> = { suv: 2 };

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
};

const HORA = 3600_000;

/**
 * CUÁNTO TIEMPO DEJA OCUPADA LA UNIDAD UN SERVICIO.
 *
 * No es la duración del trayecto: un AICM→Polanco de 35 minutos se come el
 * posicionamiento, el viaje y el regreso. Se añade una hora por delante y
 * otra por detrás, que es lo que el dueño aprobó el 21 oct 2026.
 *
 * Las fechas se construyen igual que en app/api/checkout/route.ts, con el
 * mismo `new Date("YYYY-MM-DDTHH:mm")`. Lo que importa aquí es la comparación
 * entre ventanas, y las dos se arman igual, así que la zona horaria del
 * servidor no cambia el resultado.
 */
export function ventanaDeOcupacion(s: Servicio): Ventana | null {
  const inicio = new Date(`${s.serviceDate}T${s.serviceTime}`).getTime();
  if (!Number.isFinite(inicio)) return null;

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
    return { inicio: inicio - HORA, fin: inicio + viaje + HORA };
  }

  if (s.serviceType === "hour" || s.serviceType === "day") {
    const horas = s.serviceType === "day" ? HORAS_DIA_COMPLETO : s.rentalHours;
    return { inicio: inicio - HORA, fin: inicio + horas * HORA + HORA };
  }

  return { inicio: inicio - HORA, fin: inicio + s.minutes * 60_000 + HORA };
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

/**
 * Cuántas unidades de esa categoría están ya comprometidas en la ventana, y
 * si queda alguna libre. Ante cualquier fallo contesta que SÍ hay hueco: un
 * Redis caído no puede dejar de vender.
 */
export async function hayHueco(categoria: Category, v: Ventana) {
  const unidades = UNIDADES[categoria];
  if (!unidades) return { libre: true, ocupadas: 0, unidades: 0 };
  const redis = getRedis();
  if (!redis) return { libre: true, ocupadas: 0, unidades };
  try {
    const vistos = new Set<string>();
    for (const dia of diasQueToca(v)) {
      const crudos = await redis.smembers(clave(categoria, dia));
      for (const c of crudos) {
        const a: Apunte = typeof c === "string" ? JSON.parse(c) : (c as Apunte);
        // Se solapan si una empieza antes de que la otra acabe, por los dos lados.
        if (a.inicio <= v.fin && v.inicio <= a.fin) vistos.add(a.id);
      }
    }
    return { libre: vistos.size < unidades, ocupadas: vistos.size, unidades };
  } catch {
    return { libre: true, ocupadas: 0, unidades };
  }
}
