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
