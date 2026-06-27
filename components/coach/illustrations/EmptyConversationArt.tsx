/** Gentle empty-state — open journal, warm light */
export default function EmptyConversationArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 200"
      fill="none"
      className={`w-full max-w-xs ${className}`}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="empty-warm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDF6E8" />
          <stop offset="100%" stopColor="#E8F6F3" />
        </linearGradient>
      </defs>
      <rect width="280" height="200" rx="24" fill="url(#empty-warm)" />
      <circle cx="200" cy="55" r="28" fill="#F5D9A8" opacity="0.35" />
      {/* Open journal */}
      <rect x="70" y="75" width="140" height="90" rx="8" fill="#FFFCF8" stroke="#E8E4DC" strokeWidth="1.5" />
      <line x1="140" y1="75" x2="140" y2="165" stroke="#E8E4DC" strokeWidth="1" />
      <line x1="85" y1="100" x2="125" y2="100" stroke="#D4EDE8" strokeWidth="2" strokeLinecap="round" />
      <line x1="85" y1="115" x2="120" y2="115" stroke="#E8E4DC" strokeWidth="2" strokeLinecap="round" />
      <line x1="85" y1="130" x2="115" y2="130" stroke="#E8E4DC" strokeWidth="2" strokeLinecap="round" />
      <line x1="155" y1="100" x2="195" y2="100" stroke="#D4EDE8" strokeWidth="2" strokeLinecap="round" />
      <line x1="155" y1="115" x2="190" y2="115" stroke="#E8E4DC" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M155 140 Q175 125 195 140"
        stroke="#A8D5CC"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
