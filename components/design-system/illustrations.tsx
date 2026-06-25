import type { SVGProps } from "react";

export type IllustrationName =
  | "child"
  | "goals"
  | "timeline"
  | "documents"
  | "therapy"
  | "school"
  | "reports"
  | "family"
  | "compass"
  | "habits";

type IllustrationProps = SVGProps<SVGSVGElement> & { name: IllustrationName };

/** Editorial, calm SVG illustrations — abstract, inclusive, not cartoon */
export function EditorialIllustration({ name, className = "", ...props }: IllustrationProps) {
  const base = `w-full max-w-[200px] ${className}`;

  const palettes: Record<IllustrationName, { a: string; b: string; c: string }> = {
    child: { a: "#14B8A6", b: "#E0F2F1", c: "#6366F1" },
    goals: { a: "#14B8A6", b: "#FEF3C7", c: "#0F172A" },
    timeline: { a: "#6366F1", b: "#E0E7FF", c: "#14B8A6" },
    documents: { a: "#0F172A", b: "#F1EDE6", c: "#14B8A6" },
    therapy: { a: "#8B5CF6", b: "#EDE9FE", c: "#14B8A6" },
    school: { a: "#F59E0B", b: "#FEF3C7", c: "#14B8A6" },
    reports: { a: "#0F172A", b: "#14B8A6", c: "#E0F2F1" },
    family: { a: "#14B8A6", b: "#FAF8F4", c: "#64748B" },
    compass: { a: "#14B8A6", b: "#0F172A", c: "#E0F2F1" },
    habits: { a: "#10B981", b: "#D1FAE5", c: "#14B8A6" },
  };

  const p = palettes[name];

  return (
    <svg viewBox="0 0 200 160" fill="none" className={base} role="img" aria-hidden="true" {...props}>
      <rect width="200" height="160" rx="28" fill={p.b} fillOpacity="0.5" />
      <circle cx="100" cy="72" r="48" fill={p.a} fillOpacity="0.12" />
      <circle cx="100" cy="72" r="32" fill={p.a} fillOpacity="0.2" />
      {name === "timeline" && (
        <path d="M60 100h80M70 88v24M100 80v32M130 92v20" stroke={p.c} strokeWidth="3" strokeLinecap="round" />
      )}
      {name === "documents" && (
        <>
          <rect x="72" y="48" width="56" height="72" rx="8" fill="white" stroke={p.a} strokeWidth="2" />
          <path d="M82 68h36M82 80h28M82 92h32" stroke={p.c} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {name === "goals" && (
        <path d="M100 44 L118 76 L154 80 L126 104 L134 140 L100 120 L66 140 L74 104 L46 80 L82 76 Z" fill={p.a} fillOpacity="0.25" stroke={p.a} strokeWidth="2" />
      )}
      {name === "child" && (
        <>
          <circle cx="100" cy="64" r="20" fill={p.c} fillOpacity="0.3" />
          <path d="M68 118c8-20 56-20 64 0" stroke={p.a} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {name === "school" && (
        <path d="M60 108 L100 48 L140 108 Z" fill={p.a} fillOpacity="0.2" stroke={p.a} strokeWidth="2" />
      )}
      {name === "reports" && (
        <rect x="64" y="52" width="72" height="88" rx="6" fill="white" stroke={p.b} strokeWidth="3" />
      )}
      {name === "therapy" && (
        <path d="M70 100 Q100 60 130 100" stroke={p.a} strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
      {name === "family" && (
        <>
          <circle cx="80" cy="72" r="14" fill={p.a} fillOpacity="0.35" />
          <circle cx="120" cy="72" r="14" fill={p.c} fillOpacity="0.35" />
          <circle cx="100" cy="56" r="12" fill={p.a} fillOpacity="0.5" />
        </>
      )}
      {name === "compass" && (
        <>
          <circle cx="100" cy="80" r="36" stroke={p.b} strokeWidth="3" />
          <path d="M100 56 L108 88 L100 80 L92 88 Z" fill={p.a} />
        </>
      )}
      {name === "habits" && (
        <path d="M72 100c0-16 56-16 56 0" stroke={p.a} strokeWidth="3" strokeLinecap="round" />
      )}
      <circle cx="100" cy="72" r="8" fill={p.a} fillOpacity="0.6" />
    </svg>
  );
}
