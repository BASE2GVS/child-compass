"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/framework";
import { HOME_ROUTE, MORE_NAV, PRIMARY_NAV, isNavActive } from "@/lib/navigation/parent-nav";
import type { Child } from "@/lib/types/database";

type AppSidebarProps = {
  familyName?: string | null;
  activeChild?: Child | null;
};

export default function AppSidebar({
  familyName,
  activeChild,
}: AppSidebarProps) {
  const pathname = usePathname();
  const childLabel = activeChild?.nickname || activeChild?.first_name;

  return (
    <aside className="cc-shell-sidebar relative z-[2] hidden w-[17.5rem] shrink-0 flex-col lg:flex">
      <div className="px-5 py-6">
        <Link
          href={HOME_ROUTE}
          className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-teal)]/40"
        >
          <p className="font-display text-xl font-semibold tracking-tight text-[var(--cc-ink)]">
            Child Compass™
          </p>
          <p className="mt-0.5 text-xs font-medium tracking-wide text-[var(--cc-ink-faint)]">
            Your daily companion
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
        {PRIMARY_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          const isAsk = item.href === "/coach";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9375rem] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-teal)]/40 ${
                active
                  ? "bg-gradient-to-r from-white/58 to-white/34 text-[var(--cc-teal-deep)] ring-1 ring-white/66 shadow-[inset_2px_0_0_0_var(--cc-teal),0_6px_16px_rgba(45,42,38,0.06)]"
                  : isAsk
                    ? "text-[var(--cc-ink)] hover:bg-white/44"
                    : "text-[var(--cc-ink-muted)] hover:bg-white/34 hover:text-[var(--cc-ink)]"
              }`}
            >
              <NavIcon d={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-5">
          <p className="mb-1.5 px-3.5 text-xs font-semibold tracking-wide text-[var(--cc-ink-faint)]">
            More
          </p>
          <div className="space-y-0.5">
            {MORE_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-teal)]/40 ${
                    active
                      ? "font-medium text-[var(--cc-teal-deep)]"
                      : "text-[var(--cc-ink-faint)] hover:bg-white/35 hover:text-[var(--cc-ink-muted)]"
                  }`}
                >
                  <NavIcon d={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="space-y-3 border-t border-white/44 p-4">
        {(familyName || activeChild) && (
          <div className="cc-fw-card cc-fw-card-supporting cc-fw-pad-sm">
            <p className="text-xs font-medium text-[var(--cc-ink-faint)]">Active child</p>
            {activeChild && (
              <div className="mt-2 flex items-center gap-3">
                {activeChild.photo_url ? (
                  <Image
                    src={activeChild.photo_url}
                    alt={childLabel || "Child"}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cc-teal-wash)] text-sm font-bold text-[var(--cc-teal-deep)]">
                    {activeChild.first_name.charAt(0)}
                  </div>
                )}
                <p className="truncate text-sm font-semibold text-[var(--cc-ink)]">{childLabel}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
