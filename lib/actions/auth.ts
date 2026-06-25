"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SELECTED_CHILD_COOKIE } from "@/lib/utils/child-selection";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/verify-email`,
    },
  });

  if (error) return { error: error.message };
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function resendVerificationEmail(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  if (!email) return;

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/verify-email`,
    },
  });

  if (error) return;
}

export async function completeOnboarding(data: {
  familyName: string;
  country: string;
  timezone: string;
  child: {
    photoUrl?: string;
    firstName: string;
    nickname?: string;
    dateOfBirth?: string;
    gender?: string;
    school?: string;
    grade?: string;
    diagnosis: string[];
    supportNeeds: string[];
    interests: string[];
    favouriteActivities: string[];
    strengths?: string[];
    knownTriggers?: string[];
  };
  inviteEmail?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: result, error } = await supabase.rpc("complete_family_onboarding", {
    payload: {
      familyName: data.familyName,
      country: data.country,
      timezone: data.timezone,
      inviteEmail: data.inviteEmail || null,
      child: {
        photoUrl: data.child.photoUrl || null,
        firstName: data.child.firstName,
        nickname: data.child.nickname || null,
        dateOfBirth: data.child.dateOfBirth || null,
        gender: data.child.gender || null,
        school: data.child.school || null,
        grade: data.child.grade || null,
        diagnosis: data.child.diagnosis,
        supportNeeds: data.child.supportNeeds,
        interests: data.child.interests,
        favouriteActivities: data.child.favouriteActivities,
        strengths: data.child.strengths || [],
        knownTriggers: data.child.knownTriggers || [],
      },
    },
  });

  if (error) return { error: error.message };

  const familyId = (result as { familyId?: string } | null)?.familyId;
  const childId = (result as { childId?: string } | null)?.childId;
  if (!childId) return { error: "Onboarding did not return a child id" };

  if (familyId) {
    const { ensureFamilySubscription } = await import("@/lib/commercial/subscription-service");
    await ensureFamilySubscription(familyId);
    const { trackProductEvent } = await import("@/lib/pilot/product-analytics");
    await trackProductEvent({ event: "onboarding_completed", familyId });
  }

  const cookieStore = await cookies();
  cookieStore.set(SELECTED_CHILD_COOKIE, childId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return { success: true, childId };
}

export async function selectChild(childId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SELECTED_CHILD_COOKIE, childId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
