import { redirect } from "next/navigation";



export const dynamic = "force-dynamic";



/** Reports merged into Documents hub — one library experience */

export default async function ReportsPage({

  searchParams,

}: {

  searchParams: Promise<{ child?: string; example?: string }>;

}) {

  const params = await searchParams;

  const query = new URLSearchParams();
  if (params.child) query.set("child", params.child);
  if (params.example) query.set("example", params.example);
  const qs = query.toString() ? `?${query.toString()}` : "";

  redirect(`/documents-hub${qs}`);

}


