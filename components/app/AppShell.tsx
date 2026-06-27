import { getFamilyContext, getProfile } from "@/lib/data/queries";
import { getSelectedChildId } from "@/lib/utils/child-selection";
import AppSidebar from "@/components/app/AppSidebar";
import MobileNav from "@/components/app/MobileNav";
import { AppContainer } from "@/components/framework";
import {
  AppEnvironmentBackground,
  AppShellTransition,
  AppTopNav,
} from "@/components/shell";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const [profile, { family, children: familyChildren }] = await Promise.all([
    getProfile(),
    getFamilyContext(),
  ]);

  const activeChildId = await getSelectedChildId(familyChildren);
  const activeChild =
    familyChildren.find((c) => c.id === activeChildId) ?? familyChildren[0] ?? null;

  return (
    <div className="relative flex min-h-screen">
      <AppEnvironmentBackground />
      <AppSidebar familyName={family?.name} activeChild={activeChild} />
      <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
        <AppTopNav profileName={profile?.full_name} profileAvatar={profile?.avatar_url} />
        <main className="cc-shell-main flex-1 pb-24 lg:pb-10">
          <AppShellTransition>
            <AppContainer>{children}</AppContainer>
          </AppShellTransition>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
