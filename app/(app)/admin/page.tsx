import { getAdminDashboardData, guardAdminPortalPage } from "@/lib/actions/admin";
import AdminPanel from "@/components/admin/AdminPanel";
import { PageHeader, PageShell } from "@/components/design-system";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  await guardAdminPortalPage();
  const data = await getAdminDashboardData();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Internal"
        title="Child Compass Admin"
        description="Family management, subscriptions, knowledge packs, analytics, and platform health. Developer access only."
      />
      <AdminPanel {...data} />
    </PageShell>
  );
}
