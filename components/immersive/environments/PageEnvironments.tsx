/** Full-viewport illustrated environments — one unique atmosphere per route */

import type { ReactNode, ComponentType } from "react";

type EnvProps = { className?: string };

function EnvSvg({ className, children, label }: { className?: string; children: ReactNode; label: string }) {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      className={`h-full w-full ${className || ""}`}
      role="img"
      aria-hidden
      aria-label={label}
    >
      {children}
    </svg>
  );
}

/** Today — sunrise over mountains, parent & child on path */
export function TodayEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Sunrise walk">
      <defs>
        <linearGradient id="te-sky" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#FFE4C4" />
          <stop offset="35%" stopColor="#F5D4A8" />
          <stop offset="70%" stopColor="#D4EDE8" />
          <stop offset="100%" stopColor="#B8D4C8" />
        </linearGradient>
        <radialGradient id="te-sun" cx="0.82" cy="0.12" r="0.45">
          <stop offset="0%" stopColor="#FFD080" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#F5C878" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F5C878" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="te-mt-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9B8E0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#A8D5CC" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="te-mt-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FCEC4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5BB5A8" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#te-sky)" />
      <ellipse cx="1180" cy="100" rx="320" ry="280" fill="url(#te-sun)" />
      <ellipse cx="1180" cy="100" rx="480" ry="400" fill="#FFD080" opacity="0.12" />
      {/* Distant mountains */}
      <path d="M0 520 L200 380 L420 460 L620 340 L900 420 L1100 300 L1440 400 L1440 900 L0 900 Z" fill="url(#te-mt-far)" />
      <path d="M0 620 L280 500 L500 560 L720 440 L1000 520 L1240 420 L1440 480 L1440 900 L0 900 Z" fill="url(#te-mt-near)" />
      {/* Rolling hills foreground */}
      <path d="M0 680 Q360 600 720 650 T1440 620 L1440 900 L0 900 Z" fill="#5BB5A8" opacity="0.35" />
      <path d="M0 740 Q400 680 800 710 T1440 690 L1440 900 L0 900 Z" fill="#3D9B8F" opacity="0.28" />
      {/* Winding path */}
      <path d="M200 820 Q500 720 720 760 Q940 700 1100 740 Q1250 680 1320 700" stroke="#F5D9A8" strokeWidth="28" strokeLinecap="round" opacity="0.45" />
      <path d="M200 820 Q500 720 720 760 Q940 700 1100 740 Q1250 680 1320 700" stroke="#FFF8F0" strokeWidth="8" strokeDasharray="12 20" strokeLinecap="round" opacity="0.35" />
      {/* Parent & child silhouettes */}
      <circle cx="620" cy="700" r="22" fill="#3D9B8F" opacity="0.55" />
      <path d="M598 722 Q620 708 642 722 L642 770 Q620 758 598 770 Z" fill="#2D7A70" opacity="0.5" />
      <circle cx="665" cy="715" r="16" fill="#C9B8E0" opacity="0.6" />
      <path d="M652 730 Q665 720 678 730 L678 762 Q665 754 652 762 Z" fill="#B8A8D0" opacity="0.5" />
      {/* Botanical edges */}
      <path d="M0 900 Q30 750 20 600 Q10 450 40 300" stroke="#5BB5A8" strokeWidth="6" opacity="0.25" />
      <ellipse cx="55" cy="650" rx="45" ry="28" fill="#8FCEC4" opacity="0.3" transform="rotate(-35 55 650)" />
      <ellipse cx="30" cy="500" rx="38" ry="22" fill="#B8D4C8" opacity="0.28" transform="rotate(15 30 500)" />
      <ellipse cx="70" cy="380" rx="42" ry="25" fill="#A8D5CC" opacity="0.25" transform="rotate(-20 70 380)" />
      <path d="M1440 900 Q1410 720 1420 550 Q1430 380 1400 250" stroke="#C9B8E0" strokeWidth="5" opacity="0.2" />
      <ellipse cx="1380" cy="600" rx="40" ry="24" fill="#E8A598" opacity="0.22" transform="rotate(25 1380 600)" />
      <ellipse cx="1410" cy="420" rx="35" ry="20" fill="#C9B8E0" opacity="0.2" transform="rotate(-15 1410 420)" />
      {/* Clouds */}
      <ellipse cx="400" cy="180" rx="120" ry="35" fill="white" opacity="0.35" />
      <ellipse cx="460" cy="165" rx="80" ry="28" fill="white" opacity="0.3" />
      <ellipse cx="800" cy="220" rx="100" ry="30" fill="white" opacity="0.28" />
    </EnvSvg>
  );
}

