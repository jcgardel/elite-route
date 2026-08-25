import type { NextConfig } from "next";
import { LEGACY_ROUTES } from "./lib/i18n";

const nextConfig: NextConfig = {
  /**
   * Las direcciones que el sitio tuvo antes de que el idioma viviera en la
   * URL. Todas eran páginas en español, así que todas van al lado español:
   * mandar a inglés lo que Google indexó en español rompería la
   * correspondencia entre lo que el buscador guardó y lo que encuentra.
   *
   * Son 308 permanentes porque el cambio lo es. La raíz no está aquí: la
   * resuelve el middleware, porque su destino depende del visitante.
   */
  async redirects() {
    return [
      ...LEGACY_ROUTES.map(({ from, to }) => ({
        source: from,
        destination: to,
        permanent: true,
      })),
      // Las páginas de resultado de pago cambian de sitio igual que el resto,
      // pero temporalmente: hay sesiones de Stripe ya creadas cuyo success_url
      // apunta a la dirección vieja, y no conviene que un navegador se quede
      // con la redirección cacheada para siempre. La query (?session_id=) se
      // conserva sola.
      { source: "/success", destination: "/en/success", permanent: false },
      { source: "/cancel", destination: "/en/cancel", permanent: false },
    ];
  },
};

export default nextConfig;
