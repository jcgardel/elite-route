import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MOVIMIENTOS,
  choferesEsquema,
  hoyCdmx,
  liquidacionSemana,
  lunesDe,
  sumarDias,
  totales,
  type ChoferEsquema,
  type ChoferLiq,
  type Totales,
} from "@/lib/liquidaciones";
import { COOKIE_EQUIPO } from "@/lib/reservas";
import { agregarMovimiento, borrarMovimiento, configurarChofer, definirPago, guardarUber, marcarPagado } from "./actions";
import s from "./liquidaciones.module.css";

/**
 * LIQUIDACIÓN SEMANAL DE CHOFERES (lunes a domingo).
 *
 * Los traslados EliteRoute salen solos de la tabla de reservas. Aquí solo se
 * captura lo de fuera: Uber de la semana, gasolina, gastos, adelantos y
 * reembolsos. El balance dice cuánto se le paga a cada chofer (o cuánto debe).
 */
export const metadata: Metadata = {
  title: "Liquidaciones · EliteRoute",
  robots: { index: false, follow: false },
};

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const ETIQUETA: Record<string, string> = Object.fromEntries(MOVIMIENTOS.map((m) => [m.tipo, m.etiqueta.split(" (")[0]]));
const SIGNO: Record<string, number> = Object.fromEntries(MOVIMIENTOS.map((m) => [m.tipo, m.signo]));

