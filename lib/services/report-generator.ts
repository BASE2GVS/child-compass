import type { Child, ChildProfile, DailyCheckin, ParentDebrief, PatternFinding, ReportType } from "@/lib/types/database";
import { compareWeeklyRegulation } from "@/lib/ai/debrief-engine";
import { buildWeeklyFamilyReview } from "@/lib/intelligence/weekly-review";
import { buildFamilyMemory } from "@/lib/intelligence/memory";
import { explainConfidence, confidenceFromDataDepth } from "@/lib/intelligence/confidence";
import {
  generateLongitudinalReview,
  type LongitudinalPeriod,
} from "@/lib/intelligence/longitudinal";
import {
  insightDisplayWithSupport,
  insightsForReport,
  type CompanionInsight,
} from "@/lib/intelligence/insight-engine";
import {
  isSmartDocumentType,
  prepareSmartDocument,
  type DocumentInput,
} from "@/lib/documents";

export type ReportContent = {
  headline: string;
  sections: { title: string; body: string | string[] }[];
  generatedAt: string;
  childName: string;
};

export function generateReportContent(
  type: ReportType,
  child: Child,
  profile: ChildProfile | null,
  checkins: DailyCheckin[],
  debriefs: ParentDebrief[],
  patterns: PatternFinding[],
  companionInsights: CompanionInsight[] = [],
  documentInput?: DocumentInput | null,
): ReportContent {
  const name = child.nickname || child.first_name;
  const generatedAt = new Date().toISOString();

  if (documentInput && isSmartDocumentType(type)) {
    const content = prepareSmartDocument(type, documentInput, companionInsights);
    return attachCompanionInsights(content, type, companionInsights);
  }

  let content: ReportContent;

  switch (type) {
    case "teacher_guide":
      content = buildTeacherGuide(name, child, profile, checkins, patterns);
      break;
    case "pda_passport":
      content = buildPDAPassport(name, child, profile);
      break;
    case "school_support":
      content = buildSchoolSupport(name, child, profile, patterns);
      break;
    case "weekly_summary":
      content = buildWeeklySummary(name, checkins, patterns, profile, debriefs);
      break;
    case "monthly_progress":
      content = buildMonthlyProgress(name, checkins, debriefs, patterns);
      break;
    case "parent_debrief":
      content = buildDebriefSummary(name, debriefs);
      break;
    case "therapist_summary":
      content = buildTherapistSummary(name, checkins, debriefs, patterns);
      break;
    case "review_30d":
      content = buildLongitudinalReport(name, checkins, patterns, "30d");
      break;
    case "review_90d":
      content = buildLongitudinalReport(name, checkins, patterns, "90d");
      break;
    case "review_6mo":
      content = buildLongitudinalReport(name, checkins, patterns, "180d");
      break;
    case "review_annual":
      content = buildLongitudinalReport(name, checkins, patterns, "365d");
      break;
    default:
      content = { headline: `${name}'s Report`, sections: [], generatedAt, childName: name };
  }

  return attachCompanionInsights(content, type, companionInsights);
}

export type ProfessionalAudience = "occupational_therapist" | "speech_therapist" | "psychologist" | "pediatrician";

export function generateProfessionalReportContent(
  audience: ProfessionalAudience,
  child: Child,
  profile: ChildProfile | null,
  checkins: DailyCheckin[],
  debriefs: ParentDebrief[],
  patterns: PatternFinding[],
): ReportContent {
  const name = child.nickname || child.first_name;
  const base = buildTherapistSummary(name, checkins, debriefs, patterns);

  const focusLine: Record<ProfessionalAudience, string> = {
    occupational_therapist: "Focus: participation, sensory load, transitions, daily routines.",
    speech_therapist: "Focus: communication load, expressive/receptive demands, social language contexts.",
    psychologist: "Focus: emotional regulation, anxiety patterns, coping strategies, family stressors.",
    pediatrician: "Focus: overall wellbeing, sleep, appetite, appointments, and broader health patterns.",
  };

  const audienceTitle: Record<ProfessionalAudience, string> = {
    occupational_therapist: `Occupational Therapy Summary™ — ${name}`,
    speech_therapist: `Speech Therapy Summary™ — ${name}`,
    psychologist: `Psychology Summary™ — ${name}`,
    pediatrician: `Pediatrician Summary™ — ${name}`,
  };

  const profileFacts: string[] = [];
  if (child.diagnosis?.length) profileFacts.push(`Diagnosis profile: ${child.diagnosis.join(", ")}`);
  if (child.support_needs?.length) profileFacts.push(`Support needs: ${child.support_needs.join(", ")}`);
  if (profile?.known_triggers?.length) profileFacts.push(`Known triggers: ${profile.known_triggers.slice(0, 4).join("; ")}`);
  if (profile?.calming_strategies?.length) profileFacts.push(`Calming strategies: ${profile.calming_strategies.slice(0, 4).join("; ")}`);
  if (profile?.successful_strategies?.length) profileFacts.push(`Successful strategies: ${profile.successful_strategies.slice(0, 4).join("; ")}`);

  return {
    ...base,
    headline: audienceTitle[audience],
    generatedAt: new Date().toISOString(),
    sections: [
      {
        title: "Audience focus",
        body: [focusLine[audience]],
      },
      {
        title: "Grounded profile context",
        body: profileFacts.length ? profileFacts : ["Profile context is limited; this report uses only recorded journey data."],
      },
      ...base.sections,
    ],
  };
}

