import { EMPTY_SECTION } from "@/lib/documents/constants";
import type { SupportContact } from "@/lib/types/database";

export function bullets(items: string[]): string[] {
  const filtered = items.map((s) => s.trim()).filter(Boolean);
  return filtered.length > 0 ? filtered : [EMPTY_SECTION];
}

export function paragraph(text: string | null | undefined): string {
  const trimmed = text?.trim();
  return trimmed ? trimmed : EMPTY_SECTION;
}

export function formatContacts(contacts: SupportContact[]): string[] {
  return contacts.map((c) => {
    const parts = [c.name];
    if (c.role) parts.push(c.role);
    if (c.phone) parts.push(c.phone);
    return parts.join(" · ");
  });
}

export function childAgeYears(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 86400000));
}

export function uniqueStrings(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
}
