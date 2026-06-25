"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-2xl bg-[#14B8A6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0D9488]"
    >
      Print / Export PDF
    </button>
  );
}
