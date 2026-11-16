"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ADMIN, hoyCdmx, liquidacionSemana, llamar, lunesDe, monto, totales } from "@/lib/liquidaciones";

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

async function contexto(formData: FormData) {
  const clave = (await cookies()).get(COOKIE_ADMIN)?.value || "";
  const lang = String(formData.get("lang") || "es");
  const s = String(formData.get("semana") || "");
  const semana = FECHA.test(s) ? lunesDe(s) : "";
  const driver = String(formData.get("driver") || "");
  return { clave, lang, semana, driver };
}

function volver(lang: string, semana: string, ancla = "") {
  redirect(`/${lang}/equipo/liquidaciones?semana=${semana}${ancla ? `#${ancla}` : ""}`);
}

export async function guardarUber(formData: FormData) {
  const { clave, lang, semana, driver } = await contexto(formData);
  if (clave && semana && driver)
    await llamar("guardar_uber", { p_clave: clave, p_driver: driver, p_semana: semana, p_monto: monto(formData.get("monto")) });
  volver(lang, semana, driver);
}

export async function agregarMovimiento(formData: FormData) {
  const { clave, lang, semana, driver } = await contexto(formData);
  const importe = monto(formData.get("monto"));
  if (clave && semana && driver && importe)
    await llamar("agregar_movimiento", {
      p_clave: clave,
      p_driver: driver,
      p_semana: semana,
      p_tipo: String(formData.get("tipo") || ""),
      p_concepto: String(formData.get("concepto") || ""),
      p_monto: importe,
    });
  volver(lang, semana, driver);
}

export async function borrarMovimiento(formData: FormData) {
  const { clave, lang, semana, driver } = await contexto(formData);
  const id = String(formData.get("id") || "");
  if (clave && id) await llamar("borrar_movimiento", { p_clave: clave, p_id: id });
  volver(lang, semana, driver);
}

export async function definirPago(formData: FormData) {
  const { clave, lang, semana, driver } = await contexto(formData);
  const folio = String(formData.get("folio") || "");
  if (clave && folio) await llamar("definir_pago_chofer", { p_clave: clave, p_folio: folio, p_monto: monto(formData.get("monto")) });
  volver(lang, semana, driver);
}

export async function configurarChofer(formData: FormData) {
  const { clave, lang, semana, driver } = await contexto(formData);
  const esquema = String(formData.get("esquema") || "servicio");
  if (clave && driver)
    await llamar("configurar_chofer", {
      p_clave: clave,
      p_driver: driver,
      p_esquema: esquema,
      p_renta: monto(formData.get("renta")),
      p_uber_flota: formData.get("uber_flota") === "1",
    });
  volver(lang, semana, driver);
}

/** Marca la semana como pagada con el balance calculado aquí (no el del formulario). */
export async function marcarPagado(formData: FormData) {
  const { clave, lang, semana, driver } = await contexto(formData);
  const desmarcar = formData.get("desmarcar") === "1";
  if (clave && semana && driver) {
    let importe: number | null = null;
    if (!desmarcar) {
      const ch = (await liquidacionSemana(clave, semana))?.find((c) => c.driver_id === driver);
      if (ch) importe = totales(ch).balance;
    }
    if (desmarcar || importe != null) {
      await llamar("marcar_liquidacion", { p_clave: clave, p_driver: driver, p_semana: semana, p_monto: importe });
      const ref = String(formData.get("comprobante") || "").trim();
      if (!desmarcar && ref)
        await llamar("comprobante_liquidacion", { p_clave: clave, p_driver: driver, p_semana: semana, p_ref: ref });
    }
  }
  volver(lang, semana, driver);
}

/** Entrada con la clave del dueño (distinta de la del equipo). */
export async function entrarAdmin(formData: FormData) {
  const clave = String(formData.get("clave") || "").trim().toLowerCase();
  const lang = String(formData.get("lang") || "es");
  if (!(await liquidacionSemana(clave, hoyCdmx()))) redirect(`/${lang}/equipo/liquidaciones?error=1`);
  (await cookies()).set({
    name: COOKIE_ADMIN,
    value: clave,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  redirect(`/${lang}/equipo/liquidaciones`);
}

export async function salirAdmin(formData: FormData) {
  (await cookies()).delete(COOKIE_ADMIN);
  redirect(`/${String(formData.get("lang") || "es")}/equipo/liquidaciones`);
}
