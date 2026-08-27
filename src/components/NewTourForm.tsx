"use client";

import { useState } from "react";
import { createTourAction } from "@/lib/actions";
import { estimatePrice, formatEur, VEHICLE_TYPES } from "@/lib/pricing";
import type { TourKind } from "@/lib/types";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function NewTourForm() {
  const [kind, setKind] = useState<TourKind>("DIREKT");
  const [pricingMode, setPricingMode] = useState<"FESTPREIS" | "GEBOT">("FESTPREIS");
  const [vehicleType, setVehicleType] = useState("TRANSPORTER");
  const [distanceKm, setDistanceKm] = useState("");

  const estimate = estimatePrice(vehicleType, Number(distanceKm.replace(",", ".")));

  return (
    <form action={createTourAction} className="space-y-6">
      {/* Auftragsart */}
      <div className="card">
        <span className="label">Auftragsart</span>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              ["DIREKT", "Direktfahrt", "Sofort / eilig, heute noch"],
              ["EXTRA", "Extra-Tour", "Geplante Einzelfahrt mit Zeitfenster"],
              ["FEST", "Feste Tour", "Wiederkehrend, z. B. werktags"],
            ] as const
          ).map(([value, title, sub]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                kind === value
                  ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                  : "border-slate-300 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={value}
                checked={kind === value}
                onChange={() => setKind(value)}
                className="sr-only"
              />
              <span className="block font-semibold">{title}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{sub}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Adressen */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="font-semibold text-brand-800">📍 Abholung</h2>
          <div>
            <label className="label">Firma</label>
            <input className="input" name="pickup_company" />
          </div>
          <div>
            <label className="label">Straße &amp; Nr.</label>
            <input className="input" name="pickup_street" />
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <div>
              <label className="label">PLZ *</label>
              <input className="input" name="pickup_zip" required />
            </div>
            <div>
              <label className="label">Ort *</label>
              <input className="input" name="pickup_city" required />
            </div>
          </div>
          {kind !== "FEST" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Datum</label>
                <input className="input" name="pickup_date" type="date" />
              </div>
              <div>
                <label className="label">Uhrzeit ab</label>
                <input className="input" name="pickup_time" type="time" />
              </div>
            </div>
          )}
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold text-brand-800">🏁 Zustellung</h2>
          <div>
            <label className="label">Firma</label>
            <input className="input" name="delivery_company" />
          </div>
          <div>
            <label className="label">Straße &amp; Nr.</label>
            <input className="input" name="delivery_street" />
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <div>
              <label className="label">PLZ *</label>
              <input className="input" name="delivery_zip" required />
            </div>
            <div>
              <label className="label">Ort *</label>
              <input className="input" name="delivery_city" required />
            </div>
          </div>
          {kind !== "FEST" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Datum</label>
                <input className="input" name="delivery_date" type="date" />
              </div>
              <div>
                <label className="label">Uhrzeit bis</label>
                <input className="input" name="delivery_time" type="time" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feste Tour: Wiederholung */}
      {kind === "FEST" && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-brand-800">🔁 Wiederholung</h2>
          <div>
            <span className="label">Wochentage *</span>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <label key={d} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    name="weekdays"
                    value={d}
                    defaultChecked={["Mo", "Di", "Mi", "Do", "Fr"].includes(d)}
                    className="accent-blue-700"
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="label">Start ab</label>
              <input className="input" name="start_date" type="date" />
            </div>
            <div>
              <label className="label">Ende (optional)</label>
              <input className="input" name="end_date" type="date" />
            </div>
            <div>
              <label className="label">Abholung Uhrzeit</label>
              <input className="input" name="pickup_time" type="time" />
            </div>
            <div>
              <label className="label">Zustellung bis</label>
              <input className="input" name="delivery_time" type="time" />
            </div>
          </div>
        </div>
      )}

      {/* Sendung */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-brand-800">📦 Sendung &amp; Fahrzeug</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="label">Fahrzeugklasse *</label>
            <select
              className="input"
              name="vehicle_type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              {Object.entries(VEHICLE_TYPES).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.label} ({v.payload})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Gewicht (kg)</label>
            <input className="input" name="weight_kg" type="number" min="0" step="1" />
          </div>
          <div>
            <label className="label">Paletten</label>
            <input className="input" name="pallets" type="number" min="0" step="1" />
          </div>
        </div>
        <div>
          <label className="label">Distanz (km)</label>
          <input
            className="input max-w-[200px]"
            name="distance_km"
            type="number"
            min="0"
            step="1"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="z. B. 120"
          />
        </div>
        <div>
          <label className="label">Hinweise (Ladehilfen, Termine, Besonderheiten)</label>
          <textarea className="input" name="notes" rows={3} />
        </div>
      </div>

      {/* Preis */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-brand-800">💶 Vergabe &amp; Preis</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["FESTPREIS", "Festpreis", "Der erste passende Dienstleister übernimmt sofort."],
              ["GEBOT", "Gebotsverfahren", "Dienstleister bieten – Sie wählen das beste Angebot."],
            ] as const
          ).map(([value, title, sub]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                pricingMode === value
                  ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                  : "border-slate-300 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="pricing_mode"
                value={value}
                checked={pricingMode === value}
                onChange={() => setPricingMode(value)}
                className="sr-only"
              />
              <span className="block font-semibold">{title}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{sub}</span>
            </label>
          ))}
        </div>

        {pricingMode === "FESTPREIS" && (
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="label">
                {kind === "FEST" ? "Festpreis pro Tour (€ netto)" : "Festpreis (€ netto)"}
              </label>
              <input className="input max-w-[200px]" name="price" type="number" min="0" step="1" />
            </div>
            {estimate != null && (
              <p className="pb-2 text-sm text-slate-600">
                💡 Preisempfehlung für {VEHICLE_TYPES[vehicleType]?.label}, {distanceKm} km:{" "}
                <strong className="text-brand-800">{formatEur(estimate)}</strong>
                <span className="block text-xs text-slate-500">
                  Leer lassen, um die Empfehlung zu übernehmen.
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary w-full py-3 text-base">
        Transport ausschreiben
      </button>
    </form>
  );
}
