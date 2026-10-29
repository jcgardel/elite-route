import type { Metadata } from "next";
import { cookies } from "next/headers";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { CHOFERES } from "@/lib/choferes";
import { COOKIE_EQUIPO, reservasEquipo, type ServicioEquipo } from "@/lib/reservas";
import { entrar, guardarChofer, salir } from "./actions";
import ChoferNombre from "./ChoferNombre";
import s from "./equipo.module.css";

/**
 * SERVICIOS PROGRAMADOS PARA EL EQUIPO, en vivo desde la tabla de reservas.
 *
 * Sustituye a la lista armada a mano: lo que se paga en la web o se registra
 * en la tabla aparece aquí solo. Sin precios ni montos (los filtra Postgres en
 * `reservas_equipo`, no esta página). Entra con la clave del equipo.
 */
export const metadata: Metadata = {
  title: "Servicios programados · EliteRoute",
  robots: { index: false, follow: false },
};

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const TIPO: Record<string, string> = { route: "Traslado", hour: "Por horas", day: "Por día" };

function partes(servicio: string | null) {
  const m = servicio?.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const dia = new Date(Date.UTC(+y, +mo - 1, +d)).getUTCDay();
  return { fecha: `${y}-${mo}-${d}`, hora: `${h}:${mi}`, etiqueta: `${DIAS[dia]} ${+d} ${MESES[+mo - 1]}` };
}

function color(unidad: string) {
  const u = unidad.toLowerCase();
  if (u.includes("lux") || u.includes("high")) return s.lux;
  if (u.includes("exec")) return s.exec;
  if (u.includes("urban") || u.includes("van")) return s.urban;
  return s.sedan;
}

/** WhatsApp del chofer para el link directo; 10 dígitos = celular de México (+52). */
function telChofer(tel: string | null) {
  const digitos = (tel || "").replace(/[^0-9]/g, "");
  if (digitos.length === 10) return `52${digitos}`;
  return digitos.length > 10 ? digitos : "";
}

/** Mensaje listo para el chofer: datos del servicio, sin precios. */
function mensajeChofer(r: ServicioEquipo, etiqueta: string) {
  return [
    `Servicio EliteRoute ${r.folio}`,
    etiqueta,
    `Cliente: ${r.cliente || ""}${r.telefono ? ` · ${r.telefono}` : ""}`,
    `Recoger: ${r.origen}`,
    `Destino: ${r.destino}`,
    [r.vuelo ? `Vuelo ${r.vuelo}` : "", r.unidad, r.pasajeros ? `${r.pasajeros} pax` : ""].filter(Boolean).join(" · "),
    r.notas ? `Notas: ${r.notas}` : "",
    "Confírmame de recibido, por favor.",
  ]
    .filter(Boolean)
    .join("\n");
}

