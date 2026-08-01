// Shared styling tokens for form controls in the patent input section.
// Kept in one place so every input method (form / paste / upload) and the
// advanced options panel stay visually identical without copy-pasting
// class strings everywhere.

export const fieldClass =
  "w-full rounded-lg border border-slate-100 bg-paper px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-slate/60 transition focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/15";

export const labelClass =
  "mb-1.5 flex items-baseline gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-ink";
