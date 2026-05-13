import { describe, it, expect } from "vitest";
import { validatePackageForPublish } from "@/lib/admin/packageQueries";
import type { AdminPackageDetail } from "@/lib/admin/packageQueries";

// Note: validatePackageForPublish also queries DB for option details. We only
// test the pure structural checks here by providing an empty assignedQuestions
// list OR a list with no question_id that would be reached by the DB check.
// For pure tests, we keep assignedQuestions empty so the option-level check
// path is skipped.

function makePkg(
  overrides: Partial<AdminPackageDetail> = {}
): AdminPackageDetail {
  return {
    id: "p1",
    title: "Paket Uji",
    slug: "paket-uji",
    description: "Deskripsi paket uji.",
    categoryId: null,
    mode: "simulation",
    status: "draft",
    difficulty: "medium",
    durationMinutes: 30,
    totalQuestions: 30,
    isOpenAccess: true,
    passingGradeTotal: null,
    passingGradeTwk: null,
    passingGradeTiu: null,
    passingGradeTkp: null,
    targetSafeScore: null,
    showRanking: false,
    subtests: [
      { id: "s1", subtest: "TWK", questionCount: 10, passingGrade: null, sortOrder: 0 },
      { id: "s2", subtest: "TIU", questionCount: 10, passingGrade: null, sortOrder: 1 },
      { id: "s3", subtest: "TKP", questionCount: 10, passingGrade: null, sortOrder: 2 },
    ],
    assignedQuestions: [],
    ...overrides,
  };
}

describe("validatePackageForPublish (structural checks)", () => {
  it("fails on empty title", async () => {
    const v = await validatePackageForPublish(makePkg({ title: " " }));
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/Judul/);
  });

  it("fails on empty description", async () => {
    const v = await validatePackageForPublish(makePkg({ description: "" }));
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/Deskripsi/);
  });

  it("fails when durationMinutes is non-positive", async () => {
    const v = await validatePackageForPublish(makePkg({ durationMinutes: 0 }));
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/Durasi/);
  });

  it("fails when subtest composition is empty", async () => {
    const v = await validatePackageForPublish(makePkg({ subtests: [] }));
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/subtes/);
  });

  it("fails when subtest count sum doesn't match totalQuestions", async () => {
    const v = await validatePackageForPublish(
      makePkg({
        totalQuestions: 30,
        subtests: [
          { id: "a", subtest: "TWK", questionCount: 5, passingGrade: null, sortOrder: 0 },
          { id: "b", subtest: "TIU", questionCount: 5, passingGrade: null, sortOrder: 1 },
        ],
      })
    );
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/komposisi/);
  });

  it("fails when assignedQuestions count mismatches totalQuestions", async () => {
    const v = await validatePackageForPublish(
      makePkg({ totalQuestions: 5, subtests: [] })
    );
    expect(v.ok).toBe(false);
    // Both "komposisi" and "assigned" errors fire
    expect(v.errors.join(" ")).toMatch(/assign/);
  });
});
