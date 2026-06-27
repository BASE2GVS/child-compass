import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ds } from "./tokens";
import { EmotionalButton, type ButtonVariant } from "./buttons";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <EmotionalButton variant={variant} className={className} {...props}>
      {children}
    </EmotionalButton>
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
    success: "border-[var(--cc-success)]/20 bg-[var(--cc-success-wash)] text-[var(--cc-ink)]",
    warning: "border-[var(--cc-warning)]/25 bg-[var(--cc-warning-wash)] text-[var(--cc-ink)]",
    info: "border-[var(--cc-teal)]/20 bg-[var(--cc-teal-wash)]/50 text-[var(--cc-ink)]",
  };
  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm leading-relaxed ${styles[variant]}`} role="status">
      {variant === "warning" && (
        <p className="mb-1 font-semibold text-[var(--cc-ink)]">That didn&apos;t quite work</p>
      )}
      {children}
      {variant === "warning" && (
        <p className="mt-2 text-xs text-[var(--cc-ink-faint)]">Your information is safe. Please try again when you&apos;re ready.</p>
      )}
    </div>
  );
}

export { StatusBadge } from "./status-chips";