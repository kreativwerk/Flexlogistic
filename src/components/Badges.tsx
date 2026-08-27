import type { TourKind, TourStatus } from "@/lib/types";

const KIND_STYLES: Record<TourKind, { label: string; cls: string }> = {
  DIREKT: { label: "Direktfahrt", cls: "bg-red-100 text-red-800" },
  EXTRA: { label: "Extra-Tour", cls: "bg-amber-100 text-amber-800" },
  FEST: { label: "Feste Tour", cls: "bg-emerald-100 text-emerald-800" },
};

const STATUS_STYLES: Record<TourStatus, { label: string; cls: string }> = {
  OFFEN: { label: "Offen", cls: "bg-blue-100 text-blue-800" },
  VERGEBEN: { label: "Vergeben", cls: "bg-violet-100 text-violet-800" },
  ABGEHOLT: { label: "Abgeholt", cls: "bg-amber-100 text-amber-800" },
  ZUGESTELLT: { label: "Zugestellt", cls: "bg-emerald-100 text-emerald-800" },
  STORNIERT: { label: "Storniert", cls: "bg-slate-200 text-slate-600" },
};

export function KindBadge({ kind }: { kind: TourKind }) {
  const s = KIND_STYLES[kind];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TourStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
