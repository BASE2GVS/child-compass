"use client";

import { requestAccountDeletion } from "@/lib/actions/subscription";
import { Button, FormSection, PremiumCard } from "@/components/design-system";
import { useState } from "react";

export default function AccountDeletionForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <PremiumCard padding="lg">
      <FormSection
        title="Delete account"
        description="Request permanent deletion of your account and family data. This cannot be undone."
      >
        {message && <p className="mb-4 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mb-4 text-sm text-rose-700">{error}</p>}
        <form
          action={async (fd) => {
            const result = await requestAccountDeletion(fd);
            if (result?.error) setError(result.error);
            else if (result?.message) setMessage(result.message);
          }}
          className="space-y-4"
        >
          <textarea
            name="reason"
            rows={3}
            placeholder="Optional: tell us why you're leaving"
            className="w-full rounded-2xl border border-[#E8E4DC] bg-[#FAF8F4] px-4 py-3 text-sm"
          />
          <label className="block text-sm text-[#64748B]">
            Type <strong>DELETE</strong> to confirm
            <input
              name="confirm"
              required
              className="mt-2 w-full rounded-2xl border border-[#E8E4DC] bg-white px-4 py-3 text-sm"
            />
          </label>
          <Button type="submit" variant="secondary" className="border-rose-200 text-rose-700 hover:bg-rose-50">
            Request account deletion
          </Button>
        </form>
      </FormSection>
    </PremiumCard>
  );
}
