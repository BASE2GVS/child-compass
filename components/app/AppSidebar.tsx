"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import type { Child } from "@/lib/types/database";

type NavItem = { href: string; label: string; icon: string };

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Family",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { href: "/children", label: "Children", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
      { href: "/compass", label: "Child Compass™", icon: "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" },
    ],
  },
  {
    title: "Daily",
    items: [
      { href: "/check-in", label: "Check-In", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
      { href: "/debrief", label: "Parent Debrief™", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
      { href: "/timeline", label: "Timeline", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
      { href: "/goals", label: "Goals", icon: "M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" },
      { href: "/habits", label: "Habits", icon: "M5 13l4 4L19 7" },
      { href: "/schedules", label: "Visual Schedules", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
    ],
  },
  {
    title: "AI",
    items: [
      { href: "/coach", label: "Ask Child Compass™", icon: "M8 10h.01M12 10h.01M16 10h.01M21 10c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 18l1.395-3.72C3.512 13.042 3 11.574 3 10c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
      { href: "/analytics", label: "Analytics", icon: "M3 3v18h18M7 13l3-3 2 2 5-5" },
      { href: "/school", label: "School Hub", icon: "M12 14l9-5-9-5-9 5 9 5z" },
      { href: "/therapy", label: "Therapist Hub", icon: "M4 7h16M4 12h16M4 17h10" },
      { href: "/health", label: "Health Hub", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
    ],
  },
  {
    title: "Support",
    items: [
      { href: "/help", label: "Help Centre", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
      { href: "/help-me-now", label: "Help Me Now", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    ],
  },
  {
    title: "Documents",
    items: [
      { href: "/reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { href: "/documents", label: "Documents", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
      { href: "/teacher-guide", label: "Teacher Guide™", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" },
      { href: "/pda-passport", label: "PDA Passport™", icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" },
      { href: "/calm-plan", label: "Emergency Calm Plan™", icon: "M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V6h2v6z" },
      { href: "/resource-library", label: "Resource Library", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
      { href: "/profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
      { href: "/search", label: "Search", icon: "M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" },
    ],
  },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

type AppSidebarProps = {
  familyName?: string | null;
  activeChild?: Child | null;
  profileName?: string | null;
  profileAvatar?: string | null;
};

export default function AppSidebar({
  familyName,
  activeChild,
  profileName,
  profileAvatar,
}: AppSidebarProps) {
  const pathname = usePathname();
  const childLabel = activeChild?.nickname || activeChild?.first_name;
  const parentInitial = profileName?.charAt(0)?.toUpperCase() || "P";

  return (
    <aside className="hidden w-[18rem] shrink-0 flex-col bg-white/95 shadow-[4px_0_32px_rgba(15,23,42,0.05)] backdrop-blur-md lg:flex">
      <div className="px-6 py-8">
        <Link href="/dashboard" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40 rounded-xl">
          <p className="text-xl font-bold tracking-tight text-[#0F172A]">Child Compass™</p>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-[#94A3B8] uppercase">
            Powered by VYRONSOFT
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-4" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40 ${
                      active
                        ? "bg-[#14B8A6]/10 text-[#0D9488] shadow-[inset_3px_0_0_0_#14B8A6]"
                        : "text-[#64748B] hover:translate-x-0.5 hover:bg-[#FAF8F4] hover:text-[#0F172A] motion-reduce:transform-none"
                    }`}
                  >
                    <NavIcon d={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-[#F1EDE6] p-4">
        {(familyName || activeChild) && (
          <div className="rounded-[24px] bg-gradient-to-br from-[#FAF8F4] to-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">Your Family</p>
            <p className="mt-1 truncate font-bold text-[#0F172A]">{familyName || "My Family"}</p>
            {activeChild && (
              <div className="mt-3 flex items-center gap-3">
                {activeChild.photo_url ? (
                  <Image
                    src={activeChild.photo_url}
                    alt={childLabel || "Child"}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14B8A6]/15 text-sm font-bold text-[#14B8A6]">
                    {activeChild.first_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">{childLabel}</p>
                  <p className="text-xs text-[#94A3B8]">Active child</p>
                </div>
              </div>
            )}
            <Link
              href="/settings"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-semibold text-[#64748B] shadow-sm transition-colors hover:text-[#14B8A6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40"
            >
              Family settings
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-[20px] border border-[#F1EDE6] bg-white p-3 shadow-sm">
          {profileAvatar ? (
            <Image
              src={profileAvatar}
              alt={profileName || "Profile"}
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] text-sm font-bold text-white">
              {parentInitial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0F172A]">{profileName || "Parent"}</p>
            <Link href="/profile" className="text-xs text-[#14B8A6] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40 rounded">
              View profile
            </Link>
          </div>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#64748B] transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/50"
          >
            <NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
