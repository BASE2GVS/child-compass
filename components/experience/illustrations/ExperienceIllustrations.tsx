import type { ReactNode } from "react";

/** Simple warm SVG illustrations for Sprint 7 experience pages */

function BaseArt({ className, label, children }: { className?: string; label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 380 280" fill="none" className={`w-full max-w-md ${className || ""}`} role="img" aria-label={label}>
      {children}
    </svg>
  );
}

export function SettingsHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Cozy home">
      <rect x="100" y="100" width="180" height="120" rx="12" fill="#FFFCF6" opacity="0.85" stroke="#E8DCC8" strokeWidth="2" />
      <polygon points="100,100 190,55 280,100" fill="#E8C47A" opacity="0.45" />
      <rect x="155" y="145" width="35" height="45" rx="4" fill="#D4EDE8" opacity="0.6" />
      <rect x="210" y="135" width="40" height="30" rx="4" fill="#F5E6C8" opacity="0.5" />
      <circle cx="190" cy="175" r="8" fill="#F5D9A8" opacity="0.5" />
      <path d="M60 200 Q90 175 120 195" stroke="#A8D5CC" strokeWidth="2" fill="none" opacity="0.35" />
    </BaseArt>
  );
}

export function HelpHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Helping hands and compass">
      <circle cx="190" cy="130" r="55" fill="#E8F6F3" opacity="0.5" />
      <circle cx="190" cy="130" r="35" stroke="#5BB5A8" strokeWidth="3" opacity="0.4" fill="none" />
      <path d="M190 105 L190 155 M165 130 L215 130" stroke="#3D9B8F" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <ellipse cx="130" cy="200" rx="28" ry="16" fill="#F5D4C8" opacity="0.45" transform="rotate(-20 130 200)" />
      <ellipse cx="250" cy="200" rx="28" ry="16" fill="#C9B8E0" opacity="0.35" transform="rotate(20 250 200)" />
      <path d="M145 195 Q190 175 235 195" stroke="#E8C47A" strokeWidth="2.5" fill="none" opacity="0.4" />
    </BaseArt>
  );
}

export function SearchHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Compass among the stars">
      <circle cx="120" cy="80" r="2" fill="#E8C47A" opacity="0.6" />
      <circle cx="280" cy="60" r="1.5" fill="#C9B8E0" opacity="0.5" />
      <circle cx="300" cy="120" r="2" fill="#A8D5CC" opacity="0.5" />
      <circle cx="80" cy="150" r="1.5" fill="#F5D9A8" opacity="0.55" />
      <circle cx="200" cy="50" r="2" fill="#E8A598" opacity="0.45" />
      <circle cx="175" cy="125" r="50" stroke="#5BB5A8" strokeWidth="6" opacity="0.35" fill="none" />
      <path d="M200 95 L200 115 M185 105 L215 105" stroke="#3D9B8F" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <rect x="210" y="155" width="55" height="8" rx="4" transform="rotate(45 210 155)" fill="#E8C47A" opacity="0.45" />
      <rect x="90" y="200" width="200" height="12" rx="6" fill="#A8D5CC" opacity="0.25" />
    </BaseArt>
  );
}

export function HealthHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Wellness journal">
      <rect width="380" height="280" rx="28" fill="#E8F6F3" opacity="0.4" />
      <path d="M190 70 C150 70 130 110 130 140 C130 180 190 220 190 220 C190 220 250 180 250 140 C250 110 230 70 190 70 Z" fill="#A8D5CC" opacity="0.45" />
      <circle cx="190" cy="135" r="24" fill="#5BB5A8" opacity="0.35" />
      <rect x="100" y="210" width="180" height="12" rx="6" fill="#E8C47A" opacity="0.35" />
    </BaseArt>
  );
}

export function SchoolHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="School collaboration">
      <rect width="380" height="280" rx="28" fill="#E8F4FD" opacity="0.5" />
      <rect x="120" y="90" width="140" height="100" rx="12" fill="#A8D5CC" opacity="0.35" />
      <polygon points="120,90 190,55 260,90" fill="#5BB5A8" opacity="0.4" />
      <rect x="155" y="130" width="30" height="40" rx="4" fill="#FDF6E8" opacity="0.7" />
      <rect x="195" y="130" width="30" height="40" rx="4" fill="#FDF6E8" opacity="0.7" />
      <rect x="100" y="210" width="180" height="10" rx="5" fill="#E8C47A" opacity="0.4" />
    </BaseArt>
  );
}

export function TherapyHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Calm therapy journal">
      <rect width="380" height="280" rx="28" fill="#F3EFFA" opacity="0.45" />
      <ellipse cx="190" cy="140" rx="80" ry="60" fill="#C9B8E0" opacity="0.3" />
      <rect x="130" y="100" width="120" height="90" rx="16" fill="#FFFCF8" opacity="0.8" />
      <rect x="145" y="120" width="90" height="8" rx="4" fill="#A8D5CC" opacity="0.5" />
      <rect x="145" y="140" width="70" height="6" rx="3" fill="#E8C47A" opacity="0.4" />
      <rect x="145" y="158" width="80" height="6" rx="3" fill="#E8A598" opacity="0.35" />
    </BaseArt>
  );
}

