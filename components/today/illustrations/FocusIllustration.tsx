/** Large bleeding path illustration — no boxed frame */
export default function FocusIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      fill="none"
      className={`h-full w-full ${className}`}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="focus-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E8C47A" />
          <stop offset="50%" stopColor="#5BB5A8" />
          <stop offset="100%" stopColor="#C9B8E0" />
        </linearGradient>
        <radialGradient id="focus-bloom" cx="0.75" cy="0.2" r="0.5">
          <stop offset="0%" stopColor="#F5D9A8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F5D9A8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="360" cy="70" rx="140" ry="120" fill="url(#focus-bloom)" />
      <path d="M0 280 Q120 220 240 250 T480 230 L480 360 L0 360 Z" fill="#B8D4C8" opacity="0.22" />
      <path
        d="M40 260 Q140 180 240 220 Q340 160 440 180"
        stroke="url(#focus-path)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      <circle cx="40" cy="260" r="14" fill="#E8C47A" opacity="0.7" />
      <circle cx="240" cy="215" r="10" fill="#5BB5A8" opacity="0.6" />
      <circle cx="440" cy="180" r="12" fill="#C9B8E0" opacity="0.55" />
      <path d="M60 100 Q80 75 100 95" stroke="#8FCEC4" strokeWidth="2.5" fill="none" opacity="0.4" />
      <ellipse cx="320" cy="130" rx="36" ry="20" fill="#A8D5CC" opacity="0.25" transform="rotate(-12 320 130)" />
      <ellipse cx="100" cy="85" rx="44" ry="24" fill="#F5E6C8" opacity="0.3" />
    </svg>
  );
}
