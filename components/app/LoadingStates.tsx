export {
  EmptyState,
  ShimmerBlock,
  SkeletonCard,
  SkeletonChart,
  SkeletonPage,
  SkeletonReport,
  SkeletonLoader,
} from "@/components/design-system";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-rose-200/80 bg-rose-50 px-6 py-8 text-center" role="alert">
      <p className="font-semibold text-rose-800">Something didn&apos;t work</p>
      <p className="mt-2 text-sm text-rose-600">{message}</p>
      <p className="mt-3 text-xs text-rose-500">Your data is safe — please try again.</p>
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
      role="status"
    >
      {message}
    </div>
  );
}
