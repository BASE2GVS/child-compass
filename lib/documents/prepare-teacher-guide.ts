import { bullets, childAgeYears, uniqueStrings } from "@/lib/documents/section-helpers";
import type { DocumentInput } from "@/lib/documents/document-input";
import type { ReportContent } from "@/lib/services/report-generator";

export function prepareTeacherGuide(input: DocumentInput): ReportContent {
  const { child, profile, checkins, patterns, schoolEntries, therapySessions, activeGoals } = input;
  const name = child.nickname || child.first_name;
  const age = childAgeYears(child.date_of_birth);

  const about: string[] = [];
  if (age != null) about.push(`${name} is about ${age} years old.`);
  if (child.school) about.push(`School: ${child.school}`);
  if (child.grade) about.push(`Grade: ${child.grade}`);
  if (child.diagnosis?.length) about.push(`Profile: ${child.diagnosis.join(", ")}`);
  if (child.support_needs?.length) about.push(`Support needs: ${child.support_needs.join(", ")}`);
  if (profile?.strengths?.length) about.push(`Strengths: ${profile.strengths.join(", ")}`);

  const whatHelps = uniqueStrings([
    ...(profile?.successful_strategies ?? []),
    ...(profile?.calming_strategies ?? []),
    ...checkins.flatMap((c) => c.wins ?? []).slice(0, 5),
    ...therapySessions.flatMap((t) => t.recommendations ?? []).slice(0, 3),
  ]);

  const schoolDifficult = uniqueStrings([
    ...(profile?.challenges ?? []),
    ...(profile?.known_triggers ?? []),
    ...patterns
      .filter((p) => ["school", "sleep", "sensory", "mood"].includes(p.category))
      .map((p) => p.description),
    ...checkins
      .filter((c) => (c.school_rating ?? 3) <= 2)
      .flatMap((c) => c.challenges ?? [])
      .slice(0, 4),
    ...schoolEntries
      .filter((e) => /challenge|difficult|support|transition/i.test(`${e.title} ${e.content}`))
      .map((e) => e.title)
      .slice(0, 3),
  ]);

  const classroomStrategies = uniqueStrings([
    ...(profile?.successful_strategies ?? []),
    ...schoolEntries
      .filter((e) => e.entry_type === "classroom_strategy" || e.entry_type === "transition_plan")
      .map((e) => `${e.title}: ${e.content.slice(0, 120)}`)
      .slice(0, 4),
  ]);

  const communication: string[] = [];
  if (profile?.notes?.trim()) communication.push(profile.notes.trim());
  for (const e of schoolEntries.filter((s) => /communicat|contact|preference/i.test(s.title)).slice(0, 2)) {
    communication.push(`${e.title}: ${e.content.slice(0, 140)}`);
  }

  const goals = activeGoals.map((g) => `${g.title}${g.category ? ` (${g.category})` : ""}`);

  const medical: string[] = [];
  if (profile?.medication?.length) medical.push(`Medication: ${profile.medication.join(", ")}`);
  if (profile?.medical_history?.trim()) medical.push(profile.medical_history.trim());

  return {
    headline: `Teacher Guide™ — ${name}`,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      { title: "About my child", body: bullets(about) },
      { title: "What helps", body: bullets(whatHelps) },
      { title: "What makes school difficult", body: bullets(schoolDifficult) },
      { title: "Helpful classroom strategies", body: bullets(classroomStrategies) },
      { title: "Communication preferences", body: bullets(communication) },
      { title: "Current goals", body: bullets(goals) },
      { title: "Important medical information", body: bullets(medical) },
    ],
  };
}
