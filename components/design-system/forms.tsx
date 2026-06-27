import type { ReactNode } from "react";
import { ds } from "./tokens";
import { typeScale } from "./tokens/typography";
import { radius } from "./tokens/radius";

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  success,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-0">
      <label htmlFor={htmlFor} className={ds.label}>
        {label}
        {required && <span className="text-[var(--cc-coral)]"> *</span>}
      </label>
      {hint && !error && <p className={`mb-2 ${ds.hint}`}>{hint}</p>}
      {children}
      {error && (
        <p className={ds.fieldError} role="alert">
          {error}
        </p>
      )}
      {success && !error && (
        <p className="mt-1.5 text-sm font-medium text-[var(--cc-success)]" role="status">
          {success}
        </p>
      )}
    </div>
  );
}

export function FormSuccess({
  title,
  message,
  children,
}: {
  title: string;
  message?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${radius.hero} border border-[var(--cc-success)]/20 bg-[var(--cc-success-wash)] px-8 py-10 text-center`}
      role="status"
    >
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--cc-success)]/15 text-3xl"
        aria-hidden="true"
      >
        ✓
      </div>
      <h2 className={`mt-5 ${typeScale.heading}`}>{title}</h2>
      {message && <p className={`mt-2 ${typeScale.body}`}>{message}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
