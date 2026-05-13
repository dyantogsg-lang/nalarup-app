import { test, expect } from "./_fixtures";

test.describe("Catalog & tryout detail", () => {
  test("catalog shows seeded packages", async ({ page, registeredUser }) => {
    void registeredUser; // ensures we're logged in
    await page.goto("/tryouts");
    await expect(page.getByRole("heading", { name: /Katalog Tryout/ })).toBeVisible();
    // Seeded package
    await expect(page.getByText(/SKD CPNS — Paket Perdana/)).toBeVisible();
    await expect(page.getByText(/TIU Logika Dasar/)).toBeVisible();
  });

  test("filter narrows list", async ({ page, registeredUser }) => {
    void registeredUser;
    await page.goto("/tryouts");

    // Click TIU category chip
    await page.getByRole("button", { name: "TIU" }).click();
    await page.waitForURL(/cat=tiu/);

    // TIU package should still be present
    await expect(page.getByText(/TIU Logika Dasar/)).toBeVisible();
    // TKP package should be filtered out
    await expect(page.getByText(/TKP Pelayanan Publik/)).not.toBeVisible();
  });

  test("package detail shows composition + rules", async ({ page, registeredUser }) => {
    void registeredUser;
    await page.goto("/tryouts/skd-cpns-paket-perdana");

    await expect(page.getByRole("heading", { name: /SKD CPNS — Paket Perdana/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Komposisi Subtes/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Aturan Ujian/ })).toBeVisible();

    // 30 soal badge somewhere
    await expect(page.getByText(/30 soal/).first()).toBeVisible();
    await expect(page.getByText(/30 menit/).first()).toBeVisible();
  });

  test("search filters catalog", async ({ page, registeredUser }) => {
    void registeredUser;
    await page.goto("/tryouts");

    const searchInput = page.getByPlaceholder(/Cari paket tryout/);
    await searchInput.fill("TWK");
    await page.waitForURL(/q=TWK/, { timeout: 5_000 });

    await expect(page.getByText(/TWK Fokus Nasionalisme/)).toBeVisible();
    await expect(page.getByText(/TIU Logika Dasar/)).not.toBeVisible();
  });
});
