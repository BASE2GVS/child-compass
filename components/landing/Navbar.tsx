"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "#hero", id: "hero" },
  { label: "Features", href: "#features", id: "features" },
  { label: "Pricing", href: "#pricing", id: "pricing" },
  { label: "Resources", href: "#resources", id: "resources" },
] as const;

const sectionIds = navLinks.map((link) => link.id);

export default function Navbar() {
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
    <header className="sticky top-0 z-50 border-b border-slate-200/40 bg-[#FAF8F4]/90 backdrop-blur-md">
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-5 lg:px-8">
        <div className="flex items-center">
          <a href="#hero" className="block transition-opacity hover:opacity-80">
            <p className="text-lg font-bold tracking-tight text-[#0F172A]">
              Child Compass™
            </p>
            <p className="text-[11px] font-medium tracking-widest text-slate-500 uppercase">
              Powered by VYRONSOFT
            </p>
          </a>
        </div>

        <ul className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active === link.id
                    ? "text-[#14B8A6]"
                    : "text-[#0F172A] hover:text-[#14B8A6]"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-end">
          <Link
            href="/register"
            className="rounded-2xl bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0D9488] hover:shadow-md"
          >
            Start Free
          </Link>
        </div>
      </nav>
    </header>
  );
}
