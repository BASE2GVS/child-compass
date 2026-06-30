import Link from "next/link";
import EditorialPage from "@/components/editorial/EditorialPage";
import type { Child } from "@/lib/types/database";
import type { StoryDraft } from "@/lib/journey/story";

type Props = {
  child: Child;
  familyChildren: Child[];
  parentName?: string | null;
  draft: StoryDraft;
  backHref?: string;
};

export default function StoryReader({ child, familyChildren, parentName, draft, backHref }: Props) {
  const childName = child.nickname || child.first_name;

  return (
    <EditorialPage
      variant="track"
      title={`${draft.kind[0].toUpperCase()}${draft.kind.slice(1)} Story Draft`}
      parentName={parentName}
      childName={childName}
      familyChildren={familyChildren}
      activeChildId={child.id}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#52706F]">{draft.periodLabel}</p>
        <Link href={backHref || `/journey?child=${child.id}`} className="rounded-full bg-[#F6F1E7] px-4 py-2 text-xs font-semibold text-[#345B59] ring-1 ring-[#E6DFD3] hover:bg-[#F0E9DD]">
          Close and return to Journey
        </Link>
      </div>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
        <p className="text-base leading-relaxed text-[var(--cc-ink)]">{draft.text}</p>
      </section>

      <section className="mt-6 rounded-2xl bg-[#F6F1E7] p-5 ring-1 ring-[#E6DFD3]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#52706F]">Grounding Facts</h2>
        <ul className="mt-3 space-y-1 text-sm text-[var(--cc-ink-soft)]">
          {draft.sourceFacts.map((fact) => (
            <li key={fact}>• {fact}</li>
          ))}
        </ul>
      </section>
    </EditorialPage>
  );
}
