import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./reservas";

/**
 * LIQUIDACIÓN SEMANAL DE CHOFERES (lunes a domingo), para /equipo/liquidaciones.
 *
 * Balance = traslados EliteRoute + Uber (solo si Uber le paga a la flota)
 *           + reembolsos/bonos − renta semanal − gasolina − gastos − adelantos.
 * Positivo: se le paga al chofer. Negativo: el chofer debe.
 *
 * Todo pasa por funciones de Postgres con la clave del equipo
 * (scripts/sql/2026-11-15-liquidaciones-choferes.sql). Nunca llega aquí el
 * precio al cliente: solo el pago al chofer de cada traslado.
 */

export type TipoMovimiento = "uber" | "reembolso" | "bono" | "gasolina" | "gasto" | "adelanto";

export const MOVIMIENTOS: { tipo: Exclude<TipoMovimiento, "uber">; etiqueta: string; signo: 1 | -1 }[] = [
  { tipo: "gasolina", etiqueta: "Gasolina", signo: -1 },
  { tipo: "gasto", etiqueta: "Otro gasto (multa, lavado, daño…)", signo: -1 },
  { tipo: "adelanto", etiqueta: "Adelanto / préstamo", signo: -1 },
  { tipo: "reembolso", etiqueta: "Reembolso (casetas, estacionamiento…)", signo: 1 },
  { tipo: "bono", etiqueta: "Bono / ajuste a favor", signo: 1 },
];

export type ServicioLiq = {
  folio: string;
  fecha: string;
  cliente: string | null;
  origen: string | null;
  destino: string | null;
  unidad: string | null;
  tipo: string | null;
  horas: number | null;
  pendiente_pago: boolean;
  pago: number | null;
  /** definido = capturado; nota = de las notas; regla = calculado (30% del neto o tarifa por hora). */
  origen_pago: "definido" | "nota" | "regla" | null;
};

export type Movimiento = { id: string; tipo: TipoMovimiento; concepto: string | null; monto: number };

export type ChoferLiq = {
  driver_id: string;
  nombre: string;
  tel: string | null;
  esquema: "servicio" | "renta" | "venta";
  renta_semanal: number;
  uber_por_flota: boolean;
  servicios: ServicioLiq[];
  movimientos: Movimiento[];
  pagado: number | null;
  pagado_en: string | null;
};

export type ChoferEsquema = {
  driver_id: string;
  nombre: string;
  tel: string | null;
  activo: boolean;
  esquema: "servicio" | "renta" | "venta";
  renta_semanal: number;
  uber_por_flota: boolean;
};

async function rpc(fn: string, args: Record<string, unknown>) {
  return fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
}

const n = (v: unknown) => (v == null ? null : Number(v));

/** La semana completa; null si la clave no sirve. */
export async function liquidacionSemana(clave: string, lunes: string): Promise<ChoferLiq[] | null> {
  if (!clave) return null;
  const res = await rpc("liquidacion_semana", { p_clave: clave, p_semana: lunes });
  if (!res.ok) return null;
  const filas = (await res.json()) as ChoferLiq[];
  // numeric llega como texto o número según el caso: se normaliza.
  return filas.map((c) => ({
    ...c,
    renta_semanal: Number(c.renta_semanal) || 0,
    pagado: n(c.pagado),
    servicios: c.servicios.map((s) => ({ ...s, pago: n(s.pago) })),
    movimientos: c.movimientos.map((m) => ({ ...m, monto: Number(m.monto) })),
  }));
}

export async function choferesEsquema(clave: string): Promise<ChoferEsquema[]> {
  const res = await rpc("choferes_esquema", { p_clave: clave });
  if (!res.ok) return [];
  return ((await res.json()) as ChoferEsquema[]).map((c) => ({ ...c, renta_semanal: Number(c.renta_semanal) || 0 }));
}

export async function llamar(fn: string, args: Record<string, unknown>) {
  const res = await rpc(fn, args);
  return res.ok;
}

export type Totales = {
  elite: number;
  sinPago: number;
  estimados: number;
  uber: number;
  /** Uber que entra al balance (solo renta con Uber a la flota). */
  uberSuma: number;
  renta: number;
  porTipo: Record<TipoMovimiento, number>;
  balance: number;
};

export function totales(c: ChoferLiq): Totales {
  const porTipo = { uber: 0, reembolso: 0, bono: 0, gasolina: 0, gasto: 0, adelanto: 0 } as Record<TipoMovimiento, number>;
  for (const m of c.movimientos) porTipo[m.tipo] += m.monto;
  const elite = c.servicios.reduce((t, s) => t + (s.pago ?? 0), 0);
  // Renta o abono semanal de venta: se descuenta igual.
  const renta = c.esquema === "servicio" ? 0 : c.renta_semanal;
  const uberSuma = c.esquema === "renta" && c.uber_por_flota ? porTipo.uber : 0;
  const balance =
    elite + uberSuma + porTipo.reembolso + porTipo.bono - renta - porTipo.gasolina - porTipo.gasto - porTipo.adelanto;
  return {
    elite,
    sinPago: c.servicios.filter((s) => s.pago == null).length,
    estimados: c.servicios.filter((s) => s.origen_pago === "regla").length,
    uber: porTipo.uber,
    uberSuma,
    renta,
    porTipo,
    balance: Math.round(balance * 100) / 100,
  };
}

/** "1,250.50", "$1250" → 1250.5; vacío o inválido → 0. */
export function monto(v: FormDataEntryValue | null) {
  const x = Number(String(v ?? "").replace(/[$,\s]/g, ""));
  return Number.isFinite(x) && x > 0 ? Math.round(x * 100) / 100 : 0;
}

/** Lunes (YYYY-MM-DD) de la semana de una fecha YYYY-MM-DD. */
export function lunesDe(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  const f = new Date(Date.UTC(y, m - 1, d));
  f.setUTCDate(f.getUTCDate() - ((f.getUTCDay() + 6) % 7));
  return f.toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number) {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Hoy en la CDMX, YYYY-MM-DD. */
export function hoyCdmx() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
}
