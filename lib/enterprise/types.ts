export type OrganisationType = "school" | "clinic" | "practice" | "support_organisation";

export type Organisation = {
  id: string;
  name: string;
  type: OrganisationType;
  country: string;
  createdAt: string;
};

export type OrganisationMember = {
  organisationId: string;
  userId: string;
  role: "admin" | "practitioner" | "viewer";
};

export type OrganisationFamilyLink = {
  organisationId: string;
  familyId: string;
  consentGrantedAt: string;
};

export function isEnterpriseEnabled(): boolean {
  return process.env.ENTERPRISE_ENABLED === "true";
}
