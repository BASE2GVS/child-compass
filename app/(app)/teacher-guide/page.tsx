import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Teacher guide lives with School + Documents — keep route, merge experience */
export default async function TeacherGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const qs = params.child ? `?child=${params.child}` : "";
  redirect(`/reports/view/teacher_guide${qs}`);
}
