import type { ComponentType } from "react";
import {
  TodayEnvironment,
  CoachEnvironment,
  ChildEnvironment,
  TrackEnvironment,
  DocumentsEnvironment,
  SchoolEnvironment,
  TherapyEnvironment,
  HealthEnvironment,
  SettingsEnvironment,
  HelpEnvironment,
  SearchEnvironment,
} from "@/components/immersive/environments/PageEnvironments";

export type EditorialVariant =
  | "today"
  | "coach"
  | "child"
  | "track"
  | "documents"
  | "checkin"
  | "school"
  | "therapy"
  | "health"
  | "settings"
  | "help"
  | "search";

export const editorialEnvironments: Record<
  EditorialVariant,
  ComponentType<{ className?: string }>
> = {
  today: TodayEnvironment,
  coach: CoachEnvironment,
  child: ChildEnvironment,
  track: TrackEnvironment,
  documents: DocumentsEnvironment,
  checkin: TodayEnvironment,
  school: SchoolEnvironment,
  therapy: TherapyEnvironment,
  health: HealthEnvironment,
  settings: SettingsEnvironment,
  help: HelpEnvironment,
  search: SearchEnvironment,
};
