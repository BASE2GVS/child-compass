/** Completion — story added, warm glow */
export default function CheckInCompleteArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      className={`w-full max-w-xs ${className}`}
      role="img"
      aria-label="Today's story has been added"
    >
      <defs>
        <linearGradient id="ci-complete-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8F6F3" />
          <stop offset="50%" stopColor="#FDF6E8" />
          <stop offset="100%" stopColor="#F3EFFA" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" rx="28" fill="url(#ci-complete-bg)" />
      <circle cx="160" cy="90" r="36" fill="#F5D9A8" opacity="0.4" />
      <circle cx="160" cy="90" r="22" fill="#E8C47A" opacity="0.55" />
      <path
        d="M110 130 L150 110 L190 125 L230 105"
        stroke="#5BB5A8"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <rect x="95" y="145" width="130" height="70" rx="10" fill="#FFFCF8" stroke="#E8E4DC" strokeWidth="1.5" />
      <line x1="115" y1="165" x2="205" y2="165" stroke="#D4EDE8" strokeWidth="2" strokeLinecap="round" />
      <line x1="115" y1="180" x2="185" y2="180" stroke="#E8E4DC" strokeWidth="2" strokeLinecap="round" />
      <line x1="115" y1="195" x2="195" y2="195" stroke="#E8E4DC" strokeWidth="2" strokeLinecap="round" />
      <circle cx="248" cy="158" r="14" fill="#A8D5CC" opacity="0.5" />
      <path d="M242 158 L246 162 L254 152" stroke="#3D9B8F" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
