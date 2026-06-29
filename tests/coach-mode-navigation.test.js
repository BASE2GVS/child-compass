import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadCoachMode() {
  const sourcePath = path.join(__dirname, "..", "lib", "ai", "coach-mode.ts");
  const source = fs.readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  });

  const compiledModule = { exports: {} };
  vm.runInNewContext(transpiled.outputText, {
    module: compiledModule,
    exports: compiledModule.exports,
    require,
    console,
    process,
    __filename: sourcePath,
    __dirname: path.dirname(sourcePath),
  });

  return compiledModule.exports;
}

const { detectCoachMode } = loadCoachMode();

const positiveNavigationCases = [
  "Go to Settings",
  "Go to Timeline",
  "Go to Passport",
  "Go to Documents",
  "Go to Check-ins",
  "Go to Health",
  "Go to Tracker",
  "Go to Therapy",
  "Go to School",
  "Go to the Dashboard",
  "Go to Profile",
  "Take me to Settings",
  "Show me Timeline",
  "Open the Dashboard",
  "Navigate to Profile",
  "Open Documents",
  "Go to Reports",
  "Show me the check-in",
  "Navigate to My Child",
  "Take me to Today",
];

const negativeNavigationCases = [
  "We have to go to the hairdresser.",
  "Go to school tomorrow",
  "Go to the dentist",
  "Go to grandma's house",
  "Go to occupational therapy",
  "Go to the doctor",
  "Go to the supermarket",
  "Go to swimming",
  "Go to church",
  "Go to bed",
  "We need to go to the dentist before school.",
  "I have to go to the doctor this afternoon.",
  "Can we go to the supermarket after lunch?",
  "She wants to go to swimming practice tonight.",
  "We are going to church on Sunday.",
  "I need to go to bed early tonight.",
  "Amy dislikes cutting her hair. We will have to go to the hairdresser. Help me that I can prepare her for what is to come.",
  "We are going to grandma's house for dinner.",
  "He has occupational therapy after school.",
  "She needs to go to her appointment tomorrow.",
  "We are going to the hairdresser this weekend.",
];

for (const input of positiveNavigationCases) {
  test(`detects app navigation for ${input}`, () => {
    assert.equal(detectCoachMode(input), "navigation");
  });
}

for (const input of negativeNavigationCases) {
  test(`does not treat as app navigation for ${input}`, () => {
    assert.notEqual(detectCoachMode(input), "navigation");
  });
}
