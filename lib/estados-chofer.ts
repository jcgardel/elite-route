/** Estados que marca el chofer en /chofer (sin dependencias de servidor: lo usa el navegador). */
export type EstadoChofer = "en_camino" | "a_bordo" | "terminado";

export const ESTADOS: { valor: EstadoChofer; texto: string }[] = [
  { valor: "en_camino", texto: "En camino" },
  { valor: "a_bordo", texto: "Pasajero a bordo" },
  { valor: "terminado", texto: "Terminado" },
];

/** Ubicación del teléfono al tocar el botón (si el chofer dio permiso). */
export type Gps = { lat: number; lng: number; precision: number };
