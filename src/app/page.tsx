import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VEHICLE_TYPES } from "@/lib/pricing";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="pt-10 text-center">
        <p className="mb-3 text-sm font-semibold tracking-wide text-brand-700 uppercase">
          Die Schnittstelle zwischen Industrie und Logistik
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Transporte ausschreiben.
          <br />
          Touren finden. <span className="text-brand-700">Einfach.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          FlexLogistic verbindet Firmen, die Transporte buchen wollen, direkt mit
          KEP-Dienstleistern und Kurierunternehmen – für Direktfahrten, Extra-Touren
          und feste Touren. Ohne Umwege, ohne Papierkram.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/registrieren?rolle=VERLADER" className="btn-primary px-6 py-3 text-base">
            Ich möchte Transporte buchen
          </Link>
          <Link href="/registrieren?rolle=FAHRER" className="btn-secondary px-6 py-3 text-base">
            Ich fahre Touren
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Demo-Zugänge: <code>verlader@demo.de</code> / <code>fahrer@demo.de</code> (Passwort:{" "}
          <code>demo1234</code>)
        </p>
      </section>

      {/* Auftragsarten */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-bold">Drei Auftragsarten – eine Plattform</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="card">
            <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              Direktfahrt
            </span>
            <h3 className="mt-3 font-semibold">Sofort &amp; eilig</h3>
            <p className="mt-2 text-sm text-slate-600">
              Zeitkritische Sendungen als Direktfahrt ausschreiben – der nächste freie
              Kurier übernimmt zum Festpreis.
            </p>
          </div>
          <div className="card">
            <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Extra-Tour
            </span>
            <h3 className="mt-3 font-semibold">Geplante Einzelfahrten</h3>
            <p className="mt-2 text-sm text-slate-600">
              Geplante Transporte mit Zeitfenster – zum Festpreis vergeben oder das beste
              Angebot im Gebotsverfahren wählen.
            </p>
          </div>
          <div className="card">
            <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Feste Tour
            </span>
            <h3 className="mt-3 font-semibold">Wiederkehrend &amp; planbar</h3>
            <p className="mt-2 text-sm text-slate-600">
              Regelmäßige Touren (z. B. werktags 6:30 Uhr) langfristig an einen festen
              Dienstleister vergeben – planbarer Umsatz für Fahrer.
            </p>
          </div>
        </div>
      </section>

      {/* So funktioniert's */}
      <section className="grid gap-10 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-bold text-brand-800">Für Verlader &amp; Industrie</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li>
              <strong>1. Transport ausschreiben</strong> – Abholung, Zustellung, Fahrzeugklasse,
              fertig. Mit sofortiger Preisempfehlung.
            </li>
            <li>
              <strong>2. Festpreis oder Gebote</strong> – Sofort vergeben oder Angebote von
              geprüften Dienstleistern vergleichen.
            </li>
            <li>
              <strong>3. Live-Status</strong> – Vergeben, abgeholt, zugestellt: Sie sehen jederzeit,
              wo Ihr Auftrag steht – inkl. Ablieferbeleg.
            </li>
          </ol>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold text-brand-800">Für KEP-Dienstleister &amp; Kuriere</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li>
              <strong>1. Frachtenbörse durchsuchen</strong> – Nach Region, Fahrzeugklasse und
              Auftragsart filtern.
            </li>
            <li>
              <strong>2. Übernehmen oder bieten</strong> – Festpreis-Touren mit einem Klick
              sichern oder eigenes Angebot abgeben.
            </li>
            <li>
              <strong>3. Feste Touren gewinnen</strong> – Wiederkehrende Touren bedeuten planbaren
              Umsatz, jede Woche.
            </li>
          </ol>
        </div>
      </section>

      {/* Fahrzeugklassen */}
      <section>
        <h2 className="mb-6 text-center text-2xl font-bold">Alle Fahrzeugklassen – vom PKW bis zum 40-Tonner</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(VEHICLE_TYPES).map(([key, v]) => (
            <div key={key} className="card py-4 text-center">
              <div className="font-semibold text-slate-800">{v.label}</div>
              <div className="mt-1 text-xs text-slate-500">{v.payload}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
