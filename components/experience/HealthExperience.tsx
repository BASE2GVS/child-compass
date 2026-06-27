import Link from "next/link";

import { addHealthObservation } from "@/lib/actions/health";

import { CompanionExpandable } from "@/components/companion";

import EditorialPage from "@/components/editorial/EditorialPage";

import { actionCopy } from "@/lib/presentation/copy";

import { Button, Input, Select, Textarea } from "@/components/design-system";

import type { Child, HealthObservation } from "@/lib/types/database";



const OBSERVATION_TYPES = [

  { value: "medication", label: "Medication" },

  { value: "appointment", label: "Appointment" },

  { value: "sleep", label: "Sleep" },

  { value: "nutrition", label: "Nutrition" },

  { value: "exercise", label: "Exercise" },

  { value: "growth", label: "Growth" },

  { value: "note", label: "General note" },

] as const;



const SUMMARY_LABELS: Record<string, string> = {

  medication: "Medication",

  appointments: "Appointments",

  sleep: "Sleep",

  nutrition: "Food",

  exercise: "Movement",

  growth: "Growth",

  note: "Notes",

};



type HealthExperienceProps = {

  child: Child;

  familyChildren: Child[];

  observations: HealthObservation[];

  summary: Record<string, string[]>;

  parentName?: string | null;

};



export default function HealthExperience({

  child,

  familyChildren,

  observations,

  summary,

  parentName,

}: HealthExperienceProps) {

  const childName = child.nickname || child.first_name;



  return (

    <EditorialPage

      variant="health"

      title="Health"

      parentName={parentName}

      childName={childName}

      familyChildren={familyChildren}

      activeChildId={child.id}

      primaryAction={{ label: "Add a note", href: "#health-add" }}

    >

      <CompanionExpandable label="Add a note">

        <div id="health-add">

          <form action={addHealthObservation} className="cc-fw-form mt-4">

            <input type="hidden" name="childId" value={child.id} />

            <Select name="observationType">

              {OBSERVATION_TYPES.map((t) => (

                <option key={t.value} value={t.value}>

                  {t.label}

                </option>

              ))}

            </Select>

            <Input name="observedDate" type="date" />

            <Input name="title" required placeholder="What happened?" className="cc-fw-form-span-2" />

            <Textarea name="notes" rows={3} placeholder="A few gentle words…" className="cc-fw-form-span-2" />

            <Button type="submit" className="cc-fw-form-span-2">

              {actionCopy.saveObservation}

            </Button>

          </form>

        </div>

      </CompanionExpandable>



      {observations.length > 0 && (

        <CompanionExpandable label="Previous notes">

          <div className="mt-4 grid gap-8 lg:grid-cols-2">

            {Object.entries(summary).map(([key, items]) =>

              items.length ? (

                <div key={key}>

                  <h3 className="text-sm font-medium text-[var(--cc-ink-muted)]">

                    {SUMMARY_LABELS[key] ?? key.replace(/([A-Z])/g, " $1")}

                  </h3>

                  <ul className="mt-2 space-y-2 text-base text-[var(--cc-ink-muted)]">

                    {items.map((item, i) => (

                      <li key={i}>{item}</li>

                    ))}

                  </ul>

                </div>

              ) : null,

            )}

          </div>

        </CompanionExpandable>

      )}

    </EditorialPage>

  );

}



export function HealthGateExperience({ message }: { message: string }) {

  return (

    <EditorialPage variant="health" title="Health" description={message}>

      <p className="text-base text-[var(--cc-ink-muted)]">

        Wellbeing notes are part of Family Plus.

      </p>

      <Link href="/settings" className="mt-4 inline-flex font-semibold text-[var(--cc-teal-deep)] hover:underline">

        Open settings

      </Link>

    </EditorialPage>

  );

}


