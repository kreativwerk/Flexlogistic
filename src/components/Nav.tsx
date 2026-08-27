import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
            F
          </span>
          FlexLogistic
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          {user ? (
            <>
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
                Dashboard
              </Link>
              {user.role === "VERLADER" && (
                <>
                  <Link href="/transporte" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
                    Meine Aufträge
                  </Link>
                  <Link href="/transporte/neu" className="btn-primary ml-2">
                    + Transport ausschreiben
                  </Link>
                </>
              )}
              {user.role === "FAHRER" && (
                <>
                  <Link href="/boerse" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
                    Frachtenbörse
                  </Link>
                  <Link href="/transporte" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
                    Meine Touren
                  </Link>
                </>
              )}
              <form action={logoutAction} className="ml-2">
                <button type="submit" className="btn-secondary">
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
                Anmelden
              </Link>
              <Link href="/registrieren" className="btn-primary ml-2">
                Kostenlos registrieren
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
