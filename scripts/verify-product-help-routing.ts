import { detectCoachMode } from "@/lib/ai/coach-mode";

const cases: Array<{ message: string; expected: string }> = [
  { message: "Amy hates haircuts.", expected: "coaching" },
  { message: "How do I prepare her for the dentist?", expected: "coaching" },
  { message: "She refuses to bath.", expected: "coaching" },
  { message: "How do I upload a document?", expected: "product_help" },
  { message: "Where do I find the Passport?", expected: "product_help" },
  { message: "What is the Timeline page?", expected: "product_help" },
  { message: "How do I use the PDA Passport?", expected: "product_help" },
];

let failed = 0;
for (const testCase of cases) {
  const mode = detectCoachMode(testCase.message);
  const pass = mode === testCase.expected;
  if (!pass) {
    failed += 1;
    console.error(`FAIL: ${testCase.message}\n  expected=${testCase.expected} got=${mode}`);
  } else {
    console.log(`PASS: ${testCase.message} => ${mode}`);
  }
}

if (failed > 0) {
  console.error(`${failed} test(s) failed.`);
  process.exit(1);
}
