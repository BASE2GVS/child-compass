"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { uploadDocument } from "@/lib/actions/documents";
import { DOCUMENT_CATEGORIES, formatFileSize } from "@/lib/services/storage-service";
import { FOLDER_ICONS } from "@/components/library/library-reports";
import type { DocumentRecord } from "@/lib/types/database";
import { Banner, Button, Input, Label, Select } from "@/components/design-system";
import { SecondaryCard } from "@/components/framework";
import { typeScale } from "@/components/design-system/tokens/typography";

type LibraryDocumentsSectionProps = {
  documents: DocumentRecord[];
  familyId: string;
  childId: string;
  childName: string;
};

export default function LibraryDocumentsSection({
  documents,
  familyId,
  childId,
  childName,
}: LibraryDocumentsSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const folders = useMemo(() => {
    const map = new Map<string, DocumentRecord[]>();
    for (const doc of documents) {
      const list = map.get(doc.category) ?? [];
      list.push(doc);
      map.set(doc.category, list);
    }
    return Array.from(map.entries()).map(([category, docs]) => ({
      category,
      label: DOCUMENT_CATEGORIES.find((c) => c.value === category)?.label ?? category,
      icon: FOLDER_ICONS[category] ?? "📁",
      docs,
    }));
  }, [documents]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("familyId", familyId);
    formData.set("childId", childId);
    const result = await uploadDocument(formData);
    if (result?.error) {
      setError(result.error);
      setUploading(false);
    }
  }

  return (
    <section aria-labelledby="documents-heading" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="documents-heading" className={typeScale.heading}>
            Documents
          </h2>
          <p className={`mt-2 ${typeScale.caption}`}>
            Letters, assessments, and files — organised like a family bookshelf.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => setShowUpload(!showUpload)}>
          + Add to shelf
        </Button>
      </div>

      {showUpload && (
        <form onSubmit={handleUpload}>
          <SecondaryCard padding="lg" className="cc-fw-form">
            <p className={`cc-fw-form-span-2 ${typeScale.subheading}`}>Add something to the shelf</p>
            <div className="cc-fw-form-span-2">
              <Label htmlFor="docTitle">Title</Label>
              <Input id="docTitle" name="title" required placeholder="What is this?" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="docCategory">Folder</Label>
              <Select id="docCategory" name="category" required className="mt-2">
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="cc-fw-form-span-2">
              <Label htmlFor="docFile">File</Label>
              <input
                id="docFile"
                name="file"
                type="file"
                required
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.txt"
                className="mt-2 w-full text-sm text-[var(--cc-ink-muted)]"
              />
            </div>
            {error && (
              <div className="cc-fw-form-span-2">
                <Banner variant="warning">{error}</Banner>
              </div>
            )}
            <Button type="submit" variant="pill" disabled={uploading} className="cc-fw-form-span-2">
              {uploading ? "Saving…" : "Add to library"}
            </Button>
          </SecondaryCard>
        </form>
      )}

      {folders.length === 0 ? (
        <SecondaryCard padding="lg" className="text-center">
          <p className="text-4xl" aria-hidden>
            📂
          </p>
          <p className={`mt-4 ${typeScale.body}`}>
            No documents on the shelf yet — add school letters, assessments, or medical notes for {childName}.
          </p>
        </SecondaryCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {folders.map((folder) => (
            <SecondaryCard key={folder.category} padding="md" className="overflow-hidden">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  {folder.icon}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[var(--cc-ink)]">{folder.label}</h3>
                  <p className="text-xs text-[var(--cc-ink-faint)]">
                    {folder.docs.length} {folder.docs.length === 1 ? "document" : "documents"}
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-3">
                {folder.docs.slice(0, 4).map((doc) => (
                  <li
                    key={doc.id}
                    className="rounded-xl bg-white/70 px-4 py-3 shadow-sm"
                  >
                    <p className="font-medium text-[var(--cc-ink)]">{doc.title}</p>
                    <p className="mt-1 text-xs text-[var(--cc-ink-faint)]">
                      {formatFileSize(doc.file_size)} ·{" "}
                      {new Date(doc.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </li>
                ))}
              </ul>
              {folder.docs.length > 4 && (
                <Link
                  href={`/documents?child=${childId}`}
                  className="mt-4 inline-block text-sm font-semibold text-[var(--cc-teal)]"
                >
                  View all in folder →
                </Link>
              )}
            </SecondaryCard>
          ))}
        </div>
      )}
    </section>
  );
}
