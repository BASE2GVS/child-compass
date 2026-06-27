"use client";



import Link from "next/link";

import { useSyncExternalStore } from "react";

import { CompanionExpandable } from "@/components/companion";

import EditorialPage from "@/components/editorial/EditorialPage";

import { EditorialHeading, EditorialSection } from "@/components/editorial/EditorialSection";

import { Input } from "@/components/design-system";



type SearchResultGroup = {

  title: string;

  items: { key: string; label: string; href: string }[];

};



type SearchExperienceProps = {

  query: string;

  childId?: string;

  results: SearchResultGroup[];

  parentName?: string | null;

};



const SUGGESTIONS = ["check-in", "teacher guide", "sleep", "school notes", "summary"];



const RECENT_KEY = "cc-recent-searches";

const RECENT_EVENT = "cc-recent-update";



function loadRecent(): string[] {

  try {

    const stored = localStorage.getItem(RECENT_KEY);

    return stored ? (JSON.parse(stored) as string[]) : [];

  } catch {

    return [];

  }

}



function subscribeRecent(cb: () => void) {

  window.addEventListener(RECENT_EVENT, cb);

  return () => window.removeEventListener(RECENT_EVENT, cb);

}



function saveRecent(term: string) {

  const prev = loadRecent();

  const next = [term, ...prev.filter((q) => q !== term)].slice(0, 5);

  localStorage.setItem(RECENT_KEY, JSON.stringify(next));

  window.dispatchEvent(new Event(RECENT_EVENT));

}



export default function SearchExperience({ query, childId, results, parentName }: SearchExperienceProps) {

  const recent = useSyncExternalStore(subscribeRecent, loadRecent, () => []);

  const hasQuery = Boolean(query.trim());

  const hasResults = results.some((g) => g.items.length > 0);



  function buildHref(term: string) {

    const params = new URLSearchParams({ q: term });

    if (childId) params.set("child", childId);

    return `/search?${params.toString()}`;

  }



  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    const fd = new FormData(e.currentTarget);

    const term = String(fd.get("q") || "").trim();

    if (term) saveRecent(term);

  }



  return (

    <EditorialPage variant="search" title="Search" parentName={parentName}>

      <form action="/search" onSubmit={handleSubmit} className="relative max-w-3xl">

        {childId && <input type="hidden" name="child" value={childId} />}

        <Input

          name="q"

          defaultValue={query}

          placeholder="What would you like to find?"

          aria-label="Search query"

          className="h-14 rounded-2xl border-white/60 bg-white/70 pl-6 text-lg shadow-sm backdrop-blur-sm"

        />

      </form>



      {!hasQuery && (

        <div className="flex flex-wrap gap-2">

          {SUGGESTIONS.map((term) => (

            <Link

              key={term}

              href={buildHref(term)}

              className="rounded-full bg-[var(--cc-teal)]/12 px-4 py-2 text-sm font-medium text-[var(--cc-teal-deep)]"

            >

              {term}

            </Link>

          ))}

        </div>

      )}



      {!hasQuery && recent.length > 0 && (

        <CompanionExpandable label="Recent searches">

          <div className="mt-3 flex flex-wrap gap-2">

            {recent.map((term) => (

              <Link

                key={term}

                href={buildHref(term)}

                className="rounded-full border border-white/60 bg-white/50 px-4 py-2 text-sm text-[var(--cc-ink-muted)]"

              >

                {term}

              </Link>

            ))}

          </div>

        </CompanionExpandable>

      )}



      {hasQuery && (

        <div className="space-y-8">

          {!hasResults ? (

            <p className="text-base text-[var(--cc-ink-muted)]">Nothing matched &ldquo;{query}&rdquo; — try different words, or ask in Help.</p>

          ) : (

            results.map((group) =>

              group.items.length > 0 ? (

                <EditorialSection key={group.title}>

                  <EditorialHeading>{group.title}</EditorialHeading>

                  <ul className="mt-4 divide-y divide-[var(--cc-border-soft)]/50">

                    {group.items.map((item) => (

                      <li key={item.key}>

                        <Link

                          href={item.href}

                          className="flex min-h-12 items-center py-3 text-base font-medium text-[var(--cc-ink)] hover:text-[var(--cc-teal-deep)]"

                        >

                          {item.label}

                        </Link>

                      </li>

                    ))}

                  </ul>

                </EditorialSection>

              ) : null,

            )

          )}

        </div>

      )}

    </EditorialPage>

  );

}


