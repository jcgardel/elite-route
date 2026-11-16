import type { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_CHOFER, ESTADOS, portalChofer, type ServicioChofer } from "@/lib/portal-chofer";
import { marcarEstado, salir } from "./actions";
import e from "../equipo/equipo.module.css";
import s from "./chofer.module.css";

/**
 * PORTAL DEL CHOFER: sus servicios próximos y realizados, lo que se le paga y
 * si ya se le pagó. Entra con su link personal; nunca ve el precio al cliente.
 */
export const metadata: Metadata = {
  title: "Mis servicios · EliteRoute",
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
  return { hora: `${h}:${mi}`, etiqueta: `${DIAS[dia]} ${+d} ${MESES[+mo - 1]}` };
}

/** "YYYY-MM-DDTHH:mm" en hora de la CDMX, para comparar con la hora del servicio. */
function localCdmx(fecha: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(fecha)
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Un servicio sigue en "próximos" hasta 3 h después de su hora. */
const corteProximos = () => localCdmx(new Date(Date.now() - 3 * 3600 * 1000));

const pesos = (n: number) => `$${n.toLocaleString("es-MX", { maximumFractionDigits: 2 })}`;

function pago(r: ServicioChofer) {
  if (r.pago != null) return pesos(Number(r.pago));
  return r.pago_texto || "Por definir";
}

function color(unidad: string) {
  const u = unidad.toLowerCase();
  if (u.includes("lux") || u.includes("high")) return e.lux;
  if (u.includes("exec")) return e.exec;
  if (u.includes("urban") || u.includes("van")) return e.urban;
  return e.sedan;
}

function Proximo({ r, lang }: { r: ServicioChofer; lang: string }) {
  const p = partes(r.servicio);
  const tel = (r.telefono || "").replace(/[^0-9]/g, "");
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.origen)}`;
  return (
    <article id={r.folio} className={`${e.card} ${color(r.unidad)}`}>
      <header className={e.top}>
        <span className={e.hora}>{p ? p.hora : "Hora por confirmar"}</span>
        <span className={e.unidad}>{r.unidad}</span>
        {r.estado && <span className={e.pagado}>{ESTADOS.find((x) => x.valor === r.estado)?.texto}</span>}
      </header>
      <p className={e.cliente}>
        {r.cliente} <span className={e.folio}>{r.folio}</span>
      </p>
      <p className={e.ruta}>
        {r.origen} <span className={e.flecha}>›</span> {r.destino}
      </p>
      <p className={e.meta}>
        {[
          r.tipo ? TIPO[r.tipo] : "",
          r.horas ? `${r.horas} h` : "",
          r.vuelo ? `Vuelo ${r.vuelo}` : "",
          r.pasajeros ? `${r.pasajeros} pax` : "",
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {r.notas && <p className={e.notas}>{r.notas}</p>}
      <p className={s.pago}>Tu pago: {pago(r)}</p>
      <nav className={e.acciones}>
        {tel && <a href={`tel:+${tel}`}>Llamar cliente</a>}
        {tel && <a href={`https://wa.me/${tel}`}>WhatsApp cliente</a>}
        <a href={mapa}>Mapa recogida</a>
      </nav>
      <div className={s.estados}>
        {ESTADOS.map((x) => (
          <form key={x.valor} action={marcarEstado}>
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="folio" value={r.folio} />
            <input type="hidden" name="estado" value={x.valor} />
            <button className={r.estado === x.valor ? `${s.estado} ${s.actual}` : s.estado} type="submit">
              {x.texto}
            </button>
          </form>
        ))}
      </div>
    </article>
  );
}

function Realizado({ r }: { r: ServicioChofer }) {
  const p = partes(r.servicio);
  return (
    <li className={s.fila}>
      <div>
        <p className={s.filaTitulo}>
          {p ? `${p.etiqueta} · ${p.hora}` : "Sin fecha"} <span className={e.folio}>{r.folio}</span>
        </p>
        <p className={e.meta}>
          {r.cliente} · {r.origen} › {r.destino}
        </p>
      </div>
      <div className={s.filaPago}>
        <strong>{pago(r)}</strong>
        {r.pagado ? (
          <span className={e.pagado}>Pagado{r.comprobante ? ` · ${r.comprobante}` : ""}</span>
        ) : (
          <span className={e.anticipo}>Pendiente</span>
        )}
      </div>
    </li>
  );
}

export default async function ChoferPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { lang } = await params;
  const { error } = await searchParams;
  const token = (await cookies()).get(COOKIE_CHOFER)?.value || "";
  const portal = token ? await portalChofer(token) : null;

  if (!portal) {
    return (
      <main className={e.page}>
        <div className={e.login}>
          <h1 className={e.titulo}>Mis servicios</h1>
          <p className={e.sub}>EliteRoute · Choferes</p>
          {error && <p className={e.error}>El link no es válido.</p>}
          <p className={e.meta}>Entra con el link personal que te mandamos por WhatsApp. Si no lo tienes, pídelo a coordinación.</p>
        </div>
      </main>
    );
  }

  const corte = corteProximos();
  const proximos = portal.servicios.filter((r) => !r.servicio || r.servicio.slice(0, 16).replace(" ", "T") >= corte);
  const realizados = portal.servicios.filter((r) => !proximos.includes(r)).reverse();
  const porCobrar = realizados.filter((r) => !r.pagado && r.pago != null);
  const totalPorCobrar = porCobrar.reduce((t, r) => t + Number(r.pago), 0);

  const dias = new Map<string, ServicioChofer[]>();
  for (const r of proximos) {
    const k = partes(r.servicio)?.etiqueta || "Fecha por confirmar";
    dias.set(k, [...(dias.get(k) || []), r]);
  }

  return (
    <main className={e.page}>
      <header className={e.head}>
        <div>
          <h1 className={e.titulo}>Hola, {portal.chofer.split(" ")[0]}</h1>
          <p className={e.sub}>
            {proximos.length} próximos · por cobrar {pesos(totalPorCobrar)}
          </p>
        </div>
        <form action={salir}>
          <input type="hidden" name="lang" value={lang} />
          <button className={e.salir} type="submit">Salir</button>
        </form>
      </header>

      {proximos.length === 0 && <p className={e.sub}>No tienes servicios próximos.</p>}
      {[...dias].map(([dia, lista]) => (
        <section key={dia}>
          <h2 className={e.dia}>{dia}</h2>
          {lista.map((r) => (
            <Proximo key={r.folio} r={r} lang={lang} />
          ))}
        </section>
      ))}

      {realizados.length > 0 && (
        <section>
          <h2 className={e.dia}>Realizados · últimos 45 días</h2>
          <ul className={s.lista}>
            {realizados.map((r) => (
              <Realizado key={r.folio} r={r} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
