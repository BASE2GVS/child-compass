import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

async function shot(page: import("playwright").Page, outDir: string, name: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, `framework-${name}.png`) });
  console.log(`  ✓ framework-${name}.png`);
}

async function main() {
  const outDir = path.join(process.cwd(), "screenshots");
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
  await shot(page, outDir, "login");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
