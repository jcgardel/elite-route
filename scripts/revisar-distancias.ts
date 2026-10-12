/**
 * REVISIÓN DE DISTANCIAS. Compara lo que declara lib/distances.ts con lo que
 * mide Google hoy, y dice cuánto se ha desviado el precio publicado.
 *
 *     npm run revisar-distancias
 *
 * POR QUÉ EXISTE. Las tablas del sitio publican un precio fijo por ruta,
 * calculado con una distancia escrita en el código. El cotizador y el checkout
 * miden la ruta real en el momento de reservar. Esos dos números se separan
 * solos: entre el 5 y el 12 de octubre de 2026, AICM–Santa Fe pasó de 28.2 a
 * 25.0 km sin que nadie tocara nada, porque Google cambió la ruta que elige.
 *
 * Esto NO corrige nada. Sólo mide y presenta, porque los precios los valida el
 * dueño antes de publicarse.
 *
 * LO QUE NO PUEDE ARREGLARSE Y CONVIENE RECORDAR AL LEER LA SALIDA:
 *
 *  1. La distancia es DIRECCIONAL. AICM -> Zócalo son 8.5 km y Zócalo -> AICM
 *     son 11.4. El código guarda un número por ruta y lo usa en las dos
 *     columnas, así que una de las dos siempre se desvía.
 *  2. Las páginas genéricas —"AIFA -> CDMX", "Toluca -> CDMX"— publican un
 *     precio para una ciudad entera. Se miden contra el Ángel de la
 *     Independencia, que es el punto representativo que eligió el dueño el
 *     5 oct 2026.
 *  3. A distancias cortas manda el MÍNIMO de la categoría, no el kilometraje:
 *     ahí una desviación de kilómetros no mueve el precio ni un peso.
 *
 * UNA SOLA LECTURA NO ES PRUEBA. Google cambia de ruta por obras, cortes o
 * tráfico, y a veces resuelve el mismo texto a un punto distinto. El 12 oct
 * 2026 "AIFA -> Ángel" dio 53.7 km en una medición y 41.6 en otra el mismo
 * día. Antes de mover un precio publicado, repetir la medición en otro
 * momento y quedarse con el número que se repite.
 *
 * LAS DIRECCIONES SON PUNTOS IDENTIFICABLES A PROPÓSITO. El nombre de una
 * colonia a secas resuelve mal: "Santa Fe, Ciudad de Mexico" llegó a devolver
 * 19.9 km desde el AICM, que es imposible. Si se cambia un destino de esta
 * lista, que sea por otro igual de concreto.
 */
import { calculatePrice } from "../lib/booking";
import { LEGS } from "../lib/distances";
import { CATEGORIES } from "../lib/vehicles";

const API = "https://www.eliteroute.mx/api/maps";
const AICM = "Aeropuerto Internacional Benito Juarez Terminal 1, Ciudad de Mexico";
const AIFA = "Aeropuerto Internacional Felipe Angeles, Zumpango, Estado de Mexico";
const TLC = "Aeropuerto Internacional de Toluca, Lerma, Estado de Mexico";
const ANGEL = "Angel de la Independencia, Paseo de la Reforma, Juarez, Cuauhtemoc, Ciudad de Mexico";

/** La ruta tal como se mide: de dónde a dónde, y con qué clave se compara. */
const RUTAS: Array<{ key: keyof typeof LEGS; origen: string; destino: string; nota?: string }> = [
  { key: "centro", origen: AICM, destino: "Zocalo, Centro Historico, Cuauhtemoc, Ciudad de Mexico" },
  { key: "polanco", origen: AICM, destino: "Avenida Presidente Masaryk, Polanco, Miguel Hidalgo, Ciudad de Mexico" },
  { key: "santafe", origen: AICM, destino: "Centro Santa Fe, Alvaro Obregon, Ciudad de Mexico" },
  { key: "satelite", origen: AICM, destino: "Plaza Satelite, Naucalpan de Juarez, Estado de Mexico" },
  { key: "coyoacan", origen: AICM, destino: "Jardin Centenario, Coyoacan, Ciudad de Mexico" },
  { key: "delvalle", origen: AICM, destino: "Parque Hundido, Del Valle, Benito Juarez, Ciudad de Mexico" },
  { key: "interlomas", origen: AICM, destino: "Centro Comercial Interlomas, Huixquilucan, Estado de Mexico" },
  { key: "aifapolanco", origen: AIFA, destino: "Avenida Presidente Masaryk, Polanco, Miguel Hidalgo, Ciudad de Mexico" },
  { key: "aifasantafe", origen: AIFA, destino: "Centro Santa Fe, Alvaro Obregon, Ciudad de Mexico" },
  { key: "aifa", origen: AIFA, destino: ANGEL, nota: "punto representativo de CDMX" },
  { key: "toluca", origen: TLC, destino: ANGEL, nota: "punto representativo de CDMX" },
  // Las foráneas se miden desde el AICM. El dueño decidió el 3 y el 5 de
  // octubre de 2026 NO corregirlas: aparecen para vigilarlas, no para cambiarlas.
  { key: "cuernavaca", origen: AICM, destino: "Cuernavaca, Morelos, Mexico", nota: "foránea, no se corrige" },
  { key: "tepoztlan", origen: AICM, destino: "Tepoztlan, Morelos, Mexico", nota: "foránea, no se corrige" },
  { key: "puebla", origen: AICM, destino: "Puebla de Zaragoza, Puebla, Mexico", nota: "foránea, no se corrige" },
  { key: "vallebravo", origen: AICM, destino: "Valle de Bravo, Estado de Mexico, Mexico", nota: "foránea, no se corrige" },
  { key: "queretaro", origen: AICM, destino: "Santiago de Queretaro, Queretaro, Mexico", nota: "foránea, no se corrige" },
  { key: "sanmiguel", origen: AICM, destino: "San Miguel de Allende, Guanajuato, Mexico", nota: "foránea, no se corrige" },
];

