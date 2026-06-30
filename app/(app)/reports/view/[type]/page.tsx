import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getReportsData, getCompanionInsights } from "@/lib/data/queries";
import { generateProfessionalReportContent, generateReportContent, type ProfessionalAudience } from "@/lib/services/report-generator";
import { isSmartDocumentType, loadDocumentInput } from "@/lib/documents";
import EditableReportDocument from "@/components/reports/EditableReportDocument";
import ReportLayout from "@/components/reports/ReportLayout";
import PrintButton from "@/components/reports/PrintButton";
import type { Child, ReportType } from "@/lib/types/database";
import { loadJourneyPageContext, type JourneySearchParams } from "@/lib/journey/page-context";
import type { ChildProfile, DailyCheckin, ParentDebrief, PatternFinding } from "@/lib/types/database";
import type { JourneyEntry } from "@/lib/journey/timeline";

export const dynamic = "force-dynamic";

const VALID_TYPES: ReportType[] = [
  "parent_debrief",
  "teacher_guide",
  "pda_passport",
  "school_support",
  "weekly_summary",
  "monthly_progress",
  "therapist_summary",
  "review_30d",
  "review_90d",
  "review_6mo",
  "review_annual",
];

const PROFESSIONAL_TYPES: ProfessionalAudience[] = [
  "occupational_therapist",
  "speech_therapist",
  "psychologist",
  "pediatrician",
];

export default async function ReportPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<JourneySearchParams>;
}) {
  const { type } = await params;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const isProfessionalPreview = PROFESSIONAL_TYPES.includes(type as ProfessionalAudience);
  if (!VALID_TYPES.includes(type as ReportType) && !isProfessionalPreview) redirect("/reports");

  const context = await loadJourneyPageContext(searchParams);
  const child = context.child;
  const isExampleMode = context.dataSourceMode === "example-family";

  const [data, companionInsights, documentInput] = isExampleMode
    ? [buildExampleReportData(context.exampleFamilyId || "example-family", child, context.entries), [], null]
    : await Promise.all([
        getReportsData(child.id),
        getCompanionInsights(child.id),
        isSmartDocumentType(type) ? loadDocumentInput(child.id) : Promise.resolve(null),
      ]);
  if (!data) redirect("/reports");

  const content = isProfessionalPreview
    ? generateProfessionalReportContent(
        type as ProfessionalAudience,
        data.child,
        data.profile,
        data.checkins,
        data.debriefs,
        data.patterns,
      )
    : generateReportContent(
        type as ReportType,
        data.child,
        data.profile,
        data.checkins,
        data.debriefs,
        data.patterns,
        companionInsights,
        documentInput,
      );

  const qs = context.exampleFamilyId
    ? `?child=${child.id}&example=${context.exampleFamilyId}`
    : `?child=${child.id}`;
  const isSmartDoc = !isProfessionalPreview && isSmartDocumentType(type);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href={`/documents-hub${qs}`} className="text-sm font-semibold text-[var(--cc-teal)] hover:underline">
          ← Back to library
        </Link>
        {!isSmartDoc && <PrintButton />}
      </div>
      {isSmartDoc ? (
        <EditableReportDocument
          initialContent={content}
          reportType={type as ReportType}
          childId={child.id}
        />
      ) : (
        <ReportLayout content={content} reportType={type} />
      )}
    </div>
  );
}

function buildExampleReportData(exampleFamilyId: string, child: Child, entries: JourneyEntry[]) {
  const childProfile = buildExampleChildProfile(exampleFamilyId, child, entries);
  const checkins = buildExampleCheckins(exampleFamilyId, child.id, entries);
  const patterns = buildExamplePatterns(exampleFamilyId, child.id, entries);
  const debriefs: ParentDebrief[] = [];

  return {
    child,
    profile: childProfile,
    checkins,
    debriefs,
    patterns,
  };
}

