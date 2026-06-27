import type { ComponentType } from "react";
import ChildSwitcher from "@/components/app/ChildSwitcher";
import EditorialHero from "@/components/immersive/EditorialHero";
import {
  SettingsEnvironment,
  HelpEnvironment,
  SearchEnvironment,
  HealthEnvironment,
  SchoolEnvironment,
  TherapyEnvironment,
  TrackEnvironment,
  DocumentsEnvironment,
  ChildEnvironment,
} from "@/components/immersive/environments/PageEnvironments";
import type { Child } from "@/lib/types/database";

type GradientVariant =
  | "warm"
  | "calm"
  | "school"
  | "therapy"
  | "health"
  | "goals"
  | "habits"
  | "schedule"
  | "trends"
  | "search"
  | "settings"
  | "profile"
  | "help"
  | "resources";

type ExperienceHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  variant?: GradientVariant;
  familyChildren?: Child[];
  activeChildId?: string;
  id?: string;
};

const variantEnv: Record<
  GradientVariant,
  { Env: ComponentType<{ className?: string }>; tint: NonNullable<Parameters<typeof EditorialHero>[0]["tint"]> }
> = {
  warm: { Env: ChildEnvironment, tint: "warm" },
  calm: { Env: TherapyEnvironment, tint: "calm" },
  school: { Env: SchoolEnvironment, tint: "school" },
  therapy: { Env: TherapyEnvironment, tint: "therapy" },
  health: { Env: HealthEnvironment, tint: "nature" },
  goals: { Env: TrackEnvironment, tint: "path" },
  habits: { Env: ChildEnvironment, tint: "garden" },
  schedule: { Env: TrackEnvironment, tint: "path" },
  trends: { Env: TrackEnvironment, tint: "path" },
  search: { Env: SearchEnvironment, tint: "search" },
  settings: { Env: SettingsEnvironment, tint: "home" },
  profile: { Env: SettingsEnvironment, tint: "home" },
  help: { Env: HelpEnvironment, tint: "help" },
  resources: { Env: DocumentsEnvironment, tint: "library" },
};

export default function ExperienceHero({
  eyebrow,
  title,
  description,
  variant = "warm",
  familyChildren,
  activeChildId,
  id = "page-hero-heading",
}: ExperienceHeroProps) {
  const { Env, tint } = variantEnv[variant];

  return (
    <EditorialHero id={id} tint={tint} illustration={<Env />}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">{eyebrow}</p>
          {familyChildren && familyChildren.length > 1 && activeChildId && (
            <ChildSwitcher familyChildren={familyChildren} activeChildId={activeChildId} />
          )}
        </div>

        <div>
          <h1
            id={`${id}-heading`}
            className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--cc-ink)] sm:text-4xl lg:text-[2.75rem]"
          >
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--cc-ink-muted)] sm:text-lg">{description}</p>
        </div>
      </div>
    </EditorialHero>
  );
}
