import { bullets, childAgeYears, formatContacts, uniqueStrings } from "@/lib/documents/section-helpers";
import type { DocumentInput } from "@/lib/documents/document-input";
import type { ReportContent } from "@/lib/services/report-generator";

export function preparePassport(input: DocumentInput): ReportContent {
  const { child, profile, checkins, patterns, healthObservations } = input;
  const name = child.nickname || child.first_name;
  const age = childAgeYears(child.date_of_birth);

  const overview: string[] = [];
  if (age != null) overview.push(`${name} is about ${age} years old.`);
  if (child.school) overview.push(`School: ${child.school}`);
  if (child.grade) overview.push(`Grade: ${child.grade}`);
  if (child.diagnosis?.length) overview.push(`Profile: ${child.diagnosis.join(", ")}`);
  if (child.support_needs?.length) overview.push(`Support needs: ${child.support_needs.join(", ")}`);
  if (profile?.notes?.trim()) overview.push(profile.notes.trim());

  const sensoryLines: string[] = [];
  const prefs = profile?.sensory_preferences ?? {};
  for (const [key, val] of Object.entries(prefs)) {
    if (val) sensoryLines.push(`${key}: ${String(val)}`);
  }
  for (const p of patterns.filter((p) => p.category === "sensory")) {
    sensoryLines.push(p.description);
  }
  for (const h of healthObservations.filter((o) => o.observation_type === "sleep").slice(0, 2)) {
    sensoryLines.push(`${h.title}${h.notes ? ` — ${h.notes}` : ""}`);
  }

  const communication: string[] = [];
  if (profile?.challenges?.length) {
    communication.push(
      ...profile.challenges.filter((c) => /communicat|language|demand|instruction/i.test(c)),
    );
  }
  if (profile?.notes && /communicat|language|demand/i.test(profile.notes)) {
    communication.push(profile.notes.trim());
  }

  const triggers = uniqueStrings([
    ...(profile?.known_triggers ?? []),
    ...patterns.map((p) => p.description),
    ...checkins
      .flatMap((c) => c.challenges ?? [])
      .slice(0, 4),
  ]);

  const calming = uniqueStrings([
    ...(profile?.calming_strategies ?? []),
    ...(profile?.successful_strategies ?? []),
    ...(child.support_needs ?? []),
  ]);

  const interests = uniqueStrings([
    ...(child.interests ?? []),
    ...(child.favourite_activities ?? []),
    ...(profile?.favourite_things ?? []),
  ]);

  const strengths = uniqueStrings([
    ...(profile?.strengths ?? []),
    ...checkins.flatMap((c) => c.wins ?? []).slice(0, 6),
  ]);

  const medical: string[] = [];
  if (profile?.medical_history?.trim()) medical.push(profile.medical_history.trim());
  if (profile?.medication?.length) medical.push(`Medication: ${profile.medication.join(", ")}`);
  for (const h of healthObservations.filter((o) =>
    ["medication", "appointment", "sleep", "nutrition"].includes(o.observation_type),
  ).slice(0, 5)) {
    medical.push(`${h.title}${h.notes ? ` — ${h.notes}` : ""}`);
  }

  const emergency = uniqueStrings([
    ...(profile?.emergency_notes ? [profile.emergency_notes] : []),
    ...formatContacts(profile?.doctors ?? []),
    ...formatContacts(profile?.support_team ?? []),
  ]);

  return {
    headline: `Child Passport — ${name}`,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      { title: "Child overview", body: bullets(overview) },
      { title: "Communication style", body: bullets(communication) },
      { title: "Sensory profile", body: bullets(sensoryLines) },
      { title: "Known triggers", body: bullets(triggers) },
      { title: "Calming strategies", body: bullets(calming) },
      { title: "Interests", body: bullets(interests) },
      { title: "Strengths", body: bullets(strengths) },
      { title: "Medical information", body: bullets(medical) },
      { title: "Emergency contacts", body: bullets(emergency) },
    ],
  };
}
