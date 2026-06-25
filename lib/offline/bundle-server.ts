import { createClient } from "@/lib/supabase/server";
import type { SupportContact } from "@/lib/types/database";
import { generateReportContent } from "@/lib/services/report-generator";
import type { OfflineBundle } from "@/lib/offline/types";
import { OFFLINE_CACHE_VERSION } from "@/lib/offline/types";

export async function buildOfflineBundle(childId: string): Promise<OfflineBundle | null> {
  const supabase = await createClient();
  const { data: child } = await supabase.from("children").select("*").eq("id", childId).single();
  if (!child) return null;

  const { data: profile } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("child_id", childId)
    .maybeSingle();

  const { data: reports } = await supabase
    .from("generated_reports")
    .select("id, title, report_type, content")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(5);

  const name = child.nickname || child.first_name;
  const passport = generateReportContent("pda_passport", child, profile, [], [], []);

  return {
    version: OFFLINE_CACHE_VERSION,
    childId,
    childName: name,
    generatedAt: new Date().toISOString(),
    calmingStrategies: profile?.calming_strategies || [],
    emergencyNotes: profile?.emergency_notes,
    emergencyContacts: (profile?.doctors || []).map((d: SupportContact) => ({
      name: d.name,
      phone: d.phone,
      relationship: d.role,
    })),
    pdaPassport: { headline: passport.headline, sections: passport.sections },
    reports: (reports || []).map((r) => ({
      id: r.id,
      title: r.title,
      reportType: r.report_type,
      content: r.content,
    })),
  };
}
