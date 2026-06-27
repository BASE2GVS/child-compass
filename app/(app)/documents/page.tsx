import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Documents route merged into hub */
export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const qs = params.child ? `?child=${params.child}` : "";
  redirect(`/documents-hub${qs}`);
}
