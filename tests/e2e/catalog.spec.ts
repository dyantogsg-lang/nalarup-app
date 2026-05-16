import { test, expect } from "./_fixtures";

test.describe("Catalog & tryout detail", () => {
  test("catalog shows packages", async ({ page, registeredUser }) => {
    void registeredUser; // ensures we're logged in
    await page.goto("/tryouts");
    await expect(page.getByRole("heading", { name: /Katalog Tryout/ })).toBeVisible();
    // Should show at least one SKD simulasi package
    await expect(page.getByText(/SKD CPNS Simulasi Penuh/).first()).toBeVisible();
    await expect(page.getByText(/Practice TIU/).first()).toBeVisible();
  });

  test("filter narrows list", async ({ page, registeredUser }) => {
    void registeredUser;
    // Navigate directly with filter param (server-side filtering)
    await page.goto("/tryouts?cat=tiu");

    // TIU package should be present
    await expect(page.getByText(/Practice TIU/).first()).toBeVisible();
    // SKD package should be filtered out
    await expect(page.getByText(/SKD CPNS Simulasi Penuh/)).not.toBeVisible();
  });

  test("package detail shows composition + rules", async ({ page, registeredUser }) => {
    void registeredUser;
    await page.goto("/tryouts/skd-simulasi-penuh-1");

    await expect(page.getByRole("heading", { name: /SKD CPNS Simulasi Penuh — Paket 1/ })).toBeVisible();
    await expect(page.getByText(/100 menit/).first()).toBeVisible();
  });

  test("search filters catalog", async ({ page, registeredUser }) => {
    void registeredUser;
    await page.goto("/tryouts");

    const searchInput = page.getByPlaceholder(/Cari/);
    await searchInput.fill("TWK");

    // Wait for filtered results (TIU should disappear)
    await expect(page.getByText(/Practice TIU/).first()).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Practice TWK/).first()).toBeVisible();
  });
});
