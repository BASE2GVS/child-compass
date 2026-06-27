type PaperTextareaProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  rows?: number;
  disabled?: boolean;
};

export default function PaperTextarea({
  id,
  value,
  onChange,
  placeholder,
  label,
  rows = 4,
  disabled = false,
}: PaperTextareaProps) {
  return (
    <div className="mt-8">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full resize-none rounded-[1.25rem] border border-[var(--cc-border)] bg-[var(--cc-paper)] px-5 py-4 text-base leading-relaxed text-[var(--cc-ink)] shadow-[inset_0_2px_8px_rgba(45,42,38,0.04)] placeholder:text-[var(--cc-ink-faint)] focus:border-[var(--cc-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cc-teal)]/25 disabled:opacity-60 sm:min-h-[8rem] sm:text-lg"
      />
    </div>
  );
}
