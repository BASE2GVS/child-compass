# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\live-journey.spec.ts >> brand-new parent journey
- Location: tests\live-journey.spec.ts:3:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 45000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - link "Child Compass™ Your daily companion" [ref=e5] [cursor=pointer]:
      - /url: /
      - paragraph [ref=e6]: Child Compass™
      - paragraph [ref=e7]: Your daily companion
    - img "Hope ahead" [ref=e9]
    - paragraph [ref=e13]: Understand your child. Without feeling alone.
    - paragraph [ref=e14]: Simple to start. No pressure.
    - paragraph [ref=e15]: Warm, practical support for PDA, Autism, ADHD and anxiety.
  - generic [ref=e16]:
    - link "Child Compass™" [ref=e18] [cursor=pointer]:
      - /url: /
      - paragraph [ref=e19]: Child Compass™
    - generic [ref=e21]:
      - generic [ref=e22]:
        - heading "Create your account" [level=1] [ref=e23]
        - paragraph [ref=e24]: About a minute
      - generic [ref=e25]:
        - generic [ref=e26]:
          - text: Your name
          - textbox "Your name" [ref=e27]:
            - /placeholder: Sarah
            - text: QA Parent
        - generic [ref=e28]:
          - text: Email
          - textbox "Email" [ref=e29]: qa_parent_1782841958650@childcompass.test
        - generic [ref=e30]:
          - text: Password
          - textbox "Password" [ref=e31]: CompassPass123!
          - paragraph [ref=e32]: At least 8 characters
        - button "Create account" [active] [ref=e33]
      - paragraph [ref=e34]:
        - text: Already have an account?
        - link "Sign in" [ref=e35] [cursor=pointer]:
          - /url: /login
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("brand-new parent journey", async ({ page }) => {
  4  |   test.setTimeout(120_000);
  5  |   const stamp = Date.now();
  6  |   const email = `qa_parent_${stamp}@childcompass.test`;
  7  |   const password = "CompassPass123!";
  8  | 
  9  |   await page.goto("http://localhost:3000/register");
  10 |   await page.evaluate(() => localStorage.removeItem("cc-onboarding-v2"));
  11 |   await expect(page).toHaveURL(/\/register/);
  12 | 
  13 |   await page.getByLabel(/your name/i).fill("QA Parent");
  14 |   await page.getByLabel(/^email$/i).fill(email);
  15 |   await page.getByLabel(/^password$/i).fill(password);
  16 |   await page.getByTestId("register-submit").click();
  17 | 
> 18 |   await page.waitForURL(/\/(verify-email|onboarding|today|dashboard)/, { timeout: 45000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 45000ms exceeded.
  19 | 
  20 |   if (page.url().includes("/verify-email")) {
  21 |     await page.goto("http://localhost:3000/onboarding");
  22 |   }
  23 | 
  24 |   if (page.url().includes("/today") || page.url().includes("/dashboard")) {
  25 |     const continueOnboarding = page.getByRole("link", { name: /continue onboarding/i });
  26 |     if (await continueOnboarding.isVisible().catch(() => false)) {
  27 |       await continueOnboarding.click();
  28 |     }
  29 |   }
  30 | 
  31 |   await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });
  32 | 
  33 |   const letsBegin = page.getByRole("button", { name: /let'?s begin/i });
  34 |   if (await letsBegin.isVisible().catch(() => false)) {
  35 |     await page.getByTestId("onboarding-start").click();
  36 |   }
  37 | 
  38 |   await page.getByLabel(/family name/i).fill("QA Family");
  39 |   await page.getByLabel(/^country$/i).fill("South Africa");
  40 |   await page.getByLabel(/timezone/i).fill("Africa/Johannesburg");
  41 |   await page.getByTestId("onboarding-family-next").click();
  42 | 
  43 |   await page.getByLabel(/first name/i).fill("QA Child");
  44 |   await page.getByTestId("onboarding-child-next").click();
  45 |   await page.getByTestId("onboarding-invite-skip").click();
  46 |   await page.getByTestId("onboarding-finish").click();
  47 | 
  48 |   const error = page.locator("text=/error|violates|could not find/i");
  49 |   await expect(error).toHaveCount(0);
  50 | 
  51 |   await page.getByRole("button", { name: /go to today/i }).click();
  52 |   await expect(page).toHaveURL(/\/(today|dashboard)/, { timeout: 15000 });
  53 | 
  54 |   await page.goto("http://localhost:3000/check-in");
  55 |   await page.getByRole("button", { name: /save check-in|submit|complete/i }).first().click();
  56 | 
  57 |   await page.goto("http://localhost:3000/coach");
  58 |   await page.getByRole("textbox").first().fill("Today was challenging after school.");
  59 |   await page.getByRole("button", { name: /ask child compass/i }).click();
  60 | 
  61 |   await page.goto("http://localhost:3000/timeline");
  62 |   await expect(page.getByText(/timeline/i).first()).toBeVisible();
  63 | 
  64 |   await page.goto("http://localhost:3000/reports");
  65 |   await page.getByRole("button", { name: /^generate$/i }).first().click();
  66 | 
  67 |   await page.goto("http://localhost:3000/today");
  68 |   await page.getByRole("button", { name: /^logout$/i }).click({ force: true });
  69 |   await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
  70 | 
  71 |   await page.getByLabel(/^email$/i).fill(email);
  72 |   await page.getByLabel(/^password$/i).fill(password);
  73 |   await page.getByRole("button", { name: /sign in/i }).click();
  74 | 
  75 |   await expect(page).toHaveURL(/\/(today|dashboard)/, { timeout: 15000 });
  76 | });
  77 | 
```