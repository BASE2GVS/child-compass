import type { ReactNode } from "react";
import { ds } from "./tokens";

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-0">
      <label htmlFor={htmlFor} className={ds.label}>
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {hint && <p className="mb-2 text-xs leading-relaxed text-[#94A3B8]">{hint}</p>}
      {children}
      {error && (
        <p className={ds.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
