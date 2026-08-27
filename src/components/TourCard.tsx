import Link from "next/link";
import { KindBadge, StatusBadge } from "./Badges";
import { formatEur, vehicleLabel } from "@/lib/pricing";
import type { TourWithParties } from "@/lib/queries";

const WEEKDAY_LABELS: Record<string, string> = {
  Mo: "Mo", Di: "Di", Mi: "Mi", Do: "Do", Fr: "Fr", Sa: "Sa", So: "So",
};

export function formatDate(d: string | null): string {
  if (!d) return "–";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

export default function TourCard({ tour }: { tour: TourWithParties }) {
  const displayPrice =
    tour.final_price ?? tour.price;
  return (
    <Link
      href={`/transporte/${tour.id}`}
      className="card block transition hover:border-brand-600 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <KindBadge kind={tour.kind} />
          <StatusBadge status={tour.status} />
          <span className="text-xs text-slate-500">#{tour.id}</span>
        </div>
        <div className="text-right">
          {tour.pricing_mode === "GEBOT" && tour.status === "OFFEN" ? (
            <span className="text-sm font-semibold text-amber-700">Gebote möglich</span>
          ) : (
            <span className="text-lg font-bold text-brand-800">{formatEur(displayPrice)}</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm font-medium text-slate-800">
        <span>
          {tour.pickup_zip} {tour.pickup_city}
        </span>
        <span aria-hidden className="text-slate-400">
          ⟶
        </span>
        <span>
          {tour.delivery_zip} {tour.delivery_city}
        </span>
        {tour.distance_km > 0 && (
          <span className="text-xs text-slate-500">ca. {tour.distance_km} km</span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span>🚚 {vehicleLabel(tour.vehicle_type)}</span>
        {tour.kind === "FEST" ? (
          <span>
            📅{" "}
            {(tour.weekdays ?? "")
              .split(",")
              .map((w) => WEEKDAY_LABELS[w] ?? w)
              .join(", ")}{" "}
            ab {formatDate(tour.start_date)}
            {tour.pickup_time ? `, ${tour.pickup_time} Uhr` : ""}
          </span>
        ) : (
          <span>
            📅 {formatDate(tour.pickup_date)}
            {tour.pickup_time ? `, ${tour.pickup_time} Uhr` : ""}
          </span>
        )}
        {tour.weight_kg ? <span>⚖️ {tour.weight_kg} kg</span> : null}
        {tour.pallets ? <span>🧱 {tour.pallets} Pal.</span> : null}
      </div>
    </Link>
  );
}
