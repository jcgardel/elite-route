import { ImageResponse } from "next/og";
import { cookies } from "next/headers";
import { COOKIE_EQUIPO, reservasEquipo, type ServicioEquipo } from "@/lib/reservas";

/**
 * Ficha del servicio para el chofer (azul marino/dorado, abajo "Pago al
 * chofer"). Se genera sola en cuanto el servicio tiene pago al chofer en las
 * notas; sólo con la clave del equipo. "Enviar al chofer" la comparte.
 */

const NAVY = "#0B1220";
const PANEL = "#121D33";
const GOLD = "#C7A46A";
const LINEA = "#26314A";
const ANCHO = 1080;

const DIAS = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
const MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const AEROPUERTO = /aicm|aifa|aeropuerto|airport|terminal\s*[12]|toluca.*aeropuerto|\bTLC\b|\bNLU\b|\bMEX\b/i;

/** TTF desde Google Fonts; sin red, la ficha sale con la tipografía por defecto. */
async function fuente(familia: string, eje: string, texto: string) {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${familia}:${eje}&text=${encodeURIComponent(texto)}`).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

/** "+52 55 4130 1651" › "55 4130 1651". */
function telMx(tel: string | null) {
  const d = (tel || "").replace(/[^0-9]/g, "");
  const n = d.length === 12 && d.startsWith("52") ? d.slice(2) : d;
  return n.length === 10 ? `${n.slice(0, 2)} ${n.slice(2, 6)} ${n.slice(6)}` : tel || "";
}

function filas(r: ServicioEquipo, llegada: boolean) {
  const notas = (r.notas || "")
    .split(/(?<=\.)\s+|\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return [
    ["FOLIO", [r.folio]],
    ["CLIENTE", [r.cliente || ""]],
    ["TELÉFONO", [r.telefono || ""]],
    ["VUELO", [r.vuelo ? (llegada ? `${r.vuelo} · monitorear` : r.vuelo) : ""]],
    ["RECOGIDA", [r.origen]],
    ["DESTINO", [r.destino]],
    ["UNIDAD", [r.unidad]],
    ["PASAJEROS", [r.pasajeros ? `${r.pasajeros} pax` : ""]],
    ["NOTAS", notas],
    ["CHOFER", [r.chofer ? `${r.chofer.split(" ")[0]}${r.chofer_tel ? ` · ${telMx(r.chofer_tel)}` : ""}` : ""]],
  ].filter(([, v]) => (v as string[]).some(Boolean)) as [string, string[]][];
}

/** Alto aproximado: unos 36 caracteres por renglón en la columna de valores. */
function alto(lista: [string, string[]][]) {
  const renglones = lista.reduce((t, [, v]) => t + v.reduce((s, x) => s + Math.max(1, Math.ceil(x.length / 36)), 0), 0);
  return 700 + lista.length * 26 + renglones * 42;
}

export async function GET(_req: Request, { params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params;
  const clave = (await cookies()).get(COOKIE_EQUIPO)?.value || "";
  const r = (await reservasEquipo(clave))?.find((x) => x.folio === folio);
  if (!r || !r.pago_chofer) return new Response("No encontrada", { status: 404 });

  const m = r.servicio?.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  const fecha = m ? `${DIAS[new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay()]} ${+m[3]} ${MESES[+m[2] - 1]} ${m[1]}` : "FECHA POR CONFIRMAR";
  const hora = m ? `${m[4]}:${m[5]}` : "--:--";
  const llegada = AEROPUERTO.test(r.origen) && r.tipo !== "hour";
  const modo = r.tipo === "hour" ? "POR HORAS" : r.tipo === "day" ? "POR DÍA" : llegada ? "LLEGADA" : AEROPUERTO.test(r.destino) ? "SALIDA" : "RECOGIDA";
  const pago = /^\$\s?[\d,.]+$/.test(r.pago_chofer.trim()) ? `${r.pago_chofer.trim()} MXN` : r.pago_chofer;
  const lista = filas(r, llegada);

  const texto = [fecha, hora, modo, pago, "ELITEROUTE FICHA DE SERVICIO PAGO AL CHOFER", ...lista.flat(2)].join(" ");
  const [regular, medio, negrita, lema] = await Promise.all([
    fuente("Inter", "wght@400", texto),
    fuente("Inter", "wght@600", texto),
    fuente("Inter", "wght@700", texto),
    fuente("Cormorant+Garamond", "ital,wght@1,500", "We move your level."),
  ]);
  const fonts = [
    regular && { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    medio && { name: "Inter", data: medio, weight: 600 as const, style: "normal" as const },
    negrita && { name: "Inter", data: negrita, weight: 700 as const, style: "normal" as const },
    lema && { name: "Cormorant", data: lema, weight: 500 as const, style: "italic" as const },
  ].filter((f) => !!f);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: NAVY, color: "#fff", fontFamily: "Inter", borderTop: `12px solid ${GOLD}`, padding: "48px 60px 40px" }}>
        <div style={{ fontSize: 58, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>ELITEROUTE</div>
        <div style={{ fontSize: 28, fontWeight: 600, marginTop: 10 }}>FICHA DE SERVICIO</div>
        <div style={{ width: 800, height: 2, background: GOLD, marginTop: 22, marginBottom: 34 }} />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: PANEL, border: `2px solid ${GOLD}`, borderRadius: 24, padding: "24px 0 22px" }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: "#A9B3C6" }}>{fecha}</div>
          <div style={{ fontSize: 60, fontWeight: 700, marginTop: 8 }}>{`${hora} · ${modo}`}</div>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", padding: "18px 30px 0", flexGrow: 1 }}>
          {lista.map(([k, v]) => (
            <div key={k} style={{ display: "flex", borderBottom: `1.5px solid ${LINEA}`, padding: "16px 0" }}>
              <div style={{ width: 240, fontSize: 24, fontWeight: 600, color: GOLD, paddingTop: 6 }}>{k}</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", fontSize: 32, lineHeight: 1.3 }}>
                {v.map((x, i) => (
                  <div key={i}>{x}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: GOLD, color: NAVY, borderRadius: 24, padding: "22px 0 18px", marginTop: 34 }}>
          <div style={{ fontSize: 26, fontWeight: 600 }}>PAGO AL CHOFER</div>
          <div style={{ fontSize: 56, fontWeight: 700, marginTop: 4 }}>{pago}</div>
        </div>
        <div style={{ fontSize: 34, color: GOLD, fontFamily: "Cormorant", fontStyle: "italic", marginTop: 40 }}>We move your level.</div>
      </div>
    ),
    {
      width: ANCHO,
      height: alto(lista),
      // Sin ninguna fuente descargada se queda la de por defecto.
      fonts: fonts.length ? fonts : undefined,
      headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
    },
  );
}
