import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Tarjeta que se ve cuando alguien comparte el enlace por WhatsApp, LinkedIn
 * o X. Antes se anunciaba executive.jpg como 1200×630 cuando el archivo real
 * medía 786×983 —vertical—, así que las apps la recortaban por el centro y la
 * vista previa salía sin marca, sin nombre y sin promesa. En México casi toda
 * recomendación pasa por ahí: es la primera vez que mucha gente ve Elite Route.
 */
export const alt = "Elite Route — Chofer privado y transporte ejecutivo en Ciudad de México";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#C8A46B";
const INK = "#0A0A0A";

/**
 * Google Fonts devuelve TTF —el formato que entiende el generador— cuando la
 * hoja se pide sin cabecera de navegador. Si la red falla durante el build, la
 * tarjeta se genera igual con la tipografía por defecto en lugar de romper el
 * despliegue.
 */
async function loadFont(family: string, weight: number, text: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
    ).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const titulo = "Movemos tu nivel.";
  const bajada = "Chofer privado y transporte ejecutivo en Ciudad de México";

  const [logo, cormorant, barlow] = await Promise.all([
    readFile(join(process.cwd(), "public/elite-route-logo.png")).catch(() => null),
    loadFont("Cormorant+Garamond", 300, titulo),
    loadFont("Barlow", 400, `${bajada}ELITE ROUTE CIUDAD DE MÉXICOAICM · AIFA · TolucaPrecio fijo, IVA incluido · Pago seguro con Stripe0123456789`),
  ]);

  const fonts = [
    cormorant && { name: "Cormorant Garamond", data: cormorant, weight: 300 as const, style: "normal" as const },
    barlow && { name: "Barlow", data: barlow, weight: 400 as const, style: "normal" as const },
  ].filter((f) => f !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: INK,
          color: "#fff",
          padding: 68,
          borderTop: `6px solid ${GOLD}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Barlow",
                fontSize: 22,
                letterSpacing: 8,
                color: GOLD,
                textTransform: "uppercase",
              }}
            >
              Elite Route · Ciudad de México
            </div>
            <div
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 104,
                lineHeight: 1.02,
                marginTop: 26,
              }}
            >
              {titulo}
            </div>
            <div
              style={{
                fontFamily: "Barlow",
                fontSize: 30,
                color: "#BFC3C8",
                marginTop: 22,
                maxWidth: 620,
                lineHeight: 1.45,
              }}
            >
              {bajada}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: "Barlow",
              fontSize: 21,
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ display: "flex", color: "#BFC3C8", flexShrink: 0 }}>AICM · AIFA · Toluca</div>
            <div style={{ display: "flex", color: "#3a3a3a", flexShrink: 0 }}>|</div>
            <div style={{ display: "flex", color: "#BFC3C8", flexShrink: 0 }}>Precio fijo, IVA incluido</div>
            <div style={{ display: "flex", color: "#3a3a3a", flexShrink: 0 }}>|</div>
            <div
              style={{
                display: "flex",
                flexShrink: 0,
                background: "#635BFF",
                color: "#fff",
                padding: "7px 16px 9px",
                borderRadius: 8,
                fontSize: 19,
              }}
            >
              Pago seguro con Stripe
            </div>
          </div>
        </div>

        {logo && (
          <div style={{ display: "flex", alignItems: "center", paddingLeft: 40 }}>
            <img
              src={`data:image/png;base64,${logo.toString("base64")}`}
              alt=""
              width={300}
              height={300}
            />
          </div>
        )}
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
