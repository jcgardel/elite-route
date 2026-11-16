"use client";

import { useState } from "react";
import { ESTADOS, type Gps } from "@/lib/estados-chofer";
import { marcarEstado } from "./actions";
import s from "./chofer.module.css";

/** La ubicación del teléfono, o null si no dio permiso o tarda más de 10 s. */
function ubicacion(): Promise<Gps | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, precision: p.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  });
}

/**
 * En camino / Pasajero a bordo / Terminado: toma la ubicación del teléfono,
 * guarda el estado y abre WhatsApp con el aviso para Kevin.
 */
export default function BotonesEstado({ folio, actual }: { folio: string; actual: string | null }) {
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function marcar(estado: string) {
    setEnviando(estado);
    setError("");
    const gps = await ubicacion();
    const wa = await marcarEstado(folio, estado, gps);
    if (!wa) {
      setEnviando(null);
      setError("No se pudo guardar. Recarga la página e intenta de nuevo.");
      return;
    }
    if (!gps) setError("Se guardó sin ubicación: activa el GPS y permite la ubicación para eliteroute.mx.");
    setEnviando(null);
    window.location.assign(wa);
  }

  return (
    <>
      <div className={s.estados}>
        {ESTADOS.map((x) => (
          <button
            key={x.valor}
            type="button"
            disabled={!!enviando}
            onClick={() => marcar(x.valor)}
            className={actual === x.valor ? `${s.estado} ${s.actual}` : s.estado}
          >
            {enviando === x.valor ? "Ubicando…" : x.texto}
          </button>
        ))}
      </div>
      {error && <p className={s.aviso}>{error}</p>}
    </>
  );
}
