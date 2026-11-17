import { NextResponse } from "next/server";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import { registrarSolicitudWhatsapp } from "@/lib/reservas";
import { getWhatsappLimiter, getIp } from "@/lib/rate-limit";
import { CATEGORIES, type Category, type ServiceType } from "@/lib/booking";
import { NOTAS_MAX, VUELO_MAX } from "@/lib/booking-form";

const serviceTypes: ServiceType[] = ["route", "hour", "day"];

/**
 * Guarda el clic en "Reservar por WhatsApp" para darle seguimiento aunque el
 * cliente nunca mande el mensaje. El navegador lo llama sin esperar respuesta:
 * pase lo que pase aquí, WhatsApp ya se abrió. Por eso nunca devuelve error
 * al cliente salvo datos imposibles; las fallas sólo van al log.
 *
 * El precio es el que vio el cliente, no se recalcula: es una pista para el
 * equipo, no un cobro.
 */
export async function POST(req: Request) {
  const limiter = getWhatsappLimiter();
  if (limiter) {
    const { success } = await limiter.limit(getIp(req));
    if (!success) return new NextResponse(null, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const s = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
  const num = (v: unknown) => (Number.isFinite(Number(v)) && v !== "" && v != null ? String(Number(v)) : "");

  const name = s(body.fullName, 200);
  const phone = s(body.phone, 40);
  const serviceType = body.serviceType as ServiceType;
  const category = body.category as Category;
  if (!name || !phone || !isValidPhoneNumber(phone) || !serviceTypes.includes(serviceType) || !CATEGORIES.includes(category)) {
    return new NextResponse(null, { status: 400 });
  }

  const date = s(body.serviceDate, 10);
  const time = s(body.serviceTime, 5);
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time) ? `${date} ${time}` : "";

  try {
    await registrarSolicitudWhatsapp({
      name,
      phone,
      service_type: serviceType,
      rental_hours: serviceType === "route" ? "" : num(body.rentalHours),
      origin: s(body.origin),
      destination: s(body.destination),
      service_datetime: fecha,
      category,
      km: num(body.km),
      minutes: num(body.minutes),
      zone: s(body.zone, 60),
      flight_number: s(body.flightNumber, VUELO_MAX).toUpperCase(),
      passengers: num(body.pasajeros),
      notes: s(body.notes, NOTAS_MAX),
      quoted_price: num(body.price),
      lang: s(body.lang, 5),
    });
  } catch (err) {
    console.error("No se guardó la solicitud de WhatsApp:", err);
  }
  return new NextResponse(null, { status: 204 });
}