/** Coach — warm living room, chair & tea by window */
export function CoachEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Warm living room">
      <defs>
        <linearGradient id="ce-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3EFFA" />
          <stop offset="50%" stopColor="#FDF6E8" />
          <stop offset="100%" stopColor="#E8F0ED" />
        </linearGradient>
        <radialGradient id="ce-window-light" cx="0.75" cy="0.25" r="0.5">
          <stop offset="0%" stopColor="#FFE8B0" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFE8B0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#ce-wall)" />
      <ellipse cx="1080" cy="220" rx="400" ry="350" fill="url(#ce-window-light)" />
      {/* Floor */}
      <path d="M0 680 L1440 680 L1440 900 L0 900 Z" fill="#E8DCC8" opacity="0.45" />
      <ellipse cx="720" cy="780" rx="600" ry="80" fill="#D4C4A8" opacity="0.25" />
      {/* Rug */}
      <ellipse cx="680" cy="760" rx="380" ry="90" fill="#C9B8E0" opacity="0.2" />
      {/* Window */}
      <rect x="900" y="80" width="380" height="420" rx="12" fill="#F5E6C8" opacity="0.5" stroke="#E8DCC8" strokeWidth="4" />
      <rect x="920" y="100" width="160" height="380" fill="#FFF8F0" opacity="0.3" />
      <rect x="1100" y="100" width="160" height="380" fill="#FFF8F0" opacity="0.25" />
      <circle cx="1090" cy="280" r="80" fill="#FFD080" opacity="0.35" />
      {/* Armchair */}
      <path d="M380 520 L380 720 Q380 780 440 780 L580 780 Q640 780 640 720 L640 520 Q640 460 510 460 Q380 460 380 520 Z" fill="#C9B8E0" opacity="0.5" />
      <path d="M420 520 L420 680 Q420 720 460 720 L560 720 Q600 720 600 680 L600 520" stroke="#9B8AB8" strokeWidth="3" opacity="0.3" />
      <rect x="480" y="490" width="60" height="40" rx="8" fill="#E8DCC8" opacity="0.55" />
      {/* Side table + tea */}
      <rect x="700" y="620" width="100" height="12" rx="4" fill="#E8C47A" opacity="0.55" />
      <rect x="735" y="560" width="10" height="62" fill="#D4C4A8" opacity="0.5" />
      <ellipse cx="750" cy="550" rx="28" ry="10" fill="#F5D9A8" opacity="0.65" />
      <path d="M770 550 L790 520" stroke="#8FCEC4" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Bookshelf */}
      <rect x="80" y="200" width="200" height="480" rx="8" fill="#E8DCC8" opacity="0.4" />
      <rect x="100" y="240" width="160" height="8" fill="#D4C4A8" opacity="0.5" />
      <rect x="100" y="360" width="160" height="8" fill="#D4C4A8" opacity="0.5" />
      <rect x="110" y="260" width="28" height="90" rx="3" fill="#A8D5CC" opacity="0.5" />
      <rect x="148" y="250" width="24" height="100" rx="3" fill="#C9B8E0" opacity="0.45" />
      <rect x="182" y="255" width="30" height="95" rx="3" fill="#E8C47A" opacity="0.5" />
      {/* Plants */}
      <path d="M1200 680 Q1180 580 1220 500 Q1240 420 1210 350" stroke="#5BB5A8" strokeWidth="5" opacity="0.35" />
      <ellipse cx="1220" cy="480" rx="35" ry="20" fill="#8FCEC4" opacity="0.35" transform="rotate(-25 1220 480)" />
      <ellipse cx="1195" cy="400" rx="30" ry="18" fill="#B8D4C8" opacity="0.3" transform="rotate(20 1195 400)" />
      <path d="M200 700 Q180 600 220 520" stroke="#A8D5CC" strokeWidth="4" opacity="0.3" />
      <ellipse cx="210" cy="560" rx="28" ry="16" fill="#8FCEC4" opacity="0.28" transform="rotate(-15 210 560)" />
    </EnvSvg>
  );
}

