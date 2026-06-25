"use client";

import { useState, useTransition } from "react";
import { submitPilotFeedback } from "@/lib/actions/pilot-feedback";
import { Banner } from "@/components/design-system";

export default function PilotFeedbackForm({ familyId }: { familyId: string }) {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    formData.set("familyId", familyId);
    setError(null);
    startTransition(async () => {
      const result = await submitPilotFeedback(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <Banner variant="success">
        Thank you — your feedback has been recorded. We read every response with care.
      </Banner>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6 rounded-[32px] bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      {error && <Banner variant="warning">{error}</Banner>}

      <div>
        <label htmlFor="usefulness" className="block text-sm font-semibold text-[#0F172A]">
          How useful has Child Compass been this week? (1–5)
        </label>
        <select
          id="usefulness"
          name="usefulness"
          required
          className="mt-2 w-full rounded-2xl border border-[#E8E4DC] px-4 py-3 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select a rating
          </option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} — {n === 5 ? "Very useful" : n === 1 ? "Not useful yet" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="confusion" className="block text-sm font-semibold text-[#0F172A]">
          Anything confusing?
        </label>
        <textarea
          id="confusion"
          name="confusion"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-[#E8E4DC] px-4 py-3 text-sm"
          placeholder="Optional — screens, wording, or features that felt unclear"
        />
      </div>

      <div>
        <label htmlFor="improvements" className="block text-sm font-semibold text-[#0F172A]">
          Suggested improvements
        </label>
        <textarea
          id="improvements"
          name="improvements"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-[#E8E4DC] px-4 py-3 text-sm"
          placeholder="What would make Child Compass more helpful day to day?"
        />
      </div>

      <div>
        <label htmlFor="featureRequest" className="block text-sm font-semibold text-[#0F172A]">
          Feature requests
        </label>
        <textarea
          id="featureRequest"
          name="featureRequest"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-[#E8E4DC] px-4 py-3 text-sm"
          placeholder="Optional — ideas for future releases"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-[#14B8A6] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0D9488] disabled:opacity-50"
      >
        {pending ? "Sending…" : "Submit feedback"}
      </button>
    </form>
  );
}
