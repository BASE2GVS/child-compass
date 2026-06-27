import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

async function loginAndOnboard(page: import("playwright").Page) {
  const stamp = Date.now();
  const email = `sprint6_${stamp}@childcompass.test`;
  const password = "CompassPass123!";

  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle", timeout: 120000 });
  await page.getByLabel(/your name/i).fill("Gerhard");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await page.waitForURL(/\/(verify-email|onboarding|today)/, { timeout: 90000 });
  if (page.url().includes("/verify-email")) await page.goto("http://localhost:3000/onboarding");

  if (page.url().includes("/onboarding")) {
    const letsBegin = page.getByRole("button", { name: /let'?s begin/i });
    if (await letsBegin.isVisible({ timeout: 8000 }).catch(() => false)) await letsBegin.click();
    const familyName = page.locator("#onboarding-family-name");
    if (await familyName.isVisible({ timeout: 8000 }).catch(() => false)) {
      await familyName.fill("Compass Family");
      await page.locator("#onboarding-country").fill("South Africa");
      await page.locator("#onboarding-timezone").fill("Africa/Johannesburg");
      await page.getByRole("button", { name: /^next$/i }).click();
      await page.locator("#onboarding-first-name").fill("Amy");
      await page.getByRole("button", { name: /^next$/i }).click();
      await page.getByRole("button", { name: /^skip$/i }).click();
      await page.getByRole("button", { name: /finish setup/i }).click();
      const goToday = page.getByRole("button", { name: /go to today/i });
      if (await goToday.isVisible({ timeout: 20000 }).catch(() => false)) await goToday.click();
    }
  }
}

async function shot(page: import("playwright").Page, outDir: string, name: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, `sprint6-${name}.png`) });
  console.log(`  ✓ sprint6-${name}.png`);
}

async function main() {
  const outDir = path.join(process.cwd(), "screenshots");
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 120000 });
  await shot(page, outDir, "landing");

  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle", timeout: 120000 });
  await shot(page, outDir, "register");

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle", timeout: 120000 });
  await shot(page, outDir, "login");

  try {
    await loginAndOnboard(page);
    const routes: [string, string][] = [
      ["/today", "today"],
      ["/coach", "coach"],
      ["/check-in", "checkin"],
      ["/compass", "mychild"],
      ["/track", "track"],
      ["/documents-hub", "documents"],
      ["/school", "school"],
      ["/therapy", "therapy"],
      ["/health", "health"],
      ["/search", "search"],
      ["/help", "help"],
      ["/settings", "settings"],
      ["/profile", "profile"],
    ];
    for (const [route, name] of routes) {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle", timeout: 120000 });
      await shot(page, outDir, name);
    }
  } catch (e) {
    console.error("  Auth routes skipped:", (e as Error).message);
  }

  await browser.close();
  console.log("\nSprint 6 screenshots saved to screenshots/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