/** My Child — lush garden exploration */
export function ChildEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Beautiful garden">
      <defs>
        <linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDF6E8" />
          <stop offset="60%" stopColor="#E8F6F3" />
          <stop offset="100%" stopColor="#D4EDE8" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#ch-sky)" />
      <path d="M0 550 Q300 480 600 520 Q900 460 1200 500 Q1350 480 1440 510 L1440 900 L0 900 Z" fill="#B8D4C8" opacity="0.4" />
      <path d="M0 650 Q350 580 700 620 Q1050 560 1440 600 L1440 900 L0 900 Z" fill="#8FCEC4" opacity="0.35" />
      <path d="M0 750 Q400 700 800 730 Q1100 700 1440 740 L1440 900 L0 900 Z" fill="#5BB5A8" opacity="0.3" />
      {/* Garden path */}
      <ellipse cx="720" cy="780" rx="280" ry="60" fill="#E8DCC8" opacity="0.45" />
      <ellipse cx="720" cy="770" rx="200" ry="40" fill="#F5E6C8" opacity="0.35" />
      {/* Flowers scattered */}
      {[
        [200, 620], [350, 580], [500, 640], [900, 590], [1050, 630], [1200, 570], [1300, 650],
        [150, 500], [450, 480], [750, 520], [1100, 490],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={14 + (i % 3) * 4} fill={["#E8A598", "#C9B8E0", "#E8C47A", "#A8D5CC"][i % 4]} opacity="0.45" />
          <circle cx={cx} cy={cy} r={6 + (i % 2) * 2} fill="#F5D9A8" opacity="0.6" />
        </g>
      ))}
      {/* Child exploring */}
      <circle cx="780" cy="680" r="28" fill="#5BB5A8" opacity="0.5" />
      <path d="M755 708 Q780 690 805 708 L805 760 Q780 745 755 760 Z" fill="#3D9B8F" opacity="0.45" />
      <path d="M805 700 L850 670" stroke="#C9B8E0" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      {/* Trees / botanical frame */}
      <path d="M0 900 Q20 650 50 400 Q30 250 60 100" stroke="#5BB5A8" strokeWidth="8" opacity="0.2" />
      <ellipse cx="80" cy="350" rx="60" ry="35" fill="#8FCEC4" opacity="0.25" transform="rotate(-30 80 350)" />
      <ellipse cx="40" cy="550" rx="50" ry="30" fill="#B8D4C8" opacity="0.22" transform="rotate(20 40 550)" />
      <path d="M1440 900 Q1420 600 1380 350 Q1400 200 1360 80" stroke="#A8D5CC" strokeWidth="7" opacity="0.18" />
      <ellipse cx="1370" cy="400" rx="55" ry="32" fill="#C9B8E0" opacity="0.2" transform="rotate(25 1370 400)" />
      {/* Butterflies */}
      <ellipse cx="950" cy="480" rx="12" ry="6" fill="#C9B8E0" opacity="0.35" transform="rotate(30 950 480)" />
      <ellipse cx="400" cy="420" rx="10" ry="5" fill="#E8A598" opacity="0.3" transform="rotate(-20 400 420)" />
    </EnvSvg>
  );
}

