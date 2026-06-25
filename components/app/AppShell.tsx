import { getFamilyContext, getProfile } from "@/lib/data/queries";
import { getSelectedChildId } from "@/lib/utils/child-selection";
import AppSidebar from "@/components/app/AppSidebar";
import MobileNav from "@/components/app/MobileNav";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const [profile, { family, children: familyChildren }] = await Promise.all([
    getProfile(),
    getFamilyContext(),
  ]);

  const activeChildId = await getSelectedChildId(familyChildren);
  const activeChild =
    familyChildren.find((c) => c.id === activeChildId) ?? familyChildren[0] ?? null;

  return (
    <div className="flex min-h-screen bg-[#FAF8F4]">
      <AppSidebar
        familyName={family?.name}
        activeChild={activeChild}
        profileName={profile?.full_name}
        profileAvatar={profile?.avatar_url}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 pb-24 lg:px-10 lg:py-10 lg:pb-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
