/**
 * Las diez preguntas frecuentes de /tarifas y /rates.
 *
 * VIVEN AQUÍ Y NO EN TarifasClient.tsx porque hacen falta en los dos lados:
 * el componente las pinta —y es `"use client"`— y la página de servidor las
 * declara en JSON-LD. Un módulo marcado como cliente no se puede llamar desde
 * el servidor, así que mientras estuvieron dentro del componente la página no
 * podía leerlas: el `build` falla con "Attempted to call ratesFaqs() from the
 * server".
 *
 * La alternativa era escribirlas dos veces, y eso es justo lo que no puede
 * pasar: un `FAQPage` que no coincide con las preguntas visibles no sirve de
 * nada y Google lo puede tratar como esquema engañoso. Un solo sitio, leído
 * desde los dos.
 *
 * Sin `server-only` a propósito: este archivo cruza al navegador, y puede,
 * porque es texto que ya se ve en la página. Lo que no puede cruzar son las
 * distancias y el tarifario.
 */
import { vehicles } from "./vehicles";
import type { Lang } from "./i18n";

export const RATES_FAQS: Record<Lang, Array<[string, string]>> = {
  es: [
    ["¿Los precios incluyen IVA?", "Sí. Todos los precios que ves en esta página y en el cotizador incluyen IVA (16%). No hay cargos ocultos ni sorpresas al final del servicio."],
    ["¿Por qué los traslados desde el aeropuerto cuestan más que hacia el aeropuerto?", "Los traslados de salida desde cualquier aeropuerto incluyen un cargo por estacionamiento y tiempo de espera por posibles retrasos de vuelo. Monitoreamos tu vuelo en tiempo real y el chofer ajusta su hora de llegada sin cobrar extra."],
    ["¿Qué pasa si mi vuelo se retrasa?", "Nada mientras el vuelo siga en el aire: monitoreamos tu número de vuelo en tiempo real y el chofer ajusta su hora sin cobrar extra, por largo que sea el retraso. El cargo por espera ya está incluido en la tarifa de salida desde aeropuerto. Ya en tierra, tienes 60 minutos de cortesía desde la hora real de aterrizaje para encontrarte con tu chofer."],
    ["¿Puedo pagar con tarjeta de crédito o débito?", "Sí. Aceptamos todas las tarjetas de crédito y débito mediante pago seguro con Stripe. También puedes coordinar tu reserva por WhatsApp."],
    ["¿Emiten factura?", "Sí. Emitimos factura CFDI para todos los servicios. Escríbenos a contabilidad@eliteroute.mx con tus datos fiscales."],
    ["¿Cuánto tiempo de anticipación necesito para reservar?", "Se requiere un mínimo de 12 horas de anticipación para confirmar tu reserva. Para servicios en horario de madrugada o rutas foráneas, lo ideal es reservar con 24 horas de antelación."],
    ["¿Qué pasa si cancelo?", "Sin costo si avisas con más de 24 horas de anticipación. Entre 12 y 24 horas se cobra el 50%, y dentro de las 12 horas previas el 100%, igual que si el pasajero no se presenta. Los reembolsos se procesan por el mismo medio de pago; las comisiones de procesamiento no son reembolsables."],
    ["¿Qué pasa si no llego a la hora acordada?", "En el aeropuerto tienes 60 minutos desde la hora real de aterrizaje; en cualquier otro punto, 30 minutos desde la hora acordada. Si te comunicas dentro de ese plazo y sigues en el aeropuerto —por ejemplo, si estás en migración o aduana—, tu chofer te espera hasta 30 minutos más sin costo. Si no logramos localizarte por teléfono, WhatsApp ni correo, el servicio se marca como no presentado, se cobra al 100% y el chofer se retira."],
    [`¿Cuál es la diferencia entre ${vehicles.sedan.name}, ${vehicles.executive.name} y ${vehicles.suv.name}?`, `${vehicles.sedan.name}: ideal para 1-3 pasajeros con equipaje ligero. ${vehicles.executive.name}: vehículos premium para 1-3 pasajeros, mayor confort y espacio. ${vehicles.minivan.name}: grupos de hasta 6 personas; con equipaje completo, lo cómodo son 4. ${vehicles.suv.name}: el nivel más alto de lujo para 1-6 pasajeros.`],
    ["¿Hacen traslados a Querétaro, Cuernavaca u otras ciudades?", "Sí. Cubrimos rutas foráneas a cualquier destino desde Ciudad de México. Escríbenos a business@eliteroute.mx o usa el cotizador para calcular el precio exacto."],
  ],
  en: [
    ["Do the prices include VAT?", "Yes. Every price on this page and in the quote form includes 16% VAT. There are no hidden charges and no surprises at the end of the ride."],
    ["Why do transfers from the airport cost more than transfers to it?", "Pickups at any airport include a parking charge and waiting time for possible flight delays. We track your flight in real time and the chauffeur adjusts their arrival at no extra cost."],
    ["What happens if my flight is delayed?", "Nothing while the flight is in the air: we track your flight number in real time and the chauffeur adjusts their timing at no extra cost, however long the delay. The waiting charge is already included in the airport pickup fare. Once you are on the ground you have 60 courtesy minutes from the actual landing time to meet your chauffeur."],
    ["Can I pay by credit or debit card?", "Yes. We accept every credit and debit card through secure payment with Stripe. You can also arrange your booking over WhatsApp."],
    ["Do you issue invoices?", "Yes. We issue Mexican CFDI invoices for every service. Write to contabilidad@eliteroute.mx with your tax details."],
    ["How far in advance do I need to book?", "A minimum of 12 hours' notice is required to confirm a booking. For early-morning services or out-of-town routes, 24 hours ahead is ideal."],
    ["What happens if I cancel?", "Free of charge if you tell us more than 24 hours before pickup. Between 12 and 24 hours we charge 50%, and within 12 hours 100%, the same as a no-show. Refunds are processed through the original payment method; payment-processing fees are non-refundable."],
    ["What if I am not there at the agreed time?", "At the airport you have 60 minutes from the actual landing time; anywhere else, 30 minutes from the agreed time. If you contact us within that window and are still inside the airport — waiting at immigration or customs, for instance — your chauffeur waits up to 30 extra minutes at no charge. If we cannot reach you by phone, WhatsApp or email, the service is recorded as a no-show, charged in full, and the chauffeur leaves."],
    [`What is the difference between ${vehicles.sedan.name}, ${vehicles.executive.name} and ${vehicles.suv.name}?`, `${vehicles.sedan.name}: ideal for 1-3 passengers with light luggage. ${vehicles.executive.name}: premium vehicles for 1-3 passengers, with more comfort and space. ${vehicles.minivan.name}: groups of up to 6; with full luggage, four travel comfortably. ${vehicles.suv.name}: the highest level of luxury, for 1-6 passengers.`],
    ["Do you drive to Querétaro, Cuernavaca or other cities?", "Yes. We cover out-of-town routes to any destination from Mexico City. Write to business@eliteroute.mx or use the quote form to calculate the exact price."],
  ],
};
