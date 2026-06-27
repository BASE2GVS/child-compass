/** Morning check-in — soft sunrise, gentle path */
export default function CheckInHeroArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 280"
      fill="none"
      className={`w-full max-w-sm ${className}`}
      role="img"
      aria-label="A calm morning moment together"
    >
      <defs>
        <linearGradient id="ci-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDF6E8" />
          <stop offset="60%" stopColor="#E8F6F3" />
          <stop offset="100%" stopColor="#D4EDE8" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="ci-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5D9A8" />
          <stop offset="100%" stopColor="#E8C47A" />
        </linearGradient>
      </defs>
      <rect width="360" height="280" rx="28" fill="url(#ci-sky)" />
      <circle cx="270" cy="72" r="40" fill="url(#ci-sun)" opacity="0.85" />
      <circle cx="270" cy="72" r="54" fill="#F5D9A8" opacity="0.2" />
      <path
        d="M0 200 Q90 165 180 185 T360 175 L360 280 L0 280 Z"
        fill="#A8D5CC"
        opacity="0.35"
      />
      <path
        d="M0 225 Q100 195 200 215 T360 205 L360 280 L0 280 Z"
        fill="#5BB5A8"
        opacity="0.3"
      />
      <path
        d="M120 195 Q180 150 240 195"
        stroke="#E8C47A"
        strokeWidth="2.5"
        strokeDasharray="6 8"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="120" cy="195" r="6" fill="#E8C47A" opacity="0.7" />
      <circle cx="240" cy="195" r="6" fill="#3D9B8F" opacity="0.5" />
    </svg>
  );
}
