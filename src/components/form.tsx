import type { ReactNode } from "react";

export const inputClass =
  "w-full min-h-11 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-zinc-400 outline-none transition-colors focus:border-rose-500 focus:ring-2 focus:ring-rose-200";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}
