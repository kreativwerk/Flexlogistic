import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { carrierStats, openTours, shipperStats, toursForCarrier, toursForShipper } from "@/lib/queries";
import TourCard from "@/components/TourCard";
import { formatEur } from "@/lib/pricing";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-extrabold text-brand-800">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "VERLADER") {
    const stats = shipperStats(user.id);
    const tours = toursForShipper(user.id).slice(0, 5);
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Willkommen, {user.company}</h1>
            <p className="text-sm text-slate-600">Ihr Verlader-Dashboard</p>
          </div>
          <Link href="/transporte/neu" className="btn-primary">+ Transport ausschreiben</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Offene Ausschreibungen" value={stats.offen ?? 0} />
          <Stat label="Laufende Transporte" value={stats.laufend ?? 0} />
          <Stat label="Zugestellt" value={stats.zugestellt ?? 0} />
        </div>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Neueste Aufträge</h2>
            <Link href="/transporte" className="text-sm font-medium text-brand-700 hover:underline">
              Alle anzeigen →
            </Link>
          </div>
          {tours.length === 0 ? (
            <div className="card text-sm text-slate-600">
              Noch keine Aufträge.{" "}
              <Link href="/transporte/neu" className="font-medium text-brand-700 hover:underline">
                Jetzt den ersten Transport ausschreiben
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-3">
              {tours.map((t) => <TourCard key={t.id} tour={t} />)}
            </div>
          )}
        </section>
      </div>
    );
  }

  // FAHRER
  const stats = carrierStats(user.id);
  const myTours = toursForCarrier(user.id).filter((t) => t.status === "VERGEBEN" || t.status === "ABGEHOLT");
  const offers = openTours().slice(0, 5);
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Willkommen, {user.company}</h1>
          <p className="text-sm text-slate-600">Ihr Fahrer-Dashboard</p>
        </div>
        <Link href="/boerse" className="btn-primary">Frachtenbörse öffnen</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Aktive Touren" value={stats.laufend ?? 0} />
        <Stat label="Zugestellte Touren" value={stats.zugestellt ?? 0} />
        <Stat label="Umsatz (zugestellt)" value={formatEur(stats.umsatz ?? 0)} />
      </div>
      {myTours.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Ihre aktiven Touren</h2>
          <div className="space-y-3">
            {myTours.map((t) => <TourCard key={t.id} tour={t} />)}
          </div>
        </section>
      )}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Neue Angebote in der Börse</h2>
          <Link href="/boerse" className="text-sm font-medium text-brand-700 hover:underline">
            Alle anzeigen →
          </Link>
        </div>
        {offers.length === 0 ? (
          <div className="card text-sm text-slate-600">Aktuell keine offenen Touren.</div>
        ) : (
          <div className="space-y-3">
            {offers.map((t) => <TourCard key={t.id} tour={t} />)}
          </div>
        )}
      </section>
    </div>
  );
}
