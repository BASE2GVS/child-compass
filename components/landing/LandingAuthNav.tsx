import Link from "next/link";
import { getSessionUser } from "@/lib/data/queries";

export default async function LandingAuthNav() {
  const user = await getSessionUser();
  const isAuthenticated = Boolean(user);

  if (isAuthenticated) {
    return (
      <Link
        href="/today"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E8E4DC] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--cc-ink)] shadow-sm transition-all hover:border-[var(--cc-teal)]/40 hover:shadow-md"
      >
        <span aria-hidden>👤</span>
        My Companion
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E8E4DC] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--cc-ink)] shadow-sm transition-all hover:border-[var(--cc-teal)]/40 hover:shadow-md"
    >
      Log In
    </Link>
  );
}
