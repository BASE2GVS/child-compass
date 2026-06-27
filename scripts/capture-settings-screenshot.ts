import { chromium } from "playwright";
import path from "node:path";

async function loginAndOnboard(page: import("playwright").Page) {
  const stamp = Date.now();
  const email = `settings_shot_${stamp}@childcompass.test`;
  await page.goto("http://localhost:3000/register");
  await page.getByLabel(/your name/i).fill("Gerhard");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill("CompassPass123!");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(/\/(verify-email|onboarding|today)/, { timeout: 30000 });
  if (page.url().includes("/verify-email")) await page.goto("http://localhost:3000/onboarding");
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
}

async function main() {
  const outDir = path.join(process.cwd(), "screenshots");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await loginAndOnboard(page);
  await page.goto("http://localhost:3000/settings", { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector("text=/Settings|preferences/i", { timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "sprint7-settings.png") });
  console.log("saved sprint7-settings.png");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
