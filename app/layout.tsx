import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elite Route",
  description: "Cotizador de transporte ejecutivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
