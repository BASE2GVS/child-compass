import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

async function loginAndOnboard(page: import("playwright").Page) {
  const stamp = Date.now();
  const email = `library_shot_${stamp}@childcompass.test`;
  const password = "CompassPass123!";

  await page.goto("http://localhost:3000/register");
  await page.getByLabel(/your name/i).fill("Gerhard");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await page.waitForURL(/\/(verify-email|onboarding|today)/, { timeout: 30000 });

  if (page.url().includes("/verify-email")) {
    await page.goto("http://localhost:3000/onboarding");
  }

  if (page.url().includes("/onboarding")) {
    const letsBegin = page.getByRole("button", { name: /let'?s begin/i });
    if (await letsBegin.isVisible({ timeout: 5000 }).catch(() => false)) {
      await letsBegin.click();
      await page.waitForTimeout(500);
    }

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
      if (await goToday.isVisible({ timeout: 15000 }).catch(() => false)) {
        await goToday.click();
      }
    }
  }
}

async function main() {
  const outDir = path.join(process.cwd(), "screenshots");
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await loginAndOnboard(page);
  await page.goto("http://localhost:3000/today", { waitUntil: "load", timeout: 60000 });
  await page.getByRole("link", { name: /documents/i }).first().click();
  await page.waitForURL(/documents-hub/, { timeout: 30000 });
  await page.waitForSelector("text=/Your Family Library/i", { timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(outDir, "library-after-hero.png"), fullPage: false });

  await page.setViewportSize({ width: 1280, height: 3600 });
  await page.screenshot({ path: path.join(outDir, "library-after-full.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/documents-hub", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, "library-after-mobile.png"), fullPage: true });

  console.log("Library screenshots saved to screenshots/");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
