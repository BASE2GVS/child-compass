/** Winding family journey path through hills */

export default function TrackHeroArt({ className = "" }: { className?: string }) {

  return (

    <svg

      viewBox="0 0 380 280"

      fill="none"

      className={`w-full max-w-md ${className}`}

      role="img"

      aria-label="A beautiful winding journey path"

    >

      <defs>

        <linearGradient id="track-sky" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stopColor="#FDF6E8" />

          <stop offset="50%" stopColor="#F3EFFA" />

          <stop offset="100%" stopColor="#E8F6F3" />

        </linearGradient>

        <linearGradient id="track-path" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stopColor="#E8C47A" />

          <stop offset="50%" stopColor="#F5D9A8" />

          <stop offset="100%" stopColor="#E8A598" stopOpacity="0.8" />

        </linearGradient>

      </defs>

      <rect width="380" height="280" rx="28" fill="url(#track-sky)" />

      <circle cx="300" cy="55" r="42" fill="#F5D9A8" opacity="0.45" />

      <circle cx="300" cy="55" r="58" fill="#F5D9A8" opacity="0.15" />

      <path d="M0 200 Q95 165 190 185 T380 170 L380 280 L0 280 Z" fill="#B8D4C8" opacity="0.32" />

      <path d="M0 225 Q110 195 220 215 T380 205 L380 280 L0 280 Z" fill="#5BB5A8" opacity="0.25" />

      <path

        d="M40 210 Q100 175 160 195 Q220 155 280 175 Q330 165 360 155"

        stroke="url(#track-path)"

        strokeWidth="10"

        strokeLinecap="round"

        fill="none"

        opacity="0.55"

      />

      <path

        d="M40 210 Q100 175 160 195 Q220 155 280 175 Q330 165 360 155"

        stroke="#FFF8F0"

        strokeWidth="3"

        strokeDasharray="6 12"

        strokeLinecap="round"

        fill="none"

        opacity="0.4"

      />

      <circle cx="40" cy="210" r="8" fill="#E8C47A" opacity="0.75" />

      <circle cx="160" cy="192" r="6" fill="#C9B8E0" opacity="0.6" />

      <circle cx="280" cy="172" r="7" fill="#5BB5A8" opacity="0.55" />

      <circle cx="360" cy="155" r="5" fill="#E8A598" opacity="0.5" />

      <path d="M50 100 Q65 85 80 98" stroke="#8FCEC4" strokeWidth="2" fill="none" opacity="0.4" />

      <ellipse cx="320" cy="110" rx="16" ry="9" fill="#A8D5CC" opacity="0.3" transform="rotate(-20 320 110)" />

    </svg>

  );

}