function companionInsightSection(
  insights: CompanionInsight[],
  reportType: string,
): { title: string; body: string[] } | null {
  const relevant = insightsForReport(insights, reportType);
  if (!relevant.length) return null;
  return {
    title: "What we're noticing",
    body: relevant.map(insightDisplayWithSupport),
  };
}

function attachCompanionInsights(
  content: ReportContent,
  reportType: string,
  insights: CompanionInsight[],
): ReportContent {
  const insightTypes: ReportType[] = [
    "teacher_guide",
    "pda_passport",
    "school_support",
    "therapist_summary",
    "monthly_progress",
  ];
  if (!insightTypes.includes(reportType as ReportType)) return content;

  const section = companionInsightSection(insights, reportType);
  if (!section) return content;

  return {
    ...content,
    sections: [content.sections[0], section, ...content.sections.slice(1)].filter(Boolean),
  };
}

function buildTeacherGuide(
  name: string,
  child: Child,
  profile: ChildProfile | null,
  checkins: DailyCheckin[],
  patterns: PatternFinding[],
): ReportContent {
  const recentWins = checkins.slice(0, 7).flatMap((c) => c.wins || []).slice(0, 4);
  const schoolPatterns = patterns.filter((p) => p.category === "school" || p.category === "sleep");
  const sensoryPatterns = patterns.filter((p) => p.category === "sensory");
  const strengths =
    profile?.strengths?.length ? profile.strengths : child.interests?.length ? child.interests : [];

  return {
    headline: `Teacher Guide™ — ${name}`,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      {
        title: "About",
        body: [
          child.school ? `School: ${child.school}` : "",
          child.grade ? `Grade: ${child.grade}` : "",
          child.diagnosis?.length ? `Profile: ${child.diagnosis.join(", ")}` : "",
          child.support_needs?.length ? `Support needs: ${child.support_needs.join(", ")}` : "",
        ].filter(Boolean),
      },
      {
        title: "Observed strengths",
        body: recentWins.length
          ? recentWins
          : strengths.length
            ? strengths
            : ["Strengths will appear as families log wins and profile details."],
      },
      {
        title: "Helpful strategies",
        body: [
          "Approach with curiosity, not correction",
          "Allow movement breaks without drawing attention",
          "Avoid public demands — use private, low-pressure communication",
          "Provide advance notice for transitions and changes",
          "Offer choices rather than direct instructions where possible",
          ...(profile?.calming_strategies || []),
          ...(profile?.successful_strategies || []),
        ],
      },
      {
        title: "Potential triggers",
        body: [
          ...(profile?.known_triggers || []),
          ...schoolPatterns.map((p) => p.title),
          ...sensoryPatterns.map((p) => p.title),
        ].filter(Boolean).length
          ? [
              ...(profile?.known_triggers || []),
              ...schoolPatterns.map((p) => p.description),
              ...sensoryPatterns.map((p) => p.description),
            ]
          : ["Add triggers in the child profile to personalise this guide"],
      },
      {
        title: "Suggested classroom supports",
        body: [
          "Visual schedule for transitions",
          "Sensory breaks as needed",
          "Reduced demand language",
          "Quiet space access",
          "Advance notice for changes",
          ...(profile?.successful_strategies || []),
        ],
      },
      {
        title: "Connection strategies",
        body: child.interests?.length
          ? [`Connect through interests: ${child.interests.join(", ")}`]
          : ["Add interests to personalise connection strategies"],
      },
    ],
  };
}

