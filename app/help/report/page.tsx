import { submitBugReportForm } from "@/lib/actions/support";
import { aiCopy } from "@/lib/presentation/copy";
import { Button, Input, Textarea } from "@/components/design-system";

export const metadata = { title: "Report a Problem — Child Compass" };

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0F172A]">Report a problem</h1>
      <p className="mt-4 text-sm text-[#64748B]">
        Tell us what went wrong — include the page you were on and what you expected to happen.
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
      <form action={submitBugReportForm} className="mt-8 space-y-4">
        <input type="hidden" name="ticketType" value="bug" />
        <Input name="subject" required placeholder="Brief summary" />
        <Textarea name="message" rows={6} required placeholder="Steps to reproduce, browser, device…" />
        <Button type="submit">Submit report</Button>
      </form>
    </div>
  );
}
