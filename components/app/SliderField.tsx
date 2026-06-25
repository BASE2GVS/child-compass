"use client";

type SliderFieldProps = {
  label: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
};

export default function SliderField({
  label,
  name,
  value,
  onChange,
  lowLabel = "Low",
  highLabel = "High",
}: SliderFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-semibold text-[#0F172A]">
          {label}
        </label>
        <span className="rounded-full bg-[#14B8A6]/10 px-2.5 py-0.5 text-xs font-bold text-[#14B8A6]">
          {value}/5
        </span>
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#14B8A6]"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
