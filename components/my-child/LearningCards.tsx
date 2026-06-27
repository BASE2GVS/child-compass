type LearningCard = {
  id: string;
  text: string;
  emoji: string;
  tint: string;
};

type LearningCardsProps = {
  childName: string;
  cards: LearningCard[];
};

export default function LearningCards({ childName, cards }: LearningCardsProps) {
  if (cards.length === 0) {
    return (
      <section aria-labelledby="learning-heading">
        <h2 id="learning-heading" className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
          What we&apos;re learning
        </h2>
        <p className="mt-4 rounded-[1.5rem] border border-[var(--cc-border-soft)] bg-[var(--cc-paper-elevated)] p-8 text-base leading-relaxed text-[var(--cc-ink-muted)]">
          As you check in and share with Child Compass, gentle observations about {childName} will appear here —
          like pages in a story unfolding.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="learning-heading">
      <h2 id="learning-heading" className="font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
        What we&apos;re learning
      </h2>
      <p className="mt-2 text-base text-[var(--cc-ink-muted)]">
        Small patterns becoming clearer over time.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.id}
            className={`flex gap-4 rounded-[1.5rem] p-6 shadow-[0_2px_12px_rgba(45,42,38,0.04)] ${card.tint}`}
          >
            <span className="text-3xl" aria-hidden>
              {card.emoji}
            </span>
            <p className="text-base leading-relaxed text-[var(--cc-ink-soft)] sm:text-lg">{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
