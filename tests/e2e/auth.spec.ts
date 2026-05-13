import { test, expect } from "./_fixtures";

test.describe("Landing & auth", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    // Should show NalarUp branding somewhere; at minimum the page should
    // render and <title> should be set.
    await expect(page).toHaveTitle(/NalarUp|Next/i);
  });

  test("unauthenticated access to dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    await expect(page.getByPlaceholder("kamu@email.com")).toBeVisible();
  });

  test("register → dashboard", async ({ page, registeredUser }) => {
    // Fixture already performed register; verify we're on dashboard.
    await expect(page).toHaveURL(/\/dashboard/);
    // "Hei, <firstname>" heading rendered
    await expect(
      page.getByRole("heading", { name: new RegExp(`Hei, ${registeredUser.fullName.split(" ")[0]}`) })
    ).toBeVisible();
  });

  test("logout works and blocks protected routes", async ({ page, registeredUser }) => {
    // Logged in via fixture; perform logout through the sidebar button.
    await page.getByRole("button", { name: /Keluar/i }).click();
    await page.waitForURL(/\/(login)?$/, { timeout: 10_000 });

    // Try to access dashboard — should bounce back to login.
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);

    // Re-login should work.
    await page.getByPlaceholder("kamu@email.com").fill(registeredUser.email);
    await page.getByPlaceholder("••••••••").fill(registeredUser.password);
    await page.getByRole("button", { name: /Masuk/i }).click();
    await page.waitForURL(/\/dashboard/);
  });
});
