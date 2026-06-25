import Link from "next/link";

const HELP_LINKS = [
  { href: "/help", label: "Help Centre" },
  { href: "/help/faq", label: "FAQ" },
  { href: "/help/contact", label: "Contact Support" },
  { href: "/help/report", label: "Report a Problem" },
  { href: "/help/suggest", label: "Suggest a Feature" },
  { href: "/help/status", label: "System Status" },
  { href: "/help/privacy", label: "Privacy Centre" },
  { href: "/help/terms", label: "Terms of Service" },
];

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <header className="border-b border-[#E8E4DC] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-bold text-[#0F172A]">
            Child Compass™
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#14B8A6] hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1" aria-label="Help navigation">
          {HELP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-[#64748B] hover:bg-white hover:text-[#0F172A]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <main className="rounded-3xl border border-[#E8E4DC] bg-white p-8 shadow-sm">{children}</main>
      </div>
    </div>
  );
}
