export { Icon, type IconName } from "@/components/design-system/icons";

/** Standard nav icon — one family, one stroke, one size */
export function NavIcon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg
      className={`cc-fw-icon ${className}`.trim()}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}
