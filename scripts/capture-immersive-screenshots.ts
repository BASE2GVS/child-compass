import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

async function loginAndOnboard(page: import("playwright").Page) {
  const stamp = Date.now();
  const email = `immersive_${stamp}@childcompass.test`;
  await page.goto("http://localhost:3000/register", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.getByLabel(/your name/i).fill("Gerhard");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill("CompassPass123!");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(/\/(verify-email|onboarding|today)/, { timeout: 120000 });
  if (page.url().includes("/verify-email")) {
    await page.goto("http://localhost:3000/onboarding", { waitUntil: "domcontentloaded", timeout: 120000 });
  }
  if (page.url().includes("/onboarding")) {
    const letsBegin = page.getByRole("button", { name: /let'?s begin/i });
    if (await letsBegin.isVisible({ timeout: 5000 }).catch(() => false)) await letsBegin.click();
    const familyName = page.locator("#onboarding-family-name");
    if (await familyName.isVisible({ timeout: 5000 }).catch(() => false)) {
      await familyName.fill("Compass Family");
      await page.locator("#onboarding-country").fill("South Africa");
      await page.locator("#onboarding-timezone").fill("Africa/Johannesburg");
      await page.getByRole("button", { name: /^next$/i }).click();
      await page.locator("#onboarding-first-name").fill("Amy");
      await page.getByRole("button", { name: /^next$/i }).click();
      await page.getByRole("button", { name: /^skip$/i }).click();
      await page.getByRole("button", { name: /finish setup/i }).click();
      const goToday = page.getByRole("button", { name: /go to today/i });
      if (await goToday.isVisible({ timeout: 15000 }).catch(() => false)) await goToday.click();
    }
  }
  await page.waitForURL(/\/today/, { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(1500);
}

async function shot(page: import("playwright").Page, outDir: string, name: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, `immersive-${name}.png`) });
  console.log(`  ✓ immersive-${name}.png`);
}

async function main() {
  const outDir = path.join(process.cwd(), "screenshots");
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await loginAndOnboard(page);
  for (const [route, name] of [
    ["/today", "today"],
    ["/coach", "coach"],
    ["/compass", "mychild"],
    ["/track", "track"],
    ["/timeline", "timeline"],
    ["/check-in", "checkin"],
    ["/school", "school"],
    ["/therapy", "therapy"],
    ["/health", "health"],
    ["/documents-hub", "documents"],
    ["/search", "search"],
    ["/settings", "settings"],
    ["/help", "help"],
  ] as const) {
    try {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "domcontentloaded", timeout: 180000 });
      await shot(page, outDir, name);
    } catch (e) {
      console.error(`  ✗ ${name}:`, (e as Error).message);
    }
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
