/** One shared fixed landscape — every app page sits on this canvas */
export default function AppEnvironmentBackground() {
  return (
    <div className="cc-shell-environment pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/background/app-background.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/7 via-white/4 to-[#F3FAF8]/3" />
    </div>
  );
}
