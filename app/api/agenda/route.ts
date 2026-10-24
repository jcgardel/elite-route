import { NextResponse } from "next/server";
import { apartar, liberar, listar, ventanaDeOcupacion } from "@/lib/agenda";
import { CATEGORIES, type Category } from "@/lib/vehicles";

/**
 * LA PUERTA PARA LAS RESERVAS QUE NO PASAN POR EL COTIZADOR.
 *
 * La agenda de lib/agenda.ts sólo veía lo que se pagaba en la web, y eso es
 * la minoría: lo que se cotiza por WhatsApp o por convenio no entraba, así
 * que un hueco "libre" podía estar ocupado de verdad. Por aquí el equipo
 * apunta esas reservas (y las quita si se cancelan), con lo que el bloqueo
 * del cotizador pasa a ser verdad completa.
 *
 * Es uso interno: exige `Authorization: Bearer <AGENDA_TOKEN>`. Sin la
 * variable en el entorno, la ruta no hace nada.
 *
 *   POST   { servicios: [{ id, category, serviceDate, serviceTime, ... }] }
 *          Cada servicio lleva los mismos campos que el cotizador manda a
 *          /api/checkout; para un servicio por horas basta `rentalHours`.
 *          `airportPickup: true` amplía el margen (ver lib/agenda.ts).
 *   DELETE el mismo cuerpo: quita los apuntes.
 *   GET    ?category=suv&desde=AAAA-MM-DD&hasta=AAAA-MM-DD  lista apuntes.
 */

function autorizado(req: Request) {
  const token = process.env.AGENDA_TOKEN;
  if (!token) return false;
  return req.headers.get("authorization") === `Bearer ${token}`;
}

type Entrada = {
  id?: unknown; category?: unknown; serviceDate?: unknown; serviceTime?: unknown;
  serviceType?: unknown; minutes?: unknown; rentalHours?: unknown; km?: unknown;
  redondo?: unknown; horasEspera?: unknown; airportPickup?: unknown;
};

function ventanaDe(e: Entrada) {
  const rentalHours = Number(e.rentalHours) || 0;
  return ventanaDeOcupacion({
    serviceDate: String(e.serviceDate || ""),
    serviceTime: String(e.serviceTime || ""),
    serviceType:
      e.serviceType === "hour" || e.serviceType === "day" ? e.serviceType
      : rentalHours > 0 ? "hour" : "route",
    minutes: Number(e.minutes) || 0,
    rentalHours,
    km: Number(e.km) || 0,
    redondo: Boolean(e.redondo),
    horasEspera: Number(e.horasEspera) || 0,
    airportPickup: Boolean(e.airportPickup),
  });
}

async function procesar(req: Request, accion: typeof apartar | typeof liberar) {
  if (!autorizado(req)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const servicios: Entrada[] = Array.isArray(body?.servicios) ? body.servicios : [];
  const resultados = [];
  for (const e of servicios) {
    const id = String(e.id || "").trim();
    const category = e.category as Category;
    if (!id || !CATEGORIES.includes(category)) {
      resultados.push({ id, error: "falta id o categoría inválida" });
      continue;
    }
    const v = ventanaDe(e);
    if (!v) { resultados.push({ id, error: "fecha u hora inválida" }); continue; }
    resultados.push({ id, ventana: v, ...(await accion(category, v, id)) });
  }
  return NextResponse.json({ resultados });
}

export const POST = (req: Request) => procesar(req, apartar);
export const DELETE = (req: Request) => procesar(req, liberar);

export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  const u = new URL(req.url);
  const category = u.searchParams.get("category") as Category;
  const desde = u.searchParams.get("desde") || "";
  const hasta = u.searchParams.get("hasta") || desde;
  if (!CATEGORIES.includes(category) || !/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
    return NextResponse.json({ error: "parámetros inválidos" }, { status: 400 });
  }
  return NextResponse.json({ apuntes: await listar(category, desde, hasta) });
}
