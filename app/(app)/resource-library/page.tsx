import { redirect } from "next/navigation";
import { getProfile, getResourceLibrary } from "@/lib/data/queries";
import { GlassCard, Input, PageHeader, PageShell, SectionHeader } from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function ResourceLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const resources = await getResourceLibrary(params.q);
  const grouped = resources.reduce<Record<string, typeof resources>>((acc, resource) => {
    acc[resource.category] = [...(acc[resource.category] || []), resource];
    return acc;
  }, {});

  return (
    <PageShell>
      <PageHeader
        eyebrow="Learn"
        title="Resource Library"
        description="PDA, Autism, ADHD, Anxiety, School, Sensory, and Transition supports — curated for families."
      />

      <form className="max-w-xl" action="/resource-library">
        <Input name="q" defaultValue={params.q || ""} placeholder="Search articles, videos, downloads…" aria-label="Search resources" />
      </form>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <SectionHeader eyebrow={category} title={category.replace(/_/g, " ")} />
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item) => (
              <GlassCard key={item.id} padding="sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{item.resource_type}</p>
                <p className="mt-2 font-bold text-[#0F172A]">{item.title}</p>
                {item.description && <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{item.description}</p>}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-sm font-semibold text-[#14B8A6] hover:text-[#0D9488]"
                  >
                    Open resource →
                  </a>
                )}
              </GlassCard>
            ))}
          </div>
        </section>
      ))}

      {resources.length === 0 && (
        <GlassCard className="py-12 text-center">
          <p className="text-4xl" aria-hidden="true">📚</p>
          <p className="mt-4 text-sm text-[#64748B]">No resources match your search. Try a different term.</p>
        </GlassCard>
      )}
    </PageShell>
  );
}
