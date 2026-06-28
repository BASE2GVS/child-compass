import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Track merged into Timeline — one living family story */
export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; saved?: string; saveError?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.child) qs.set("child", params.child);
  if (params.saved) qs.set("saved", params.saved);
  if (params.saveError) qs.set("saveError", params.saveError);
  const query = qs.toString();
  redirect(`/timeline${query ? `?${query}` : ""}`);
}
