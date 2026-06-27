import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  const outDir = path.join(process.cwd(), "screenshots");
  await mkdir(outDir, { recursive: true });

  const stamp = Date.now();
  const email = `screenshot_${stamp}@childcompass.test`;
  const password = "CompassPass123!";

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto("http://localhost:3000/register");
  await page.getByLabel(/your name/i).fill("Gerhard");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await page.waitForURL(/\/(verify-email|onboarding|today|dashboard)/, { timeout: 30000 });

  if (page.url().includes("/verify-email")) {
    await page.goto("http://localhost:3000/onboarding");
  }

  if (page.url().includes("/today") || page.url().includes("/dashboard")) {
    const continueOnboarding = page.getByRole("link", { name: /continue onboarding/i });
    if (await continueOnboarding.isVisible().catch(() => false)) {
      await continueOnboarding.click();
    }
  }

  await page.waitForURL(/\/onboarding/, { timeout: 15000 }).catch(() => {});

  if (page.url().includes("/onboarding")) {
    const letsBegin = page.getByRole("button", { name: /let'?s begin/i });
    if (await letsBegin.isVisible().catch(() => false)) {
      await letsBegin.click();
      await page.waitForTimeout(500);
    }

    await page.locator("#onboarding-family-name").fill("Compass Family");
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

  await page.goto("http://localhost:3000/today", { waitUntil: "networkidle" });
  await page.waitForSelector("text=/Good morning|Good evening|Hello,/i", { timeout: 30000 });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: path.join(outDir, "today-after-hero.png"),
    fullPage: false,
  });

  await page.setViewportSize({ width: 1280, height: 2400 });
  await page.screenshot({
    path: path.join(outDir, "today-after-full.png"),
    fullPage: true,
  });

  console.log("Screenshots saved to screenshots/");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
