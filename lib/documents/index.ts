import { prepareFamilySummary } from "@/lib/documents/prepare-family-summary";
import { preparePassport } from "@/lib/documents/prepare-passport";
import { prepareTeacherGuide } from "@/lib/documents/prepare-teacher-guide";
import type { DocumentInput } from "@/lib/documents/document-input";
import type { CompanionInsight } from "@/lib/intelligence/insight-engine";
import type { ReportContent } from "@/lib/services/report-generator";

export const SMART_DOCUMENT_TYPES = ["pda_passport", "teacher_guide", "weekly_summary"] as const;
export type SmartDocumentType = (typeof SMART_DOCUMENT_TYPES)[number];

export function isSmartDocumentType(type: string): type is SmartDocumentType {
  return SMART_DOCUMENT_TYPES.includes(type as SmartDocumentType);
}

export function prepareSmartDocument(
  type: SmartDocumentType,
  input: DocumentInput,
  companionInsights: CompanionInsight[] = [],
): ReportContent {
  switch (type) {
    case "pda_passport":
      return preparePassport(input);
    case "teacher_guide":
      return prepareTeacherGuide(input);
    case "weekly_summary":
      return prepareFamilySummary(input, companionInsights);
  }
}

export { loadDocumentInput, type DocumentInput } from "@/lib/documents/document-input";
export { EMPTY_SECTION } from "@/lib/documents/constants";
