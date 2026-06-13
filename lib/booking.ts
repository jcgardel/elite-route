export const tariffs = {
  sedan: {
    name: "Sedan",
    km: 25,
    hour: 450,
    min: 700,
    cap: "1-3 passengers · 2 bags",
    tag: "Executive",
  },
  executive: {
    name: "Executive",
    km: 40,
    hour: 650,
    min: 950,
    cap: "1-3 passengers · 3 bags",
    tag: "Premium",
  },
  minivan: {
    name: "Minivan",
    km: 45,
    hour: 700,
    min: 1100,
    cap: "4-6 passengers · 4 bags",
    tag: "Group",
  },
  suv: {
    name: "HIGH SUV",
    km: 70,
    hour: 990,
    min: 1600,
    cap: "1-6 passengers · 6 bags",
    tag: "Suburban",
  },
};

export type Category = keyof typeof tariffs;
export type Zone = "cdmx" | "semi_foraneo" | "foraneo";
export type ServiceType = "route" | "hour" | "day";

export function zoneLabel(z: Zone) {
  return z === "cdmx" ? "Mexico City" : z === "semi_foraneo" ? "AIFA / Toluca" : "Out-of-town";
}

export function zoneLabelEs(z: Zone) {
  return z === "cdmx" ? "CDMX" : z === "semi_foraneo" ? "AIFA / Toluca" : "Foráneo";
}

export function serviceTypeLabel(serviceType: ServiceType, rentalHours: number) {
  if (serviceType === "hour") return `Hourly ride (${rentalHours} hrs)`;
  if (serviceType === "day") return "Full day (10 hrs)";
  return "Point-to-point transfer";
}

export function serviceTypeLabelEs(serviceType: ServiceType, rentalHours: number) {
  if (serviceType === "hour") return `Por horas (${rentalHours} hrs)`;
  if (serviceType === "day") return "Por día (10 hrs)";
  return "Traslado por ruta";
}

export function calculatePrice(
  km: number,
  minutes: number,
  category: Category,
  zone: Zone,
  urgent: boolean,
  serviceType: ServiceType,
  rentalHours: number,
) {
  const tariff = tariffs[category];
  let base = 0;

  if (serviceType === "hour") {
    base = Math.max(rentalHours * tariff.hour, tariff.min);
  } else if (serviceType === "day") {
    base = Math.max(10 * tariff.hour, tariff.min);
  } else {
    const hours = Math.ceil((minutes / 60) * 2) / 2;
    base = Math.max(km * tariff.km, hours * tariff.hour, tariff.min);
    if (zone === "semi_foraneo") base *= 1.18;
    if (zone === "foraneo") base *= 1.35;
  }

  base = Math.round(base * 1.16);
  if (urgent) base = Math.round(base * 1.15);
  return base;
}