function buildExampleChildProfile(exampleFamilyId: string, child: Child, entries: JourneyEntry[]): ChildProfile {
  const knownTriggers = entries
    .filter((entry) => entry.source === "memory" && entry.title === "Known trigger")
    .map((entry) => entry.summary)
    .slice(0, 5);
  const calming = entries
    .filter((entry) => entry.source === "memory" && entry.title === "Calming strategy")
    .map((entry) => entry.summary)
    .slice(0, 5);
  const successful = entries
    .filter((entry) => entry.source === "memory" && entry.title === "Successful strategy")
    .map((entry) => entry.summary)
    .slice(0, 5);
  const favourites = entries
    .filter((entry) => entry.source === "memory" && entry.title === "Favourite thing")
    .map((entry) => entry.summary)
    .slice(0, 5);

  return {
    id: `${exampleFamilyId}-profile`,
    child_id: child.id,
    family_id: child.family_id,
    strengths: child.interests || [],
    sensory_preferences: {},
    favourite_things: favourites,
    known_triggers: knownTriggers,
    calming_strategies: calming,
    support_network: [],
    notes: null,
    medical_history: null,
    medication: [],
    challenges: [],
    successful_strategies: successful,
    support_team: [],
    school_contacts: [],
    doctors: [],
    therapists: [],
    emergency_notes: null,
    created_at: child.created_at,
    updated_at: child.updated_at,
  };
}

function buildExampleCheckins(exampleFamilyId: string, childId: string, entries: JourneyEntry[]): DailyCheckin[] {
  const checkins: DailyCheckin[] = [];
  for (const entry of entries) {
    if (entry.source !== "checkin") continue;
    const sleepMatch = entry.summary.match(/sleep\s+(\d)\/5/i);
    const moodMatch = entry.summary.match(/mood\s+(\d)\/5/i);
    const schoolMatch = entry.summary.match(/school\s+(\d)\/5/i);
    const winsMatch = entry.summary.match(/wins:\s*([^•]+)/i);
    const challengesMatch = entry.summary.match(/challenges:\s*([^•]+)/i);

    checkins.push({
      id: `${exampleFamilyId}-${entry.id}`,
      child_id: childId,
      family_id: exampleFamilyId,
      user_id: "example-family",
      checkin_date: entry.date.slice(0, 10),
      day_type: null,
      sleep_quality: sleepMatch ? Number(sleepMatch[1]) : null,
      mood: moodMatch ? Number(moodMatch[1]) : null,
      energy: null,
      school_rating: schoolMatch ? Number(schoolMatch[1]) : null,
      anxiety: null,
      sensory_overload: null,
      demand_tolerance: null,
      appetite: null,
      social_battery: null,
      wins: winsMatch ? [winsMatch[1].trim()] : [],
      challenges: challengesMatch ? [challengesMatch[1].trim()] : [],
      notes: null,
      created_at: entry.date,
    });
    if (checkins.length >= 60) break;
  }

  return checkins;
}

function buildExamplePatterns(exampleFamilyId: string, childId: string, entries: JourneyEntry[]): PatternFinding[] {
  const counts: Record<string, number> = { school: 0, sleep: 0, health: 0 };
  for (const entry of entries) {
    if (entry.filter === "school") counts.school += 1;
    if (entry.filter === "sleep") counts.sleep += 1;
    if (entry.filter === "health") counts.health += 1;
  }

  const createdAt = new Date().toISOString();
  const patterns: PatternFinding[] = [];
  for (const [category, count] of Object.entries(counts)) {
    if (count < 2) continue;
    patterns.push({
      id: `${exampleFamilyId}-${category}-pattern`,
      child_id: childId,
      family_id: exampleFamilyId,
      category,
      title: `${category[0].toUpperCase()}${category.slice(1)} pattern`,
      description: `${category[0].toUpperCase()}${category.slice(1)}-related moments appeared ${count} times in recent journey history.`,
      confidence: 0.8,
      evidence: { count },
      is_active: true,
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  return patterns;
}
