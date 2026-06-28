import type { ReportType } from "@/lib/types/database";

export type LibraryReportMeta = {
  type: ReportType;
  label: string;
  description: string;
  emoji: string;
  tint: string;
  tag: string;
  tagTint: string;
};

export const LIBRARY_REPORTS: LibraryReportMeta[] = [
  {
    type: "teacher_guide",
    label: "Teacher Guide™",
    description: "Classroom strategies tailored to your child — ready for school conversations.",
    emoji: "🏫",
    tint: "from-[#F3EFFA]/80 to-[#FFFCF8]",
    tag: "School",
    tagTint: "bg-[#F3EFFA] text-[var(--cc-ink-soft)]",
  },
  {
    type: "weekly_summary",
    label: "Family Summary",
    description: "A warm narrative from your family's story — progress, challenges, and what helps.",
    emoji: "📖",
    tint: "from-[#E8F6F3]/80 to-[#FFFCF8]",
    tag: "Family",
    tagTint: "bg-[#E8F6F3] text-[var(--cc-teal-deep)]",
  },
  {
    type: "monthly_progress",
    label: "Monthly Progress™",
    description: "A calm month-at-a-glance — mood, anxiety, and progress.",
    emoji: "🌱",
    tint: "from-[#FBF4E6]/80 to-[#FFFCF8]",
    tag: "Progress",
    tagTint: "bg-[#FBF4E6] text-[#9A7B3A]",
  },
  {
    type: "parent_debrief",
    label: "Parent Debrief™ Summary",
    description: "Recent situations and calm, practical approaches.",
    emoji: "💬",
    tint: "from-[#FBEFEC]/60 to-[#FFFCF8]",
    tag: "Reflection",
    tagTint: "bg-[#FBEFEC] text-[#B87A6E]",
  },
  {
    type: "pda_passport",
    label: "PDA Passport™",
    description: "A shareable profile for teachers and carers.",
    emoji: "🛂",
    tint: "from-[#F0F5EE]/80 to-[#FFFCF8]",
    tag: "Share",
    tagTint: "bg-[#F0F5EE] text-[var(--cc-ink-soft)]",
  },
  {
    type: "school_support",
    label: "School Support Summary™",
    description: "Adjustments and patterns that affect school.",
    emoji: "🎒",
    tint: "from-[#F3EFFA]/70 to-[#FFFCF8]",
    tag: "School",
    tagTint: "bg-[#F3EFFA] text-[var(--cc-ink-soft)]",
  },
  {
    type: "therapist_summary",
    label: "Therapist Summary™",
    description: "Session-ready observations, trends, and discussion questions.",
    emoji: "🌿",
    tint: "from-[#E8F6F3]/70 to-[#FFFCF8]",
    tag: "Therapy",
    tagTint: "bg-[#E8F6F3] text-[var(--cc-teal-deep)]",
  },
  {
    type: "review_30d",
    label: "30-Day Review™",
    description: "Progress and patterns from the past month.",
    emoji: "📅",
    tint: "from-[#FBF4E6]/70 to-[#FFFCF8]",
    tag: "Review",
    tagTint: "bg-[#FBF4E6] text-[#9A7B3A]",
  },
  {
    type: "review_90d",
    label: "90-Day Review™",
    description: "Quarterly longitudinal insight.",
    emoji: "🗓️",
    tint: "from-[#F3EFFA]/60 to-[#FFFCF8]",
    tag: "Review",
    tagTint: "bg-[#F3EFFA] text-[var(--cc-ink-soft)]",
  },
  {
    type: "review_6mo",
    label: "6-Month Review™",
    description: "Half-year progress and helpful strategies.",
    emoji: "✨",
    tint: "from-[#E8F6F3]/60 to-[#FFFCF8]",
    tag: "Review",
    tagTint: "bg-[#E8F6F3] text-[var(--cc-teal-deep)]",
  },
  {
    type: "review_annual",
    label: "Annual Review™",
    description: "A full year compared only with your child's own history.",
    emoji: "🌟",
    tint: "from-[#FDF6E8]/80 to-[#FFFCF8]",
    tag: "Milestone",
    tagTint: "bg-[#FDF6E8] text-[#9A7B3A]",
  },
];

export function relativeUpdated(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Updated today";
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  return `Updated ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

export function audienceForReportType(type: string): string {
  if (type.includes("teacher") || type === "school_support") return "School team";
  if (type.includes("therapist")) return "Therapist";
  if (type === "pda_passport") return "Teachers & carers";
  if (type.includes("parent")) return "Family";
  return "Your support team";
}

export const FOLDER_ICONS: Record<string, string> = {
  medical: "🏥",
  ot: "🤲",
  speech: "💬",
  psychology: "🧠",
  school: "🏫",
  letters: "✉️",
  assessments: "📋",
  support_plans: "🌿",
  other: "📁",
};
