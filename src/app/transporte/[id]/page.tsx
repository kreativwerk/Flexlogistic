import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { bidOfCarrier, bidsForTour, getTour } from "@/lib/queries";
import {
  acceptBidAction,
  acceptTourAction,
  cancelTourAction,
  markDeliveredAction,
  markPickedUpAction,
  placeBidAction,
} from "@/lib/actions";
import { KindBadge, StatusBadge } from "@/components/Badges";
import ErrorBanner from "@/components/ErrorBanner";
import { formatDate } from "@/components/TourCard";
import { formatEur, vehicleLabel } from "@/lib/pricing";

export default async function TourDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { error } = await searchParams;
  const tour = getTour(Number(id));
  if (!tour) redirect("/dashboard");

  const isOwner = tour.shipper_id === user.id;
  const isAssignedCarrier = tour.carrier_id === user.id;
  const isCarrier = user.role === "FAHRER";
  const showContacts = isOwner || isAssignedCarrier;

  const bids = tour.pricing_mode === "GEBOT" ? bidsForTour(tour.id) : [];
  const myBid = isCarrier ? bidOfCarrier(tour.id, user.id) : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Auftrag #{tour.id}</h1>
          <KindBadge kind={tour.kind} />
          <StatusBadge status={tour.status} />
        </div>
        <div className="text-right">
          {tour.final_price != null ? (
            <div>
              <div className="text-xs text-slate-500">Vergabepreis</div>
              <div className="text-2xl font-bold text-brand-800">{formatEur(tour.final_price)}</div>
            </div>
          ) : tour.pricing_mode === "FESTPREIS" ? (
            <div>
              <div className="text-xs text-slate-500">
                Festpreis{tour.kind === "FEST" ? " pro Tour" : ""}
              </div>
              <div className="text-2xl font-bold text-brand-800">{formatEur(tour.price)}</div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-amber-700">Gebotsverfahren</div>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 font-semibold text-brand-800">📍 Abholung</h2>
          <p className="text-sm text-slate-800">
            {showContacts && tour.pickup_company ? <>{tour.pickup_company}<br /></> : null}
            {showContacts && tour.pickup_street ? <>{tour.pickup_street}<br /></> : null}
            {tour.pickup_zip} {tour.pickup_city}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {tour.kind === "FEST" ? (
              <>🔁 {tour.weekdays?.split(",").join(", ")} ab {formatDate(tour.start_date)}</>
            ) : (
              <>📅 {formatDate(tour.pickup_date)}</>
            )}
            {tour.pickup_time ? `, ab ${tour.pickup_time} Uhr` : ""}
          </p>
        </div>
        <div className="card">
          <h2 className="mb-2 font-semibold text-brand-800">🏁 Zustellung</h2>
          <p className="text-sm text-slate-800">
            {showContacts && tour.delivery_company ? <>{tour.delivery_company}<br /></> : null}
            {showContacts && tour.delivery_street ? <>{tour.delivery_street}<br /></> : null}
            {tour.delivery_zip} {tour.delivery_city}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {tour.kind === "FEST" ? (
              tour.delivery_time ? <>bis {tour.delivery_time} Uhr</> : null
            ) : (
              <>
                📅 {formatDate(tour.delivery_date)}
                {tour.delivery_time ? `, bis ${tour.delivery_time} Uhr` : ""}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="card">
        <h2 className="mb-3 font-semibold text-brand-800">📦 Sendungsdetails</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-slate-500">Fahrzeugklasse</dt>
            <dd className="font-medium">{vehicleLabel(tour.vehicle_type)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Distanz</dt>
            <dd className="font-medium">{tour.distance_km ? `ca. ${tour.distance_km} km` : "–"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Gewicht</dt>
            <dd className="font-medium">{tour.weight_kg ? `${tour.weight_kg} kg` : "–"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Paletten</dt>
            <dd className="font-medium">{tour.pallets ?? "–"}</dd>
          </div>
        </dl>
        {tour.notes && (
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{tour.notes}</p>
        )}
      </div>

      {/* Beteiligte */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 font-semibold text-brand-800">🏭 Auftraggeber</h2>
          <p className="text-sm text-slate-800">{tour.shipper_company}</p>
          {showContacts && (
            <p className="mt-1 text-sm text-slate-600">
              {tour.shipper_contact}
              {tour.shipper_phone ? <> · {tour.shipper_phone}</> : null}
            </p>
          )}
        </div>
        <div className="card">
          <h2 className="mb-2 font-semibold text-brand-800">🚚 Transportdienstleister</h2>
          {tour.carrier_company ? (
            <>
              <p className="text-sm text-slate-800">{tour.carrier_company}</p>
              {showContacts && (
                <p className="mt-1 text-sm text-slate-600">
                  {tour.carrier_contact}
                  {tour.carrier_phone ? <> · {tour.carrier_phone}</> : null}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Noch nicht vergeben</p>
          )}
        </div>
      </div>

      {/* Statusverlauf */}
      <div className="card">
        <h2 className="mb-3 font-semibold text-brand-800">📋 Verlauf</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>✅ Ausgeschrieben am {tour.created_at.slice(0, 10).split("-").reverse().join(".")}</li>
          {tour.assigned_at && <li>✅ Vergeben an {tour.carrier_company} ({formatEur(tour.final_price)})</li>}
          {tour.picked_up_at && <li>✅ Abgeholt</li>}
          {tour.delivered_at && (
            <li>
              ✅ Zugestellt{tour.pod_name ? ` – Empfangen von: ${tour.pod_name}` : ""}
            </li>
          )}
          {tour.status === "STORNIERT" && <li>❌ Storniert</li>}
        </ul>
      </div>

      {/* Aktionen: Fahrer, Tour offen */}
      {isCarrier && !isAssignedCarrier && tour.status === "OFFEN" && (
        <div className="card border-brand-600">
          {tour.pricing_mode === "FESTPREIS" ? (
            <form action={acceptTourAction}>
              <input type="hidden" name="tour_id" value={tour.id} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-700">
                  Diese Tour zum Festpreis von{" "}
                  <strong className="text-brand-800">{formatEur(tour.price)}</strong>
                  {tour.kind === "FEST" ? " pro Tour" : ""} übernehmen?
                </p>
                <button type="submit" className="btn-primary">
                  Tour jetzt übernehmen
                </button>
              </div>
            </form>
          ) : (
            <form action={placeBidAction} className="space-y-3">
              <input type="hidden" name="tour_id" value={tour.id} />
              <h2 className="font-semibold text-brand-800">
                {myBid ? "Ihr Gebot aktualisieren" : "Gebot abgeben"}
              </h2>
              {myBid && (
                <p className="text-sm text-slate-600">
                  Ihr aktuelles Gebot: <strong>{formatEur(myBid.amount)}</strong>
                </p>
              )}
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="label">Preis (€ netto){tour.kind === "FEST" ? " pro Tour" : ""}</label>
                  <input
                    className="input max-w-[160px]"
                    name="amount"
                    type="number"
                    min="1"
                    step="1"
                    required
                    defaultValue={myBid?.amount}
                  />
                </div>
                <div className="min-w-[200px] flex-1">
                  <label className="label">Nachricht (optional)</label>
                  <input className="input" name="message" defaultValue={myBid?.message} />
                </div>
                <button type="submit" className="btn-primary">
                  {myBid ? "Gebot aktualisieren" : "Gebot abgeben"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Aktionen: zugewiesener Fahrer */}
      {isAssignedCarrier && (tour.status === "VERGEBEN" || tour.status === "ABGEHOLT") && (
        <div className="card border-brand-600 space-y-3">
          <h2 className="font-semibold text-brand-800">Statusmeldung</h2>
          {tour.status === "VERGEBEN" && (
            <form action={markPickedUpAction}>
              <input type="hidden" name="tour_id" value={tour.id} />
              <button type="submit" className="btn-primary">📦 Sendung abgeholt</button>
            </form>
          )}
          {tour.status === "ABGEHOLT" && (
            <form action={markDeliveredAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="tour_id" value={tour.id} />
              <div>
                <label className="label">Empfangen von (Name)</label>
                <input className="input max-w-[240px]" name="pod_name" />
              </div>
              <button type="submit" className="btn-primary">✅ Zugestellt melden</button>
            </form>
          )}
        </div>
      )}

      {/* Gebote (nur Eigentümer) */}
      {isOwner && tour.pricing_mode === "GEBOT" && (
        <div className="card">
          <h2 className="mb-3 font-semibold text-brand-800">
            💶 Eingegangene Gebote ({bids.length})
          </h2>
          {bids.length === 0 ? (
            <p className="text-sm text-slate-600">Noch keine Gebote eingegangen.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {bids.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {b.carrier_company}
                      {b.carrier_city ? <span className="text-slate-500"> · {b.carrier_city}</span> : null}
                    </p>
                    {b.message && <p className="text-sm text-slate-600">„{b.message}“</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-brand-800">{formatEur(b.amount)}</span>
                    {tour.status === "OFFEN" && b.status === "OFFEN" ? (
                      <form action={acceptBidAction}>
                        <input type="hidden" name="bid_id" value={b.id} />
                        <button type="submit" className="btn-primary">Annehmen</button>
                      </form>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">{b.status}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Stornieren (Eigentümer) */}
      {isOwner && (tour.status === "OFFEN" || tour.status === "VERGEBEN") && (
        <form action={cancelTourAction} className="text-right">
          <input type="hidden" name="tour_id" value={tour.id} />
          <button type="submit" className="btn-secondary text-red-700">
            Auftrag stornieren
          </button>
        </form>
      )}
    </div>
  );
}
