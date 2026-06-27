/** One shared fixed landscape — every app page sits on this canvas */
export default function AppEnvironmentBackground() {
  return (
    <div className="cc-shell-environment pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/background/today-background.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[#FFF8F2]/[0.78]" />
    </div>
  );
}
