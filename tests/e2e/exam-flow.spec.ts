import { test, expect } from "./_fixtures";

/**
 * Full happy-path: start a tryout, answer some questions, submit, land on
 * result page with visible score.
 *
 * Uses "Practice TWK — Set 1" (15 soal, 15m) to keep the run short.
 */
test.describe("Exam flow", () => {
  test("start → answer 3 → submit → result", async ({ page, registeredUser }) => {
    void registeredUser;

    // Open the detail page
    await page.goto("/tryouts/practice-twk-1");
    await expect(page.getByRole("heading", { name: /Practice TWK — Set 1/ })).toBeVisible();

    // Open the start modal
    await page.getByRole("button", { name: /Mulai Tryout/ }).click();

    // Modal: confirm start
    await expect(page.getByRole("heading", { name: /Siap memulai\?/ })).toBeVisible();
    await page.getByRole("button", { name: /Mulai Sekarang/ }).click();

    // Should arrive at /exam/<uuid>
    await page.waitForURL(/\/exam\/[0-9a-f-]+/, { timeout: 15_000 });

    // The question card should be visible
    await expect(page.getByText(/Soal #1/)).toBeVisible();

    // Answer the first 3 questions by clicking first option + save
    for (let i = 0; i < 3; i++) {
      // Click first option (A)
      await page.locator("[data-option]").first().click();
      // Click save button (CAT BKN manual save)
      await page.getByRole("button", { name: /Simpan/i }).click();
      await page.waitForTimeout(300);
      // Go to next question (except on the final answer)
      if (i < 2) {
        await page.getByRole("button", { name: /Selanjutnya|Next/i }).click();
      }
    }

    // Navigate to the last question via the navigator grid
    await page.locator("[data-nav-item='14']").click();
    await expect(page.getByText(/Soal #15/)).toBeVisible();

    // Click Submit
    await page.getByRole("button", { name: /Submit/i }).click();

    // Confirm dialog
    await page.getByRole("button", { name: /Ya|Submit/i }).last().click();

    // Lands on result page
    await page.waitForURL(/\/results\/[0-9a-f-]+/, { timeout: 15_000 });

    // Score visible
    await expect(page.getByText(/Skor|skor|Score/i).first()).toBeVisible();
  });

  test("detail page shows 'Lanjutkan' when attempt is active", async ({ page, registeredUser }) => {
    void registeredUser;

    // Start a tryout and leave it running
    await page.goto("/tryouts/practice-tiu-1");
    await page.getByRole("button", { name: /Mulai Tryout/ }).click();
    await page.getByRole("button", { name: /Mulai Sekarang/ }).click();
    await page.waitForURL(/\/exam\//);

    // Go back to detail page
    await page.goto("/tryouts/practice-tiu-1");

    // Active attempt banner or resume button should be visible
    await expect(
      page.getByRole("button", { name: /Lanjutkan/i }).or(page.getByText(/masih punya tryout/i))
    ).toBeVisible();
  });
});
