import DashboardBackground from "@/components/dashboard/DashboardBackground";

import ParentProfileForm from "@/components/profile/ParentProfileForm";

import { GlassCard } from "@/components/design-system";

import type { Profile } from "@/lib/types/database";



export default function ProfileExperience({ profile }: { profile: Profile }) {

  const initials = (profile.full_name || "P").charAt(0).toUpperCase();



  return (

    <DashboardBackground>

      <article className="today-editorial cc-flow-enter mx-auto max-w-6xl pb-8">

        <header className="px-2 pb-6 pt-4 sm:px-4">

          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--cc-ink)] sm:text-4xl">

            Profile

          </h1>

          <p className="mt-2 text-base text-[var(--cc-ink-muted)]">Your name and how you&apos;re connected to your child.</p>

        </header>



        <div className="cc-framework-rhythm space-y-8 px-2 sm:px-4">

          <GlassCard padding="lg">

            <div className="flex items-center gap-5">

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--cc-teal)]/25 to-[var(--cc-lavender)]/30 text-3xl font-bold text-[var(--cc-teal-deep)]">

                {initials}

              </div>

              <div>

                <p className="font-display text-xl font-semibold text-[var(--cc-ink)]">

                  {profile.full_name || "Parent"}

                </p>

                <p className="mt-1 text-[var(--cc-ink-muted)]">

                  {profile.relationship_to_child || "Parent"}

                </p>

              </div>

            </div>

          </GlassCard>



          <ParentProfileForm profile={profile} />

        </div>

      </article>

    </DashboardBackground>

  );

}


