"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/framework";
import { PRIMARY_NAV, isNavActive } from "@/lib/navigation/parent-nav";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="cc-shell-mobile-nav fixed right-0 bottom-0 left-0 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around px-1 pt-1">
        {PRIMARY_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          const isAsk = item.href === "/coach";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-3 transition-colors ${
                active ? "text-[var(--cc-teal-deep)]" : "text-[var(--cc-ink-faint)]"
              } ${isAsk && !active ? "text-[var(--cc-ink)]" : ""}`}
            >
              <span
                className={`flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl transition-colors ${
                  isAsk
                    ? active
                      ? "bg-[var(--cc-teal)] text-white"
                      : "bg-[var(--cc-teal-wash)] text-[var(--cc-teal-deep)]"
                    : ""
                }`}
              >
                <NavIcon d={item.icon} />
              </span>
              <span className="max-w-full truncate text-[11px] font-semibold">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
