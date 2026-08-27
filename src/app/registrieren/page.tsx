import ErrorBanner from "@/components/ErrorBanner";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; rolle?: string }>;
}) {
  const { error, rolle } = await searchParams;
  const initialRole = rolle === "FAHRER" ? "FAHRER" : "VERLADER";
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Registrieren</h1>
      <ErrorBanner message={error} />
      <RegisterForm initialRole={initialRole} />
    </div>
  );
}
