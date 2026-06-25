import Link from "next/link";

export const metadata = {
  title: "Help Me Now™ — Child Compass",
  description: "Calm, personalised guidance when you need it most.",
};

export default function HelpMeNowPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Help Me Now™</p>
        <h1 className="mt-3 text-4xl font-bold text-[#0F172A]">Support in difficult moments</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#64748B]">
          When something feels hard, Child Compass helps you understand what may be happening and offers calm,
          practical next steps — personalised to your child&apos;s profile and history.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-[#475569]">
          <li className="flex gap-2">
            <span className="text-[#14B8A6]">✓</span> Parent Debrief™ for after difficult moments
          </li>
          <li className="flex gap-2">
            <span className="text-[#14B8A6]">✓</span> Ask Child Compass™ on your dashboard
          </li>
          <li className="flex gap-2">
            <span className="text-[#14B8A6]">✓</span> Guidance drawn from your family&apos;s own data
          </li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/login?redirect=/debrief"
            className="rounded-2xl bg-[#14B8A6] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0D9488]"
          >
            Sign in for guidance
          </Link>
          <Link
            href="/register"
            className="rounded-2xl border border-[#E8E4DC] bg-white px-6 py-3.5 text-sm font-semibold text-[#0F172A] hover:bg-white/80"
          >
            Create a free account
          </Link>
        </div>
        <Link href="/" className="mt-8 text-sm font-semibold text-[#14B8A6] hover:underline">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
