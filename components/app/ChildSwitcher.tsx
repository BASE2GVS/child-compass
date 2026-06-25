"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { selectChild } from "@/lib/actions/auth";
import type { Child } from "@/lib/types/database";

export default function ChildSwitcher({
  familyChildren,
  activeChildId,
}: {
  familyChildren: Child[];
  activeChildId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  if (familyChildren.length <= 1) return null;

  function handleChange(childId: string) {
    startTransition(async () => {
      await selectChild(childId);
      router.push(`${pathname}?child=${childId}`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {familyChildren.map((child) => {
        const active = child.id === activeChildId;
        const label = child.nickname || child.first_name;
        return (
          <button
            key={child.id}
            type="button"
            disabled={pending}
            onClick={() => handleChange(child.id)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
              active
                ? "bg-[#14B8A6] text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:border-[#14B8A6]/40"
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                active ? "bg-white/20 text-white" : "bg-[#14B8A6]/10 text-[#14B8A6]"
              }`}
            >
              {child.first_name.charAt(0)}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