export function GoalsHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Your progress journey">
      <rect width="380" height="280" rx="28" fill="#FDF6E8" />
      <path d="M80 200 L140 150 L200 170 L260 100 L300 130" stroke="#5BB5A8" strokeWidth="6" strokeLinecap="round" opacity="0.5" fill="none" />
      <circle cx="140" cy="150" r="12" fill="#E8C47A" opacity="0.6" />
      <circle cx="200" cy="170" r="12" fill="#A8D5CC" opacity="0.6" />
      <circle cx="260" cy="100" r="14" fill="#5BB5A8" opacity="0.55" />
      <path d="M250 95 L260 85 L270 95 L260 105 Z" fill="#E8C47A" opacity="0.7" />
    </BaseArt>
  );
}

export function HabitsHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Friendly routines">
      <rect width="380" height="280" rx="28" fill="#FFF8ED" />
      <rect x="100" y="80" width="80" height="80" rx="20" fill="#A8D5CC" opacity="0.35" />
      <rect x="200" y="80" width="80" height="80" rx="20" fill="#E8C47A" opacity="0.35" />
      <rect x="150" y="175" width="80" height="80" rx="20" fill="#C9B8E0" opacity="0.3" />
      <circle cx="140" cy="120" r="16" fill="#5BB5A8" opacity="0.4" />
      <circle cx="240" cy="120" r="16" fill="#E8A598" opacity="0.35" />
      <circle cx="190" cy="215" r="16" fill="#F5D9A8" opacity="0.5" />
    </BaseArt>
  );
}

export function ScheduleHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Beautiful daily rhythm">
      <rect width="380" height="280" rx="28" fill="#FFF4E6" opacity="0.5" />
      <circle cx="100" cy="100" r="28" fill="#F5D9A8" opacity="0.5" />
      <circle cx="190" cy="130" r="28" fill="#A8D5CC" opacity="0.45" />
      <circle cx="280" cy="100" r="28" fill="#C9B8E0" opacity="0.4" />
      <line x1="128" y1="110" x2="162" y2="125" stroke="#E8C47A" strokeWidth="3" opacity="0.5" />
      <line x1="218" y1="125" x2="252" y2="110" stroke="#E8C47A" strokeWidth="3" opacity="0.5" />
      <rect x="110" y="190" width="160" height="12" rx="6" fill="#5BB5A8" opacity="0.25" />
      <rect x="130" y="215" width="120" height="10" rx="5" fill="#E8A598" opacity="0.25" />
    </BaseArt>
  );
}

export function TrendsHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Gentle trends">
      <rect width="380" height="280" rx="28" fill="#F3EFFA" opacity="0.4" />
      <rect x="90" y="180" width="30" height="60" rx="8" fill="#A8D5CC" opacity="0.4" />
      <rect x="140" y="150" width="30" height="90" rx="8" fill="#5BB5A8" opacity="0.35" />
      <rect x="190" y="130" width="30" height="110" rx="8" fill="#E8C47A" opacity="0.4" />
      <rect x="240" y="160" width="30" height="80" rx="8" fill="#C9B8E0" opacity="0.35" />
      <path d="M105 170 Q160 120 220 140 T275 150" stroke="#5BB5A8" strokeWidth="4" fill="none" opacity="0.45" />
    </BaseArt>
  );
}

export function ProfileHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Your profile">
      <rect width="380" height="280" rx="28" fill="#FDF6E8" />
      <circle cx="190" cy="105" r="50" fill="#A8D5CC" opacity="0.4" />
      <circle cx="190" cy="95" r="22" fill="#5BB5A8" opacity="0.45" />
      <ellipse cx="190" cy="175" rx="55" ry="35" fill="#C9B8E0" opacity="0.3" />
      <rect x="120" y="215" width="140" height="12" rx="6" fill="#E8C47A" opacity="0.35" />
    </BaseArt>
  );
}

export function ResourcesHeroArt({ className = "" }: { className?: string }) {
  return (
    <BaseArt className={className} label="Curated resources">
      <rect width="380" height="280" rx="28" fill="#FDF6E8" />
      <rect x="70" y="130" width="36" height="70" rx="4" fill="#A8D5CC" opacity="0.55" />
      <rect x="115" y="120" width="32" height="80" rx="4" fill="#C9B8E0" opacity="0.5" />
      <rect x="155" y="125" width="40" height="75" rx="4" fill="#E8C47A" opacity="0.55" />
      <rect x="205" y="118" width="34" height="82" rx="4" fill="#5BB5A8" opacity="0.45" />
      <rect x="250" y="128" width="38" height="72" rx="4" fill="#E8A598" opacity="0.4" />
      <rect x="40" y="200" width="300" height="12" rx="4" fill="#E8DCC8" opacity="0.7" />
    </BaseArt>
  );
}
