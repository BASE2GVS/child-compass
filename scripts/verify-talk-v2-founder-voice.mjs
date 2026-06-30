import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = "http://localhost:3001";
const suitePath = path.join(process.cwd(), "data", "talk-v2-founder-golden-suite.json");
const rawSuite = await fs.readFile(suitePath, "utf8");
const suite = JSON.parse(rawSuite);
const scenarios = Array.isArray(suite.scenarios) ? suite.scenarios : [];

const browser = await chromium.launch({ headless: true });
const report = {
  loginRedirect: null,
  harnessAccessible: false,
  turnResults: [],
  bannedOpenings: [],
  pageErrors: [],
  consoleErrors: [],
};

function trackPage(page) {
  page.on("pageerror", (err) => report.pageErrors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") report.consoleErrors.push(msg.text());
  });
}

const bannedPatterns = [
  /you might be feeling/i,
  /you may be feeling/i,
  /it'?s understandable/i,
  /it'?s completely normal/i,
  /many parents/i,
  /children like/i,
  /it'?s common for/i,
  /i can imagine/i,
  /that must be difficult/i,
  /i hear that/i,
  /you sound/i,
  /you seem/i,
];

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const page = await context.newPage();
  trackPage(page);

  const stamp = Date.now();
  const email = `founder_voice_${stamp}@childcompass.test`;
  const password = "CompassPass123!";

  await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await page.getByLabel(/your name/i).fill("Founder Voice QA");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByTestId("register-submit").click();
  await page.waitForURL(/\/(verify-email|onboarding|today|dashboard)/, { timeout: 45000 });

  if (page.url().includes("/verify-email")) {
    await page.goto(`${baseUrl}/onboarding`, { waitUntil: "networkidle" });
  }

  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/(today|dashboard|onboarding)/, { timeout: 30000 });

  report.loginRedirect = page.url();

  await page.goto(`${baseUrl}/pilot-settings/talk-v2`, { waitUntil: "networkidle" });
  report.harnessAccessible = !/\/login/.test(page.url());

  if (!report.harnessAccessible) {
    report.pageErrors.push(`Harness redirected to ${page.url()}`);
  }

  if (!report.harnessAccessible) {
    await context.close();
    throw new Error(`Harness not accessible: ${page.url()}`);
  }

  const scenarioSubset = scenarios.length ? scenarios : [{ id: "fallback", title: "General parenting", turns: ["What should I do first?", "What would you change next?"] }];

  for (const scenario of scenarioSubset) {
    const childId = `voice-qa-${scenario.id}`;
    await page.getByLabel(/^mode$/i).selectOption({ label: "Start new conversation" });
    await page.getByLabel(/^child id$/i).fill(childId);
    await page.getByLabel(/^scenario$/i).fill(scenario.title);
    await page.getByLabel(/request id override/i).fill("");

    for (let index = 0; index < scenario.turns.length; index += 1) {
      const message = scenario.turns[index];
      const requestId = `${scenario.id}-${index}-${stamp}`;
      await page.getByLabel(/parent message/i).fill(message);
      await page.getByLabel(/request id override/i).fill(requestId);
      await page.getByRole("button", { name: /send to talk v2/i }).click();
      await page.getByText(requestId, { exact: false }).waitFor({ timeout: 60000 });

      const articleTexts = await page.locator("article").allInnerTexts();
      const latestConversationText = articleTexts[0] || "";
      const flagged = bannedPatterns.filter((pattern) => pattern.test(latestConversationText));

      report.turnResults.push({
        scenario: scenario.title,
        turn: index + 1,
        requestId,
        message,
        preview: latestConversationText.slice(0, 1200),
        flagged: flagged.map((pattern) => String(pattern)),
      });

      if (flagged.length) {
        report.bannedOpenings.push({
          scenario: scenario.title,
          turn: index + 1,
          requestId,
          patterns: flagged.map((pattern) => String(pattern)),
        });
      }
    }
  }

  await context.close();
} finally {
  await browser.close();
}

const reportDir = path.join(process.cwd(), "screenshots", "talk-v2-founder-voice");
await fs.mkdir(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
console.log(reportPath);