function buildPDAPassport(name: string, child: Child, profile: ChildProfile | null): ReportContent {
  return {
    headline: `PDA Passport™ — ${name}`,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      {
        title: "What helps",
        body: [
          "Advance notice of changes",
          "Choices instead of demands",
          "Humour and indirect language",
          "Recovery time after overwhelm",
          ...(child.support_needs || []),
          ...(profile?.calming_strategies || []),
        ],
      },
      {
        title: "What to avoid",
        body: [
          "Surprise demands",
          "Countdowns and ultimatums",
          "Public correction",
          "Rushing transitions",
          ...(profile?.known_triggers || []).slice(0, 4),
        ],
      },
      {
        title: "Understanding profile",
        body: child.diagnosis?.length ? child.diagnosis.join(" · ") : "See child profile for details",
      },
      {
        title: "Emergency notes",
        body: profile?.emergency_notes || "No emergency notes recorded",
      },
    ],
  };
}

function buildSchoolSupport(
  name: string,
  child: Child,
  profile: ChildProfile | null,
  patterns: PatternFinding[],
): ReportContent {
  const schoolPatterns = patterns.filter((p) => p.category === "school" || p.category === "sleep");
  return {
    headline: `School Support Summary™ — ${name}`,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      { title: "School", body: child.school || "Not specified" },
      { title: "Support needs", body: child.support_needs?.length ? child.support_needs : ["Not specified"] },
      {
        title: "Recommended classroom adjustments",
        body: [
          "Visual schedule for transitions",
          "Sensory breaks as needed",
          "Reduced demand language",
          "Quiet space access",
          ...(profile?.successful_strategies || []),
        ],
      },
      {
        title: "Patterns affecting school",
        body: schoolPatterns.length
          ? schoolPatterns.map((p) => p.description)
          : ["Patterns will appear as check-ins accumulate"],
      },
      {
        title: "School contacts",
        body: profile?.school_contacts?.length
          ? profile.school_contacts.map((c) => `${c.name}${c.role ? ` (${c.role})` : ""}`)
          : ["Add school contacts in the child profile"],
      },
    ],
  };
}

function buildWeeklySummary(
  name: string,
  checkins: DailyCheckin[],
  patterns: PatternFinding[],
  profile: ChildProfile | null,
  debriefs: ParentDebrief[],
): ReportContent {
  const weekCheckins = checkins.slice(0, 7);
  const memories = buildFamilyMemory({
    profile,
    checkins,
    debriefs,
    timeline: [],
    patterns,
  });
  const review = buildWeeklyFamilyReview(name, weekCheckins, patterns, memories);
  const trend = compareWeeklyRegulation(weekCheckins);

  return {
    headline: review.headline,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      { title: "Biggest success", body: review.biggestSuccess },
      { title: "Biggest challenge", body: review.biggestChallenge },
      { title: "Progress made", body: review.progressMade },
      { title: "Regulation trend", body: `${trend.trend}. ${trend.message}` },
      {
        title: "Patterns discovered",
        body: review.patternsDiscovered,
      },
      {
        title: "Recommendations for next week",
        body: review.recommendationsNextWeek,
      },
      { title: "Celebration", body: review.celebration },
    ],
  };
}

function buildMonthlyProgress(
  name: string,
  checkins: DailyCheckin[],
  debriefs: ParentDebrief[],
  patterns: PatternFinding[],
): ReportContent {
  const monthCheckins = checkins.slice(0, 30);
  const avgMood =
    monthCheckins.reduce((s, c) => s + (c.mood ?? 3), 0) / (monthCheckins.length || 1);
  const avgAnxiety =
    monthCheckins.reduce((s, c) => s + (c.anxiety ?? 3), 0) / (monthCheckins.length || 1);
  const depth = confidenceFromDataDepth({
    checkinCount: monthCheckins.length,
    patternCount: patterns.length,
    hasTodayCheckin: monthCheckins.length > 0,
    memoryCount: 0,
  });

  return {
    headline: `Monthly Progress™ — ${name}`,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      {
        title: "Month at a glance",
        body: `${monthCheckins.length} check-ins · ${debriefs.length} debriefs · ${patterns.length} patterns identified`,
      },
      {
        title: "Average mood",
        body: `${avgMood.toFixed(1)} / 5`,
      },
      {
        title: "Average anxiety",
        body: `${avgAnxiety.toFixed(1)} / 5`,
      },
      {
        title: "Key patterns",
        body: patterns.length
          ? patterns.map((p) => `${p.title}: ${p.description}`)
          : ["Patterns emerge with consistent check-ins"],
      },
      {
        title: "Progress note",
        body:
          avgMood >= 3.5
            ? `${name} has had generally positive mood this month.`
            : `${name} has faced some challenging days. Your consistent tracking is helping identify what supports them.`,
      },
      {
        title: "Confidence",
        body: explainConfidence(depth.score, depth.factors),
      },
    ],
  };
}

