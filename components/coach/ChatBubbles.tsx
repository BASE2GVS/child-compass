import type { CoachMessage } from "@/lib/types/database";

function CompanionAvatar() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#A8D5CC] to-[#8FCEC4] text-sm shadow-sm"
      aria-hidden
    >
      🌿
    </div>
  );
}

export function AssistantBubble({ content }: { content: string }) {
  return (
    <div className="mr-4 flex max-w-[92%] items-start gap-3 sm:mr-12 sm:max-w-[85%]">
      <CompanionAvatar />
      <div className="rounded-[1.5rem] rounded-bl-md bg-gradient-to-br from-[#E8F6F3] via-[#F0FAF8] to-[#F3EFFA] px-5 py-4 text-base leading-relaxed text-[var(--cc-ink)] shadow-[0_2px_12px_rgba(45,42,38,0.05)] sm:text-[1.05rem] sm:leading-relaxed">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

export function ParentBubble({ content }: { content: string }) {
  return (
    <div className="ml-4 flex justify-end sm:ml-12">
      <div className="max-w-[92%] rounded-[1.5rem] rounded-br-md bg-[#F5F0E8] px-5 py-4 text-base leading-relaxed text-[var(--cc-ink)] shadow-[0_2px_12px_rgba(45,42,38,0.06)] sm:max-w-[85%] sm:text-[1.05rem]">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

export function MessageList({ messages }: { messages: CoachMessage[] }) {
  return (
    <>
      {messages.map((msg) =>
        msg.role === "parent" ? (
          <ParentBubble key={msg.id} content={msg.content} />
        ) : (
          <AssistantBubble key={msg.id} content={msg.content} />
        ),
      )}
    </>
  );
}

const COMPANION_TOUCHES = [
  "Take your time.",
  "I'm listening.",
  "We don't have to solve everything today.",
];

export function companionTouchForSession(messageCount: number): string | null {
  if (messageCount === 0) {
    const day = new Date().getDate();
    return COMPANION_TOUCHES[day % COMPANION_TOUCHES.length];
  }
  if (messageCount > 0 && messageCount % 4 === 0) {
    return COMPANION_TOUCHES[(messageCount / 4) % COMPANION_TOUCHES.length];
  }
  return null;
}
