"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import AppCard from "@/components/app/AppCard";
import { ds } from "@/components/design-system/tokens";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AppCard padding="lg" className="cc-card-lift shadow-[0_12px_40px_rgba(45,42,38,0.06)]">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-[var(--cc-ink)]">Create your account</h1>
        <p className="mt-2 text-sm text-[var(--cc-ink-muted)]">About a minute</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="fullName" className={ds.label}>
            Your name
          </label>
          <input id="fullName" name="fullName" type="text" required className={ds.input} placeholder="Sarah" />
        </div>

        <div>
          <label htmlFor="email" className={ds.label}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={ds.input} />
        </div>

        <div>
          <label htmlFor="password" className={ds.label}>
            Password
          </label>
          <input id="password" name="password" type="password" required minLength={8} className={ds.input} />
          <p className={ds.hint}>At least 8 characters</p>
        </div>

        {error && (
          <p className="rounded-2xl bg-[var(--cc-danger-wash)] px-4 py-3 text-sm text-[var(--cc-danger)]">{error}</p>
        )}

        <button type="submit" data-testid="register-submit" disabled={loading} className={`w-full ${ds.btnPrimary} cc-btn-alive`}>
          {loading ? "Creating your space…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--cc-ink-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--cc-teal-deep)] hover:underline">
          Sign in
        </Link>
      </p>
    </AppCard>
  );
}