/** Track — winding journey path through hills */
export function TrackEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Family journey path">
      <defs>
        <linearGradient id="tr-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDF6E8" />
          <stop offset="50%" stopColor="#F3EFFA" />
          <stop offset="100%" stopColor="#E8F6F3" />
        </linearGradient>
        <linearGradient id="tr-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E8C47A" />
          <stop offset="50%" stopColor="#F5D9A8" />
          <stop offset="100%" stopColor="#E8A598" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#tr-sky)" />
      <circle cx="1200" cy="120" r="90" fill="#F5D9A8" opacity="0.4" />
      <circle cx="1200" cy="120" r="140" fill="#F5D9A8" opacity="0.15" />
      <path d="M0 500 L300 400 L600 450 L900 350 L1200 400 L1440 380 L1440 900 L0 900 Z" fill="#B8D4C8" opacity="0.35" />
      <path d="M0 600 L250 520 L550 560 L850 480 L1150 530 L1440 500 L1440 900 L0 900 Z" fill="#8FCEC4" opacity="0.3" />
      <path d="M0 700 L300 640 L600 680 L900 620 L1200 660 L1440 640 L1440 900 L0 900 Z" fill="#5BB5A8" opacity="0.25" />
      {/* Winding path */}
      <path
        d="M80 750 Q300 650 500 700 Q700 600 900 660 Q1100 580 1300 620 Q1380 600 1400 580"
        stroke="url(#tr-path)"
        strokeWidth="32"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M80 750 Q300 650 500 700 Q700 600 900 660 Q1100 580 1300 620 Q1380 600 1400 580"
        stroke="#FFF8F0"
        strokeWidth="10"
        strokeDasharray="14 24"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {/* Milestone markers */}
      <circle cx="80" cy="750" r="16" fill="#E8C47A" opacity="0.7" />
      <circle cx="500" cy="700" r="12" fill="#C9B8E0" opacity="0.6" />
      <circle cx="900" cy="660" r="14" fill="#5BB5A8" opacity="0.55" />
      <circle cx="1300" cy="620" r="11" fill="#E8A598" opacity="0.5" />
      {/* Open journal on path */}
      <rect x="650" y="620" width="80" height="60" rx="6" fill="#FFFCF6" opacity="0.7" stroke="#E8C47A" strokeWidth="2" />
      <path d="M670 640 H710 M670 655 H700 M670 668 H705" stroke="#C9B8E0" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </EnvSvg>
  );
}

/** Documents — wooden bookshelf wall */
export function DocumentsEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Family bookshelf">
      <defs>
        <linearGradient id="doc-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDF6E8" />
          <stop offset="100%" stopColor="#F3EFFA" />
        </linearGradient>
        <radialGradient id="doc-lamp" cx="0.7" cy="0.2" r="0.35">
          <stop offset="0%" stopColor="#FFE8A0" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFE8A0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#doc-wall)" />
      <ellipse cx="1000" cy="180" rx="350" ry="300" fill="url(#doc-lamp)" />
      {/* Bookshelf structure */}
      <rect x="200" y="100" width="1040" height="700" rx="16" fill="#E8DCC8" opacity="0.5" stroke="#D4C4A8" strokeWidth="3" />
      {[220, 340, 480, 620].map((y) => (
        <rect key={y} x="220" y={y} width="1000" height="12" rx="4" fill="#D4C4A8" opacity="0.6" />
      ))}
      {/* Books — row 1 */}
      {[
        [240, 140, 50, 75, "#A8D5CC"],
        [300, 130, 45, 85, "#C9B8E0"],
        [355, 135, 55, 80, "#E8C47A"],
        [420, 125, 48, 90, "#5BB5A8"],
        [480, 138, 52, 77, "#E8A598"],
        [545, 132, 46, 83, "#B8D4C8"],
        [600, 128, 50, 87, "#C9B8E0"],
        [660, 140, 44, 75, "#A8D5CC"],
        [715, 130, 54, 85, "#E8C47A"],
        [780, 135, 48, 80, "#5BB5A8"],
        [840, 125, 50, 90, "#E8A598"],
        [900, 138, 46, 77, "#C9B8E0"],
        [960, 132, 52, 83, "#A8D5CC"],
        [1025, 140, 48, 75, "#E8C47A"],
        [1085, 128, 50, 87, "#5BB5A8"],
        [1145, 135, 44, 80, "#B8D4C8"],
      ].map(([x, y, w, h, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill={c as string} opacity="0.5" />
      ))}
      {/* Journal on middle shelf */}
      <rect x="580" y="380" width="90" height="90" rx="6" fill="#FFFCF6" opacity="0.85" stroke="#E8C47A" strokeWidth="3" />
      <path d="M605 410 H645 M605 430 H635 M605 448 H640" stroke="#C9B8E0" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Lamp */}
      <path d="M1100 200 L1120 200 L1110 260 L1105 260 Z" fill="#E8C47A" opacity="0.55" />
      <ellipse cx="1110" cy="268" rx="30" ry="10" fill="#D4C4A8" opacity="0.45" />
      <ellipse cx="1110" cy="200" rx="40" ry="40" fill="#FFD080" opacity="0.2" />
    </EnvSvg>
  );
}

