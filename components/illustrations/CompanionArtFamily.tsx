import type { ReactNode } from "react";
import { palette } from "@/components/design-system/tokens/colors";

/** Shared SVG canvas — one illustration family across Child Compass 3.0 */
function ArtCanvas({
  className = "",
  label,
  gradientStops,
  showFrame = true,
  children,
}: {
  className?: string;
  label: string;
  gradientStops: [string, string, string];
  showFrame?: boolean;
  children: ReactNode;
}) {
  const gradId = `cc-art-${label.replace(/\s/g, "-").toLowerCase()}`;
  return (
    <svg
      viewBox="0 0 380 280"
      fill="none"
      className={`w-full max-w-md ${className}`}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={gradientStops[0]} />
          <stop offset="55%" stopColor={gradientStops[1]} />
          <stop offset="100%" stopColor={gradientStops[2]} />
        </linearGradient>
      </defs>
      {showFrame ? <rect width="380" height="280" rx="28" fill={`url(#${gradId})`} /> : null}
      {children}
    </svg>
  );
}

const warm = [palette.cream[100], "#FFFCF8", palette.teal.wash] as [string, string, string];
const calm = ["#F3EFFA", "#FFFCF8", palette.mint.wash] as [string, string, string];

export function MorningArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="Good morning" gradientStops={warm}>
      <circle cx="280" cy="70" r="42" fill={palette.amber.soft} opacity="0.55" />
      <circle cx="280" cy="70" r="28" fill={palette.amber.DEFAULT} opacity="0.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1={280}
          y1={70}
          x2={280 + Math.cos((deg * Math.PI) / 180) * 52}
          y2={70 + Math.sin((deg * Math.PI) / 180) * 52}
          stroke={palette.amber.DEFAULT}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.25"
        />
      ))}
      <ellipse cx="140" cy="210" rx="90" ry="24" fill={palette.teal.DEFAULT} opacity="0.12" />
      <path d="M90 200 Q140 160 190 200 T290 200" stroke={palette.mint.DEFAULT} strokeWidth="4" fill="none" opacity="0.35" />
    </ArtCanvas>
  );
}

export function FamilyArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="Your family" gradientStops={warm}>
      <circle cx="130" cy="110" r="22" fill={palette.teal.DEFAULT} opacity="0.4" />
      <circle cx="190" cy="95" r="26" fill={palette.lavender.DEFAULT} opacity="0.35" />
      <circle cx="250" cy="110" r="22" fill={palette.coral.soft} opacity="0.45" />
      <ellipse cx="130" cy="155" rx="32" ry="22" fill={palette.teal.DEFAULT} opacity="0.2" />
      <ellipse cx="190" cy="145" rx="36" ry="26" fill={palette.lavender.DEFAULT} opacity="0.18" />
      <ellipse cx="250" cy="155" rx="32" ry="22" fill={palette.coral.soft} opacity="0.2" />
      <path d="M100 200 Q190 175 280 200" stroke={palette.amber.DEFAULT} strokeWidth="3" fill="none" opacity="0.3" />
    </ArtCanvas>
  );
}

export function SleepArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="Restful sleep" gradientStops={calm}>
      <circle cx="300" cy="80" r="18" fill={palette.lavender.DEFAULT} opacity="0.35" />
      <circle cx="320" cy="95" r="12" fill={palette.lavender.DEFAULT} opacity="0.25" />
      <circle cx="290" cy="100" r="10" fill={palette.lavender.DEFAULT} opacity="0.2" />
      <ellipse cx="170" cy="150" rx="70" ry="40" fill={palette.teal.wash} opacity="0.5" />
      <path d="M130 150 Q170 120 210 150" stroke={palette.teal.muted} strokeWidth="3" fill="none" opacity="0.4" />
    </ArtCanvas>
  );
}

export function CelebrationArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="Celebrate progress" gradientStops={warm}>
      <circle cx="190" cy="120" r="40" fill={palette.amber.DEFAULT} opacity="0.35" />
      <path d="M175 115 L188 128 L210 100" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      {[
        [100, 80],
        [280, 90],
        [120, 180],
        [260, 170],
        [190, 60],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6 + (i % 3)} fill={[palette.teal.DEFAULT, palette.lavender.DEFAULT, palette.coral.soft, palette.amber.DEFAULT, palette.mint.DEFAULT][i]} opacity="0.5" />
      ))}
    </ArtCanvas>
  );
}

export function ReflectionArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="Quiet reflection" gradientStops={calm}>
      <ellipse cx="190" cy="200" rx="100" ry="20" fill={palette.teal.DEFAULT} opacity="0.1" />
      <circle cx="190" cy="110" r="50" fill={palette.lavender.wash} opacity="0.6" />
      <circle cx="190" cy="100" r="8" fill={palette.teal.muted} opacity="0.5" />
      <path d="M160 130 Q190 150 220 130" stroke={palette.teal.muted} strokeWidth="3" fill="none" opacity="0.35" />
    </ArtCanvas>
  );
}

export function GrowthArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="Growing together" gradientStops={warm}>
      <rect x="170" y="160" width="12" height="50" rx="4" fill={palette.teal.muted} opacity="0.4" />
      <ellipse cx="176" cy="150" rx="28" ry="18" fill={palette.mint.DEFAULT} opacity="0.45" />
      <ellipse cx="176" cy="135" rx="20" ry="14" fill={palette.teal.DEFAULT} opacity="0.35" />
      <path d="M80 210 Q130 170 176 190 T280 200" stroke={palette.teal.DEFAULT} strokeWidth="4" fill="none" opacity="0.3" />
    </ArtCanvas>
  );
}

export function NatureArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="Nature and calm" gradientStops={warm}>
      <ellipse cx="100" cy="220" rx="60" ry="18" fill={palette.mint.DEFAULT} opacity="0.25" />
      <ellipse cx="280" cy="225" rx="50" ry="15" fill={palette.mint.DEFAULT} opacity="0.2" />
      <path d="M190 200 L190 120 M190 140 Q160 100 130 120 M190 130 Q220 90 250 115 M190 155 Q170 125 155 145" stroke={palette.teal.DEFAULT} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </ArtCanvas>
  );
}

export function JourneyArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="Your journey" gradientStops={warm}>
      <path d="M60 200 Q120 140 190 170 T300 120" stroke={palette.teal.DEFAULT} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.4" />
      <circle cx="120" cy="155" r="10" fill={palette.amber.DEFAULT} opacity="0.55" />
      <circle cx="190" cy="170" r="10" fill={palette.teal.DEFAULT} opacity="0.5" />
      <circle cx="260" cy="130" r="12" fill={palette.lavender.DEFAULT} opacity="0.45" />
    </ArtCanvas>
  );
}

export function HopeArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="Hope ahead" gradientStops={calm} showFrame={false}>
      <path d="M190 220 L190 90" stroke={palette.amber.DEFAULT} strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      <circle cx="190" cy="75" r="20" fill={palette.amber.soft} opacity="0.6" />
      <circle cx="190" cy="75" r="10" fill={palette.amber.DEFAULT} opacity="0.5" />
    </ArtCanvas>
  );
}

export function CalmArt({ className = "" }: { className?: string }) {
  return (
    <ArtCanvas className={className} label="A calm moment" gradientStops={calm}>
      <ellipse cx="190" cy="140" rx="80" ry="50" fill={palette.lavender.wash} opacity="0.5" />
      <path d="M130 140 Q190 100 250 140 Q190 180 130 140" fill={palette.teal.wash} opacity="0.4" />
    </ArtCanvas>
  );
}
