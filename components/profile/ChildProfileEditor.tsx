"use client";

import type { Child, ChildProfile } from "@/lib/types/database";
import { updateChildProfile } from "@/lib/actions/profile";
import AppCard from "@/components/app/AppCard";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm outline-none focus:border-[#14B8A6]";

function listField(name: string, label: string, defaultValue: string) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        defaultValue={defaultValue}
        placeholder="One per line or comma-separated"
        className={inputClass}
      />
    </div>
  );
}

export default function ChildProfileEditor({
  child,
  profile,
}: {
  child: Child;
  profile: ChildProfile | null;
}) {
  const contactsFormat = (items: { name: string; role?: string; phone?: string }[]) =>
    items.map((c) => [c.name, c.role, c.phone].filter(Boolean).join(" | ")).join("\n");

  return (
    <form action={updateChildProfile.bind(null, child.id)} className="space-y-6">
      <AppCard>
        <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Basic information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">First name</label>
            <input name="firstName" defaultValue={child.first_name} className={inputClass} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Nickname</label>
            <input name="nickname" defaultValue={child.nickname || ""} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Date of birth</label>
            <input name="dateOfBirth" type="date" defaultValue={child.date_of_birth || ""} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Gender</label>
            <input name="gender" defaultValue={child.gender || ""} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">School</label>
            <input name="school" defaultValue={child.school || ""} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Grade</label>
            <input name="grade" defaultValue={child.grade || ""} className={inputClass} />
          </div>
        </div>
      </AppCard>

      <AppCard>
        <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Medical &amp; diagnosis</h2>
        <div className="grid gap-5">
          {listField("diagnosis", "Diagnoses", child.diagnosis?.join("\n") || "")}
          {listField("medication", "Medication", profile?.medication?.join("\n") || "")}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Medical history</label>
            <textarea name="medicalHistory" rows={3} defaultValue={profile?.medical_history || ""} className={inputClass} />
          </div>
        </div>
      </AppCard>

      <AppCard>
        <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Strengths &amp; challenges</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {listField("strengths", "Strengths", profile?.strengths?.join("\n") || "")}
          {listField("challenges", "Challenges", profile?.challenges?.join("\n") || "")}
          {listField("interests", "Interests", child.interests?.join("\n") || "")}
          {listField("favouriteActivities", "Favourite activities", child.favourite_activities?.join("\n") || "")}
          {listField("favouriteThings", "Favourite things", profile?.favourite_things?.join("\n") || "")}
        </div>
      </AppCard>

      <AppCard>
        <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Sensory &amp; regulation</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {listField("knownTriggers", "Known triggers", profile?.known_triggers?.join("\n") || "")}
          {listField("calmingStrategies", "Calming strategies", profile?.calming_strategies?.join("\n") || "")}
          {listField("successfulStrategies", "Successful strategies", profile?.successful_strategies?.join("\n") || "")}
          {listField("supportNeeds", "Support needs", child.support_needs?.join("\n") || "")}
        </div>
      </AppCard>

      <AppCard>
        <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Support team</h2>
        <div className="grid gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">School contacts (name | role | phone)</label>
            <textarea name="schoolContacts" rows={3} defaultValue={contactsFormat(profile?.school_contacts || [])} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Doctors</label>
            <textarea name="doctors" rows={2} defaultValue={contactsFormat(profile?.doctors || [])} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Therapists</label>
            <textarea name="therapists" rows={2} defaultValue={contactsFormat(profile?.therapists || [])} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Emergency notes</label>
            <textarea name="emergencyNotes" rows={3} defaultValue={profile?.emergency_notes || ""} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">General notes</label>
            <textarea name="notes" rows={3} defaultValue={profile?.notes || ""} className={inputClass} />
          </div>
        </div>
      </AppCard>

      <button
        type="submit"
        className="w-full rounded-2xl bg-[#14B8A6] py-4 text-base font-semibold text-white hover:bg-[#0D9488]"
      >
        Save Profile
      </button>
    </form>
  );
}
