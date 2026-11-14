"use client";

import { useRef } from "react";

/**
 * "Enviar al chofer": con ficha (imagen) abre el menú de compartir del celular
 * con la ficha y el mensaje (WhatsApp › chat del chofer). La imagen se empieza
 * a bajar al tocar el botón, para que el menú abra a tiempo. Sin ficha, o si el
 * navegador no comparte archivos, manda sólo el texto directo al chofer.
 */
export default function EnviarChofer({ wa, imagen, mensaje, folio, className }: { wa: string; imagen: string | null; mensaje: string; folio: string; className?: string }) {
  const archivo = useRef<Promise<File> | null>(null);

  function bajar() {
    if (!imagen) return null;
    archivo.current ??= fetch(imagen, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.blob();
      })
      .then((b) => new File([b], `Servicio ${folio}.${b.type.includes("png") ? "png" : "jpg"}`, { type: b.type || "image/png" }));
    archivo.current.catch(() => (archivo.current = null));
    return archivo.current;
  }

  return (
    <a
      className={className}
      href={wa}
      onPointerDown={bajar}
      onClick={async (e) => {
        if (!imagen || !navigator.canShare) return;
        e.preventDefault();
        try {
          const file = await bajar()!;
          if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: mensaje });
          else window.location.href = wa;
        } catch (err) {
          if ((err as Error).name !== "AbortError") window.location.href = wa;
        }
      }}
    >
      Enviar al chofer
    </a>
  );
}
