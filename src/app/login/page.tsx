import Link from "next/link";
import { loginAction } from "@/lib/actions";
import ErrorBanner from "@/components/ErrorBanner";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Anmelden</h1>
      <ErrorBanner message={error} />
      <form action={loginAction} className="card space-y-4">
        <div>
          <label className="label" htmlFor="email">E-Mail</label>
          <input className="input" id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Passwort</label>
          <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <button type="submit" className="btn-primary w-full">Anmelden</button>
        <p className="text-center text-sm text-slate-600">
          Noch kein Konto?{" "}
          <Link href="/registrieren" className="font-medium text-brand-700 hover:underline">
            Jetzt registrieren
          </Link>
        </p>
      </form>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-500">
        Demo: <code>verlader@demo.de</code> oder <code>fahrer@demo.de</code>, Passwort <code>demo1234</code>
      </div>
    </div>
  );
}
