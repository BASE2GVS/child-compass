"use client";

import type { Profile } from "@/lib/types/database";
import { updateProfile } from "@/lib/actions/profile";
import { actionCopy } from "@/lib/presentation/copy";
import {
  Button,
  FormSection,
  GlassCard,
  Input,
  Label,
  PremiumCard,
  ProgressRing,
} from "@/components/design-system";

export default function ParentProfileForm({ profile }: { profile: Profile }) {
  const prefs = profile.notification_preferences;
  const emergency = profile.emergency_contact || {};
  const initials = (profile.full_name || "P").charAt(0).toUpperCase();

  return (
    <form action={updateProfile} className="space-y-8">
      <GlassCard padding="lg">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#14B8A6]/20 to-indigo-100/60 text-3xl font-bold text-[#14B8A6]">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Your profile</p>
            <p className="mt-1 text-2xl font-bold text-[#0F172A]">{profile.full_name || "Parent"}</p>
            <p className="text-sm text-[#64748B]">{profile.relationship_to_child || "Family member"}</p>
          </div>
          <div className="ml-auto">
            <ProgressRing label="Profile complete" value={profile.full_name ? 85 : 45} size={80} />
          </div>
        </div>
      </GlassCard>

      <PremiumCard padding="lg">
        <FormSection title="Personal details">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" defaultValue={profile.full_name || ""} />
            </div>
            <div>
              <Label htmlFor="relationship">Relationship to child</Label>
              <Input id="relationship" name="relationship" defaultValue={profile.relationship_to_child || ""} placeholder="e.g. Mother, Father, Guardian" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={profile.country || ""} />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" defaultValue={profile.timezone || "UTC"} />
            </div>
          </div>
        </FormSection>
      </PremiumCard>

      <PremiumCard padding="lg">
        <FormSection title="Emergency contact">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="emergencyName">Name</Label>
              <Input id="emergencyName" name="emergencyName" defaultValue={emergency.name || ""} />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Phone</Label>
              <Input id="emergencyPhone" name="emergencyPhone" defaultValue={emergency.phone || ""} />
            </div>
            <div>
              <Label htmlFor="emergencyRelationship">Relationship</Label>
              <Input id="emergencyRelationship" name="emergencyRelationship" defaultValue={emergency.relationship || ""} />
            </div>
          </div>
        </FormSection>
      </PremiumCard>

      <PremiumCard padding="lg">
        <FormSection title="Notification preferences">
          <div className="space-y-3">
            {[
              { name: "notifyCheckin", label: "Daily check-in reminder", checked: prefs?.daily_checkin },
              { name: "notifyWeekly", label: "Weekly summary", checked: prefs?.weekly_summary },
              { name: "notifyInsight", label: "New AI insight", checked: prefs?.new_insight },
              { name: "notifyAppointments", label: "Upcoming appointments", checked: prefs?.appointments },
              { name: "notifySchool", label: "School reminder", checked: prefs?.school_reminder },
            ].map((item) => (
              <label key={item.name} className="flex items-center justify-between rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
                <span className="text-[#0F172A]">{item.label}</span>
                <input type="checkbox" name={item.name} defaultChecked={item.checked !== false} className="h-5 w-5 rounded text-[#14B8A6]" />
              </label>
            ))}
          </div>
        </FormSection>
      </PremiumCard>

      <Button type="submit">{actionCopy.saveProfile}</Button>
    </form>
  );
}
