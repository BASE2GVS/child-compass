import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Timeline merged into Track — one continuous journal experience */
export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const qs = params.child ? `?child=${params.child}` : "";
  redirect(`/track${qs}`);
}
