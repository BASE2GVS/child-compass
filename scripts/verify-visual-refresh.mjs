import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = "http://localhost:3001";
const outDir = path.join(process.cwd(), "screenshots", "visual-refresh-verification");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const runDir = path.join(outDir, timestamp);

await fs.mkdir(runDir, { recursive: true });

function attachDiagnostics(page, bucket) {
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    bucket.console.push({ type, text });
    if (type === "error") bucket.consoleErrors.push(text);
    if (/hydrat/i.test(text) || /did not match/i.test(text)) bucket.hydrationWarnings.push(text);
  });
  page.on("pageerror", (err) => {
    bucket.pageErrors.push(String(err));
  });
}

async function gatherPageChecks(page, label) {
  const cls = await page.evaluate(() => {
    const entries = performance.getEntriesByType("layout-shift");
    return entries.reduce((sum, entry) => sum + (entry.hadRecentInput ? 0 : entry.value || 0), 0);
  }).catch(() => 0);

  const noHorizontalOverflow = await page.evaluate(() => {
    const root = document.scrollingElement || document.documentElement;
    return root.scrollWidth <= window.innerWidth + 1;
  });

  const result = { label, cls, noHorizontalOverflow };

  if (label.includes("landing")) {
    result.heroImageVisible = await page.locator('img[src*="hero-family-journey-sky.webp"]').first().isVisible().catch(() => false);
  }

  if (label.includes("login") || label.includes("register")) {
    result.authBackgroundVisible = await page.locator('img[src*="login-background.webp"]').first().isVisible().catch(() => false);
    result.authCardVisible = await page.locator(".cc-auth-card").first().isVisible().catch(() => false);
    result.buttonStyleConsistent = await page.evaluate(() => {
      const button = document.querySelector('button[type="submit"]');
      if (!button) return false;
      const style = window.getComputedStyle(button);
      return style.borderRadius !== "0px" && style.backgroundColor !== "rgba(0, 0, 0, 0)";
    });
  }

  return result;
}

const report = {
  baseUrl,
  runDir,
  screenshots: [],
  checks: [],
  authFlow: {},
  diagnostics: {
    console: [],
    consoleErrors: [],
    hydrationWarnings: [],
    pageErrors: [],
  },
};

const browser = await chromium.launch({ headless: true });

try {
  // Context A: confirm unauthenticated app access redirects to login.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    attachDiagnostics(page, report.diagnostics);
    await page.goto(`${baseUrl}/today`, { waitUntil: "networkidle" });
    report.authFlow.unauthRedirectsToLogin = /\/login/.test(page.url());
    report.authFlow.unauthRedirectUrl = page.url();
    await context.close();
  }

  // Context B: visual checks + register + first authenticated screen.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const page = await context.newPage();
  attachDiagnostics(page, report.diagnostics);

  const widths = [
    { w: 1440, h: 900, tag: "desktop" },
    { w: 768, h: 1024, tag: "tablet" },
    { w: 390, h: 844, tag: "mobile" },
  ];

  const routes = [
    { path: "/", key: "landing" },
    { path: "/login", key: "login" },
    { path: "/register", key: "register" },
  ];

  for (const vp of widths) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    for (const route of routes) {
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      const shot = path.join(runDir, `${route.key}-${vp.tag}-${vp.w}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      report.screenshots.push(shot);
      report.checks.push(await gatherPageChecks(page, `${route.key}-${vp.w}`));
    }
  }

  // Dark contrast check (if applicable).
  await context.close();
  const darkContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const darkPage = await darkContext.newPage();
  attachDiagnostics(darkPage, report.diagnostics);
  await darkPage.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  const darkShot = path.join(runDir, "login-dark-desktop-1440.png");
  await darkPage.screenshot({ path: darkShot, fullPage: true });
  report.screenshots.push(darkShot);
  report.checks.push(await gatherPageChecks(darkPage, "login-dark-1440"));
  await darkContext.close();

  // Register in a fresh context and capture first authenticated screen.
  const authContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const authPage = await authContext.newPage();
  attachDiagnostics(authPage, report.diagnostics);

  const stamp = Date.now();
  const email = `visual_verify_${stamp}@childcompass.test`;
  const password = "CompassPass123!";

  await authPage.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await authPage.getByLabel(/your name/i).fill("Visual QA");
  await authPage.getByLabel(/^email$/i).fill(email);
  await authPage.getByLabel(/^password$/i).fill(password);
  await authPage.getByTestId("register-submit").click();
  await authPage.waitForURL(/\/(verify-email|onboarding|today|dashboard)/, { timeout: 45000 });

  let authUrl = authPage.url();
  if (/\/verify-email/.test(authUrl)) {
    await authPage.goto(`${baseUrl}/onboarding`, { waitUntil: "networkidle" });
    authUrl = authPage.url();
  }

  const authShotDesktop = path.join(runDir, "first-authenticated-desktop-1440.png");
  await authPage.screenshot({ path: authShotDesktop, fullPage: true });
  report.screenshots.push(authShotDesktop);
  report.checks.push(await gatherPageChecks(authPage, "first-authenticated-1440"));

  await authPage.setViewportSize({ width: 390, height: 844 });
  const authShotMobile = path.join(runDir, "first-authenticated-mobile-390.png");
  await authPage.screenshot({ path: authShotMobile, fullPage: true });
  report.screenshots.push(authShotMobile);
  report.checks.push(await gatherPageChecks(authPage, "first-authenticated-390"));

  report.authFlow.registerResultUrl = authUrl;

  await authContext.close();

  // Context C: fresh profile login with newly registered account.
  const loginContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const loginPage = await loginContext.newPage();
  attachDiagnostics(loginPage, report.diagnostics);
  await loginPage.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await loginPage.getByLabel(/^email$/i).fill(email);
  await loginPage.getByLabel(/^password$/i).fill(password);
  await loginPage.getByRole("button", { name: /sign in/i }).click();
  await loginPage.waitForURL(/\/(today|dashboard|onboarding)/, { timeout: 30000 });
  report.authFlow.loginResultUrl = loginPage.url();
  await loginContext.close();
} finally {
  await browser.close();
}

const reportPath = path.join(runDir, "verification-report.json");
await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
console.log(reportPath);
