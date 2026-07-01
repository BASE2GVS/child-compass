"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Item = {
  id: string;
  label: string;
  childId: string;
};

export default function ExampleFamilySelector({
  items,
  activeExampleId,
}: {
  items: Item[];
  activeExampleId?: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!items.length) return null;

  return (
    <section className="cc-premium-panel mb-6 rounded-2xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#52706F]">Example Families</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("example", item.id);
          params.set("child", item.childId);
          const href = `${pathname}?${params.toString()}`;
          const active = item.id === activeExampleId;
          return (
            <Link
              key={item.id}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "bg-[rgba(29,59,58,0.9)] text-white shadow-[0_6px_14px_rgba(45,42,38,0.14)]"
                  : "bg-white/58 text-[var(--cc-ink-soft)] ring-1 ring-white/72 backdrop-blur-sm hover:bg-white/72"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
