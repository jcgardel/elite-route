import { ImageResponse } from "next/og";

/**
 * Icono de iOS: el símbolo de nivel sobre el negro de la marca. Antes eran
 * las letras "ER" en la sans por defecto del generador — la única tipografía
 * de todo el proyecto que no es de la marca.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const GLYPH = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 48 48">
  <path d="M6 35 H18 L30 15 H38" fill="none" stroke="#C8A46B" stroke-width="3.6"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="41.4" cy="15" r="2.8" fill="#C8A46B"/>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={`data:image/svg+xml;base64,${Buffer.from(GLYPH).toString("base64")}`}
          alt=""
          width={120}
          height={120}
        />
      </div>
    ),
    { ...size },
  );
}
