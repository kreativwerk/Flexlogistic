import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { toursForCarrier, toursForShipper } from "@/lib/queries";
import TourCard from "@/components/TourCard";

export default async function ToursPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tours = user.role === "VERLADER" ? toursForShipper(user.id) : toursForCarrier(user.id);
  const title = user.role === "VERLADER" ? "Meine Aufträge" : "Meine Touren";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        {user.role === "VERLADER" && (
          <Link href="/transporte/neu" className="btn-primary">+ Transport ausschreiben</Link>
        )}
      </div>
      {tours.length === 0 ? (
        <div className="card text-sm text-slate-600">
          {user.role === "VERLADER" ? (
            <>Noch keine Aufträge vorhanden.</>
          ) : (
            <>
              Noch keine Touren übernommen –{" "}
              <Link href="/boerse" className="font-medium text-brand-700 hover:underline">
                jetzt in der Frachtenbörse stöbern
              </Link>
              .
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map((t) => <TourCard key={t.id} tour={t} />)}
        </div>
      )}
    </div>
  );
}
