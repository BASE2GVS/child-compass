"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import AppCard from "@/components/app/AppCard";

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
    <AppCard padding="lg">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#0F172A]">Welcome to Child Compass™</h1>
        <p className="mt-2 text-sm text-slate-600">Create your account and get calm, personalised support</p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-[#FAF8F4] p-4">
        <ul className="space-y-2 text-sm text-slate-700">
          <li>✓ Personalised AI Guidance</li>
          <li>✓ Built for PDA, Autism &amp; ADHD</li>
          <li>✓ Secure &amp; Private</li>
          <li>✓ Free to get started</li>
        </ul>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
            Your name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20"
            placeholder="Sarah"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20"
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
            minLength={8}
            className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#14B8A6] py-3.5 text-sm font-semibold text-white hover:bg-[#0D9488] disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#14B8A6] hover:underline">
          Sign in
        </Link>
      </p>
    </AppCard>
  );
}
