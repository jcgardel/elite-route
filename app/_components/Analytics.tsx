import Script from "next/script";
import { GA_ID, analyticsEnabled } from "@/lib/analytics";

/**
 * Carga GA4, y sólo si hay un identificador configurado.
 *
 * `strategy="afterInteractive"` es deliberado: la etiqueta se pide DESPUÉS de
 * que la página sea usable, no antes. Medir no puede retrasar el momento en
 * que alguien puede empezar a cotizar.
 *
 * Las dos banderas de abajo separan medir de anunciar. Sin ellas GA4 usa los
 * datos del visitante para construir audiencias publicitarias, que es una
 * finalidad distinta de la que declara el aviso de privacidad.
 *
 * NO LAS ENCIENDAS SOLAS. El sitio promete lo contrario en TRES archivos, y
 * los tres tienen que moverse en el mismo commit:
 *   · lib/legal.ts                      → la entrada "Google Analytics" de
 *                                         `encargados` (`para` y `forWhat`)
 *   · app/[lang]/privacidad/page.tsx    → el párrafo de cookies
 *   · app/[lang]/privacy/page.tsx       → su gemelo en inglés
 * Entre encender la bandera y corregir el texto, el sitio recoge datos para
 * una finalidad que le dice al visitante que no recoge. El procedimiento
 * entero está en el README, sección "Google Ads".
 *
 * Para IMPORTAR CONVERSIONES a Google Ads no hace falta tocar nada de esto:
 * eso se hace enlazando las cuentas en la consola. Sólo el remarketing pide
 * estas banderas.
 */
export default function Analytics() {
  if (!analyticsEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
