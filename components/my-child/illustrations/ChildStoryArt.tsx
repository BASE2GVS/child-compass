/** Child exploring a warm garden */

export default function ChildStoryArt({ className = "" }: { className?: string }) {

  return (

    <svg

      viewBox="0 0 360 300"

      fill="none"

      className={`w-full max-w-sm ${className}`}

      role="img"

      aria-label="Child exploring a beautiful garden"

    >

      <defs>

        <linearGradient id="garden-sky" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stopColor="#FDF6E8" />

          <stop offset="100%" stopColor="#E8F6F3" />

        </linearGradient>

      </defs>

      <rect width="360" height="300" rx="28" fill="url(#garden-sky)" />

      <path d="M0 220 Q90 190 180 210 T360 200 L360 300 L0 300 Z" fill="#B8D4C8" opacity="0.35" />

      <path d="M0 245 Q100 215 200 235 T360 225 L360 300 L0 300 Z" fill="#A8D5CC" opacity="0.3" />

      {/* Garden path */}

      <ellipse cx="180" cy="250" rx="70" ry="18" fill="#E8DCC8" opacity="0.45" />

      {/* Flowers */}

      <circle cx="80" cy="210" r="8" fill="#E8A598" opacity="0.5" />

      <circle cx="80" cy="210" r="4" fill="#F5D9A8" opacity="0.7" />

      <circle cx="280" cy="200" r="7" fill="#C9B8E0" opacity="0.5" />

      <circle cx="280" cy="200" r="3.5" fill="#F0D9A8" opacity="0.7" />

      <circle cx="120" cy="175" r="6" fill="#E8C47A" opacity="0.55" />

      <circle cx="250" cy="165" r="5" fill="#A8D5CC" opacity="0.5" />

      {/* Child exploring */}

      <circle cx="195" cy="195" r="16" fill="#5BB5A8" opacity="0.45" />

      <path d="M182 210 Q195 200 208 210 L208 232 Q195 225 182 232 Z" fill="#3D9B8F" opacity="0.4" />

      <path d="M208 215 L225 205" stroke="#C9B8E0" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />

      {/* Butterflies / wonder */}

      <ellipse cx="240" cy="175" rx="6" ry="3" fill="#C9B8E0" opacity="0.4" transform="rotate(30 240 175)" />

      <path d="M60 130 Q75 115 90 128" stroke="#8FCEC4" strokeWidth="2" fill="none" opacity="0.4" />

      <ellipse cx="300" cy="120" rx="14" ry="8" fill="#A8D5CC" opacity="0.3" transform="rotate(-15 300 120)" />

    </svg>

  );

}


