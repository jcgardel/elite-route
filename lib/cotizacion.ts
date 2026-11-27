import "server-only";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import { registrarReserva } from "./reservas";
import {
  airportCodeOf,
  calculatePrice,
  precioRedondo,
  detectZone,
  isAirportAddress,
  serviceTypeLabel,
  serviceTypeLabelEs,
  vehicles,
  CATEGORIES,
  type Category,
  type ServiceType,
} from "./booking";
import { getStripe } from "./stripe";
import { CAPACIDAD } from "./vehicles";
import { escaladeLibre, hayHueco, ventanaDeOcupacion } from "./agenda";
import { DEFAULT_LANG, isLang, path } from "./i18n";
import { MIN_ADVANCE_HOURS, NOTAS_MAX, VUELO_MAX, esVueloValido } from "./booking-form";
import { lookupRouteDistance } from "./distance";
import { HORAS_MAX, HORAS_MIN } from "./rate-tables";
import {
  CENTRO_CDMX,
  dentroDeZonaPorHoras,
  RADIO_POR_HORAS_KM,
  admiteRedondo,
  REDONDO_HORAS_CORTESIA,
  REDONDO_HORAS_MAX,
  categoriaBloqueada,
  horasMinimas,
  precioConEvento,
  precioConEscalade,
} from "./service-limits";

/**
 * LA COTIZACIÓN DEL SERVIDOR, en un solo sitio.
 *
 * Hasta el 25 de noviembre de 2026 vivía dentro de app/api/checkout/route.ts.
 * Se sacó aquí cuando llegó el agente de WhatsApp: el agente tiene que dar
 * exactamente el mismo precio que la web, y dos copias de estas reglas se
 * desfasan a la primera tarifa de evento que se agregue en una sola.
 *
 * Recibe el cuerpo tal como lo manda el cotizador de la web (mismos nombres
 * de campo) y nunca acepta del cliente km, minutos ni zona: los mide aquí.
 * Puede lanzar `RouteLookupError` si Google no encuentra la ruta.
 */

const serviceTypes: ServiceType[] = ["route", "hour", "day"];

export type Cotizacion = {
  ok: true;
  price: number;
  category: Category;
  serviceType: ServiceType;
  rentalHours: number;
  origin: string;
  destination: string;
  serviceDate: string;
  serviceTime: string;
  notes: string;
  quiereRedondo: boolean;
  horasEspera: number;
  flightNumber: string;
  escalade: boolean;
  pasajeros: number;
  maletas: number;
  airportPickup: boolean;
  airportDropoff: boolean;
  km: number;
  minutes: number;
  zone: string;
  lang: "en" | "es";
  vehicle: string;
  serviceLabel: string;
  serviceLabelEn: string;
};

export type FalloCotizacion = {
  ok: false;
  status: number;
  error: string;
  /** Sin unidades: la web manda al cliente a WhatsApp en vez de cerrarle la puerta. */
  whatsapp?: boolean;
  categoria?: Category;
};

const fallo = (status: number, error: string): FalloCotizacion => ({ ok: false, status, error });

export function contactoValido(fullName: string, phone: string) {
  return Boolean(fullName && phone && isValidPhoneNumber(phone));
}

