/** Evening / quiet reflection — soft moon and home glow */
export default function QuietReflectionArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 120"
      fill="none"
      className={`w-full max-w-sm opacity-80 ${className}`}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="quiet-sky" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F3EFFA" />
          <stop offset="100%" stopColor="#E8F6F3" />
        </linearGradient>
      </defs>
      <rect width="320" height="120" rx="20" fill="url(#quiet-sky)" />
      <circle cx="260" cy="40" r="22" fill="#E8E0F0" />
      <circle cx="252" cy="36" r="20" fill="#F3EFFA" />
      <path d="M80 90 L120 55 L160 75 L200 50 L240 80" stroke="#C9B8E0" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <rect x="100" y="68" width="48" height="32" rx="6" fill="#FFFEFC" stroke="#E8D4C8" strokeWidth="1.5" />
      <path d="M112 68 L124 55 L136 68" fill="#FBEFEC" stroke="#E8A598" strokeWidth="1" />
      <rect x="118" y="82" width="12" height="18" rx="2" fill="#E8C47A" opacity="0.4" />
    </svg>
  );
}
