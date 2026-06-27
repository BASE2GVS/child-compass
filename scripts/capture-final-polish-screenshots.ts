import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

async function loginAndOnboard(page: import("playwright").Page) {
  const stamp = Date.now();
  const email = `final_polish_${stamp}@childcompass.test`;
  const password = "CompassPass123!";

  await page.goto("http://localhost:3000/register");
  await page.getByLabel(/your name/i).fill("Gerhard");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
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

async function shot(page: import("playwright").Page, outDir: string, name: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outDir, `final-polish-${name}.png`) });
  console.log(`  ✓ final-polish-${name}.png`);
}

async function main() {
  const outDir = path.join(process.cwd(), "screenshots");
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto("http://localhost:3000/", { waitUntil: "load", timeout: 120000 });
  await shot(page, outDir, "landing");

  await page.goto("http://localhost:3000/register", { waitUntil: "load", timeout: 120000 });
  await shot(page, outDir, "register");

  await loginAndOnboard(page);

  const routes: [string, string][] = [
    ["/today", "today"],
    ["/coach", "coach"],
    ["/check-in", "checkin"],
    ["/compass", "mychild"],
    ["/track", "track"],
    ["/documents-hub", "reports"],
    ["/settings", "settings"],
    ["/help", "help"],
    ["/search", "search"],
    ["/health", "health"],
    ["/school", "school"],
    ["/therapy", "therapy"],
    ["/profile", "profile"],
  ];

  for (const [route, name] of routes) {
    try {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "load", timeout: 120000 });
      await shot(page, outDir, name);
    } catch (e) {
      console.error(`  ✗ ${name}:`, (e as Error).message);
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/today", { waitUntil: "load", timeout: 120000 });
  await shot(page, outDir, "today-mobile");

  console.log("\nFinal polish screenshots saved.");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