export async function cotizar(body: Record<string, unknown>): Promise<Cotizacion | FalloCotizacion> {
  const category = body.category as Category;
  const serviceType = body.serviceType as ServiceType;
  const rentalHours = Number(body.rentalHours);
  const origin = String(body.origin || "").trim();
  const destination = String(body.destination || "").trim();
  const serviceDate = String(body.serviceDate || "").trim();
  const serviceTime = String(body.serviceTime || "").trim();
  // Solicitudes extra del cliente. Opcional y sin validar contra nada: es
  // texto libre a propósito. Se recorta aquí y no sólo en el navegador
  // porque el límite del formulario no obliga a nadie que llame a la API
  // directamente, y de aquí sale hacia Stripe, el correo y WhatsApp.
  const notes = String(body.notes || "").trim().slice(0, NOTAS_MAX);
  // Viaje redondo foráneo. Se lee aquí y se valida más abajo, cuando ya se
  // conocen los kilómetros que midió el servidor.
  const quiereRedondo = Boolean(body.redondo);
  const horasEspera = Number(body.horasEspera);
  const flightNumber = String(body.flightNumber || "").trim().toUpperCase().slice(0, VUELO_MAX);
  // Garantizar Cadillac Escalade 2027 (+20 %): sólo existe dentro de SUV Lux.
  const escalade = Boolean(body.escalade) && category === "suv";

  if (!CATEGORIES.includes(category) || !serviceTypes.includes(serviceType)) {
    return fallo(400, "Datos de cotización inválidos");
  }

  if (!origin || (serviceType === "route" && !destination) || !serviceDate || !serviceTime) {
    return fallo(400, "Faltan datos del servicio");
  }

  if (!Number.isFinite(rentalHours) || rentalHours < HORAS_MIN || rentalHours > HORAS_MAX) {
    return fallo(400, "Duración inválida");
  }

  // El recargo de aeropuerto se vuelve a verificar aquí sobre la dirección:
  // el cliente puede detectarlo por el tipo de lugar de Google (que el
  // servidor no ve), pero no puede quitarlo mandando false.
  const airportPickup = isAirportAddress(origin) || Boolean(body.airportPickup);

  // La LLEGADA a una terminal SÍ toca el precio desde el 12 oct 2026: lleva
  // un alza propia —12 % en Sedan y Minivan, 18 % en Executive y High SUV—
  // topada para que recoger en el aeropuerto siga costando al menos un 5 %
  // más. Ver `ALZA_HACIA_AEROPUERTO` en lib/booking.ts.
  const airportDropoff =
    serviceType === "route" && (isAirportAddress(destination) || Boolean(body.airportDropoff));

  // PASAJEROS Y MALETAS, comprobados contra la capacidad real. El coste de
  // equivocarse lo paga el chofer en la puerta: una reserva de cinco
  // personas en un Sedan Lite no se puede servir.
  const pasajeros = Number(body.pasajeros);
  const maletas = Number(body.maletas);
  if (airportPickup || airportDropoff) {
    const cabe = CAPACIDAD[category];
    const paxOk = !Number.isFinite(pasajeros) || (pasajeros >= 1 && pasajeros <= cabe.pax);
    const malOk = !Number.isFinite(maletas) || (maletas >= 0 && maletas <= cabe.maletas);
    if (!paxOk || !malOk) {
      return fallo(400, `La categoría elegida admite ${cabe.pax} pasajeros y ${cabe.maletas} maletas`);
    }
  }

  // Sin número de vuelo no se puede monitorear el vuelo, que es lo que el
  // sitio promete en el hero, en el FAQ y en las páginas de ruta.
  if ((airportPickup || airportDropoff) && !esVueloValido(flightNumber)) {
    return fallo(400, "El número de vuelo es obligatorio en traslados de aeropuerto");
  }

  const startsAt = new Date(`${serviceDate}T${serviceTime}`);
  const hoursUntilService = (startsAt.getTime() - Date.now()) / 3600000;
  if (!Number.isFinite(hoursUntilService) || hoursUntilService < MIN_ADVANCE_HOURS) {
    return fallo(400, `El servicio requiere al menos ${MIN_ADVANCE_HOURS} horas de anticipación`);
  }

  if (categoriaBloqueada(category, serviceDate)) {
    return fallo(
      400,
      `${vehicles[category].name} no está disponible en esa fecha. Elige otra categoría o escríbenos por WhatsApp.`,
    );
  }

  const horasMin = horasMinimas(serviceDate, HORAS_MIN, category);
  if (serviceType === "hour" && rentalHours < horasMin) {
    return fallo(400, `El servicio por horas en ${vehicles[category].name} es de mínimo ${horasMin} horas.`);
  }

  // La distancia se vuelve a consultar aquí: el precio depende de los km, así
  // que aceptarlos del cliente permitiría cobrarse la tarifa mínima.
  // Por horas y por día no hay destino: se mide la recogida contra el
  // centro de la ciudad, porque el servicio sólo aplica dentro de la CDMX.
  const { km, minutes } = await lookupRouteDistance(
    origin,
    serviceType === "route" ? destination : CENTRO_CDMX,
  );

  if (serviceType !== "route" && !dentroDeZonaPorHoras(km)) {
    return fallo(
      400,
      `El servicio por horas aplica sólo dentro de la Ciudad de México (hasta ${RADIO_POR_HORAS_KM} km del centro; tu recogida está a ${km} km). Para salir de la CDMX solicita una cotización especial.`,
    );
  }

  // EL VIAJE REDONDO, validado contra los kilómetros del servidor. Se RECHAZA
  // en vez de caer al traslado sencillo: caer al sencillo cobraría la mitad
  // del servicio a quien cree haber reservado ida y vuelta.
  if (quiereRedondo) {
    if (serviceType !== "route") return fallo(400, "El viaje redondo sólo aplica a traslados");
    if (!admiteRedondo(km, airportDropoff)) return fallo(400, "El viaje redondo no aplica a este destino");
    if (
      !Number.isInteger(horasEspera) ||
      horasEspera < REDONDO_HORAS_CORTESIA ||
      horasEspera > REDONDO_HORAS_MAX
    ) {
      return fallo(400, `La espera debe ser de entre ${REDONDO_HORAS_CORTESIA} y ${REDONDO_HORAS_MAX} horas`);
    }
  }

  // ¿QUEDA UNIDAD DE ESTA CATEGORÍA A ESTA HORA? Sólo muerde en las
  // categorías con flota limitada (hoy SUV Lux). NO CIERRA LA PUERTA: la
  // agenda sólo ve las reservas del sitio, así que un bloqueo puede ser
  // falso, y perder la venta por un dato incompleto sería peor que pasarla a
  // un humano. Ver lib/agenda.ts.
  const ventana = ventanaDeOcupacion({
    serviceDate, serviceTime, serviceType, minutes, rentalHours, km,
    redondo: quiereRedondo, horasEspera, airportPickup,
  });
  if (ventana) {
    const hueco = await hayHueco(category, ventana);
    if (!hueco.libre || (escalade && !(await escaladeLibre(ventana)))) {
      return { ok: false, status: 409, error: "sin_unidades", whatsapp: true, categoria: category };
    }
  }

  const zone = detectZone(km);
  // Si el viaje SALE de una terminal manda el recargo de salida y la ida no
  // entra: un AICM -> AIFA no puede cobrar las dos cosas.
  const haciaAeropuerto = !airportPickup && airportDropoff;

  const price = precioConEscalade(precioConEvento(
    quiereRedondo
      ? precioRedondo(km, minutes, category, horasEspera, airportPickup)
      : calculatePrice(
          km, minutes, category, serviceType, rentalHours, airportPickup, haciaAeropuerto,
          airportCodeOf(airportPickup ? origin : destination),
        ),
    category,
    serviceDate,
    serviceType === "day" ? 10 : serviceType === "hour" ? rentalHours : undefined,
    origin,
    serviceTime,
  ), category, escalade);
  if (price <= 0) return fallo(400, "No se pudo calcular el total");

  // Si el cuerpo no trae idioma —una petición vieja o manipulada— cae al de
  // por defecto en lugar de fallar: nadie debe perder un pago por esto.
  const lang = isLang(String(body.lang)) ? (body.lang as "en" | "es") : DEFAULT_LANG;

  // EL NOMBRE DEL SERVICIO LO DICE TODO, y no es cosmético: esta cadena es
  // la que viaja a Stripe, al correo del cliente, al aviso de Telegram y al
  // de WhatsApp. Si un redondo llega rotulado "Traslado punto a punto", el
  // chofer deja al pasajero y se va. `serviceLabel` va al equipo (siempre en
  // español); `serviceLabelEn`, al correo del cliente que reservó en inglés.
  const serviceLabel = quiereRedondo
    ? `Viaje redondo foráneo · ${horasEspera} h de espera`
    : serviceTypeLabelEs(serviceType, rentalHours);
  const serviceLabelEn = quiereRedondo
    ? `Out-of-town round trip · ${horasEspera} h waiting`
    : serviceTypeLabel(serviceType, rentalHours);

  return {
    ok: true,
    price,
    category,
    serviceType,
    rentalHours,
    origin,
    destination,
    serviceDate,
    serviceTime,
    notes,
    quiereRedondo,
    horasEspera,
    flightNumber,
    escalade,
    pasajeros,
    maletas,
    airportPickup,
    airportDropoff,
    km,
    minutes,
    zone,
    lang,
    // "SUV Lux" se queda tal cual: con ese nombre cruza la agenda de Supabase.
    vehicle: vehicles[category].name,
    serviceLabel,
    serviceLabelEn,
  };
}