const mx = (v: number) =>
  `${v < 0 ? "−" : ""}$${Math.abs(v).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function dia(fecha: string) {
  const [y, m, d] = fecha.slice(0, 10).split("-").map(Number);
  return `${DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d} ${MESES[m - 1]}`;
}

function rango(lunes: string) {
  const [, m1, d1] = lunes.split("-").map(Number);
  const dom = sumarDias(lunes, 6);
  const [y2, m2, d2] = dom.split("-").map(Number);
  return m1 === m2 ? `${d1}–${d2} ${MESES[m2 - 1]} ${y2}` : `${d1} ${MESES[m1 - 1]} – ${d2} ${MESES[m2 - 1]} ${y2}`;
}

function wa(tel: string | null) {
  const d = (tel || "").replace(/\D/g, "");
  return d.length === 10 ? `52${d}` : d.length > 10 ? d : "";
}

/** Estado de cuenta para el chofer: solo lo suyo, sin precios al cliente. */
function mensaje(c: ChoferLiq, t: Totales, lunes: string) {
  const l = [`EliteRoute · Liquidación ${rango(lunes)}`, `Hola ${c.nombre.split(" ")[0]}, este es tu resumen de la semana:`, ""];
  if (c.servicios.length) {
    l.push(`Traslados EliteRoute (${c.servicios.length}): ${mx(t.elite)}`);
    for (const x of c.servicios) l.push(`• ${dia(x.fecha)} ${x.folio}: ${x.pago == null ? "por definir" : mx(x.pago)}`);
  }
  if (t.uberSuma) l.push(`Uber: ${mx(t.uberSuma)}`);
  for (const m of c.movimientos.filter((m) => m.tipo !== "uber"))
    l.push(`${ETIQUETA[m.tipo]}${m.concepto ? ` (${m.concepto})` : ""}: ${mx(SIGNO[m.tipo] * m.monto)}`);
  if (t.renta) l.push(`Renta semanal: ${mx(-t.renta)}`);
  l.push("", t.balance >= 0 ? `Total a pagarte: ${mx(t.balance)}` : `Saldo a tu cargo: ${mx(-t.balance)}`, "", "Cualquier duda, avísanos.");
  return l.join("\n");
}

function Oculto({ lang, semana, driver }: { lang: string; semana: string; driver: string }) {
  return (
    <>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="semana" value={semana} />
      <input type="hidden" name="driver" value={driver} />
    </>
  );
}

function Esquema({ c, lang, semana }: { c: ChoferEsquema | ChoferLiq; lang: string; semana: string }) {
  return (
    <form action={configurarChofer} className={s.fila}>
      <Oculto lang={lang} semana={semana} driver={c.driver_id} />
      <select name="esquema" defaultValue={c.esquema} className={s.campo} aria-label="Esquema">
        <option value="servicio">Sin renta (auto propio o por comisión)</option>
        <option value="renta">Auto de la flota · renta semanal</option>
      </select>
      <input name="renta" inputMode="decimal" placeholder="Renta $/sem" defaultValue={c.renta_semanal || ""} className={s.campo} aria-label="Renta semanal" />
      <label className={s.check}>
        <input type="checkbox" name="uber_flota" value="1" defaultChecked={c.uber_por_flota} /> Uber me paga a mí
      </label>
      <button className={s.boton}>Guardar</button>
    </form>
  );
}

function Chofer({ c, lang, semana }: { c: ChoferLiq; lang: string; semana: string }) {
  const t = totales(c);
  const tel = wa(c.tel);
  const pagado = c.pagado != null;
  const o = { lang, semana, driver: c.driver_id };

  return (
    <article id={c.driver_id} className={`${s.card} ${pagado ? s.pagadoCard : ""}`}>
      <header className={s.top}>
        <div>
          <h2 className={s.nombre}>{c.nombre}</h2>
          <p className={s.meta}>
            {c.esquema === "renta"
              ? `Renta ${mx(c.renta_semanal)}/sem · Uber ${c.uber_por_flota ? "lo cobro yo" : "lo cobra él"}`
              : "Sin renta (auto propio o por comisión)"}
          </p>
        </div>
        <div className={s.balance}>
          <span className={t.balance >= 0 ? s.aPagar : s.debe}>{mx(Math.abs(t.balance))}</span>
          <span className={s.meta}>{pagado ? `✓ ${t.balance >= 0 ? "Pagado" : "Cobrado"}` : t.balance >= 0 ? "A pagar" : "Debe"}</span>
        </div>
      </header>

      <dl className={s.desglose}>
        <dt>Traslados EliteRoute ({c.servicios.length})</dt>
        <dd>{mx(t.elite)}</dd>
        {c.esquema === "renta" && c.uber_por_flota && (
          <>
            <dt>Uber</dt>
            <dd>{mx(t.uber)}</dd>
          </>
        )}
        {(["reembolso", "bono", "gasolina", "gasto", "adelanto"] as const)
          .filter((k) => t.porTipo[k])
          .map((k) => (
            <div key={k} className={s.par}>
              <dt>{ETIQUETA[k]}</dt>
              <dd>{mx(SIGNO[k] * t.porTipo[k])}</dd>
            </div>
          ))}
        {t.renta > 0 && (
          <>
            <dt>Renta semanal</dt>
            <dd>{mx(-t.renta)}</dd>
          </>
        )}
      </dl>
      {pagado && c.pagado !== t.balance && (
        <p className={s.aviso}>Se marcó {mx(c.pagado!)} y ahora da {mx(t.balance)}: revisa y vuelve a marcar.</p>
      )}
      {t.sinPago > 0 && <p className={s.aviso}>{t.sinPago} traslado(s) sin pago definido</p>}
      {t.estimados > 0 && <p className={s.nota}>{t.estimados} traslado(s) con pago estimado por regla: confirma o corrige.</p>}

      {c.esquema === "renta" && c.uber_por_flota && (
        <form action={guardarUber} className={s.fila}>
          <Oculto {...o} />
          <input name="monto" inputMode="decimal" placeholder="Uber de la semana" defaultValue={t.uber || ""} className={s.campo} aria-label="Uber de la semana" />
          <button className={s.boton}>Guardar Uber</button>
        </form>
      )}

      <details className={s.det}>
        <summary>Traslados EliteRoute ({c.servicios.length})</summary>
        {c.servicios.length === 0 && <p className={s.meta}>Sin traslados esta semana.</p>}
        {c.servicios.map((x) => (
          <form key={x.folio} action={definirPago} className={s.servicio}>
            <Oculto {...o} />
            <input type="hidden" name="folio" value={x.folio} />
            <div className={s.servicioTxt}>
              <strong>{dia(x.fecha)} {x.fecha.slice(11, 16)}</strong> · {x.folio} · {x.unidad}
              {x.pendiente_pago && <span className={s.tag}>cliente sin pagar</span>}
              <br />
              <span className={s.meta}>
                {x.cliente} · {x.origen} › {x.destino}
              </span>
            </div>
            <input name="monto" inputMode="decimal" defaultValue={x.pago ?? ""} placeholder="Pago" className={`${s.campo} ${s.pago} ${x.origen_pago === "regla" ? s.estimado : ""}`} aria-label={`Pago ${x.folio}`} />
            <button className={s.boton} title="Guardar pago definitivo">✓</button>
          </form>
        ))}
      </details>

      <details className={s.det}>
        <summary>Gasolina, gastos y adelantos ({c.movimientos.filter((m) => m.tipo !== "uber").length})</summary>
        {c.movimientos
          .filter((m) => m.tipo !== "uber")
          .map((m) => (
            <form key={m.id} action={borrarMovimiento} className={s.fila}>
              <Oculto {...o} />
              <input type="hidden" name="id" value={m.id} />
              <span className={s.movTxt}>
                {ETIQUETA[m.tipo]}
                {m.concepto ? ` · ${m.concepto}` : ""}
              </span>
              <span>{mx(SIGNO[m.tipo] * m.monto)}</span>
              <button className={s.quitar} aria-label="Quitar">×</button>
            </form>
          ))}
        <form action={agregarMovimiento} className={s.fila}>
          <Oculto {...o} />
          <select name="tipo" className={s.campo} aria-label="Tipo">
            {MOVIMIENTOS.map((m) => (
              <option key={m.tipo} value={m.tipo}>
                {m.etiqueta}
              </option>
            ))}
          </select>
          <input name="concepto" placeholder="Concepto (opcional)" className={s.campo} maxLength={80} />
          <input name="monto" inputMode="decimal" placeholder="Monto" required className={`${s.campo} ${s.pago}`} />
          <button className={s.boton}>Agregar</button>
        </form>
      </details>

      <details className={s.det}>
        <summary>Esquema del chofer</summary>
        <Esquema c={c} lang={lang} semana={semana} />
      </details>

      <nav className={s.acciones}>
        {tel && (
          <a className={s.wa} href={`https://wa.me/${tel}?text=${encodeURIComponent(mensaje(c, t, semana))}`}>
            Enviar resumen
          </a>
        )}
        <form action={marcarPagado}>
          <Oculto {...o} />
          {pagado && <input type="hidden" name="desmarcar" value="1" />}
          <button className={pagado ? s.salir : s.botonOro}>{pagado ? "Desmarcar" : t.balance >= 0 ? "Marcar pagado" : "Marcar cobrado"}</button>
        </form>
      </nav>
    </article>
  );
}

