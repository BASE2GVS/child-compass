"use client";



import type { ReactNode } from "react";

import Image from "next/image";

import Link from "next/link";

import { signOut } from "@/lib/actions/auth";



type AppTopNavProps = {

  profileName?: string | null;

  profileAvatar?: string | null;

};



function IconButton({

  href,

  label,

  children,

}: {

  href: string;

  label: string;

  children: ReactNode;

}) {

  return (

    <Link

      href={href}

      aria-label={label}

      className="cc-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/58 bg-white/38 text-[var(--cc-ink-muted)] backdrop-blur-md transition-colors hover:border-[var(--cc-teal)]/35 hover:bg-white/46 hover:text-[var(--cc-teal-deep)]"

    >

      {children}

    </Link>

  );

}



export default function AppTopNav({ profileName, profileAvatar }: AppTopNavProps) {

  const parentInitial = profileName?.charAt(0)?.toUpperCase() || "P";

  const firstName = profileName?.split(" ")[0] || "Parent";



  return (

    <header className="pointer-events-none sticky top-0 z-40 pt-3 lg:pt-4">

      <div className="cc-shell-topnav pointer-events-auto mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6">

        <Link href="/today" className="flex items-center gap-2 lg:hidden">

          <span className="font-display text-base font-semibold text-[var(--cc-ink)]">Child Compass</span>

        </Link>

        <div className="hidden flex-1 lg:block" aria-hidden />



        <div className="flex items-center justify-end gap-2">

          <Link

            href="/profile"

            className="cc-focus-ring flex min-h-10 min-w-0 items-center gap-2.5 rounded-full border border-transparent py-1 pr-2 transition-colors hover:border-white/62 hover:bg-white/32 sm:pr-3"

          >

            {profileAvatar ? (

              <Image

                src={profileAvatar}

                alt={profileName || "Profile"}

                width={36}

                height={36}

                className="h-9 w-9 shrink-0 rounded-xl object-cover ring-2 ring-white/80"

              />

            ) : (

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--cc-teal)] to-[var(--cc-teal-soft)] text-sm font-bold text-white ring-2 ring-white/80">

                {parentInitial}

              </div>

            )}

            <span className="truncate text-sm font-semibold text-[var(--cc-ink)]">{firstName}</span>

          </Link>



          <IconButton href="/search" label="Search">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
          </IconButton>

          <IconButton href="/settings" label="Settings">

            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>

              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />

              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />

            </svg>

          </IconButton>



          <form action={signOut} className="shrink-0">

            <button

              type="submit"

              className="cc-focus-ring inline-flex min-h-10 items-center justify-center rounded-full px-3 text-sm font-medium text-[var(--cc-ink-muted)] transition-colors hover:bg-white/42 hover:text-[var(--cc-ink)]"

            >

              Sign out

            </button>

          </form>

        </div>

      </div>

    </header>

  );

}


