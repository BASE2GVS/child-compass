"use client";

import { Input } from "@/components/design-system";

type TimelineSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function TimelineSearch({ value, onChange }: TimelineSearchProps) {
  return (
    <div>
      <label htmlFor="timeline-search" className="sr-only">
        Search your family timeline
      </label>
      <Input
        id="timeline-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search — sleep, medication, birthday, teacher…"
        className="w-full"
      />
    </div>
  );
}
