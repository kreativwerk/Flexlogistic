import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { openTours } from "@/lib/queries";
import TourCard from "@/components/TourCard";
import { VEHICLE_TYPES } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function BoersePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; fahrzeug?: string; plz?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { kind, fahrzeug, plz } = await searchParams;
  const tours = openTours({ kind, vehicleType: fahrzeug, zip: plz });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Frachtenbörse</h1>
        <p className="text-sm text-slate-600">
          Alle offenen Direktfahrten, Extra-Touren und festen Touren – übernehmen oder bieten.
        </p>
      </div>

      <form method="GET" className="card flex flex-wrap items-end gap-3">
        <div>
          <label className="label" htmlFor="kind">Auftragsart</label>
          <select className="input" id="kind" name="kind" defaultValue={kind ?? ""}>
            <option value="">Alle</option>
            <option value="DIREKT">Direktfahrt</option>
            <option value="EXTRA">Extra-Tour</option>
            <option value="FEST">Feste Tour</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="fahrzeug">Fahrzeugklasse</label>
          <select className="input" id="fahrzeug" name="fahrzeug" defaultValue={fahrzeug ?? ""}>
            <option value="">Alle</option>
            {Object.entries(VEHICLE_TYPES).map(([key, v]) => (
              <option key={key} value={key}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="plz">PLZ (Abholung oder Zustellung)</label>
          <input className="input" id="plz" name="plz" defaultValue={plz ?? ""} placeholder="z. B. 45" />
        </div>
        <button type="submit" className="btn-primary">Filtern</button>
      </form>

      {tours.length === 0 ? (
        <div className="card text-sm text-slate-600">
          Keine offenen Touren für diese Filter gefunden.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">{tours.length} offene Tour(en)</p>
          {tours.map((t) => <TourCard key={t.id} tour={t} />)}
        </div>
      )}
    </div>
  );
}
