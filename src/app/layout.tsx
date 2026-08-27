import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "FlexLogistic – Die Schnittstelle zwischen Industrie und Logistik",
  description:
    "Transporte einfach ausschreiben und buchen: Direktfahrten, Extra-Touren und feste Touren für Verlader und KEP-Dienstleister.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
          FlexLogistic – Die Schnittstelle zwischen Industrie und Logistik
        </footer>
      </body>
    </html>
  );
}
