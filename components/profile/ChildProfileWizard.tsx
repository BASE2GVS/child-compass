
"use client";

import { useState } from "react";
import ProfileQuestion from "./ProfileQuestion";
import ProfileProgress from "./ProfileProgress";

const questions = [
  "Child Name",
  "Age",
  "Communication Style",
  "What Makes Them Feel Safe",
  "Biggest Triggers",
  "Sensory Challenges",
  "Special Interests",
  "How They Learn",
  "What Helps Regulation",
  "School Challenges",
  "Family Challenges",
  "Transition Challenges",
  "Food Issues",
  "Sleep Issues",
  "Anxiety Triggers",
  "Social Challenges",
  "Strengths",
  "What Makes Them Happy",
  "What Doesn't Work",
  "What You Want Help With Most",
];

export default function ChildProfileWizard() {
  const [step] = useState(1);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-4xl font-bold">
        Understanding My Child™
      </h1>

      <p className="mb-8 text-slate-600">
        Build your child&apos;s profile.
      </p>

      <ProfileProgress current={step} total={questions.length} />

      {questions.map((question) => (
        <ProfileQuestion key={question} label={question} />
      ))}

      <button className="mt-6 rounded-2xl bg-indigo-600 px-8 py-4 font-semibold text-white">
        Save profile
      </button>
    </div>
  );
}
