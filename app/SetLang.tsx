"use client";

import { useEffect } from "react";

/**
 * Marca el idioma real de una página cuando no coincide con el del documento.
 *
 * La portada arranca en inglés, así que el layout declara `lang="en"`. Las
 * páginas que sólo existen en español —tarifas, corporativo, legales, estados
 * de pago— montan esto para corregir el atributo: sin él, un lector de
 * pantalla leería el español con fonética inglesa y el navegador ofrecería
 * traducir una página que ya está en el idioma del lector.
 */
export default function SetLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
