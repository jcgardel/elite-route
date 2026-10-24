"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_EQUIPO, reservasEquipo } from "@/lib/reservas";

export async function entrar(formData: FormData) {
  const clave = String(formData.get("clave") || "").trim().toLowerCase();
  const lang = String(formData.get("lang") || "es");
  if (!(await reservasEquipo(clave))) redirect(`/${lang}/equipo?error=1`);

  (await cookies()).set({
    name: COOKIE_EQUIPO,
    value: clave,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  redirect(`/${lang}/equipo`);
}

export async function salir(formData: FormData) {
  (await cookies()).delete(COOKIE_EQUIPO);
  redirect(`/${String(formData.get("lang") || "es")}/equipo`);
}
