"use client";

import type { Family, FamilyAccessInvite, FamilyMember, Profile } from "@/lib/types/database";
import { updateFamilySettings, inviteCaregiver, updateNotificationPreferences } from "@/lib/actions/settings";
import { inviteSharedAccess } from "@/lib/actions/ecosystem";
import AccountDeletionForm from "@/components/settings/AccountDeletionForm";
import { actionCopy } from "@/lib/presentation/copy";
import {
  Button,
  FormSection,
  GlassCard,
  Input,
  Label,
  PremiumCard,
  SectionHeader,
  Select,
  StatusBadge,
  ds,
} from "@/components/design-system";

export default function SettingsForms({
  family,
  members,
  profile,
  invites,
}: {
  family: Family;
  members: FamilyMember[];
  profile: Profile;
  invites: FamilyAccessInvite[];
}) {
  const prefs = profile.notification_preferences;

  return (
    <div className="space-y-8">
      <PremiumCard padding="lg">
        <FormSection title="Family" description="Your family name, country, and timezone.">
          <form action={updateFamilySettings} className="space-y-4">
            <input type="hidden" name="familyId" value={family.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="familyName">Family name</Label>
                <Input id="familyName" name="familyName" defaultValue={family.name} required />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={family.country || ""} />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" name="timezone" defaultValue={family.timezone} />
              </div>
            </div>
            <Button type="submit">{actionCopy.saveFamily}</Button>
          </form>
        </FormSection>
      </PremiumCard>

      <PremiumCard padding="lg">
        <SectionHeader title="Caregivers" description="Connected parents and family members." />
        <ul className="mb-6 space-y-2">
          {members.map((m) => (
            <li key={m.id} className={`flex items-center justify-between rounded-2xl bg-[#FAF8F4] px-5 py-3 ${ds.hoverLift}`}>
              <span className="text-sm font-medium text-[#0F172A]">{m.invited_email || m.role}</span>
              <StatusBadge label={m.role} tone="brand" />
            </li>
          ))}
        </ul>
        <form action={inviteCaregiver} className="flex flex-wrap gap-3">
          <input type="hidden" name="familyId" value={family.id} />
          <Input name="email" type="email" placeholder="Caregiver email" className="min-w-[200px] flex-1" required />
          <Button type="submit" variant="secondary">
            Invite
          </Button>
        </form>
      </PremiumCard>

      <PremiumCard padding="lg">
        <FormSection
          title="Family sharing permissions"
          description="Invite grandparents, teachers, therapists, and support workers with role-based access."
        >
          <form action={inviteSharedAccess} className="grid gap-4 sm:grid-cols-2">
            <Input name="email" type="email" placeholder="Email address" required />
            <Select name="role">
              <option value="grandparent">Grandparent</option>
              <option value="teacher">Teacher</option>
              <option value="therapist">Therapist</option>
              <option value="support_worker">Support Worker</option>
              <option value="caregiver">Caregiver</option>
            </Select>
            <label className="flex items-center gap-3 rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
              <input type="checkbox" name="permTimeline" defaultChecked className="h-4 w-4 rounded text-[#14B8A6]" />
              Timeline
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
              <input type="checkbox" name="permReports" defaultChecked className="h-4 w-4 rounded text-[#14B8A6]" />
              Reports
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
              <input type="checkbox" name="permSchool" defaultChecked className="h-4 w-4 rounded text-[#14B8A6]" />
              School Hub
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
              <input type="checkbox" name="permTherapy" className="h-4 w-4 rounded text-[#14B8A6]" />
              Therapist Hub
            </label>
            <Button type="submit" className="sm:col-span-2">
              Send invite
            </Button>
          </form>
          {invites.length > 0 && (
            <div className="mt-6 space-y-2">
              {invites.slice(0, 6).map((invite) => (
                <div key={invite.id} className="flex items-center justify-between rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
                  <span className="text-[#0F172A]">{invite.invited_email}</span>
                  <StatusBadge label={`${invite.invited_role} · ${invite.status}`} tone="neutral" />
                </div>
              ))}
            </div>
          )}
        </FormSection>
      </PremiumCard>

      <PremiumCard padding="lg">
        <FormSection title="Notifications" description="Choose what Child Compass reminds you about.">
          <form action={updateNotificationPreferences} className="space-y-3">
            {[
              { name: "daily_checkin", label: "Daily check-in reminder", checked: prefs?.daily_checkin },
              { name: "weekly_summary", label: "Weekly summary", checked: prefs?.weekly_summary },
              { name: "new_insight", label: "New AI insight", checked: prefs?.new_insight },
              { name: "appointments", label: "Upcoming appointments", checked: prefs?.appointments },
              { name: "school_reminder", label: "School reminder", checked: prefs?.school_reminder },
            ].map((item) => (
              <label key={item.name} className="flex items-center justify-between rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
                <span className="text-[#0F172A]">{item.label}</span>
                <input type="checkbox" name={item.name} defaultChecked={item.checked !== false} className="h-5 w-5 rounded border-[#E8E4DC] text-[#14B8A6]" />
              </label>
            ))}
            <Button type="submit" className="mt-4">
              Save notification preferences
            </Button>
          </form>
        </FormSection>
      </PremiumCard>

      <GlassCard padding="lg">
        <SectionHeader title="Privacy & security" />
        <p className="text-sm leading-relaxed text-[#64748B]">
          Your family data is encrypted and isolated with row-level security. Only members of your family can access your
          children&apos;s profiles.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a href="/help/privacy" className="font-semibold text-[#14B8A6] hover:underline">
            Privacy Centre
          </a>
          <a href="/help/terms" className="font-semibold text-[#14B8A6] hover:underline">
            Terms of Service
          </a>
        </div>
      </GlassCard>

      <PremiumCard padding="lg">
        <SectionHeader title="Data controls" description="Export your family data or request account deletion." />
        <a href="/api/export" className={ds.btnSecondary}>
          Export family data
        </a>
      </PremiumCard>

      <AccountDeletionForm />
    </div>
  );
}
