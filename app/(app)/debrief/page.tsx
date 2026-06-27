import { redirect } from "next/navigation";

export default async function DebriefRedirect({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; first?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.child) qs.set("child", params.child);
  qs.set("reflect", "1");
  redirect(`/coach?${qs.toString()}`);
}
