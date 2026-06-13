import Image from "next/image";
import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="er-status-page">
      <section className="er-status-panel">
        <Image src="/elite-route-logo.jpg" alt="Elite Route" width={152} height={152} className="er-status-logo" />
        <p className="er-status-kicker">Payment not completed</p>
        <h1>Your quote is still available.</h1>
        <p>
          You can return to the cotizador, review the service details and try the card payment again.
        </p>
        <Link href="/#quote" className="er-status-link">Return to quote</Link>
      </section>
    </main>
  );
}
