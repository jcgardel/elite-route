import LegalPage from "../../_components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { path } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export async function generateMetadata() {
  return pageMetadata("en", "privacy");
}

/**
 * La versión en inglés del aviso de privacidad, traducida de /es/privacidad.
 *
 * Se publica con la nota de que el original en español es el que rige. No es
 * una fórmula de cortesía: el aviso responde a la Ley Federal de Protección
 * de Datos Personales en Posesión de los Particulares, que es una ley
 * mexicana escrita en español, y un matiz perdido en la traducción no puede
 * cambiar lo que el responsable se obliga a cumplir.
 *
 * Al cambiar este archivo hay que cambiar también su gemelo en español, y al
 * revés. Son el mismo documento.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      lang="en"
      page="privacy"
      kicker="Personal data"
      title="Privacy notice"
      intro={`${LEGAL.responsable} collects your data in order to quote and provide a transfer. This is exactly what we ask for, what it is used for, who else sees it and how to have it corrected or deleted.`}
    >
      <div className="lg-note">
        <p>
          This is a translation provided for convenience. In case of any
          discrepancy, the Spanish version at{" "}
          <a href={path("es", "privacy")}>eliteroute.mx/es/privacidad</a>{" "}
          prevails, as it is the one that answers to Mexican data protection
          law.
        </p>
      </div>

      <h2>Who is responsible for your data</h2>
      <p>
        <strong>{LEGAL.responsable}</strong>, which operates{" "}
        <a href={`https://${LEGAL.sitio}`}>{LEGAL.sitio}</a>, is responsible for
        processing the personal data you provide.
        {LEGAL.razonSocial ? ` Legal entity: ${LEGAL.razonSocial}.` : ""}
        {LEGAL.rfc ? ` Tax ID (RFC): ${LEGAL.rfc}.` : ""}
        {LEGAL.domicilio ? ` Address: ${LEGAL.domicilio}.` : ""}
      </p>
      <p>
        For anything concerning your personal data, including exercising your
        ARCO rights (access, rectification, cancellation and objection under
        Mexican law), write to{" "}
        <a href={`mailto:${LEGAL.correoPrivacidad}`}>{LEGAL.correoPrivacidad}</a>.
      </p>

      <h2>What we collect</h2>
      <p>Only what it takes to move you from one place to another and charge for it:</p>
      <table className="lg-table">
        <tbody>
          <tr>
            <td>When you quote</td>
            <td>Pickup, destination, date and time of the service, and vehicle category.</td>
          </tr>
          <tr>
            <td>When you book</td>
            <td>Full name and phone number. Stripe additionally collects your email address during payment.</td>
          </tr>
          <tr>
            <td>When you pay</td>
            <td>
              Your card details are captured directly by Stripe.{" "}
              <strong>They never pass through this site and are never stored on our servers.</strong>
            </td>
          </tr>
          <tr>
            <td>Corporate services</td>
            <td>Company name, tax ID, contact person and email address, when you request a corporate quote.</td>
          </tr>
          <tr>
            <td>Technical data</td>
            <td>IP address and access logs, which the hosting provider keeps in order to run the site and limit abuse of the quote form.</td>
          </tr>
        </tbody>
      </table>
      <p>
        We do not ask for sensitive data and we do not create user accounts. We
        do use analytics cookies: Google Analytics tells us how many people
        arrive and where they stop in the quote form, so we know which part of
        the site is failing. It is set up for measurement only — Google's
        advertising signals and ad personalisation are switched off — so we do
        not use that data to follow you with ads, and we do not share it with
        anyone for that purpose. We run no advertising cookies. You can block
        these cookies in your browser and the site still works: neither the
        quote form nor the payment depends on them.
      </p>

      <h2>What we use it for</h2>
      <ul>
        <li>Calculating the route and the price of your transfer.</li>
        <li>Providing the service: assigning a chauffeur and vehicle, and coordinating the pickup.</li>
        <li>Charging the booking and sending you the receipt and confirmation.</li>
        <li>Contacting you by WhatsApp, phone or email about that particular transfer.</li>
        <li>Issuing an invoice when you request one.</li>
        <li>Meeting tax and accounting obligations.</li>
      </ul>
      <p>
        We do not sell your data, we do not share it with third parties for
        advertising, and we do not send you promotions unless you ask for them.
      </p>

      <h2>Who else processes it</h2>
      <p>
        We rely on outside services to operate. Each one receives only what it
        needs to do its job:
      </p>
      <table className="lg-table">
        <tbody>
          {LEGAL.encargados.map((e) => (
            <tr key={e.nombre}>
              <td>{e.nombre}</td>
              <td>{e.forWhat}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        These providers process the information on our behalf and under their
        own privacy policies.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Transfer data is kept for as long as the client relationship lasts and
        afterwards for the period Mexican tax law requires for transaction
        records. The site&rsquo;s technical logs are kept for short periods set
        by the hosting provider.
      </p>

      <h2>Your ARCO rights</h2>
      <p>
        You may request at any time <strong>access</strong> to your personal
        data, its <strong>rectification</strong> when it is inaccurate, its{" "}
        <strong>cancellation</strong> when you consider it is no longer needed,
        and you may <strong>object</strong> to its use for specific purposes.
        You may also withdraw your consent.
      </p>
      <p>
        Write to <a href={`mailto:${LEGAL.correoPrivacidad}`}>{LEGAL.correoPrivacidad}</a>{" "}
        with your name, a way to reach you and what you are asking for. We reply
        the same way. Bear in mind that some information cannot be deleted right
        away when there is a tax obligation to retain it, and that the payment
        record also lives at Stripe.
      </p>

      <h2>Changes to this notice</h2>
      <p>
        If the way we handle data changes, we will update this notice at this
        same address and change the date in the header.
      </p>
    </LegalPage>
  );
}
