/**
 * Directorio de choferes (Tarjetas_Choferes_Elite_Route.pdf). Alimenta /equipo.
 * `tel`: WhatsApp interno para mandarle el servicio. `telCliente`: el que ve el
 * cliente, si es distinto. `tarjeta`: imagen en /public/choferes.
 * `alias`: nombres anteriores, para que los servicios ya asignados los reconozcan.
 */
export type Chofer = {
  nombre: string;
  tel: string;
  telCliente?: string;
  auto: string;
  color: string;
  placa: string;
  tarjeta: string;
  alias?: string[];
};

export const CHOFERES: Chofer[] = [
  { nombre: "Kevin López", tel: "+52 55 5199 6496", auto: "Chevrolet Captiva", color: "Gris", placa: "NXE-508-C", tarjeta: "kevin-lopez" },
  { nombre: "Marcos Soto", tel: "+52 56 4442 1242", auto: "Tesla Model 3", color: "Rojo", placa: "07G-339-G", tarjeta: "marcos-soto" },
  { nombre: "Armando Soto", tel: "+52 55 5818 0877", auto: "Chevrolet Captiva", color: "Negro", placa: "X54-BPK", tarjeta: "armando-soto", alias: ["Don Armando"] },
  { nombre: "Luis Noriega", tel: "+52 56 2144 1945", auto: "Chevrolet Captiva", color: "Gris", placa: "LSH-295-C", tarjeta: "luis-noriega" },
  { nombre: "Paulo Traveseras", tel: "+52 55 7298 8365", auto: "Chevrolet Captiva", color: "Blanco", placa: "NAC-155-B", tarjeta: "paulo-traveseras", alias: ["Paulo Travesares", "Paulo"] },
  { nombre: "José Gardel", tel: "+52 55 1836 3817", telCliente: "+52 55 4358 2919", auto: "Chevrolet Suburban", color: "Negro", placa: "RDZ-836-E", tarjeta: "jose-gardel" },
  { nombre: "Rodrigo Pineda", tel: "+52 55 4827 4770", auto: "Mercedes-Benz GLA", color: "Gris", placa: "H99-BNF", tarjeta: "rodrigo-pineda" },
  { nombre: "Itzel Sánchez", tel: "+52 55 4130 1651", auto: "Lexus ES", color: "Negro", placa: "41H-806", tarjeta: "itzel-sanchez" },
  { nombre: "Rubén Alejandro", tel: "+52 56 2022 0348", auto: "BMW X1", color: "Azul", placa: "G29-BPL", tarjeta: "ruben-alejandro" },
  { nombre: "José Luis Islas", tel: "+52 55 4918 0801", auto: "BMW Serie 3", color: "Blanco", placa: "J25-BCY", tarjeta: "jose-luis-islas", alias: ["José Islas"] },
  { nombre: "Ivan Zuñiga", tel: "+52 55 3387 5193", auto: "Nissan Kicks", color: "Blanco", placa: "10K-952", tarjeta: "ivan-zuniga" },
  { nombre: "Isaí Hernández", tel: "+52 56 4946 5408", auto: "Audi Q2", color: "Plata", placa: "LZG-638-A", tarjeta: "isai-hernandez" },
  { nombre: "Luis Daniel", tel: "+52 55 1080 0335", auto: "Audi A3", color: "Plata", placa: "C20-BUE", tarjeta: "luis-daniel" },
  { nombre: "Armando Traveseras", tel: "+52 55 3464 5222", auto: "Nissan Versa", color: "Azul", placa: "NZT-66-73", tarjeta: "armando-traveseras", alias: ["Armando Travesares"] },
  { nombre: "Armando Noriega", tel: "+52 55 1371 0455", auto: "Audi A3", color: "Negro", placa: "PDE-476-A", tarjeta: "armando-noriega" },
  { nombre: "Erick Zavala", tel: "+52 55 1201 4183", auto: "Chevrolet Suburban", color: "Negro", placa: "014-BLE", tarjeta: "erick-zavala" },
  { nombre: "Omar Pérez", tel: "+52 55 2891 5576", auto: "Audi A3", color: "Gris", placa: "NRB-130-B", tarjeta: "omar-perez", alias: ["Omar Perez"] },
  { nombre: "Gabriel Zúñiga", tel: "+52 55 2350 8983", auto: "Nissan Kicks", color: "Gris", placa: "54K-365", tarjeta: "gabriel-zuniga", alias: ["Gabriel"] },
];

const clave = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

/** Chofer del directorio por nombre o alias (sin importar acentos ni mayúsculas). */
export function choferDe(nombre: string | null | undefined) {
  const k = clave(nombre || "");
  if (!k) return undefined;
  return CHOFERES.find((c) => clave(c.nombre) === k || c.alias?.some((a) => clave(a) === k));
}

/** WhatsApp del directorio para un nombre. */
export function telDeChofer(nombre: string) {
  return choferDe(nombre)?.tel || "";
}
