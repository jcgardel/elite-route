import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const shareImageAlt =
  "Elite Route CDMX — Transporte ejecutivo privado";
export const shareImageSize = { width: 1200, height: 630 };

/**
 * Imagen que se muestra al compartir el sitio (WhatsApp, redes, buscadores).
 * Usa el logo real sobre negro para que empate con el fondo del propio logo.
 */
export async function renderShareImage() {
  const logoData = await readFile(
    join(process.cwd(), "public/elite-route-logo.jpg"),
    "base64"
  );
  const logoSrc = `data:image/jpeg;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* El logo se escala a todo el ancho y se recorta verticalmente para
            que su fondo negro cubra el lienzo sin dejar costura visible. */}
        <img
          src={logoSrc}
          width={1200}
          height={1200}
          alt=""
          style={{ position: "absolute", top: -285, left: 0 }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 88,
            background: "#C8A46B",
            color: "#0A0A0A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Transporte ejecutivo · CDMX
        </div>
      </div>
    ),
    { ...shareImageSize }
  );
}
