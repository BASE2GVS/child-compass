import { addTherapySession } from "@/lib/actions/ecosystem";

import { CompanionExpandable } from "@/components/companion";

import EditorialPage from "@/components/editorial/EditorialPage";

import { StatusBadge } from "@/components/design-system";

import { Button, Input, Textarea } from "@/components/design-system";

import type { Child, TherapySession } from "@/lib/types/database";



type TherapyExperienceProps = {

  child: Child;

  familyChildren: Child[];

  sessions: TherapySession[];

  insight: string | null;

  parentName?: string | null;

};



export default function TherapyExperience({

  child,

  familyChildren,

  sessions,

  insight,

  parentName,

}: TherapyExperienceProps) {

  const childName = child.nickname || child.first_name;



  return (

    <EditorialPage

      variant="therapy"

      title="Therapy"

      parentName={parentName}

      childName={childName}

      familyChildren={familyChildren}

      activeChildId={child.id}

    >

      {insight && (

        <p className="text-lg leading-relaxed text-[var(--cc-ink-soft)]">{insight}</p>

      )}



      <CompanionExpandable label="Add session note">

        <div id="therapy-add">

          <form action={addTherapySession} className="cc-fw-form mt-4">

            <input type="hidden" name="childId" value={child.id} />

            <Input name="therapistName" placeholder="Therapist name" />

            <Input name="sessionDate" type="date" />

            <Textarea name="notes" rows={3} placeholder="How did it go?" className="cc-fw-form-span-2" />

            <CompanionExpandable label="More detail (optional)">

              <div className="mt-4 space-y-4">

                <Textarea name="recommendations" rows={2} placeholder="Recommendations (one per line)" />

                <Textarea name="goals" rows={2} placeholder="Goals (one per line)" />

                <Textarea name="exercises" rows={2} placeholder="Exercises (one per line)" />

                <Textarea name="progress" rows={2} placeholder="Progress in your own words" />

              </div>

            </CompanionExpandable>

            <Button type="submit" className="cc-fw-form-span-2">

              Save session

            </Button>

          </form>

        </div>

      </CompanionExpandable>



      {sessions.length > 0 && (

        <CompanionExpandable label="Previous sessions">

          <ul className="mt-4 space-y-8">

            {sessions.map((session) => (

              <li key={session.id} className="border-b border-[var(--cc-border-soft)]/50 pb-8 last:border-0">

                <StatusBadge label={session.session_date} tone="brand" />

                <p className="mt-2 font-display text-lg font-semibold text-[var(--cc-ink)]">

                  {session.therapist_name || "Therapy session"}

                </p>

                {session.notes && (

                  <p className="mt-2 whitespace-pre-wrap text-base text-[var(--cc-ink-muted)]">{session.notes}</p>

                )}

              </li>

            ))}

          </ul>

        </CompanionExpandable>

      )}

    </EditorialPage>

  );

}


