/** Parent and child walking into sunrise — Today hero */

export default function MorningHeroArt({ className = "" }: { className?: string }) {

  return (

    <svg

      viewBox="0 0 400 320"

      fill="none"

      className={`w-full max-w-md ${className}`}

      role="img"

      aria-label="Parent and child walking into a warm sunrise"

    >

      <defs>

        <linearGradient id="today-sky" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stopColor="#FDF0E0" />

          <stop offset="40%" stopColor="#F5E6C8" />

          <stop offset="100%" stopColor="#D4EDE8" stopOpacity="0.5" />

        </linearGradient>

        <linearGradient id="today-sun" x1="0" y1="0" x2="1" y2="1">

          <stop offset="0%" stopColor="#FFD9A0" />

          <stop offset="100%" stopColor="#E8C47A" />

        </linearGradient>

        <linearGradient id="today-path" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stopColor="#E8C47A" stopOpacity="0.3" />

          <stop offset="100%" stopColor="#F5D9A8" stopOpacity="0.5" />

        </linearGradient>

      </defs>

      <rect width="400" height="320" rx="32" fill="url(#today-sky)" />

      <circle cx="310" cy="72" r="58" fill="url(#today-sun)" opacity="0.85" />

      <circle cx="310" cy="72" r="78" fill="#F5D9A8" opacity="0.22" />

      <circle cx="310" cy="72" r="95" fill="#F5D9A8" opacity="0.1" />

      <path d="M0 230 Q100 190 200 210 T400 200 L400 320 L0 320 Z" fill="#B8D4C8" opacity="0.35" />

      <path d="M0 255 Q120 220 240 240 T400 230 L400 320 L0 320 Z" fill="#5BB5A8" opacity="0.32" />

      <path d="M80 250 Q200 200 320 230" stroke="url(#today-path)" strokeWidth="14" strokeLinecap="round" opacity="0.6" />

      {/* Parent */}

      <circle cx="165" cy="198" r="14" fill="#5BB5A8" opacity="0.5" />

      <path d="M152 212 Q165 204 178 212 L178 238 Q165 232 152 238 Z" fill="#3D9B8F" opacity="0.45" />

      {/* Child */}

      <circle cx="195" cy="208" r="10" fill="#C9B8E0" opacity="0.55" />

      <path d="M187 218 Q195 212 203 218 L203 234 Q195 230 187 234 Z" fill="#C9B8E0" opacity="0.45" />

      {/* Walking motion dots */}

      <circle cx="220" cy="242" r="3" fill="#E8C47A" opacity="0.5" />

      <circle cx="235" cy="238" r="2.5" fill="#E8A598" opacity="0.4" />

      <path d="M50 110 Q65 90 80 108" stroke="#8FCEC4" strokeWidth="2" fill="none" opacity="0.5" />

      <ellipse cx="55" cy="105" rx="10" ry="6" fill="#A8D5CC" opacity="0.35" transform="rotate(-25 55 105)" />

      <path d="M350 140 Q365 120 378 135" stroke="#C9B8E0" strokeWidth="2" fill="none" opacity="0.4" />

    </svg>

  );

}


