/** Family journal bookshelf — warm lamplight */

export default function LibraryHeroArt({ className = "" }: { className?: string }) {

  return (

    <svg

      viewBox="0 0 380 280"

      fill="none"

      className={`w-full max-w-md ${className}`}

      role="img"

      aria-label="A beautiful family bookshelf and journal"

    >

      <defs>

        <linearGradient id="lib-bg" x1="0" y1="0" x2="1" y2="1">

          <stop offset="0%" stopColor="#FDF6E8" />

          <stop offset="50%" stopColor="#F3EFFA" />

          <stop offset="100%" stopColor="#E8F6F3" />

        </linearGradient>

        <radialGradient id="lib-lamp" cx="0.5" cy="0.5" r="0.5">

          <stop offset="0%" stopColor="#F5D9A8" stopOpacity="0.6" />

          <stop offset="100%" stopColor="#F5D9A8" stopOpacity="0" />

        </radialGradient>

      </defs>

      <rect width="380" height="280" rx="28" fill="url(#lib-bg)" />

      <circle cx="300" cy="90" r="55" fill="url(#lib-lamp)" />

      <rect x="50" y="60" width="280" height="8" rx="3" fill="#E8DCC8" opacity="0.6" />

      <rect x="50" y="130" width="280" height="10" rx="4" fill="#E8DCC8" opacity="0.7" />

      <rect x="50" y="200" width="280" height="12" rx="4" fill="#E8DCC8" opacity="0.75" />

      {/* Books row 1 */}

      <rect x="70" y="75" width="32" height="52" rx="3" fill="#A8D5CC" opacity="0.55" />

      <rect x="110" y="68" width="28" height="59" rx="3" fill="#C9B8E0" opacity="0.5" />

      <rect x="148" y="72" width="36" height="55" rx="3" fill="#E8C47A" opacity="0.55" />

      <rect x="192" y="65" width="30" height="62" rx="3" fill="#5BB5A8" opacity="0.45" />

      <rect x="230" y="70" width="34" height="57" rx="3" fill="#E8A598" opacity="0.42" />

      {/* Journal on lower shelf */}

      <rect x="140" y="148" width="48" height="48" rx="4" fill="#FFFCF6" stroke="#E8C47A" strokeWidth="2" opacity="0.9" />

      <path d="M152 162 H176 M152 172 H170 M152 182 H174" stroke="#C9B8E0" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      <rect x="200" y="152" width="28" height="44" rx="3" fill="#B8D4C8" opacity="0.45" />

      <path d="M290 95 L305 95 L300 115 L295 115 Z" fill="#E8C47A" opacity="0.5" />

      <ellipse cx="297" cy="118" rx="12" ry="4" fill="#D4C4A8" opacity="0.4" />

    </svg>

  );

}


