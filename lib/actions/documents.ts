"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  buildStoragePath,
  getBucketName,
  validateFile,
} from "@/lib/services/storage-service";

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("file") as File;
  const familyId = formData.get("familyId") as string;
  const childId = (formData.get("childId") as string) || null;
  const category = formData.get("category") as string;
  const title = formData.get("title") as string;

  const validation = validateFile(file);
  if (!validation.valid) return { error: validation.error };

  const path = buildStoragePath(familyId, childId, file.name);
  const bucket = getBucketName();

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}. Ensure the '${bucket}' storage bucket exists in Supabase.` };
  }

  const { error: dbError } = await supabase.from("documents").insert({
    family_id: familyId,
    child_id: childId,
    user_id: user.id,
    category,
    title: title || file.name,
    file_name: file.name,
    file_path: path,
    file_type: file.type,
    file_size: file.size,
  });

  if (dbError) return { error: dbError.message };

  redirect(childId ? `/documents?child=${childId}` : "/documents");
}

export async function deleteDocument(documentId: string, filePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: doc } = await supabase
    .from("documents")
    .select("id, family_id, file_path")
    .eq("id", documentId)
    .maybeSingle();

  if (!doc || doc.file_path !== filePath) {
    return { error: "Document not found" };
  }

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .eq("family_id", doc.family_id)
    .maybeSingle();

  if (!membership) {
    return { error: "Not authorised" };
  }

  await supabase.storage.from(getBucketName()).remove([filePath]);
  await supabase.from("documents").delete().eq("id", documentId);
}

export async function getDocumentUrl(filePath: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(getBucketName())
    .createSignedUrl(filePath, 3600);
  return data?.signedUrl || null;
}
