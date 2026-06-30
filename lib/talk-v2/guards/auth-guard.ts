import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type TalkV2AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string };
};

export async function requireTalkV2Auth(): Promise<TalkV2AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return {
    supabase,
    user: { id: user.id },
  };
}
