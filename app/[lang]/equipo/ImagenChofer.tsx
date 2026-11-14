"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { guardarImagenChofer } from "./actions";

/** Lado mayor y calidad al reducir: una captura del celular queda en ~200 KB. */
const LADO = 1600;
const CALIDAD = 0.85;

/** Reduce la imagen en el navegador y la devuelve en base64 (JPEG). */
async function reducir(archivo: File): Promise<string> {
  const bmp = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // PNG con transparencia: fondo blanco, no negro.
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", CALIDAD).split(",")[1];
}

/**
 * Imagen ya hecha del servicio (la que dice abajo "Pago al chofer"): se sube
 * una vez y queda en el portal. "Imagen al chofer" abre el menú de compartir
 * del celular (WhatsApp › chat del chofer); si no se puede, la abre.
 */
export default function ImagenChofer({ folio, lang, tiene }: { folio: string; lang: string; tiene: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<"" | "subiendo" | "error">("");
  const url = `/${lang}/equipo/imagen/${encodeURIComponent(folio)}`;

  async function subir(archivo: File | undefined) {
    if (!archivo) return;
    setEstado("subiendo");
    try {
      const ok = await guardarImagenChofer(folio, "image/jpeg", await reducir(archivo));
      setEstado(ok ? "" : "error");
      if (ok) router.refresh();
    } catch {
      setEstado("error");
    }
  }

  async function quitar() {
    if (!confirm(`¿Quitar la imagen de ${folio}?`)) return;
    if (await guardarImagenChofer(folio, "", "")) router.refresh();
  }

  async function compartir(e: React.MouseEvent) {
    if (!navigator.canShare) return;
    e.preventDefault();
    try {
      const blob = await (await fetch(url, { cache: "no-store" })).blob();
      const file = new File([blob], `Servicio ${folio}.jpg`, { type: blob.type || "image/jpeg" });
      if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file] });
      else window.open(url, "_blank");
    } catch (err) {
      if ((err as Error).name !== "AbortError") window.open(url, "_blank");
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          subir(e.currentTarget.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
      {tiene && (
        <a href={url} target="_blank" rel="noopener" onClick={compartir}>
          Imagen al chofer
        </a>
      )}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          input.current?.click();
        }}
      >
        {estado === "subiendo" ? "Subiendo…" : estado === "error" ? "Error, reintentar" : tiene ? "Cambiar imagen" : "Subir imagen"}
      </a>
      {tiene && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            quitar();
          }}
        >
          Quitar imagen
        </a>
      )}
    </>
  );
}
