import { cookies } from "next/headers";
import type { Child } from "@/lib/types/database";

export const SELECTED_CHILD_COOKIE = "cc_selected_child";

export async function getSelectedChildId(children: Child[]): Promise<string | null> {
  if (children.length === 0) return null;
  const cookieStore = await cookies();
  const selected = cookieStore.get(SELECTED_CHILD_COOKIE)?.value;
  if (selected && children.some((c) => c.id === selected)) {
    return selected;
  }
  return children[0].id;
}

export function resolveChildFromParam(
  children: Child[],
  childIdParam?: string | null,
): Child | null {
  if (children.length === 0) return null;
  if (childIdParam && children.some((c) => c.id === childIdParam)) {
    return children.find((c) => c.id === childIdParam) ?? null;
  }
  return children[0];
}

export async function resolveActiveChild(
  children: Child[],
  searchParams?: { child?: string },
): Promise<Child | null> {
  if (searchParams?.child) {
    return resolveChildFromParam(children, searchParams.child);
  }
  const id = await getSelectedChildId(children);
  return children.find((c) => c.id === id) ?? children[0] ?? null;
}

export function childQueryString(childId: string): string {
  return `?child=${childId}`;
}
