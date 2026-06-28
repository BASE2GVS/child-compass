import { Suspense } from "react";

import { addSchoolHubEntry } from "@/lib/actions/ecosystem";
import FormFeedbackBanner from "@/components/forms/FormFeedbackBanner";
import FormSaveButton from "@/components/forms/FormSaveButton";

import { CompanionExpandable } from "@/components/companion";

import EditorialPage from "@/components/editorial/EditorialPage";

import { Input, Select, StatusBadge, Textarea } from "@/components/design-system";

import type { Child, SchoolHubEntry } from "@/lib/types/database";



const ENTRY_TYPES = [

  { value: "teacher_guide", label: "Teacher Guide™" },

  { value: "support_plan", label: "Support Plan™" },

  { value: "classroom_strategy", label: "Classroom Strategies" },

  { value: "transition_plan", label: "Transition Plan" },

  { value: "exam_support", label: "Exam Support" },

  { value: "sensory_profile", label: "Sensory Profile" },

  { value: "attendance_summary", label: "Attendance Summary" },

] as const;



type SchoolExperienceProps = {

  child: Child;

  familyChildren: Child[];

  entries: SchoolHubEntry[];

  insight: string | null;

  parentName?: string | null;

};



export default function SchoolExperience({

  child,

  familyChildren,

  entries,

  insight,

  parentName,

}: SchoolExperienceProps) {

  const childName = child.nickname || child.first_name;



  return (

    <EditorialPage

      variant="school"

      title="School"

      parentName={parentName}

      childName={childName}

      familyChildren={familyChildren}

      activeChildId={child.id}

      primaryAction={{

        label: "Share with school",

        href: `/reports/view/teacher_guide?child=${child.id}`,

      }}

    >

      <Suspense fallback={null}>
        <FormFeedbackBanner successMessage="Your notes have been updated." />
      </Suspense>

      {insight && (

        <p className="text-lg leading-relaxed text-[var(--cc-ink-soft)]">{insight}</p>

      )}



      <CompanionExpandable label="Add a school note">

        <div id="school-add">

          <form action={addSchoolHubEntry} className="cc-fw-form mt-4">

            <input type="hidden" name="childId" value={child.id} />

            <Select name="entryType">

              {ENTRY_TYPES.map((t) => (

                <option key={t.value} value={t.value}>

                  {t.label}

                </option>

              ))}

            </Select>

            <Input name="title" required placeholder="Title" />

            <Textarea

              name="content"

              required

              rows={4}

              placeholder="What teachers should know…"

              className="cc-fw-form-span-2"

            />

            <FormSaveButton className="cc-fw-form-span-2">

              Save note

            </FormSaveButton>

          </form>

        </div>

      </CompanionExpandable>



      {entries.length > 0 && (

        <CompanionExpandable label="Previous notes">

          <ul className="mt-4 space-y-6">

            {entries.map((entry) => (

              <li key={entry.id} className="border-b border-[var(--cc-border-soft)]/50 pb-6 last:border-0">

                <StatusBadge label={entry.entry_type.replace(/_/g, " ")} tone="brand" />

                <p className="mt-2 font-display text-lg font-semibold text-[var(--cc-ink)]">{entry.title}</p>

                <p className="mt-2 whitespace-pre-wrap text-base text-[var(--cc-ink-muted)]">{entry.content}</p>

              </li>

            ))}

          </ul>

        </CompanionExpandable>

      )}

    </EditorialPage>

  );

}


