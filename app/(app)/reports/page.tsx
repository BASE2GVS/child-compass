import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Reports merged into Documents hub — one library experience */
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const qs = params.child ? `?child=${params.child}` : "";
  redirect(`/documents-hub${qs}`);
}
