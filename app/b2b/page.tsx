import type { Metadata } from "next";
import B2bClient from "./B2bClient";

export const metadata: Metadata = {
  title: "Transporte Ejecutivo Corporativo CDMX | Elite Route B2B",
  description:
    "Cuenta corporativa para empresas en CDMX. Rutas recurrentes, factura electrónica CFDI, choferes verificados y pago con Stripe, Mercado Pago o transferencia bancaria.",
  openGraph: {
    title: "Transporte Ejecutivo Corporativo CDMX | Elite Route",
    description: "Cuenta corporativa, factura CFDI y choferes verificados en CDMX.",
    url: "https://eliteroute.mx/b2b",
    siteName: "Elite Route",
    locale: "es_MX",
    type: "website",
  },
};

/**
 * Los metadatos se quedan en español: esta página atiende al comprador
 * corporativo mexicano. El contenido es bilingüe — ver B2bClient.
 */
export default function B2BPage() {
  return <B2bClient />;
}
