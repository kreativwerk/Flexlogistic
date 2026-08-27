export const VEHICLE_TYPES: Record<
  string,
  { label: string; base: number; perKm: number; payload: string }
> = {
  PKW: { label: "PKW / Kombi", base: 25, perKm: 0.55, payload: "bis 400 kg" },
  CADDY: { label: "Caddy / Hochdach", base: 30, perKm: 0.62, payload: "bis 700 kg" },
  TRANSPORTER: { label: "Transporter 3,5 t", base: 40, perKm: 0.85, payload: "bis 1,4 t / 4 Paletten" },
  SPRINTER_XXL: { label: "Sprinter XXL / Plane", base: 45, perKm: 0.95, payload: "bis 1,2 t / 5 Paletten" },
  LKW_7_5: { label: "LKW 7,5 t", base: 60, perKm: 1.1, payload: "bis 3 t / 16 Paletten" },
  LKW_12: { label: "LKW 12 t", base: 75, perKm: 1.3, payload: "bis 6 t / 18 Paletten" },
  LKW_40: { label: "Sattelzug 40 t", base: 120, perKm: 1.6, payload: "bis 25 t / 33 Paletten" },
};

export function vehicleLabel(key: string): string {
  return VEHICLE_TYPES[key]?.label ?? key;
}

/** Grobe Preisempfehlung für eine Einzelfahrt (netto). */
export function estimatePrice(vehicleType: string, distanceKm: number): number | null {
  const v = VEHICLE_TYPES[vehicleType];
  if (!v || !distanceKm || distanceKm <= 0) return null;
  const raw = Math.max(v.base, v.base * 0.4 + distanceKm * v.perKm);
  return Math.round(raw / 5) * 5;
}

export function formatEur(n: number | null | undefined): string {
  if (n == null) return "–";
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}
