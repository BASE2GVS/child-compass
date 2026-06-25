"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import AppCard from "@/components/app/AppCard";

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
    <AppCard padding="lg">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to Child Compass™</p>
      </div>

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
            className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#14B8A6] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0D9488] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <Link href="/forgot-password" className="text-[#14B8A6] hover:underline">
          Forgot password?
        </Link>
        <p className="text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[#14B8A6] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AppCard>
  );
}
