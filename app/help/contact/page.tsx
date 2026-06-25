import { submitContactForm } from "@/lib/actions/support";
import { aiCopy } from "@/lib/presentation/copy";
import { Button, Input, Textarea } from "@/components/design-system";

export const metadata = { title: "Contact Support — Child Compass" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0F172A]">Contact support</h1>
      <p className="mt-4 text-sm text-[#64748B]">
        We typically respond within one business day. For urgent safety concerns, contact your local emergency services
        or your child&apos;s clinician.
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
      <form action={submitContactForm} className="mt-8 space-y-4">
        <input type="hidden" name="ticketType" value="contact" />
        <Input name="subject" required placeholder="Subject" />
        <Textarea name="message" rows={6} required placeholder="How can we help?" />
        <Button type="submit">Send message</Button>
      </form>
    </div>
  );
}
