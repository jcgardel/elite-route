/** Directorio de choferes (Directorio_de_Choferes_EliteRoute.pdf). Alimenta /equipo. */
export const CHOFERES: { nombre: string; tel: string }[] = [
  { nombre: "Armando Noriega", tel: "+52 55 1371 0455" },
  { nombre: "Don Armando", tel: "+52 55 5818 0877" },
  { nombre: "Luis Noriega", tel: "+52 56 2144 1945" },
  { nombre: "José Islas", tel: "+52 55 4918 0801" },
  { nombre: "Armando Travesares", tel: "+52 55 3464 5222" },
  { nombre: "Rodrigo Pineda", tel: "+52 55 4827 4770" },
  { nombre: "Rubén Alejandro", tel: "+52 56 2022 0348" },
  { nombre: "Gabriel", tel: "+52 55 2350 8983" },
  { nombre: "Kevin López", tel: "+52 55 5199 6496" },
  { nombre: "Paulo Travesares", tel: "+52 55 7298 8365" },
  { nombre: "José Gardel", tel: "+52 55 1836 3817" },
  { nombre: "Luis Daniel", tel: "+52 55 1080 0335" },
  { nombre: "Itzel Sánchez", tel: "+52 55 4130 1651" },
];

const clave = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

/** WhatsApp del directorio para un nombre (sin importar acentos ni mayúsculas). */
export function telDeChofer(nombre: string) {
  return CHOFERES.find((c) => clave(c.nombre) === clave(nombre))?.tel || "";
}
