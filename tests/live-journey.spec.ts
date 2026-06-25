import { test, expect } from "@playwright/test";

test("brand-new parent journey", async ({ page }) => {
  test.setTimeout(120_000);
  const stamp = Date.now();
  const email = `qa_parent_${stamp}@childcompass.test`;
  const password = "CompassPass123!";

  await page.goto("http://localhost:3000");
  await page.evaluate(() => localStorage.removeItem("cc-onboarding-v2"));
  await page.getByRole("link", { name: /start free/i }).first().click();
  await expect(page).toHaveURL(/\/register/);

  await page.getByLabel(/your name/i).fill("QA Parent");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await page.waitForURL(/\/(verify-email|onboarding|dashboard)/, { timeout: 15000 });

  if (page.url().includes("/verify-email")) {
    await page.goto("http://localhost:3000/onboarding");
  }

  if (page.url().includes("/dashboard")) {
    const continueOnboarding = page.getByRole("link", { name: /continue onboarding/i });
    if (await continueOnboarding.isVisible().catch(() => false)) {
      await continueOnboarding.click();
    }
  }

  await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });

  const letsBegin = page.getByRole("button", { name: /let'?s begin/i });
  if (await letsBegin.isVisible().catch(() => false)) {
    await letsBegin.click();
  }

  await page.getByLabel(/family name/i).fill("QA Family");
  await page.getByLabel(/^country$/i).fill("South Africa");
  await page.getByLabel(/timezone/i).fill("Africa/Johannesburg");
  await page.getByRole("button", { name: /^next$/i }).click();

  await page.getByLabel(/first name/i).fill("QA Child");
  await page.getByRole("button", { name: /^next$/i }).click();
  await page.getByRole("button", { name: /^skip$/i }).click();
  await page.getByRole("button", { name: /finish setup/i }).click();

  const error = page.locator("text=/error|violates|could not find/i");
  await expect(error).toHaveCount(0);

  await page.getByRole("button", { name: /go to my dashboard/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  await page.goto("http://localhost:3000/check-in");
  await page.getByRole("button", { name: /save check-in|submit|complete/i }).first().click();

  await page.goto("http://localhost:3000/debrief");
  await page.getByRole("textbox").first().fill("Today was challenging after school.");
  await page.getByRole("button", { name: /get guidance/i }).click();

  await page.goto("http://localhost:3000/timeline");
  await expect(page.getByText(/timeline/i).first()).toBeVisible();

  await page.goto("http://localhost:3000/reports");
  await page.getByRole("button", { name: /^generate$/i }).first().click();

  await page.goto("http://localhost:3000/dashboard");
  await page.getByRole("button", { name: /^logout$/i }).click({ force: true });
  await expect(page).toHaveURL(/\/login/, { timeout: 30000 });

  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
});
