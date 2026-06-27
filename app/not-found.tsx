import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-[#0F172A]">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
          That link may have moved. Let&apos;s get you back to Today.
        </p>
        <Link
          href="/today"
          className="mt-6 inline-block rounded-2xl bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0D9488]"
        >
          Back to Today
        </Link>
      </div>
    </main>
  );
}
