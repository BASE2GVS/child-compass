import { CompanionExpandable } from "@/components/companion";

type ConversationStarter = {
  id: string;
  emoji: string;
  label: string;
  prompt: string;
};

function firstVisitStarters(childName: string): ConversationStarter[] {
  return [
    {
      id: "difficult-day",
      emoji: "❤️",
      label: "I had a hard day",
      prompt: `I had a difficult day with ${childName}.`,
    },
    {
      id: "understand",
      emoji: "🌱",
      label: "Help me understand",
      prompt: `Help me understand what ${childName} might be feeling.`,
    },
    {
      id: "listen",
      emoji: "💛",
      label: "I need to talk",
      prompt: "I just need someone to listen right now.",
    },
    {
      id: "tomorrow",
      emoji: "🌅",
      label: "Prepare for tomorrow",
      prompt: "Help me prepare for tomorrow.",
    },
  ];
}

function starters(childName: string, reflectMode: boolean): ConversationStarter[] {
  if (reflectMode) {
    return [
      { id: "understand-today", emoji: "🌅", label: "Understand today", prompt: `Help me understand what happened with ${childName} today.` },
      { id: "meltdown", emoji: "💛", label: "After a meltdown", prompt: `${childName} had a meltdown — I want to make sense of it.` },
      { id: "listen", emoji: "😔", label: "I need to talk", prompt: "I just need someone to listen right now." },
      { id: "reflect-day", emoji: "🌙", label: "Reflect on the day", prompt: "I need to reflect on how today went." },
    ];
  }

  return [
    { id: "difficult-day", emoji: "❤️", label: "Difficult day", prompt: `I had a difficult day with ${childName}.` },
    { id: "tomorrow", emoji: "🌅", label: "Prepare for tomorrow", prompt: "Help me prepare for tomorrow." },
    { id: "listen", emoji: "😔", label: "I need to talk", prompt: "I just need someone to listen right now." },
    { id: "school", emoji: "🏫", label: "School is hard", prompt: `School has become hard for ${childName}.` },
    { id: "sleep", emoji: "😴", label: "Sleep struggles", prompt: "We're struggling with sleep." },
    { id: "celebrate", emoji: "✨", label: "Celebrate a win", prompt: `I want to celebrate today's wins with ${childName}.` },
  ];
}

function StarterButton({
  item,
  disabled,
  onSelect,
}: {
  item: ConversationStarter;
  disabled?: boolean;
  onSelect: (prompt: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(item.prompt)}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/50 px-4 py-3.5 text-left text-base font-medium text-[var(--cc-ink)] transition-colors hover:bg-white/80 disabled:opacity-50"
    >
      <span aria-hidden>{item.emoji}</span>
      {item.label}
    </button>
  );
}

type SuggestedConversationsProps = {
  childName: string;
  reflectMode?: boolean;
  firstVisit?: boolean;
  disabled?: boolean;
  onSelect: (prompt: string) => void;
};

export default function SuggestedConversations({
  childName,
  reflectMode = false,
  firstVisit = false,
  disabled = false,
  onSelect,
}: SuggestedConversationsProps) {
  const items = firstVisit ? firstVisitStarters(childName) : starters(childName, reflectMode);
  const primary = firstVisit ? items : items.slice(0, 3);
  const more = firstVisit ? [] : items.slice(3);

  return (
    <section aria-labelledby="suggested-conversations-heading" className="space-y-3">
      <h2 id="suggested-conversations-heading" className="sr-only">
        Conversation starters
      </h2>
      {primary.map((item) => (
        <StarterButton key={item.id} item={item} disabled={disabled} onSelect={onSelect} />
      ))}
      {more.length > 0 && (
        <CompanionExpandable label="More starters">
          <div className="mt-3 space-y-2">
            {more.map((item) => (
              <StarterButton key={item.id} item={item} disabled={disabled} onSelect={onSelect} />
            ))}
          </div>
        </CompanionExpandable>
      )}
    </section>
  );
}
