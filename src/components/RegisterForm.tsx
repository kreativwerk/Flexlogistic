"use client";

import { useState } from "react";
import { registerAction } from "@/lib/actions";
import { VEHICLE_TYPES } from "@/lib/pricing";

export default function RegisterForm({ initialRole }: { initialRole: "VERLADER" | "FAHRER" }) {
  const [role, setRole] = useState<"VERLADER" | "FAHRER">(initialRole);

  return (
    <form action={registerAction} className="card space-y-4">
      <div>
        <span className="label">Ich registriere mich als …</span>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["VERLADER", "Verlader / Firma", "Ich möchte Transporte buchen"],
              ["FAHRER", "Transportdienstleister", "Ich fahre Touren (KEP / Kurier)"],
            ] as const
          ).map(([value, title, sub]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                role === value
                  ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                  : "border-slate-300 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={value}
                checked={role === value}
                onChange={() => setRole(value)}
                className="sr-only"
              />
              <span className="block font-semibold">{title}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{sub}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="company">Firmenname *</label>
        <input className="input" id="company" name="company" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="contact">Ansprechpartner</label>
          <input className="input" id="contact" name="contact" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Telefon</label>
          <input className="input" id="phone" name="phone" type="tel" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="city">Stadt / Standort</label>
        <input className="input" id="city" name="city" />
      </div>

      {role === "FAHRER" && (
        <div>
          <span className="label">Verfügbare Fahrzeugklassen</span>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(VEHICLE_TYPES).map(([key, v]) => (
              <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <input type="checkbox" name="vehicle_types" value={key} className="accent-blue-700" />
                {v.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">E-Mail *</label>
          <input className="input" id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Passwort * (mind. 8 Zeichen)</label>
          <input className="input" id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
        </div>
      </div>

      <button type="submit" className="btn-primary w-full">
        Kostenlos registrieren
      </button>
    </form>
  );
}
