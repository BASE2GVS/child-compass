/** Ambient botanical layer — lives behind the entire Today page */
export default function TodayAtmosphere() {
  return (
    <div className="today-atmosphere pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -left-24 top-[18%] h-72 w-72 rounded-full bg-[#E8F6F3]/40 blur-3xl" />
      <div className="absolute right-[8%] top-[42%] h-96 w-96 rounded-full bg-[#F5E6C8]/35 blur-3xl" />
      <div className="absolute bottom-[12%] left-[30%] h-80 w-80 rounded-full bg-[#EDE8F8]/30 blur-3xl" />
      <svg className="cc-leaf-1 absolute left-[6%] top-[28%] h-16 w-16 opacity-25" viewBox="0 0 64 64" fill="none">
        <path d="M32 4C20 20 8 36 32 60C56 36 44 20 32 4Z" fill="#8FCEC4" />
      </svg>
      <svg className="cc-leaf-2 absolute right-[14%] top-[55%] h-20 w-20 opacity-20" viewBox="0 0 64 64" fill="none">
        <path d="M32 4C20 20 8 36 32 60C56 36 44 20 32 4Z" fill="#C9B8E0" />
      </svg>
      <svg className="cc-leaf-3 absolute bottom-[22%] right-[28%] h-14 w-14 opacity-22" viewBox="0 0 64 64" fill="none">
        <path d="M32 4C20 20 8 36 32 60C56 36 44 20 32 4Z" fill="#E8C47A" />
      </svg>
      <span className="cc-particle-1 absolute left-[18%] top-[12%] h-1.5 w-1.5 rounded-full bg-[#F5D9A8]/60" />
      <span className="cc-particle-2 absolute right-[22%] top-[20%] h-1 w-1 rounded-full bg-[#5BB5A8]/50" />
      <span className="cc-particle-3 absolute left-[42%] bottom-[30%] h-1.5 w-1.5 rounded-full bg-[#C9B8E0]/45" />
      <span className="cc-particle-4 absolute right-[38%] top-[38%] h-1 w-1 rounded-full bg-[#E8C47A]/55" />
      <div className="cc-paper-grain absolute inset-0" />
    </div>
  );
}
