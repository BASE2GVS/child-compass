export type CareRole = "parent" | "teacher" | "therapist" | "grandparent" | "support_worker" | "caregiver" | "admin";

export type CarePermissions = {
  timeline: boolean;
  reports: boolean;
  school: boolean;
  therapy: boolean;
  health: boolean;
  checkin: boolean;
  observations: boolean;
};

export const ROLE_DEFAULT_PERMISSIONS: Record<CareRole, CarePermissions> = {
  parent: { timeline: true, reports: true, school: true, therapy: true, health: true, checkin: true, observations: true },
  admin: { timeline: true, reports: true, school: true, therapy: true, health: true, checkin: true, observations: true },
  caregiver: { timeline: true, reports: true, school: true, therapy: false, health: true, checkin: true, observations: true },
  teacher: { timeline: false, reports: true, school: true, therapy: false, health: false, checkin: false, observations: true },
  therapist: { timeline: true, reports: true, school: false, therapy: true, health: true, checkin: false, observations: true },
  grandparent: { timeline: true, reports: false, school: false, therapy: false, health: false, checkin: false, observations: true },
  support_worker: { timeline: true, reports: false, school: true, therapy: false, health: false, checkin: true, observations: true },
};

export type CareResource =
  | "timeline"
  | "reports"
  | "school"
  | "therapy"
  | "health"
  | "checkin"
  | "observations";

export function permissionsFromInvite(raw: Record<string, unknown> | null, role: string): CarePermissions {
  const base = ROLE_DEFAULT_PERMISSIONS[(role as CareRole) || "caregiver"] || ROLE_DEFAULT_PERMISSIONS.caregiver;
  if (!raw) return base;
  return {
    timeline: raw.timeline === true || base.timeline,
    reports: raw.reports === true || base.reports,
    school: raw.school === true || base.school,
    therapy: raw.therapy === true || base.therapy,
    health: raw.health === true || base.health,
    checkin: raw.checkin === true || base.checkin,
    observations: raw.observations === true || base.observations,
  };
}

export function canAccessCareResource(permissions: CarePermissions, resource: CareResource): boolean {
  return permissions[resource] === true;
}

export function roleLabel(role: CareRole): string {
  const labels: Record<CareRole, string> = {
    parent: "Parent",
    teacher: "Teacher",
    therapist: "Therapist",
    grandparent: "Grandparent",
    support_worker: "Support worker",
    caregiver: "Caregiver",
    admin: "Family admin",
  };
  return labels[role] || role;
}
