import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

async function shot(page: import("playwright").Page, outDir: string, name: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, `sprint5-${name}.png`) });
  console.log(`  ✓ sprint5-${name}.png`);
}

async function main() {
  const outDir = path.join(process.cwd(), "screenshots");
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const [route, name] of [
    ["/", "landing"],
    ["/login", "login"],
    ["/register", "register"],
  ] as const) {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle", timeout: 120000 });
    await shot(page, outDir, name);
  }

  await browser.close();
  console.log("\nDone — screenshots/sprint5-*.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