export default async function LiquidacionesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ semana?: string }>;
}) {
  const { lang } = await params;
  const { semana: q } = await searchParams;
  const clave = (await cookies()).get(COOKIE_EQUIPO)?.value || "";
  // Por defecto la última semana cerrada: es la que se paga el lunes.
  const semana = q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? lunesDe(q) : sumarDias(lunesDe(hoyCdmx()), -7);
  const choferes = await liquidacionSemana(clave, semana);
  if (!choferes) redirect(`/${lang}/equipo`);
  const todos = await choferesEsquema(clave);

  const conT = choferes.map((c) => ({ c, t: totales(c) }));
  const aPagar = conT.filter((x) => x.t.balance > 0 && x.c.pagado == null).reduce((a, x) => a + x.t.balance, 0);
  const porCobrar = conT.filter((x) => x.t.balance < 0 && x.c.pagado == null).reduce((a, x) => a - x.t.balance, 0);
  const pendientes = conT.filter((x) => x.c.pagado == null && x.t.balance !== 0).length;
  const faltaUber = conT.filter((x) => x.c.esquema === "renta" && x.c.uber_por_flota && !x.t.uber).length;
  const base = `/${lang}/equipo/liquidaciones?semana=`;

  return (
    <main className={s.page}>
      <header className={s.head}>
        <div>
          <h1 className={s.titulo}>Liquidaciones</h1>
          <p className={s.sub}>Semana {rango(semana)} · lunes a domingo</p>
        </div>
        <Link className={s.salir} href={`/${lang}/equipo`}>
          Servicios
        </Link>
      </header>

      <nav className={s.semanas}>
        <Link href={`${base}${sumarDias(semana, -7)}`}>‹ Anterior</Link>
        <Link href={`${base}${lunesDe(hoyCdmx())}`}>Esta semana</Link>
        <Link href={`${base}${sumarDias(semana, 7)}`}>Siguiente ›</Link>
      </nav>

      <section className={s.resumen}>
        <div>
          <span className={s.aPagar}>{mx(aPagar)}</span>
          <span className={s.meta}>por pagar</span>
        </div>
        <div>
          <span className={s.debe}>{mx(porCobrar)}</span>
          <span className={s.meta}>por cobrar</span>
        </div>
        <div>
          <span className={s.cifra}>{pendientes}</span>
          <span className={s.meta}>pendientes</span>
        </div>
      </section>
      {faltaUber > 0 && <p className={s.aviso}>Falta capturar Uber de {faltaUber} chofer(es) en renta.</p>}

      <details className={s.ayuda}>
        <summary>Cómo se hace cada lunes</summary>
        <ol>
          <li>Los traslados EliteRoute ya están cargados. Revisa los marcados en amarillo (pago estimado) y corrige si hace falta.</li>
          <li>A los choferes en renta con Uber a la flota, captura lo que pagó Uber esa semana (panel de Uber Flota › Pagos).</li>
          <li>Agrega gasolina, gastos, adelantos o reembolsos de cada chofer.</li>
          <li>Toca “Enviar resumen” para mandarle su estado de cuenta por WhatsApp.</li>
          <li>Paga (o cobra) y toca “Marcar pagado”.</li>
        </ol>
      </details>

      {choferes.length === 0 && <p className={s.sub}>Sin movimientos esta semana.</p>}
      {choferes.map((c) => (
        <Chofer key={c.driver_id} c={c} lang={lang} semana={semana} />
      ))}

      <details className={s.det}>
        <summary>Esquema de todos los choferes</summary>
        <p className={s.meta}>Por defecto todos son "Sin renta (auto propio o por comisión)": solo se les pagan sus traslados EliteRoute. Los de auto de la flota aparecen cada semana aunque no tengan traslados.</p>
        {todos.map((c) => (
          <div key={c.driver_id} className={s.esquemaFila}>
            <strong>{c.nombre}</strong>
            <Esquema c={c} lang={lang} semana={semana} />
          </div>
        ))}
      </details>
    </main>
  );
}
