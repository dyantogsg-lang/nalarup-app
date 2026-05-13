import { test as base, expect, type Page } from "@playwright/test";

/**
 * Generate a unique email so tests don't collide with one another on re-runs.
 * Cleanup is handled by the global teardown in tests/e2e/_cleanup.ts.
 */
export function freshEmail(prefix = "e2e"): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${rand}@nalarup.local`;
}

export interface AuthedUser {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Register a fresh user via the /register UI and wait until the dashboard
 * renders. Returns the credentials so the test can log in again if needed.
 */
export async function registerUser(
  page: Page,
  fullName = "E2E User"
): Promise<AuthedUser> {
  const email = freshEmail();
  const password = "Test1234!";

  await page.goto("/register");
  await page.getByPlaceholder("Nama kamu").fill(fullName);
  await page.getByPlaceholder("kamu@email.com").fill(email);
  await page.getByPlaceholder("Minimal 6 karakter").fill(password);
  await page.getByRole("button", { name: /Daftar Gratis/i }).click();

  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Hei,/ })).toBeVisible();

  return { email, password, fullName };
}

export async function loginUser(page: Page, user: AuthedUser): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("kamu@email.com").fill(user.email);
  await page.getByPlaceholder("••••••••").fill(user.password);
  await page.getByRole("button", { name: /Masuk/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

/**
 * Extend base test to expose a `registeredUser` fixture that's lazy —
 * tests that don't need auth won't pay the cost.
 */
export const test = base.extend<{ registeredUser: AuthedUser }>({
  registeredUser: async ({ page }, use) => {
    const user = await registerUser(page);
    await use(user);
  },
});

export { expect };
