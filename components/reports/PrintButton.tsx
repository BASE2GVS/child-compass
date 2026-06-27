"use client";

import { actionCopy } from "@/lib/presentation/copy";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-11 rounded-full bg-[var(--cc-teal)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_var(--cc-teal-glow)] hover:bg-[var(--cc-teal-deep)]"
    >
      {actionCopy.exportPdf}
    </button>
  );
}
