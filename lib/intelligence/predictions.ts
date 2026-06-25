import type { DailyCheckin, PatternFinding } from "@/lib/types/database";
import { confidenceFromDataDepth, explainConfidence } from "@/lib/intelligence/confidence";

export type Prediction = {
  message: string;
  why: string;
  confidence: number;
  confidenceExplanation: string;
  horizon: "today" | "tomorrow" | "this_week";
};

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function generatePredictions(
  childName: string,
  checkins: DailyCheckin[],
  patterns: PatternFinding[],
): Prediction[] {
  const predictions: Prediction[] = [];
  if (checkins.length < 2) return predictions;

  const depth = confidenceFromDataDepth({
    checkinCount: checkins.length,
    patternCount: patterns.length,
    hasTodayCheckin: true,
    memoryCount: 0,
  });

  const recent = checkins.slice(0, 7);
  const sleepScores = recent.map((c) => c.sleep_quality ?? 3);
  const schoolScores = recent.map((c) => c.school_rating ?? 3);

  if (sleepScores.length >= 3) {
    const lastThree = sleepScores.slice(0, 3);
    const declining =
      lastThree[0] < lastThree[1] && lastThree[1] < lastThree[2];
    const lowSleepStreak = lastThree.every((s) => s <= 2);

    if (declining || lowSleepStreak) {
      const conf = Math.min(0.88, 0.65 + lastThree.length * 0.07);
      predictions.push({
        message: `Tomorrow may feel more demanding for ${childName} because sleep has been lower over recent nights.`,
        why: `Sleep ratings were ${lastThree.join(", ")} out of 5 over the last ${lastThree.length} check-ins. Child Compass often sees regulation and school tolerance follow sleep.`,
        confidence: conf,
        confidenceExplanation: explainConfidence(conf, [
          "sleep has been tracked across multiple nights",
          depth.factors[0] || "",
        ].filter(Boolean)),
        horizon: "tomorrow",
      });
    }
  }

  if (schoolScores.length >= 4) {
    const thisWeek = avg(schoolScores.slice(0, 3));
    const prior = avg(schoolScores.slice(3, 6));
    if (thisWeek - prior >= 0.6) {
      const conf = 0.76;
      predictions.push({
        message: `School transition looks more positive than last week for ${childName}.`,
        why: `Recent school ratings average ${thisWeek.toFixed(1)}/5 compared with ${prior.toFixed(1)}/5 earlier in the week.`,
        confidence: conf,
        confidenceExplanation: explainConfidence(conf, [
          "school ratings have improved across several check-ins",
        ]),
        horizon: "this_week",
      });
    } else if (prior - thisWeek >= 0.6) {
      const conf = 0.74;
      predictions.push({
        message: `School may need extra gentleness this week — ratings have softened compared with before.`,
        why: `Recent school ratings average ${thisWeek.toFixed(1)}/5 versus ${prior.toFixed(1)}/5 previously.`,
        confidence: conf,
        confidenceExplanation: explainConfidence(conf, [
          "a downward school trend appears in your check-ins",
        ]),
        horizon: "this_week",
      });
    }
  }

  const mondayPattern = patterns.find((p) => p.title.toLowerCase().includes("monday"));
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (mondayPattern && tomorrow.getDay() === 1) {
    const conf = mondayPattern.confidence ?? 0.75;
    predictions.push({
      message: `Monday may feel anxious for ${childName} — your history shows this is a sensitive day.`,
      why: mondayPattern.description,
      confidence: conf,
      confidenceExplanation: explainConfidence(conf, [
        "a recurring Monday pattern appears in your family's data",
      ]),
      horizon: "tomorrow",
    });
  }

  const sensoryHighDays = recent.filter((c) => (c.sensory_overload ?? 3) >= 4).length;
  if (sensoryHighDays >= 2) {
    const conf = 0.72;
    predictions.push({
      message: `Busy or noisy environments may be harder for ${childName} right now.`,
      why: `Sensory overload was elevated on ${sensoryHighDays} of the last ${recent.length} check-ins.`,
      confidence: conf,
      confidenceExplanation: explainConfidence(conf, [
        "recent sensory ratings suggest a lower buffer for stimulation",
      ]),
      horizon: "today",
    });
  }

  const homeworkPattern = patterns.find((p) => p.title.toLowerCase().includes("homework"));
  if (homeworkPattern) {
    predictions.push({
      message: `Homework or after-school demands may need a softer approach for ${childName}.`,
      why: homeworkPattern.description,
      confidence: homeworkPattern.confidence ?? 0.7,
      confidenceExplanation: explainConfidence(homeworkPattern.confidence ?? 0.7, [
        "homework-related stress appears in your family's timeline and check-ins",
      ]),
      horizon: "this_week",
    });
  }

  return predictions.slice(0, 3);
}