/** Settings — cozy warm home */
export function SettingsEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Cozy home">
      <defs>
        <linearGradient id="se-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDF0E4" />
          <stop offset="100%" stopColor="#F3EFFA" />
        </linearGradient>
        <radialGradient id="se-glow" cx="0.5" cy="0.6" r="0.4">
          <stop offset="0%" stopColor="#FFE8B0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFE8B0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#se-sky)" />
      <ellipse cx="720" cy="550" rx="500" ry="350" fill="url(#se-glow)" />
      {/* House */}
      <rect x="480" y="380" width="480" height="320" rx="12" fill="#FFFCF6" opacity="0.7" stroke="#E8DCC8" strokeWidth="3" />
      <polygon points="480,380 720,260 960,380" fill="#E8C47A" opacity="0.45" />
      <rect x="660" y="500" width="80" height="120" rx="6" fill="#D4EDE8" opacity="0.55" />
      <rect x="540" y="440" width="70" height="55" rx="6" fill="#F5E6C8" opacity="0.5" />
      <rect x="830" y="440" width="70" height="55" rx="6" fill="#F5E6C8" opacity="0.5" />
      <circle cx="700" cy="560" r="12" fill="#F5D9A8" opacity="0.5" />
      {/* Garden */}
      <path d="M0 700 Q360 650 720 680 Q1080 640 1440 700 L1440 900 L0 900 Z" fill="#B8D4C8" opacity="0.35" />
      <ellipse cx="300" cy="750" rx="40" ry="24" fill="#8FCEC4" opacity="0.3" transform="rotate(-20 300 750)" />
      <ellipse cx="1100" cy="760" rx="45" ry="26" fill="#A8D5CC" opacity="0.28" transform="rotate(15 1100 760)" />
      {/* Chimney smoke */}
      <ellipse cx="820" cy="240" rx="20" ry="12" fill="#E8DCC8" opacity="0.25" />
      <ellipse cx="835" cy="210" rx="16" ry="10" fill="#E8DCC8" opacity="0.2" />
      <ellipse cx="848" cy="185" rx="12" ry="8" fill="#E8DCC8" opacity="0.15" />
    </EnvSvg>
  );
}

/** Health — nature & wellbeing */
export function HealthEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Nature and wellbeing">
      <defs>
        <linearGradient id="he-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F6F3" />
          <stop offset="100%" stopColor="#D4EDE8" />
        </linearGradient>
        <radialGradient id="he-sun" cx="0.3" cy="0.15" r="0.35">
          <stop offset="0%" stopColor="#FFE8A0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFE8A0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#he-sky)" />
      <ellipse cx="400" cy="130" rx="280" ry="240" fill="url(#he-sun)" />
      <path d="M0 500 Q400 420 800 480 Q1200 440 1440 470 L1440 900 L0 900 Z" fill="#8FCEC4" opacity="0.35" />
      <path d="M0 650 Q500 580 1000 630 Q1300 600 1440 620 L1440 900 L0 900 Z" fill="#5BB5A8" opacity="0.3" />
      {/* Trees */}
      <path d="M150 900 L150 400 Q130 350 150 300 Q170 250 150 200" stroke="#3D9B8F" strokeWidth="12" opacity="0.3" />
      <ellipse cx="150" cy="280" rx="80" ry="50" fill="#5BB5A8" opacity="0.35" />
      <ellipse cx="130" cy="220" rx="65" ry="40" fill="#8FCEC4" opacity="0.3" />
      <path d="M1280 900 L1280 350 Q1260 300 1280 250 Q1300 200 1280 150" stroke="#3D9B8F" strokeWidth="10" opacity="0.25" />
      <ellipse cx="1280" cy="230" rx="70" ry="45" fill="#5BB5A8" opacity="0.3" />
      {/* Floating leaves */}
      {[
        [300, 400], [500, 350], [700, 420], [900, 380], [1100, 400],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="20" ry="12" fill="#B8D4C8" opacity="0.35" transform={`rotate(${i * 30} ${x} ${y})`} />
      ))}
      {/* Heart of nature */}
      <path d="M720 500 C660 440 580 440 580 520 C580 600 720 700 720 700 C720 700 860 600 860 520 C860 440 780 440 720 500 Z" fill="#A8D5CC" opacity="0.35" />
    </EnvSvg>
  );
}