function buildDebriefSummary(name: string, debriefs: ParentDebrief[]): ReportContent {
  const recent = debriefs.slice(0, 5);
  return {
    headline: `Parent Debrief™ Summary — ${name}`,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      {
        title: "Recent situations",
        body: recent.map((d) => d.parent_message.slice(0, 120)),
      },
      {
        title: "Common triggers identified",
        body: [...new Set(recent.map((d) => d.likely_trigger).filter(Boolean) as string[])],
      },
      {
        title: "Recommended approaches",
        body: recent.map((d) => d.suggested_response).filter(Boolean) as string[],
      },
    ],
  };
}

function buildTherapistSummary(
  name: string,
  checkins: DailyCheckin[],
  debriefs: ParentDebrief[],
  patterns: PatternFinding[],
): ReportContent {
  const recent = checkins.slice(0, 14);
  const trend = compareWeeklyRegulation(recent.slice(0, 7));
  const avgMood = recent.reduce((s, c) => s + (c.mood ?? 3), 0) / (recent.length || 1);
  const avgAnxiety = recent.reduce((s, c) => s + (c.anxiety ?? 3), 0) / (recent.length || 1);
  const recentTriggers = [
    ...new Set(debriefs.slice(0, 5).map((d) => d.likely_trigger).filter(Boolean) as string[]),
  ];

  const questions = [
    recentTriggers.length
      ? `How might we support ${name} around: ${recentTriggers[0].slice(0, 80)}?`
      : `What professional observations align with parent-reported regulation trends?`,
    patterns[0] ? `Does the pattern "${patterns[0].title}" match your clinical view?` : null,
    trend.trend === "declining"
      ? "Are there adjustments to home or school routines worth exploring together?"
      : "What small wins should we build on in the next session?",
  ].filter(Boolean) as string[];

  const depth = confidenceFromDataDepth({
    checkinCount: recent.length,
    patternCount: patterns.length,
    hasTodayCheckin: Boolean(recent[0]),
    memoryCount: 0,
  });

  return {
    headline: `Therapist Summary™ — ${name}`,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      {
        title: "Recent observations",
        body: [
          `${recent.length} check-ins in the past two weeks`,
          `Average mood: ${avgMood.toFixed(1)}/5`,
          `Average anxiety: ${avgAnxiety.toFixed(1)}/5`,
          ...recent.slice(0, 3).flatMap((c) => c.challenges || []).slice(0, 3),
        ].filter(Boolean),
      },
      {
        title: "Behaviour trends",
        body: [
          trend.message,
          ...patterns.slice(0, 3).map((p) => `${p.title}: ${p.description}`),
        ],
      },
      {
        title: "Questions for discussion",
        body: questions,
      },
      {
        title: "Progress since last visit",
        body:
          trend.trend === "improving"
            ? `Regulation appears to be gently improving. Parents report wins including: ${recent.flatMap((c) => c.wins || []).slice(0, 2).join("; ") || "steady engagement with daily tracking"}.`
            : trend.trend === "stable"
              ? `Regulation has been relatively steady. Parents continue tracking to understand ${name}'s rhythms.`
              : `A more challenging fortnight — parents are using debrief guidance and pattern insights to adjust support.`,
      },
      {
        title: "Data confidence",
        body: explainConfidence(depth.score, depth.factors),
      },
    ],
  };
}

export function getReportTitle(type: ReportType, childName: string): string {
  const titles: Record<ReportType, string> = {
    parent_debrief: `Parent Debrief™ Summary — ${childName}`,
    teacher_guide: `Teacher Guide™ — ${childName}`,
    pda_passport: `Child Passport — ${childName}`,
    school_support: `School Support Summary™ — ${childName}`,
    weekly_summary: `Family Summary — ${childName}`,
    monthly_progress: `Monthly Progress™ — ${childName}`,
    therapist_summary: `Therapist Summary™ — ${childName}`,
    review_30d: `30-Day Review™ — ${childName}`,
    review_90d: `90-Day Review™ — ${childName}`,
    review_6mo: `6-Month Review™ — ${childName}`,
    review_annual: `Annual Review™ — ${childName}`,
  };
  return titles[type];
}

function buildLongitudinalReport(
  name: string,
  checkins: DailyCheckin[],
  patterns: PatternFinding[],
  period: LongitudinalPeriod,
): ReportContent {
  const review = generateLongitudinalReview(name, checkins, patterns, period);
  return {
    headline: review.headline,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      { title: "Progress", body: review.progress },
      { title: "Recurring challenges", body: review.recurringChallenges },
      { title: "Helpful strategies", body: review.helpfulStrategies },
      { title: "Changes over time", body: review.changesOverTime },
      { title: "How we compare", body: review.comparisonNote },
    ],
  };
}