function trimMetadata(value: string) {
  return value.slice(0, 500);
}

/**
 * Crea la sesión de pago de Stripe para una cotización ya validada y la deja
 * registrada como "pendiente de pago". Cuando el cliente paga, el webhook de
 * Stripe la confirma, la pone en la agenda y avisa al equipo: el agente de
 * WhatsApp y la web terminan en el mismo sitio.
 *
 * `extra` son campos adicionales para la metadata (atribución de GA4, origen
 * de la venta).
 */
export async function crearPago(
  cot: Cotizacion,
  contacto: { fullName: string; phone: string },
  appUrl: string,
  extra: Record<string, string> = {},
  registrarPendiente: (p: Promise<unknown>) => void = (p) => void p,
) {
  // La Escalade viaja en `escalade` y al frente de las notas, que es lo que
  // leen el equipo, el chofer y el correo del cliente.
  const notasConEscalade = cot.escalade
    ? `Cadillac Escalade 2027 garantizada${cot.notes ? ` · ${cot.notes}` : ""}`
    : cot.notes;

  /** Todo lo que hace falta para operar el servicio, en un solo sitio. */
  const reserva: Record<string, string> = {
    fullName: trimMetadata(contacto.fullName),
    phone: trimMetadata(contacto.phone),
    serviceType: cot.serviceType,
    serviceLabel: trimMetadata(cot.serviceLabel),
    serviceLabelEn: trimMetadata(cot.serviceLabelEn),
    serviceDate: cot.serviceDate,
    serviceTime: cot.serviceTime,
    origin: trimMetadata(cot.origin),
    destination: trimMetadata(cot.serviceType === "route" ? cot.destination : "Disposición libre"),
    vehicle: cot.vehicle,
    category: cot.category,
    zone: cot.zone,
    km: String(cot.km),
    minutes: String(cot.minutes),
    ...(Number.isFinite(cot.pasajeros) ? { pasajeros: String(cot.pasajeros) } : {}),
    ...(Number.isFinite(cot.maletas) ? { maletas: String(cot.maletas) } : {}),
    ...extra,
    airportPickup: String(cot.airportPickup),
    airportDropoff: String(cot.airportDropoff),
    // El idioma en el que reservó: el webhook escribe el correo de
    // confirmación en ese idioma a partir de esta metadata.
    lang: cot.lang,
    redondo: String(cot.quiereRedondo),
    horasEspera: cot.quiereRedondo ? String(cot.horasEspera) : "",
    flightNumber: trimMetadata(cot.flightNumber),
    notes: trimMetadata(notasConEscalade),
    escalade: String(cot.escalade),
    priceMxn: String(cot.price),
  };

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_creation: "if_required",
    phone_number_collection: { enabled: true },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "mxn",
          unit_amount: cot.price * 100,
          product_data: {
            name: `Elite Route · ${cot.vehicle}${cot.escalade ? " · Cadillac Escalade 2027 garantizada" : ""}`,
            description: `${cot.serviceLabel} · ${cot.serviceDate} ${cot.serviceTime}`,
          },
        },
      },
    ],
    success_url: `${appUrl}${path(cot.lang, "success")}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}${path(cot.lang, "cancel")}`,
    // La MISMA reserva se guarda en DOS sitios de Stripe: la pantalla de
    // "Pagos" sólo enseña la metadata del cobro, no la de la sesión.
    payment_intent_data: { metadata: reserva },
    metadata: reserva,
  });

  // La cotización queda registrada como "pendiente de pago" desde ya, para
  // darle seguimiento aunque no se pague. Si falla, el pago la registra igual.
  registrarPendiente(
    registrarReserva(session, { pendiente: true }).catch((error) =>
      console.error("Elite Route registro pendiente error:", error),
    ),
  );

  return session;
}
