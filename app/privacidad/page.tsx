import type { Metadata } from "next";
import LegalPage from "../legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | Elite Route",
  description:
    "Qué datos personales recaba Elite Route al reservar un traslado, para qué se usan, quién los procesa y cómo ejercer tus derechos ARCO.",
  alternates: { canonical: "https://eliteroute.mx/privacidad" },
  robots: { index: true, follow: true },
};

/**
 * Aviso de privacidad. Cada afirmación sale del código: los campos que pide
 * el cotizador, los servicios a los que se les manda información y los
 * correos que ya existen. Nada de lo que dice aquí es una promesa inventada.
 */
export default function PrivacidadPage() {
  return (
    <LegalPage
      kicker="Datos personales"
      title="Aviso de privacidad"
      intro={`${LEGAL.responsable} recaba tus datos para cotizar y prestar un traslado. Aquí está exactamente qué se pide, para qué se usa, quién más lo ve y cómo pedir que se corrija o se borre.`}
    >
      <h2>Quién es responsable de tus datos</h2>
      <p>
        <strong>{LEGAL.responsable}</strong>, que opera el sitio{" "}
        <a href={`https://${LEGAL.sitio}`}>{LEGAL.sitio}</a>, es responsable del
        tratamiento de los datos personales que nos proporciones.
        {LEGAL.razonSocial ? ` Razón social: ${LEGAL.razonSocial}.` : ""}
        {LEGAL.rfc ? ` RFC: ${LEGAL.rfc}.` : ""}
        {LEGAL.domicilio ? ` Domicilio: ${LEGAL.domicilio}.` : ""}
      </p>
      <p>
        Para cualquier asunto relacionado con tus datos personales, incluido el
        ejercicio de tus derechos ARCO, el canal de contacto es{" "}
        <a href={`mailto:${LEGAL.correoPrivacidad}`}>{LEGAL.correoPrivacidad}</a>.
      </p>

      <h2>Qué datos recabamos</h2>
      <p>Sólo los necesarios para llevarte de un punto a otro y poder cobrarlo:</p>
      <table className="lg-table">
        <tbody>
          <tr>
            <td>Al cotizar</td>
            <td>Lugar de recogida, destino, fecha y hora del servicio, y categoría de vehículo.</td>
          </tr>
          <tr>
            <td>Al reservar</td>
            <td>Nombre completo y número de teléfono. Stripe recaba además tu correo electrónico durante el pago.</td>
          </tr>
          <tr>
            <td>Al pagar</td>
            <td>
              Los datos de tu tarjeta se capturan directamente en Stripe.{" "}
              <strong>Nunca pasan por este sitio ni se guardan en nuestros servidores.</strong>
            </td>
          </tr>
          <tr>
            <td>Servicios corporativos</td>
            <td>Nombre de la empresa, RFC, persona responsable y correo de contacto, cuando solicitas una cotización empresarial.</td>
          </tr>
          <tr>
            <td>Datos técnicos</td>
            <td>Dirección IP y registros de acceso, que el alojamiento guarda para operar el sitio y limitar el abuso del cotizador.</td>
          </tr>
        </tbody>
      </table>
      <p>
        No pedimos datos sensibles, no creamos cuentas de usuario y no usamos
        cookies de publicidad ni de analítica propias.
      </p>

      <h2>Para qué los usamos</h2>
      <ul>
        <li>Calcular la ruta y el precio de tu traslado.</li>
        <li>Prestar el servicio: asignar chofer y vehículo, y coordinar la recogida.</li>
        <li>Cobrar la reserva y enviarte el comprobante y la confirmación.</li>
        <li>Contactarte por WhatsApp, teléfono o correo sobre ese traslado en concreto.</li>
        <li>Emitir factura cuando la solicitas.</li>
        <li>Cumplir obligaciones fiscales y contables.</li>
      </ul>
      <p>
        No vendemos tus datos ni los compartimos con terceros para fines
        publicitarios, y no te enviamos promociones salvo que lo pidas.
      </p>

      <h2>Quién más los procesa</h2>
      <p>
        Para operar usamos servicios externos. Cada uno recibe únicamente lo que
        necesita para su función:
      </p>
      <table className="lg-table">
        <tbody>
          {LEGAL.encargados.map((e) => (
            <tr key={e.nombre}>
              <td>{e.nombre}</td>
              <td>{e.para}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Estos proveedores tratan la información por cuenta nuestra y conforme a
        sus propias políticas de privacidad.
      </p>

      <h2>Cuánto tiempo los conservamos</h2>
      <p>
        Los datos del traslado se conservan mientras dure la relación con el
        cliente y después durante el plazo que exige la legislación fiscal
        mexicana para la documentación de operaciones. Los registros técnicos
        del sitio se conservan por periodos cortos, definidos por el proveedor
        de alojamiento.
      </p>

      <h2>Tus derechos ARCO</h2>
      <p>
        Puedes solicitar en cualquier momento el <strong>acceso</strong> a tus
        datos personales, su <strong>rectificación</strong> cuando sean
        inexactos, su <strong>cancelación</strong> cuando consideres que no se
        requieren, y <strong>oponerte</strong> a su uso para fines específicos.
        También puedes revocar tu consentimiento.
      </p>
      <p>
        Escribe a <a href={`mailto:${LEGAL.correoPrivacidad}`}>{LEGAL.correoPrivacidad}</a>{" "}
        indicando tu nombre, un medio de contacto y qué solicitas. Responderemos
        por la misma vía. Ten en cuenta que hay información que no podemos
        borrar de inmediato cuando existe una obligación fiscal de conservarla,
        y que el registro del pago vive también en Stripe.
      </p>

      <h2>Cambios a este aviso</h2>
      <p>
        Si cambia la forma en que tratamos los datos, actualizaremos este aviso
        en esta misma dirección y modificaremos la fecha del encabezado.
      </p>
    </LegalPage>
  );
}
