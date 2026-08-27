import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ErrorBanner from "@/components/ErrorBanner";
import NewTourForm from "@/components/NewTourForm";

export default async function NewTourPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "VERLADER") redirect("/dashboard");

  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold">Transport ausschreiben</h1>
      <p className="mb-6 text-sm text-slate-600">
        In wenigen Schritten zur Ausschreibung – mit sofortiger Preisempfehlung.
      </p>
      <ErrorBanner message={error} />
      <NewTourForm />
    </div>
  );
}
