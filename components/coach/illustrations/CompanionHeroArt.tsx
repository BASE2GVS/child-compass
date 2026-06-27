/** Calm room — comfortable chair, tea, warm listening space */

export default function CompanionHeroArt({ className = "" }: { className?: string }) {

  return (

    <svg

      viewBox="0 0 400 320"

      fill="none"

      className={`w-full max-w-md ${className}`}

      role="img"

      aria-label="A calm room with a comfortable chair and tea"

    >

      <defs>

        <linearGradient id="coach-wall" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stopColor="#F3EFFA" />

          <stop offset="60%" stopColor="#FDF6E8" />

          <stop offset="100%" stopColor="#E8F6F3" />

        </linearGradient>

        <linearGradient id="coach-rug" x1="0" y1="0" x2="1" y2="1">

          <stop offset="0%" stopColor="#E8DCC8" stopOpacity="0.5" />

          <stop offset="100%" stopColor="#D4EDE8" stopOpacity="0.4" />

        </linearGradient>

      </defs>

      <rect width="400" height="320" rx="32" fill="url(#coach-wall)" />

      <rect x="40" y="40" width="320" height="180" rx="8" fill="#FFFCF8" opacity="0.5" />

      <ellipse cx="200" cy="265" rx="150" ry="35" fill="url(#coach-rug)" />

      {/* Armchair */}

      <path d="M120 200 L120 250 Q120 270 145 270 L195 270 Q220 270 220 250 L220 200 Q220 175 170 175 Q120 175 120 200 Z" fill="#C9B8E0" opacity="0.45" />

      <path d="M130 200 L130 240 Q130 255 150 255 L190 255 Q210 255 210 240 L210 200" stroke="#9B8AB8" strokeWidth="2" opacity="0.3" />

      <rect x="155" y="185" width="30" height="20" rx="6" fill="#E8DCC8" opacity="0.6" />

      {/* Side table + tea */}

      <rect x="250" y="220" width="50" height="8" rx="3" fill="#E8C47A" opacity="0.5" />

      <rect x="258" y="200" width="6" height="22" fill="#D4C4A8" opacity="0.5" />

      <ellipse cx="272" cy="196" rx="14" ry="5" fill="#F5D9A8" opacity="0.6" />

      <path d="M278 196 L285 188" stroke="#8FCEC4" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      <path d="M268 194 Q272 188 276 194" stroke="#E8A598" strokeWidth="1.5" fill="none" opacity="0.4" />

      {/* Window light */}

      <rect x="280" y="55" width="70" height="90" rx="6" fill="#F5E6C8" opacity="0.35" />

      <circle cx="315" cy="100" r="28" fill="#F5D9A8" opacity="0.25" />

      <path d="M40 250 Q80 230 120 245" stroke="#A8D5CC" strokeWidth="2" fill="none" opacity="0.35" />

      <ellipse cx="45" cy="245" rx="12" ry="7" fill="#8FCEC4" opacity="0.3" transform="rotate(-20 45 245)" />

    </svg>

  );

}


