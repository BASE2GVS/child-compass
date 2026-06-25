"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth";
import AppCard from "@/components/app/AppCard";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await resetPassword(formData);
    if (result?.error) setError(result.error);
    if (result?.success) setSuccess(true);
    setLoading(false);
  }

  return (
    <AppCard padding="lg">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#0F172A]">Reset password</h1>
        <p className="mt-2 text-sm text-slate-600">We&apos;ll send you a reset link</p>
      </div>

      {success ? (
        <div className="rounded-xl bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-800">
          Check your email for a password reset link.
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm outline-none focus:border-[#14B8A6]"
            />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#14B8A6] py-3.5 text-sm font-semibold text-white hover:bg-[#0D9488]"
          >
            Send Reset Link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-[#14B8A6] hover:underline">
          Back to sign in
        </Link>
      </p>
    </AppCard>
  );
}
