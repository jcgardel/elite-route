"use client";

/**
 * Manda la tarjeta del conductor como imagen: en el celular abre el menú de
 * compartir (se elige WhatsApp y el chat del cliente). Si el navegador no
 * puede compartir archivos, abre la imagen para guardarla o copiarla.
 */
export default function EnviarTarjeta({ tarjeta, nombre }: { tarjeta: string; nombre: string }) {
  const url = `/choferes/${tarjeta}.jpg`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      onClick={async (e) => {
        if (!navigator.canShare) return;
        e.preventDefault();
        try {
          const blob = await (await fetch(url)).blob();
          const file = new File([blob], `Conductor ${nombre}.jpg`, { type: "image/jpeg" });
          if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file] });
          else window.open(url, "_blank");
        } catch (err) {
          if ((err as Error).name !== "AbortError") window.open(url, "_blank");
        }
      }}
    >
      Tarjeta
    </a>
  );
}
