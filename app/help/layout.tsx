import Link from "next/link";
import LandingAuthNav from "@/components/landing/LandingAuthNav";

const HELP_LINKS = [
  { href: "/help/faq", label: "FAQ" },
  { href: "/help/contact", label: "Contact" },
  { href: "/help/privacy", label: "Privacy" },
  { href: "/help/terms", label: "Terms" },
];

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--cc-bg)]">
      <header className="sticky top-0 z-50 border-b border-[var(--cc-border-soft)]/60 bg-[var(--cc-bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-lg font-semibold text-[var(--cc-ink)]">
            Child Compass
          </Link>
          <LandingAuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Help navigation">
          {HELP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-[var(--cc-border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--cc-ink-muted)] hover:text-[var(--cc-teal-deep)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