/** School — warm classroom */
export function SchoolEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Warm classroom">
      <defs>
        <linearGradient id="sc-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDF6E8" />
          <stop offset="100%" stopColor="#E8F4FD" />
        </linearGradient>
        <radialGradient id="sc-light" cx="0.8" cy="0.2" r="0.4">
          <stop offset="0%" stopColor="#FFF0C0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFF0C0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#sc-wall)" />
      <ellipse cx="1150" cy="180" rx="350" ry="300" fill="url(#sc-light)" />
      <path d="M0 650 L1440 650 L1440 900 L0 900 Z" fill="#E8DCC8" opacity="0.4" />
      {/* Blackboard */}
      <rect x="500" y="120" width="440" height="200" rx="8" fill="#5BB5A8" opacity="0.35" />
      <rect x="520" y="140" width="400" height="160" rx="4" fill="#3D9B8F" opacity="0.25" />
      {/* Desks */}
      {[280, 480, 680, 880, 1080].map((x) => (
        <g key={x}>
          <rect x={x} y="520" width="120" height="80" rx="6" fill="#E8DCC8" opacity="0.5" />
          <rect x={x + 20} y="480" width="80" height="50" rx="4" fill="#FDF6E8" opacity="0.6" />
        </g>
      ))}
      {/* Windows */}
      <rect x="100" y="100" width="200" height="280" rx="8" fill="#F5E6C8" opacity="0.45" stroke="#E8DCC8" strokeWidth="3" />
      <rect x="1140" y="100" width="200" height="280" rx="8" fill="#F5E6C8" opacity="0.45" stroke="#E8DCC8" strokeWidth="3" />
    </EnvSvg>
  );
}

/** Therapy — calm comfortable room */
export function TherapyEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Calming therapy room">
      <defs>
        <linearGradient id="th-room" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3EFFA" />
          <stop offset="100%" stopColor="#E8F6F3" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#th-room)" />
      <ellipse cx="720" cy="500" rx="500" ry="300" fill="#C9B8E0" opacity="0.12" />
      <path d="M0 620 L1440 620 L1440 900 L0 900 Z" fill="#E8DCC8" opacity="0.35" />
      {/* Two soft chairs facing */}
      <ellipse cx="500" cy="700" rx="120" ry="60" fill="#C9B8E0" opacity="0.35" />
      <ellipse cx="940" cy="700" rx="120" ry="60" fill="#A8D5CC" opacity="0.3" />
      {/* Soft light */}
      <circle cx="720" cy="200" r="60" fill="#F5D9A8" opacity="0.3" />
      <circle cx="720" cy="200" r="100" fill="#F5D9A8" opacity="0.12" />
      {/* Calm plants */}
      <path d="M100 700 Q90 550 120 400" stroke="#5BB5A8" strokeWidth="5" opacity="0.3" />
      <ellipse cx="115" cy="450" rx="40" ry="24" fill="#8FCEC4" opacity="0.3" transform="rotate(-20 115 450)" />
      <path d="M1340 700 Q1350 550 1320 400" stroke="#5BB5A8" strokeWidth="5" opacity="0.28" />
      <ellipse cx="1325" cy="450" rx="38" ry="22" fill="#B8D4C8" opacity="0.28" transform="rotate(20 1325 450)" />
    </EnvSvg>
  );
}

