"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { completeOnboarding } from "@/lib/actions/auth";
import { WELCOME_ONE_LINER } from "@/lib/first-time/copy";
import AppCard from "@/components/app/AppCard";
import { createClient } from "@/lib/supabase/client";

const STEPS = ["Welcome", "Family", "Child", "Invite", "Finish"] as const;
const AUTOSAVE_KEY = "cc-onboarding-v2";

export default function OnboardingWizard() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [done, setDone] = useState(false);
  const [createdChildName, setCreatedChildName] = useState("");
  const [createdChildId, setCreatedChildId] = useState("");

  const [familyName, setFamilyName] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  const [firstName, setFirstName] = useState("");
  const [nickname, setNickname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [supportNeeds, setSupportNeeds] = useState("");
  const [interests, setInterests] = useState("");
  const [favouriteActivities, setFavouriteActivities] = useState("");
  const [strengths, setStrengths] = useState("");
  const [knownTriggers, setKnownTriggers] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [step, setStep] = useState(0);

  const inputClass = "cc-fw-input w-full text-sm";

  const completionPct = useMemo(() => Math.round((step / (STEPS.length - 1)) * 100), [step]);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate onboarding draft from localStorage after mount */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || "{}") as Record<string, string>;
      setFamilyName(saved.familyName || "");
      setCountry(saved.country || "");
      setTimezone(saved.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setFirstName(saved.firstName || "");
      setNickname(saved.nickname || "");
      setDateOfBirth(saved.dateOfBirth || "");
      setGender(saved.gender || "");
      setSchool(saved.school || "");
      setGrade(saved.grade || "");
      setDiagnosis(saved.diagnosis || "");
      setSupportNeeds(saved.supportNeeds || "");
      setInterests(saved.interests || "");
      setFavouriteActivities(saved.favouriteActivities || "");
      setStrengths(saved.strengths || "");
      setKnownTriggers(saved.knownTriggers || "");
      setInviteEmail(saved.inviteEmail || "");
      setStep(Number(saved.step) || 0);
    } catch {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    const payload = {
      step,
      familyName,
      country,
      timezone,
      firstName,
      nickname,
      dateOfBirth,
      gender,
      school,
      grade,
      diagnosis,
      supportNeeds,
      interests,
      favouriteActivities,
      strengths,
      knownTriggers,
      inviteEmail,
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
    return undefined;
  }, [
    step,
    familyName,
    country,
    timezone,
    firstName,
    nickname,
    dateOfBirth,
    gender,
    school,
    grade,
    diagnosis,
    supportNeeds,
    interests,
    favouriteActivities,
    strengths,
    knownTriggers,
    inviteEmail,
    hydrated,
  ]);

  async function uploadPhotoIfAny(): Promise<string | undefined> {
    if (!photoFile) return undefined;
    const supabase = createClient();
    const filePath = `onboarding/${crypto.randomUUID()}-${photoFile.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await supabase.storage
      .from("child-photos")
      .upload(filePath, photoFile, { upsert: false });
    if (uploadError) {
      setError("Photo upload skipped. You can add a photo later in the child profile.");
      return undefined;
    }
    const { data } = supabase.storage.from("child-photos").getPublicUrl(filePath);
    return data.publicUrl || undefined;
  }

  async function handleFinish() {
    setLoading(true);
    setError(null);
    const photoUrl = await uploadPhotoIfAny();
    const result = await completeOnboarding({
      familyName,
      country,
      timezone,
      child: {
        photoUrl,
        firstName,
        nickname: nickname || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        school: school || undefined,
        grade: grade || undefined,
        diagnosis: diagnosis.split(",").map((s) => s.trim()).filter(Boolean),
        supportNeeds: supportNeeds.split(",").map((s) => s.trim()).filter(Boolean),
        interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
        favouriteActivities: favouriteActivities.split(",").map((s) => s.trim()).filter(Boolean),
        strengths: strengths.split(",").map((s) => s.trim()).filter(Boolean),
        knownTriggers: knownTriggers.split(",").map((s) => s.trim()).filter(Boolean),
      },
      inviteEmail: inviteEmail || undefined,
    });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    localStorage.removeItem(AUTOSAVE_KEY);
    setCreatedChildName(firstName);
    if (result.childId) setCreatedChildId(result.childId);
    setDone(true);
    setLoading(false);
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl">
        <AppCard padding="lg">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-[var(--cc-ink)]">
              You&apos;re ready, {createdChildName || "friend"}
            </h2>
            <p className="mt-3 text-[var(--cc-ink-muted)]">
              Let&apos;s take your first gentle step together.
            </p>
            <button
              type="button"
              onClick={() =>
                router.push(
                  createdChildId
                    ? `/check-in?child=${createdChildId}&first=1`
                    : "/today",
                )
              }
              className="mt-8 rounded-full bg-[var(--cc-teal)] px-10 py-3.5 text-base font-semibold text-white hover:bg-[var(--cc-teal-deep)]"
            >
              Let&apos;s begin
            </button>
          </div>
        </AppCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cc-ink-faint)]">
          Step {step + 1} of {STEPS.length}
        </p>
        <p className="text-xs font-semibold text-[var(--cc-teal)]">{completionPct}% complete</p>
      </div>
      <div className="mb-2 h-2 w-full rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-[var(--cc-teal)] transition-all" style={{ width: `${completionPct}%` }} />
      </div>
      <div className="mb-8 flex items-center justify-between gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
              i <= step ? "bg-[var(--cc-teal)]/15 text-[var(--cc-teal)]" : "bg-[var(--cc-cream-200)] text-[var(--cc-ink-faint)]"
            }`}
          >
            {s}
          </div>
        ))}
      </div>
      <p className="mb-3 text-right text-xs text-[var(--cc-ink-faint)]">Progress autosaves automatically</p>

      <AppCard padding="lg">
        {step === 0 && (
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold text-[var(--cc-ink)]">Welcome</h1>
            <p className="mt-5 text-lg leading-relaxed text-[var(--cc-ink-muted)]">{WELCOME_ONE_LINER}</p>
            <button
              type="button"
              onClick={next}
              className="mt-10 rounded-full bg-[var(--cc-teal)] px-10 py-3.5 text-base font-semibold text-white hover:bg-[var(--cc-teal-deep)]"
            >
              Let&apos;s begin
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[var(--cc-ink)]">Create your family</h2>
            <div>
              <label htmlFor="onboarding-family-name" className="mb-1.5 block text-sm font-medium">Family name</label>
              <input id="onboarding-family-name" className={inputClass} value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="The Smith Family" required />
            </div>
            <div>
              <label htmlFor="onboarding-country" className="mb-1.5 block text-sm font-medium">Country</label>
              <input id="onboarding-country" className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="South Africa" />
            </div>
            <div>
              <label htmlFor="onboarding-timezone" className="mb-1.5 block text-sm font-medium">Timezone</label>
              <input id="onboarding-timezone" className={inputClass} value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={prev} className="flex-1 rounded-2xl border border-[var(--cc-border)] py-3.5 text-sm font-semibold text-[var(--cc-ink-muted)]">
                Previous
              </button>
              <button type="button" onClick={next} disabled={!familyName} className="flex-1 rounded-2xl bg-[var(--cc-teal)] py-3.5 text-sm font-semibold text-white disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--cc-ink)]">Add your first child</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPhotoFile(file);
                  if (file) setPhotoPreview(URL.createObjectURL(file));
                }}
              />
              {photoPreview && (
                <Image
                  src={photoPreview}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="mt-2 h-16 w-16 rounded-2xl object-cover"
                />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="onboarding-first-name" className="mb-1.5 block text-sm font-medium">First name *</label>
                <input id="onboarding-first-name" className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nickname</label>
                <input className={inputClass} value={nickname} onChange={(e) => setNickname(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Date of birth</label>
                <input type="date" className={inputClass} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Gender</label>
                <input className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">School</label>
                <input className={inputClass} value={school} onChange={(e) => setSchool(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Grade</label>
                <input className={inputClass} value={grade} onChange={(e) => setGrade(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Diagnosis (comma separated)</label>
              <input className={inputClass} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="PDA, Autism, ADHD" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Support needs</label>
              <input className={inputClass} value={supportNeeds} onChange={(e) => setSupportNeeds(e.target.value)} placeholder="Low demands, sensory breaks" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Interests</label>
              <input className={inputClass} value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Dinosaurs, Minecraft" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Favourite activities</label>
              <input className={inputClass} value={favouriteActivities} onChange={(e) => setFavouriteActivities(e.target.value)} placeholder="Swimming, drawing" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Strengths (optional)</label>
              <input className={inputClass} value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="Kind, creative, resilient" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Known triggers (optional)</label>
              <input className={inputClass} value={knownTriggers} onChange={(e) => setKnownTriggers(e.target.value)} placeholder="Crowded spaces, rushed transitions" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={prev} className="flex-1 rounded-2xl border border-[var(--cc-border)] py-3.5 text-sm font-semibold text-[var(--cc-ink-muted)]">
                Previous
              </button>
              <button type="button" onClick={next} disabled={!firstName} className="flex-1 rounded-2xl bg-[var(--cc-teal)] py-3.5 text-sm font-semibold text-white disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[var(--cc-ink)]">Invite another parent or caregiver</h2>
            <p className="text-sm text-[var(--cc-ink-muted)]">Optional — you can always do this later in Settings.</p>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email address</label>
              <input type="email" className={inputClass} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="partner@example.com" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={next} className="flex-1 rounded-2xl border border-[var(--cc-border)] py-3.5 text-sm font-semibold text-[var(--cc-ink-muted)]">
                Skip
              </button>
              <button type="button" onClick={next} className="flex-1 rounded-2xl bg-[var(--cc-teal)] py-3.5 text-sm font-semibold text-white">
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--cc-ink)]">You&apos;re all set</h2>
            <p className="mt-3 text-[var(--cc-ink-muted)]">
              {firstName}&apos;s profile is ready. Child Compass will learn their unique patterns over time.
            </p>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={prev} className="flex-1 rounded-2xl border border-[var(--cc-border)] py-3.5 text-sm font-semibold text-[var(--cc-ink-muted)]">
                Previous
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 rounded-2xl bg-[var(--cc-teal)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--cc-teal-deep)] disabled:opacity-60"
              >
                {loading ? "Setting up…" : "Finish Setup"}
              </button>
            </div>
          </div>
        )}
      </AppCard>
    </div>
  );
}
