import type { Metadata } from "next";
import LegalPage from "../legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos del Servicio | Elite Route",
  description:
    "Cómo funciona una reserva en Elite Route: anticipación mínima, precio fijo con IVA, qué incluye el traslado desde aeropuerto, cambios, cancelaciones y facturación.",
  alternates: { canonical: "https://eliteroute.mx/terminos" },
  robots: { index: true, follow: true },
};

/**
 * Términos del servicio. Todo lo que se afirma aquí es lo que el sitio ya
 * hace: la anticipación de 6 horas está validada en el cotizador y en las dos
 * rutas de cobro, el precio con IVA sale de lib/booking.ts, el recargo de
 * aeropuerto y la espera por retraso de vuelo están en la lógica de precio, y
 * la confirmación por WhatsApp es el flujo real después del pago.
 *
 * PENDIENTE DEL DUEÑO — la sección de cancelaciones describe el proceso real
 * de hoy (revisión caso por caso, reembolso manual por Stripe) porque no hay
 * una tabla de porcentajes decidida. Cuando exista, sustituye ese bloque.
 */
export default function TerminosPage() {
  return (
    <LegalPage
      kicker="Condiciones del servicio"
      title="Términos del servicio"
      intro="Las reglas de una reserva en Elite Route, escritas como funcionan de verdad: qué incluye el precio, con cuánta anticipación se reserva, qué pasa si tu vuelo se retrasa y cómo se cambia o cancela un traslado."
    >
      <h2>Qué es una reserva</h2>
      <p>
        Al pagar en el cotizador solicitas un traslado privado con chofer para
        una fecha, hora, origen y destino determinados.{" "}
        <strong>La reserva queda sujeta a confirmación final de disponibilidad</strong>{" "}
        por parte de {LEGAL.responsable}. Confirmamos por WhatsApp o correo en
        los minutos siguientes al pago. Si no hubiera disponibilidad, se
        reembolsa el importe completo.
      </p>

      <h2>Anticipación mínima</h2>
      <p>
        Los traslados se reservan con un mínimo de <strong>6 horas de
        anticipación</strong>. El cotizador no permite seleccionar un horario
        más cercano. Para algo más inmediato, escríbenos por WhatsApp al{" "}
        <a href={LEGAL.whatsappUrl}>{LEGAL.whatsapp}</a> y te decimos si hay
        unidad disponible.
      </p>

      <h2>Precio</h2>
      <p>
        El precio que ves en el cotizador es <strong>fijo y con IVA incluido</strong>.
        Se calcula a partir de la distancia y la duración estimadas de la ruta,
        la categoría de vehículo y, en el caso de las salidas desde aeropuerto,
        el cargo por estacionamiento y espera.
      </p>
      <ul>
        <li>No hay cargos por tráfico, ni por horario nocturno, ni por casetas dentro de la ruta cotizada.</li>
        <li>Los cambios de ruta durante el servicio, las esperas adicionales solicitadas en el momento y las paradas no cotizadas se acuerdan y cobran aparte.</li>
        <li>En los servicios por hora y por día, el kilometraje incluido se muestra en el cotizador antes de pagar.</li>
      </ul>

      <h2>Traslados desde aeropuerto</h2>
      <p>
        Las salidas desde cualquier aeropuerto incluyen{" "}
        <strong>estacionamiento y tiempo de espera por retraso de vuelo</strong>.
        Monitoreamos el vuelo y el chofer espera el tiempo necesario sin costo
        adicional. Para que funcione, danos tu número de vuelo al confirmar.
      </p>

      <h2>Equipaje y pasajeros</h2>
      <p>
        Cada categoría de vehículo indica su capacidad de pasajeros y maletas en
        el cotizador. Si viajas con más equipaje del indicado —o con equipo
        especial— avísanos antes para asignar la unidad adecuada. El chofer
        puede rechazar carga que exceda la capacidad segura del vehículo.
      </p>

      <h2>Cambios y cancelaciones</h2>
      <p>
        Para cambiar o cancelar un traslado, escríbenos por WhatsApp al{" "}
        <a href={LEGAL.whatsappUrl}>{LEGAL.whatsapp}</a> o a{" "}
        <a href={`mailto:${LEGAL.correoComercial}`}>{LEGAL.correoComercial}</a>{" "}
        indicando el folio de tu reserva.
      </p>
      <p>
        Hoy <strong>cada solicitud se revisa de forma individual</strong>: el
        equipo confirma la modificación o el reembolso según la anticipación con
        la que se avise y si la unidad ya fue asignada. Los reembolsos se
        procesan por la misma vía del pago, a través de Stripe, y el banco puede
        tardar varios días hábiles en reflejarlos.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        Prestamos el servicio con choferes licenciados y vehículos en
        condiciones de operar. No respondemos por retrasos causados por hechos
        fuera de nuestro control —tráfico extraordinario, bloqueos, condiciones
        meteorológicas o cierres viales— aunque haremos lo razonable por
        avisarte y ofrecer una alternativa.
      </p>
      <p>
        Revisa el vehículo al bajar: los objetos olvidados se resguardan y se
        devuelven cuando es posible localizarlos, pero no podemos garantizar su
        custodia.
      </p>

      <h2>Facturación</h2>
      <p>
        Emitimos factura CFDI a solicitud. Escribe a{" "}
        <a href={`mailto:${LEGAL.correoPrivacidad}`}>{LEGAL.correoPrivacidad}</a>{" "}
        con tus datos fiscales y el folio de la reserva. En la página de
        confirmación de pago encontrarás un enlace que arma esa solicitud por ti.
      </p>

      <h2>Datos personales</h2>
      <p>
        El tratamiento de tus datos se explica en el{" "}
        <a href="/privacidad">aviso de privacidad</a>.
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Estos términos se rigen por la legislación mexicana. Cualquier
        controversia se resolverá ante los tribunales competentes de la Ciudad
        de México.
      </p>
    </LegalPage>
  );
}