/** Help — reaching hands & compass */
export function HelpEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Helping hands">
      <defs>
        <linearGradient id="hp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDF6E8" />
          <stop offset="100%" stopColor="#F3EFFA" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#hp-sky)" />
      <circle cx="720" cy="380" r="120" fill="#E8F6F3" opacity="0.4" />
      <circle cx="720" cy="380" r="80" stroke="#5BB5A8" strokeWidth="6" opacity="0.35" fill="none" />
      <path d="M720 320 L720 440 M660 380 L780 380" stroke="#3D9B8F" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
      {/* Reaching hands */}
      <ellipse cx="480" cy="600" rx="70" ry="40" fill="#F5D4C8" opacity="0.4" transform="rotate(-25 480 600)" />
      <ellipse cx="960" cy="600" rx="70" ry="40" fill="#C9B8E0" opacity="0.35" transform="rotate(25 960 600)" />
      <path d="M520 580 Q720 500 920 580" stroke="#E8C47A" strokeWidth="4" fill="none" opacity="0.35" />
      {/* Stars */}
      {[[200, 200], [400, 150], [1000, 180], [1200, 250]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#E8C47A" opacity="0.5" />
      ))}
    </EnvSvg>
  );
}

/** Search — stars & compass */
export function SearchEnvironment({ className }: EnvProps) {
  return (
    <EnvSvg className={className} label="Compass among stars">
      <defs>
        <linearGradient id="sr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3EFFA" />
          <stop offset="60%" stopColor="#E8F6F3" />
          <stop offset="100%" stopColor="#FDF6E8" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#sr-sky)" />
      {Array.from({ length: 40 }, (_, i) => {
        const x = (i * 137 + 50) % 1400;
        const y = (i * 89 + 30) % 700;
        const r = 1.5 + (i % 3);
        return <circle key={i} cx={x} cy={y} r={r} fill={["#E8C47A", "#C9B8E0", "#A8D5CC", "#F5D9A8"][i % 4]} opacity={0.3 + (i % 5) * 0.08} />;
      })}
      <circle cx="720" cy="420" r="100" stroke="#5BB5A8" strokeWidth="8" opacity="0.3" fill="none" />
      <path d="M720 340 L720 500 M640 420 L800 420" stroke="#3D9B8F" strokeWidth="6" strokeLinecap="round" opacity="0.35" />
      <path d="M720 340 L740 400 L720 420 L700 400 Z" fill="#E8C47A" opacity="0.4" />
      <path d="M720 500 L740 440 L720 420 L700 440 Z" fill="#A8D5CC" opacity="0.35" />
      <path d="M640 420 L700 400 L720 420 L700 440 Z" fill="#C9B8E0" opacity="0.35" />
      <path d="M800 420 L740 440 L720 420 L740 400 Z" fill="#E8A598" opacity="0.3" />
    </EnvSvg>
  );
}

/** Default fallback — warm sunrise landscape */
export function DefaultEnvironment({ className }: EnvProps) {
  return <TodayEnvironment className={className} />;
}

export type EnvironmentComponent = ComponentType<EnvProps>;

export function getPageEnvironment(pathname: string): EnvironmentComponent {
  if (pathname.startsWith("/today") || pathname.startsWith("/check-in")) return TodayEnvironment;
  if (pathname.startsWith("/coach")) return CoachEnvironment;
  if (pathname.startsWith("/compass") || pathname.startsWith("/children")) return ChildEnvironment;
  if (pathname.startsWith("/track") || pathname.startsWith("/timeline")) return TrackEnvironment;
  if (pathname.startsWith("/documents") || pathname.startsWith("/reports")) return DocumentsEnvironment;
  if (pathname.startsWith("/school")) return SchoolEnvironment;
  if (pathname.startsWith("/therapy")) return TherapyEnvironment;
  if (pathname.startsWith("/health")) return HealthEnvironment;
  if (pathname.startsWith("/settings") || pathname.startsWith("/profile") || pathname.startsWith("/pilot-settings")) return SettingsEnvironment;
  if (pathname.startsWith("/help")) return HelpEnvironment;
  if (pathname.startsWith("/search")) return SearchEnvironment;
  if (pathname.startsWith("/goals") || pathname.startsWith("/habits") || pathname.startsWith("/schedules") || pathname.startsWith("/analytics")) return TrackEnvironment;
  if (pathname.startsWith("/resource-library") || pathname.startsWith("/resources")) return DocumentsEnvironment;
  return DefaultEnvironment;
}