/**
 * La API tiene límite de peticiones. Con 4 s la mitad de las foráneas caía en
 * "Demasiadas solicitudes" —comprobado el 12 oct 2026—, así que son 8 s más un
 * reintento. Una revisión completa tarda unos tres minutos; no hay prisa.
 */
const ESPERA_MS = 8000;
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function pedir(origen: string, destino: string) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin: origen, destination: destino }),
  });
  return (await res.json()) as { km?: number; minutes?: number; error?: string };
}

async function medir(origen: string, destino: string) {
  let d = await pedir(origen, destino);
  if (!d.km && /solicitudes/i.test(d.error ?? "")) {
    await dormir(ESPERA_MS * 2);
    d = await pedir(origen, destino);
  }
  if (!d.km) throw new Error(d.error ?? "respuesta sin kilómetros");
  return { km: d.km, min: d.minutes ?? 0 };
}

const mxn = (n: number) => "$" + n.toLocaleString("es-MX");

async function main() {
  console.log(`Revisión de distancias · ${new Date().toLocaleDateString("es-MX")}\n`);
  console.log("ruta             declarado   medido    dif     precio Executive        acción");
  console.log("-".repeat(92));

  const aCorregir: string[] = [];

  for (const r of RUTAS) {
    const leg = LEGS[r.key];
    let medido: { km: number; min: number };
    try {
      medido = await medir(r.origen, r.destino);
    } catch (e) {
      console.log(`${r.key.padEnd(16)} ${String(leg.km).padStart(8)}   ERROR: ${(e as Error).message}`);
      await dormir(ESPERA_MS);
      continue;
    }

    const foranea = r.nota === "foránea, no se corrige";
    const conRecargo = !foranea;
    const publicado = calculatePrice(leg.km, leg.min, "executive", "route", 0, conRecargo);
    const real = calculatePrice(medido.km, leg.min, "executive", "route", 0, conRecargo);
    const difKm = medido.km - leg.km;
    const difPct = (difKm / medido.km) * 100;
    const difPrecio = real - publicado;

    // Umbral: 5 % de desviación O $150 de diferencia en Executive. Por debajo
    // de eso no vale la pena mover un precio publicado ni pedir reindexación.
    const importa = !foranea && (Math.abs(difPct) >= 5 || Math.abs(difPrecio) >= 150);
    if (importa) aCorregir.push(`${r.key}: ${leg.km} -> ${medido.km} km (${difPrecio >= 0 ? "+" : ""}${mxn(difPrecio)})`);

    const accion = foranea ? "—" : importa ? "REVISAR" : "ok";
    console.log(
      `${r.key.padEnd(16)} ${String(leg.km).padStart(8)} ${String(medido.km).padStart(8)} ` +
        `${(difKm >= 0 ? "+" : "") + difKm.toFixed(1)}`.padStart(7) +
        `   ${mxn(publicado).padStart(7)} -> ${mxn(real).padStart(7)} ` +
        `${((difPrecio >= 0 ? "+" : "") + mxn(difPrecio)).padStart(9)}   ${accion}` +
        (r.nota && !foranea ? `  (${r.nota})` : ""),
    );
    await dormir(ESPERA_MS);
  }

  console.log("\n" + "-".repeat(92));
  if (aCorregir.length === 0) {
    console.log("Ninguna ruta pasa el umbral. No hay nada que hacer.");
  } else {
    console.log(`${aCorregir.length} ruta(s) pasan el umbral del 5 % o $150:\n`);
    for (const l of aCorregir) console.log("   " + l);
    console.log(
      "\nSIGUIENTE PASO: enseñarle esta tabla al dueño ANTES de tocar lib/distances.ts.\n" +
        "Los precios se validan con él; el guion sólo mide.",
    );
  }
}

main();
