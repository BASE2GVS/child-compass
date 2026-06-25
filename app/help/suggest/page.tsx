import { submitFeatureSuggestionForm } from "@/lib/actions/support";
import { aiCopy } from "@/lib/presentation/copy";
import { Button, Input, Textarea } from "@/components/design-system";

export const metadata = { title: "Suggest a Feature — Child Compass" };

export default async function SuggestPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0F172A]">Suggest a feature</h1>
      <p className="mt-4 text-sm text-[#64748B]">
        We prioritise features that help parents understand their child and build trust. Share your idea below.
      </p>
      {params.sent === "1" && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {aiCopy.supportReceived}
        </p>
      )}
      {params.error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {decodeURIComponent(params.error)}
        </p>
      )}
      <form action={submitFeatureSuggestionForm} className="mt-8 space-y-4">
        <input type="hidden" name="ticketType" value="feature" />
        <Input name="subject" required placeholder="Feature title" />
        <Textarea name="message" rows={6} required placeholder="What problem would this solve for your family?" />
        <Button type="submit">Submit suggestion</Button>
      </form>
    </div>
  );
}
