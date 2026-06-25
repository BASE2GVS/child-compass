const BUCKET = "family-documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File must be under 10MB" };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "File type not supported. Use images, PDF, DOCX, or TXT." };
  }
  return { valid: true };
}

export function buildStoragePath(familyId: string, childId: string | null, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const prefix = childId ? `${familyId}/${childId}` : `${familyId}/family`;
  return `${prefix}/${Date.now()}_${safeName}`;
}

export function getBucketName(): string {
  return BUCKET;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const DOCUMENT_CATEGORIES = [
  { value: "medical", label: "Medical Reports" },
  { value: "ot", label: "OT Reports" },
  { value: "speech", label: "Speech Therapy" },
  { value: "psychology", label: "Psychology Reports" },
  { value: "school", label: "School Reports" },
  { value: "letters", label: "Letters" },
  { value: "assessments", label: "Assessments" },
  { value: "support_plans", label: "Support Plans" },
  { value: "other", label: "Other" },
] as const;
