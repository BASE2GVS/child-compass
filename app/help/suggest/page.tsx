import { submitFeatureSuggestionForm } from "@/lib/actions/support";
import { aiCopy } from "@/lib/presentation/copy";
import { Button, Input, Textarea } from "@/components/design-system";
import { typeScale } from "@/components/design-system/tokens/typography";

export const metadata = { title: "Suggest a Feature — Child Compass" };

export default async function SuggestPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="max-w-xl">
      <h1 className={typeScale.title}>Suggest a feature</h1>
      <p className={`mt-4 ${typeScale.body}`}>
        Tell us what would make life easier for your family — we read every suggestion with care.
      </p>
      {params.sent === "1" && (
        <p className="mt-4 rounded-2xl border border-[var(--cc-success)]/20 bg-[var(--cc-success-wash)] px-4 py-3 text-sm text-[var(--cc-ink)]" role="status">
          {aiCopy.supportReceived}
        </p>
      )}
      {params.error && (
        <p className="mt-4 rounded-2xl border border-[var(--cc-warning)]/25 bg-[var(--cc-warning-wash)] px-4 py-3 text-sm text-[var(--cc-ink)]" role="alert">
          That didn&apos;t quite work — please try again when you&apos;re ready.
        </p>
      )}
      <form action={submitFeatureSuggestionForm} className="cc-fw-form mt-8">
        <input type="hidden" name="ticketType" value="feature" />
        <Input name="subject" required placeholder="Feature title" className="cc-fw-form-span-2" />
        <Textarea name="message" rows={6} required placeholder="What problem would this solve for your family?" className="cc-fw-form-span-2" />
        <Button type="submit" className="cc-fw-form-span-2">Save suggestion</Button>
      </form>
    </div>
  );
}
