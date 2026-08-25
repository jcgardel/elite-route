"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type Lang = "es" | "en";

const KEY = "er-lang";
const EVENT = "er-lang-change";

/**
 * El idioma elegido vive en localStorage, no en el estado de una página.
 *
 * Antes el selector ES/EN existía sólo en la portada y se perdía al navegar:
 * alguien que ponía la página en inglés y entraba a Tarifas se encontraba otra
 * vez con español. Ahora la elección viaja con el visitante por todo el sitio
 * y sobrevive a recargar.
 *
 * Se lee con useSyncExternalStore y no con un efecto porque el servidor tiene
 * que renderizar el idioma por defecto de cada página —español en las páginas
 * que existen para el buscador en español, inglés en la portada— y el cliente
 * corregirlo sin provocar un desajuste de hidratación.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readStored(): Lang | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "es" || value === "en" ? value : null;
  } catch {
    // Safari en modo privado puede lanzar al tocar localStorage.
    return null;
  }
}

export function useLang(fallback: Lang): [Lang, (next: Lang) => void] {
  const lang = useSyncExternalStore(
    subscribe,
    () => readStored() ?? fallback,
    () => fallback,
  );

  // El atributo del documento sigue al idioma en pantalla: sin esto un lector
  // de pantalla lee un idioma con la fonética del otro.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Sin almacenamiento el idioma dura lo que dure la página. Aceptable.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [lang, setLang];
}
