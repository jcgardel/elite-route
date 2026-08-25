import LegalPage from "../../_components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { path } from "@/lib/i18n";
import { LEGAL } from "@/lib/legal";

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export async function generateMetadata() {
  return pageMetadata("en", "terms");
}

/**
 * La versión en inglés de los términos, traducida de /es/terminos.
 *
 * Como en el aviso de privacidad, el original en español es el que rige: el
 * contrato se celebra en México y se juzga en tribunales mexicanos. Los dos
 * archivos se cambian juntos o no se cambia ninguno.
 *
 * PENDIENTE DEL DUEÑO — la sección de cancelaciones describe el proceso real
 * de hoy porque no hay una tabla de porcentajes decidida.
 */
export default function TermsPage() {
  return (
    <LegalPage
      lang="en"
      page="terms"
      kicker="Service conditions"
      title="Terms of service"
      intro="The rules of an Elite Route booking, written the way they actually work: what the price covers, how far ahead you book, what happens if your flight is delayed, and how a transfer is changed or cancelled."
    >
      <div className="lg-note">
        <p>
          This is a translation provided for convenience. In case of any
          discrepancy, the Spanish version at{" "}
          <a href={path("es", "terms")}>eliteroute.mx/es/terminos</a> prevails,
          as it is the one governed by Mexican law.
        </p>
      </div>

      <h2>What a booking is</h2>
      <p>
        By paying through the quote form you are requesting a private transfer
        with a chauffeur for a given date, time, pickup and destination.{" "}
        <strong>The booking remains subject to final confirmation of availability</strong>{" "}
        by {LEGAL.responsable}. We confirm by WhatsApp or email within minutes of
        payment. If no vehicle is available, the full amount is refunded.
      </p>

      <h2>Minimum notice</h2>
      <p>
        Transfers are booked at least <strong>6 hours in advance</strong>. The
        quote form will not let you pick a closer time. For anything more
        immediate, message us on WhatsApp at{" "}
        <a href={LEGAL.whatsappUrl}>{LEGAL.whatsapp}</a> and we will tell you
        whether a vehicle is free.
      </p>

      <h2>Price</h2>
      <p>
        The price shown in the quote form is <strong>fixed and includes VAT</strong>.
        It is calculated from the estimated distance and duration of the route,
        the vehicle category and, for airport pickups, the parking and waiting
        charge.
      </p>
      <ul>
        <li>There are no surcharges for traffic, for night hours, or for tolls within the quoted route.</li>
        <li>Route changes during the service, extra waiting requested on the spot, and stops that were not quoted are agreed and charged separately.</li>
        <li>On hourly and daily services, the included mileage is shown in the quote form before you pay.</li>
      </ul>

      <h2>Airport pickups</h2>
      <p>
        Pickups from any airport include{" "}
        <strong>parking and waiting time for flight delays</strong>. We track the
        flight and the chauffeur waits as long as needed at no extra cost. For
        that to work, give us your flight number when you confirm.
      </p>

      <h2>Luggage and passengers</h2>
      <p>
        Each vehicle category states its passenger and luggage capacity in the
        quote form. If you are travelling with more luggage than listed — or
        with special equipment — tell us beforehand so we can assign the right
        vehicle. The chauffeur may refuse a load that exceeds what the vehicle
        can carry safely.
      </p>

      <h2>Changes and cancellations</h2>
      <p>
        To change or cancel a transfer, message us on WhatsApp at{" "}
        <a href={LEGAL.whatsappUrl}>{LEGAL.whatsapp}</a> or write to{" "}
        <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>{" "}
        quoting your booking reference.
      </p>
      <p>
        Today <strong>each request is reviewed individually</strong>: the team
        confirms the change or the refund depending on how much notice was given
        and whether a vehicle had already been assigned. Refunds are processed
        back through the original payment method via Stripe, and the bank may
        take several business days to show them.
      </p>

      <h2>Liability</h2>
      <p>
        We provide the service with licensed chauffeurs and roadworthy vehicles.
        We are not liable for delays caused by events outside our control —
        extraordinary traffic, roadblocks, weather or road closures — though we
        will do what is reasonable to warn you and offer an alternative.
      </p>
      <p>
        Check the vehicle before you get out: items left behind are kept and
        returned when they can be traced, but we cannot guarantee their custody.
      </p>

      <h2>Invoicing</h2>
      <p>
        We issue CFDI invoices on request. Write to{" "}
        <a href={`mailto:${LEGAL.correoPrivacidad}`}>{LEGAL.correoPrivacidad}</a>{" "}
        with your tax details and the booking reference. The payment
        confirmation page carries a link that composes that request for you.
      </p>

      <h2>Personal data</h2>
      <p>
        How your data is handled is explained in the{" "}
        <a href={path("en", "privacy")}>privacy notice</a>.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by Mexican law. Any dispute will be resolved
        before the competent courts of Mexico City.
      </p>
    </LegalPage>
  );
}
