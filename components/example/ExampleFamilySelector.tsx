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
    <section className="mb-6 rounded-2xl bg-white p-4 ring-1 ring-[#E6DFD3]">
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
                active ? "bg-[#1D3B3A] text-white" : "bg-[#FAF8F4] text-[var(--cc-ink-soft)] ring-1 ring-[#E6DFD3]"
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
