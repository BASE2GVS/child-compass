"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import AppCard from "@/components/app/AppCard";
import { ds } from "@/components/design-system/tokens";

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    if (redirectTo) formData.set("redirect", redirectTo);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AppCard padding="lg" className="cc-card-lift shadow-[0_12px_40px_rgba(45,42,38,0.06)]">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-[var(--cc-ink)]">Welcome back</h1>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className={ds.label}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={ds.input} placeholder="you@example.com" />
        </div>

        <div>
          <label htmlFor="password" className={ds.label}>
            Password
          </label>
          <input id="password" name="password" type="password" required className={ds.input} placeholder="••••••••" />
        </div>

        {error && (
          <p className="rounded-2xl bg-[var(--cc-danger-wash)] px-4 py-3 text-sm text-[var(--cc-danger)]">{error}</p>
        )}

        <button type="submit" disabled={loading} className={`w-full ${ds.btnPrimary} cc-btn-alive`}>
          {loading ? "Opening your companion…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <Link href="/forgot-password" className="font-medium text-[var(--cc-teal-deep)] hover:underline">
          Forgot password?
        </Link>
        <p className="text-[var(--cc-ink-muted)]">
          New here?{" "}
          <Link href="/register" className="font-semibold text-[var(--cc-teal-deep)] hover:underline">
            Create your account
          </Link>
        </p>
      </div>
    </AppCard>
  );
}
