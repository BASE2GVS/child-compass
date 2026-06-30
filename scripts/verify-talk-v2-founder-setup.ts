import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";

type Scenario = {
  id: string;
  title: string;
  objective: string;
  turns: string[];
};

async function run() {
  const suitePath = path.join(process.cwd(), "data", "talk-v2-founder-golden-suite.json");
  const raw = await fs.readFile(suitePath, "utf8");
  const parsed = JSON.parse(raw) as { scenarios?: Scenario[] };

  assert.ok(Array.isArray(parsed.scenarios), "Golden suite scenarios must be an array");
  const scenarios = parsed.scenarios || [];

  const required = [
    "sleep",
    "anxiety",
    "school",
    "meltdown",
    "parent exhaustion",
    "pda",
    "medication",
    "general parenting",
  ];

  assert.ok(scenarios.length >= required.length, "Expected at least 8 founder scenarios");

  const titles = scenarios.map((s) => s.title.toLowerCase());
  for (const name of required) {
    assert.ok(titles.some((title) => title.includes(name)), `Missing required founder scenario: ${name}`);
  }

  for (const scenario of scenarios) {
    assert.ok(Array.isArray(scenario.turns), `Scenario ${scenario.id} must contain turns`);
    assert.ok(scenario.turns.length >= 3, `Scenario ${scenario.id} must include multiple turns`);
  }

  const requiredDocs = [
    path.join(process.cwd(), "docs", "TALK_V2_FOUNDER_TESTING_GUIDE.md"),
    path.join(process.cwd(), "docs", "TALK_V2_FOUNDER_ACCEPTANCE_CHECKLIST.md"),
    path.join(process.cwd(), "docs", "TALK_V2_REGRESSION_REPORT_TEMPLATE.md"),
  ];

  for (const docPath of requiredDocs) {
    await fs.access(docPath);
  }

  console.log("Talk V2 founder setup checks passed.");
}

run();
