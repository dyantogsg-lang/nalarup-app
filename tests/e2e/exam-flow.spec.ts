import { test, expect } from "./_fixtures";

/**
 * Full happy-path: start a tryout, answer some questions, submit, land on
 * result page with visible score.
 *
 * Uses "TWK Fokus Nasionalisme" (15 soal, 15m) to keep the run short.
 */
test.describe("Exam flow", () => {
  test("start → answer 3 → submit → result", async ({ page, registeredUser }) => {
    void registeredUser;

    // Open the detail page
    await page.goto("/tryouts/twk-fokus-nasionalisme");
    await expect(page.getByRole("heading", { name: /TWK Fokus Nasionalisme/ })).toBeVisible();

    // Open the start modal
    await page.getByRole("button", { name: /Mulai Tryout/ }).click();

    // Modal: confirm start
    await expect(page.getByRole("heading", { name: /Siap memulai\?/ })).toBeVisible();
    await page.getByRole("button", { name: /Mulai Sekarang/ }).click();

    // Should arrive at /exam/<uuid>
    await page.waitForURL(/\/exam\/[0-9a-f-]+/, { timeout: 15_000 });

    // The question card + timer should be visible
    await expect(page.getByText(/^Ujian$/)).toBeVisible();
    await expect(page.getByText(/Soal #1/)).toBeVisible();

    // Answer the first 3 questions by clicking any option
    for (let i = 0; i < 3; i++) {
      // Click option A (first option button inside the question card)
      await page.getByRole("button", { name: /^A\. / }).first().click();
      // Allow autosave to flush
      await page.waitForTimeout(200);
      // Go to next question (except on the final answer)
      if (i < 2) {
        await page.getByRole("button", { name: /Selanjutnya/ }).click();
      }
    }

    // Navigate to the last question via the navigator grid to reach Submit
    // Soal 15 is the last — use the nav button with "15"
    await page.getByTitle(/Soal 15/).click();
    await expect(page.getByText(/Soal #15/)).toBeVisible();

    // Click the green "Submit Tryout" in the bottom nav
    await page.getByRole("button", { name: /^Submit Tryout$/ }).click();

    // Confirm dialog
    await expect(page.getByRole("heading", { name: /Submit tryout sekarang/ })).toBeVisible();
    await page.getByRole("button", { name: /Ya, Submit/ }).click();

    // Lands on result page
    await page.waitForURL(/\/results\/[0-9a-f-]+/, { timeout: 15_000 });

    // Either "Lulus passing grade" or "Belum lulus" — test is robust
    await expect(page.getByText(/Skor total/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Bahas soal salah/ })).toBeVisible();
  });

  test("detail page shows 'Lanjutkan' when attempt is active", async ({ page, registeredUser }) => {
    void registeredUser;

    // Start a tryout and leave it running
    await page.goto("/tryouts/tiu-logika-dasar");
    await page.getByRole("button", { name: /Mulai Tryout/ }).click();
    await page.getByRole("button", { name: /Mulai Sekarang/ }).click();
    await page.waitForURL(/\/exam\//);

    // Go back to detail page
    await page.goto("/tryouts/tiu-logika-dasar");

    // Active attempt banner should be visible
    await expect(page.getByText(/Kamu masih punya tryout/)).toBeVisible();
    // The primary CTA should now say "Lanjutkan Tryout" (resume)
    await expect(page.getByRole("button", { name: /Lanjutkan Tryout/ })).toBeVisible();

    // Clicking it should skip the modal and drop the user straight into /exam
    await page.getByRole("button", { name: /Lanjutkan Tryout/ }).click();
    await page.waitForURL(/\/exam\//);
  });
});
