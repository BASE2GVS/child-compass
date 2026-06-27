import DashboardBackground from "@/components/dashboard/DashboardBackground";
import ExperienceHero from "@/components/experience/ExperienceHero";
import { GlassCard, Input, SectionHeader } from "@/components/design-system";
import type { ResourceLibraryItem } from "@/lib/types/database";

type ResourceLibraryExperienceProps = {
  resources: ResourceLibraryItem[];
  query: string;
};

export default function ResourceLibraryExperience({ resources, query }: ResourceLibraryExperienceProps) {
  const grouped = resources.reduce<Record<string, ResourceLibraryItem[]>>((acc, resource) => {
    acc[resource.category] = [...(acc[resource.category] || []), resource];
    return acc;
  }, {});

  return (
    <DashboardBackground>
      <div className="mx-auto max-w-6xl space-y-10 pb-8">
        <ExperienceHero
          variant="resources"
          eyebrow="📚 Curated for families"
          title="Resource Library"
          description="PDA, Autism, ADHD, anxiety, school, sensory, and transition supports — chosen with care."
        />

        <form action="/resource-library">
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search articles, videos, downloads…"
            aria-label="Search resources"
            className="h-14 rounded-2xl border-[#E8E4DC] bg-white/90 pl-5 text-lg shadow-sm"
          />
        </form>

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <SectionHeader eyebrow={category} title={category.replace(/_/g, " ")} />
            <div className="grid gap-4">
              {items.map((item) => (
                <GlassCard key={item.id} padding="sm" className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--cc-ink-muted)]">{item.resource_type}</p>
                  <p className="mt-2 font-semibold text-[var(--cc-ink)]">{item.title}</p>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--cc-ink-muted)]">{item.description}</p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-sm font-semibold text-[var(--cc-teal-deep)] hover:underline"
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
          <GlassCard className="py-14 text-center">
            <p className="text-5xl" aria-hidden>
              🌿
            </p>
            <p className="mt-4 text-lg font-medium text-[var(--cc-ink)]">No resources match yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--cc-ink-muted)]">
              Try a different search — or browse without a filter to see everything.
            </p>
          </GlassCard>
        )}
      </div>
    </DashboardBackground>
  );
}
