import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ds } from "./tokens";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base =
    variant === "primary"
      ? ds.btnPrimary
      : variant === "secondary"
        ? ds.btnSecondary
        : "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#FAF8F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/30";
  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${ds.input} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${ds.input} resize-none ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${ds.input} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Label({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={ds.label}>
      {children}
    </label>
  );
}

export function Banner({
  variant,
  children,
}: {
  variant: "success" | "warning" | "info";
  children: ReactNode;
}) {
  const styles = {
    success: "border-emerald-200/80 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200/80 bg-amber-50 text-amber-900",
    info: "border-[#14B8A6]/20 bg-[#14B8A6]/5 text-[#0F172A]",
  };
  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm leading-relaxed ${styles[variant]}`} role="status">
      {children}
    </div>
  );
}

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "warning" | "danger" | "brand" | "neutral";
}) {
  const tones = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-700",
    brand: "bg-[#14B8A6]/10 text-[#0D9488]",
    neutral: "bg-[#FAF8F4] text-[#64748B]",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {label}
    </span>
  );
}
