import Link from "next/link";
import { redirect } from "next/navigation";
import { getFamilyContext, getGlobalSearchResults, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { GlassCard, Input, PageHeader, PageShell, SectionHeader } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; child?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { children } = await getFamilyContext();
  const child = await resolveActiveChild(children, { child: params.child });
  const results = await getGlobalSearchResults(params.q || "", child?.id);
  const hasQuery = Boolean(params.q?.trim());

  return (
    <PageShell>
      <PageHeader
        eyebrow="Find"
        title="Global Search"
        description="Search children, reports, timeline, documents, insights, and debriefs across your family."
      />

      <form action="/search" className="max-w-2xl">
        {child && <input type="hidden" name="child" value={child.id} />}
        <Input name="q" defaultValue={params.q || ""} placeholder="Search anything…" aria-label="Search query" />
      </form>

      {hasQuery && (
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { title: "Children", items: results.children.map((item) => ({ key: item.id, label: item.nickname || item.first_name, href: `/children/${item.id}` })) },
            { title: "Reports", items: results.reports.map((item) => ({ key: item.id, label: item.title, href: `/reports/${item.id}` })) },
            { title: "Timeline", items: results.timeline.map((item) => ({ key: item.id, label: item.title })) },
            { title: "Documents", items: results.documents.map((item) => ({ key: item.id, label: item.title })) },
          ].map((group) => (
            <GlassCard key={group.title} padding="sm">
              <SectionHeader title={group.title} />
              {group.items.length === 0 ? (
                <p className="text-sm text-[#94A3B8]">No matches</p>
              ) : (
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      {"href" in item && item.href ? (
                        <Link href={item.href} className="text-sm text-[#64748B] hover:text-[#14B8A6]">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-sm text-[#64748B]">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {!hasQuery && (
        <GlassCard className="py-12 text-center">
          <p className="text-4xl" aria-hidden="true">🔍</p>
          <p className="mt-4 text-sm text-[#64748B]">Type a search term to find content across Child Compass.</p>
        </GlassCard>
      )}
    </PageShell>
  );
}
