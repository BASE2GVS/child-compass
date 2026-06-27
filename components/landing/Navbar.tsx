"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "#hero", id: "hero" },
  { label: "Features", href: "#features", id: "features" },
  { label: "Pricing", href: "#pricing", id: "pricing" },
  { label: "Resources", href: "#resources", id: "resources" },
] as const;

const sectionIds = navLinks.map((link) => link.id);

export default function Navbar({ authSlot }: { authSlot?: ReactNode }) {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--cc-border-soft)]/80 bg-[var(--cc-bg)]/92 backdrop-blur-lg">
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-8 lg:py-5">
        <div className="flex items-center">
          <a href="#hero" className="block transition-opacity hover:opacity-80">
            <p className="font-display text-lg font-semibold tracking-tight text-[var(--cc-ink)]">Child Compass™</p>
            <p className="text-[11px] font-medium tracking-widest text-[var(--cc-ink-muted)] uppercase">Powered by VYRONSOFT</p>
          </a>
        </div>

        <ul className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active === link.id ? "text-[var(--cc-teal-deep)]" : "text-[var(--cc-ink)] hover:text-[var(--cc-teal-deep)]"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-end gap-3">
          {authSlot}
          <Link
            href="/register"
            className="cc-btn-alive rounded-full bg-[var(--cc-teal)] px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_20px_var(--cc-teal-glow)] transition-all hover:bg-[var(--cc-teal-deep)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            Start Free
          </Link>
        </div>
      </nav>
    </header>
  );
}
