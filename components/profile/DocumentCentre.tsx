"use client";

import { useMemo, useState } from "react";
import { uploadDocument } from "@/lib/actions/documents";
import { DOCUMENT_CATEGORIES, formatFileSize } from "@/lib/services/storage-service";
import type { DocumentRecord } from "@/lib/types/database";
import {
  Button,
  EmptyState,
  FormSection,
  GlassCard,
  Input,
  Label,
  PremiumCard,
  ProgressBar,
  Select,
  StatusBadge,
  ds,
} from "@/components/design-system";

export default function DocumentCentre({
  documents,
  familyId,
  childId,
  childName,
}: {
  documents: DocumentRecord[];
  familyId: string;
  childId?: string;
  childName?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dragOver, setDragOver] = useState(false);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !search ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.file_name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [documents, search, categoryFilter]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setProgress(30);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("familyId", familyId);
    if (childId) formData.set("childId", childId);

    setProgress(60);
    const result = await uploadDocument(formData);
    if (result?.error) {
      setError(result.error);
      setUploading(false);
      setProgress(0);
      return;
    }
    setProgress(100);
  }

  return (
    <div className="space-y-8">
      <PremiumCard padding="lg">
        <FormSection
          title="Upload document"
          description="Drag and drop or browse — medical reports, assessments, and school letters."
        >
          <form
            onSubmit={handleUpload}
            className={`space-y-4 rounded-[24px] border-2 border-dashed p-8 transition-colors ${
              dragOver ? "border-[#14B8A6] bg-[#14B8A6]/5" : "border-[#E8E4DC] bg-[#FAF8F4]/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={() => setDragOver(false)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="docTitle">Title</Label>
                <Input id="docTitle" name="title" placeholder="Document title" />
              </div>
              <div>
                <Label htmlFor="docCategory">Category</Label>
                <Select id="docCategory" name="category" required>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="docFile">File (images, PDF, DOCX, TXT — max 10MB)</Label>
              <Input
                id="docFile"
                name="file"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.txt"
                required
                className="file:mr-4 file:rounded-xl file:border-0 file:bg-[#14B8A6] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            </div>
            {uploading && <ProgressBar label="Uploading" value={progress} />}
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </form>
        </FormSection>
      </PremiumCard>

      {documents.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            aria-label="Search documents"
          />
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="max-w-xs" aria-label="Filter by category">
            <option value="all">All categories</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {documents.length === 0 ? (
        <EmptyState
          illustration="documents"
          title="No documents yet"
          description={`Upload medical reports, school letters, and assessments${childName ? ` for ${childName}` : ""}.`}
          why="Secure document storage helps you share context with schools, therapists, and your support team."
          actionLabel="Upload your first document"
          actionHref={childId ? `/documents?child=${childId}` : "/documents"}
        />
      ) : filtered.length === 0 ? (
        <GlassCard className="py-12 text-center text-sm text-[#64748B]">No documents match your search.</GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <GlassCard key={doc.id} padding="sm" className={ds.hoverLift}>
              <div className="mb-3 flex h-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-3xl text-white/90">
                📄
              </div>
              <StatusBadge label={doc.category.replace("_", " ")} tone="brand" />
              <p className="mt-2 font-bold text-[#0F172A]">{doc.title}</p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                {doc.file_name} · {formatFileSize(doc.file_size)}
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                {new Date(doc.created_at).toLocaleDateString("en-GB")}
              </p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