function Tarjeta({ r, lang }: { r: ServicioEquipo; lang: string }) {
  const p = partes(r.servicio);
  const tel = (r.telefono || "").replace(/[^0-9]/g, "");
  const telCh = telChofer(r.chofer_tel);
  const etiqueta = p ? `${p.etiqueta} · ${p.hora}` : "Fecha y hora por confirmar";
  const calendario = p
    ? buildGoogleCalendarUrl({
        titulo: `${r.folio} · ${r.cliente || ""} · ${r.unidad}`,
        detalle: [
          `${r.origen} › ${r.destino}`,
          r.vuelo ? `Vuelo ${r.vuelo}` : "",
          r.telefono ? `Tel ${r.telefono}` : "",
          r.notas || "",
        ].filter(Boolean),
        lugar: r.origen,
        fecha: p.fecha,
        hora: p.hora,
        uid: r.folio,
        aviso: `${r.folio} ${r.cliente || ""}`,
      })
    : null;

  return (
    <article id={r.folio} className={`${s.card} ${color(r.unidad)}`}>
      <header className={s.top}>
        <span className={s.hora}>{p ? p.hora : "Hora por confirmar"}</span>
        <span className={s.unidad}>{r.unidad}</span>
        <span className={r.estado === "Pagado" ? s.pagado : s.anticipo}>{r.estado}</span>
      </header>
      <p className={s.cliente}>
        {r.cliente} <span className={s.folio}>{r.folio}</span>
      </p>
      <p className={s.ruta}>
        {r.origen} <span className={s.flecha}>›</span> {r.destino}
      </p>
      <p className={s.meta}>
        {[r.tipo ? TIPO[r.tipo] : "", r.vuelo ? `Vuelo ${r.vuelo}` : "", r.pasajeros ? `${r.pasajeros} pax` : ""]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {r.notas && <p className={s.notas}>{r.notas}</p>}
      <form action={guardarChofer} className={s.chofer}>
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="folio" value={r.folio} />
        <ChoferNombre
          className={r.chofer ? s.choferInput : `${s.choferInput} ${s.sinChofer}`}
          defaultValue={r.chofer || ""}
        />
        <input
          className={telCh || !r.chofer ? `${s.choferInput} ${s.telInput}` : `${s.choferInput} ${s.telInput} ${s.faltaTel}`}
          name="tel"
          type="tel"
          inputMode="tel"
          list="telefonos"
          defaultValue={r.chofer_tel || ""}
          placeholder="WhatsApp"
          aria-label="WhatsApp del chofer"
          maxLength={20}
        />
        <button className={s.choferBoton} type="submit">Guardar</button>
      </form>
      {r.chofer && !telCh && <p className={s.aviso}>Falta el WhatsApp del chofer (10 dígitos)</p>}
      <nav className={s.acciones}>
        {telCh && (
          <a className={s.enviar} href={`https://wa.me/${telCh}?text=${encodeURIComponent(mensajeChofer(r, etiqueta))}`}>
            Enviar al chofer
          </a>
        )}
        {tel && <a href={`tel:+${tel}`}>Llamar cliente</a>}
        {tel && <a href={`https://wa.me/${tel}`}>WhatsApp cliente</a>}
        {calendario && <a href={calendario}>+ Calendario</a>}
      </nav>
    </article>
  );
}

export default async function EquipoPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { lang } = await params;
  const { error } = await searchParams;
  const clave = (await cookies()).get(COOKIE_EQUIPO)?.value || "";
  const servicios = clave ? await reservasEquipo(clave) : null;

  if (!servicios) {
    return (
      <main className={s.page}>
        <form action={entrar} className={s.login}>
          <h1 className={s.titulo}>Servicios programados</h1>
          <p className={s.sub}>EliteRoute · Equipo</p>
          <input type="hidden" name="lang" value={lang} />
          <input className={s.input} name="clave" type="password" placeholder="Clave del equipo" autoComplete="current-password" required />
          {error && <p className={s.error}>Clave incorrecta</p>}
          <button className={s.boton} type="submit">Entrar</button>
        </form>
      </main>
    );
  }

  const dias = new Map<string, ServicioEquipo[]>();
  for (const r of servicios) {
    const k = partes(r.servicio)?.etiqueta || "Fecha por confirmar";
    dias.set(k, [...(dias.get(k) || []), r]);
  }
  const ahora = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <main className={s.page}>
      <header className={s.head}>
        <div>
          <h1 className={s.titulo}>Servicios programados</h1>
          <p className={s.sub}>
            {servicios.length} servicios · {servicios.filter((r) => !r.chofer).length} sin chofer · actualizado {ahora}
          </p>
        </div>
        <form action={salir}>
          <input type="hidden" name="lang" value={lang} />
          <button className={s.salir} type="submit">Salir</button>
        </form>
      </header>
      {servicios.length === 0 && <p className={s.sub}>No hay servicios próximos.</p>}
      {/* Directorio de choferes + los ya usados, para no volver a escribirlos. */}
      <datalist id="choferes">
        {[...new Set([...CHOFERES.map((c) => c.nombre), ...servicios.map((r) => r.chofer).filter(Boolean)])].map((c) => (
          <option key={c} value={c!} />
        ))}
      </datalist>
      <datalist id="telefonos">
        {[
          ...new Map([
            ...CHOFERES.map((c) => [c.tel, c.nombre] as [string, string]),
            ...servicios.filter((r) => r.chofer_tel).map((r) => [r.chofer_tel!, r.chofer || ""] as [string, string]),
          ]),
        ].map(([tel, nombre]) => (
          <option key={tel} value={tel} label={nombre} />
        ))}
      </datalist>
      {[...dias].map(([dia, lista]) => (
        <section key={dia}>
          <h2 className={s.dia}>{dia}</h2>
          {lista.map((r) => (
            <Tarjeta key={r.folio} r={r} lang={lang} />
          ))}
        </section>
      ))}
    </main>
  );
}
