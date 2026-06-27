import { FrameworkEmptyState } from "@/components/framework";

type LibraryEmptyStateProps = {
  childId: string;
  childName: string;
};

export default function LibraryEmptyState({ childId, childName }: LibraryEmptyStateProps) {
  return (
    <FrameworkEmptyState
      icon="📚"
      title="Your family library will grow here"
      description={`Summaries for school, therapy notes, and important documents — all in one place for ${childName}.`}
      actionLabel="Begin with today's check-in"
      actionHref={`/check-in?child=${childId}&first=1`}
    />
  );
}
