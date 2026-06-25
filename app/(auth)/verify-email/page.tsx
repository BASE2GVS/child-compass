import Link from "next/link";
import AppCard from "@/components/app/AppCard";
import { resendVerificationEmail } from "@/lib/actions/auth";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  return (
    <AppCard padding="lg">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#14B8A6]/10">
          <svg className="h-7 w-7 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We&apos;ve sent you a verification link.
          Open your inbox, click the link, then return here and sign in.
        </p>
        <form action={resendVerificationEmail} className="mx-auto mt-6 max-w-sm space-y-3">
          <input
            type="email"
            name="email"
            required
            defaultValue={params.email || ""}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            Resend verification email
          </button>
        </form>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-2xl bg-[#14B8A6] px-8 py-3 text-sm font-semibold text-white hover:bg-[#0D9488]"
        >
          I&apos;ve verified my email
        </Link>
      </div>
    </AppCard>
  );
}
