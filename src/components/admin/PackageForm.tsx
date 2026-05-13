"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PackageFormInput } from "@/lib/admin/packageActions";

export interface PackageFormProps {
  initial?: Partial<PackageFormInput> & { id?: string; slug?: string; status?: string };
  categories: { id: string; name: string; slug: string }[];
  onSubmit: (input: PackageFormInput) => Promise<
    { ok: true; id: string; slug: string } | { ok: false; error: string }
  >;
  onSetStatus?: (
    id: string,
    status: "draft" | "review" | "published" | "archived"
  ) => Promise<
    | { ok: true; status: "draft" | "review" | "published" | "archived" }
    | { ok: false; errors: string[] }
  >;
  onDelete?: (id: string) => Promise<void>;
}

const SUBTEST_OPTIONS: PackageFormInput["subtests"][number]["subtest"][] = [
  "TWK",
  "TIU",
  "TKP",
  "SKB",
];

export function PackageForm({
  initial,
  categories,
  onSubmit,
  onSetStatus,
  onDelete,
}: PackageFormProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);

  const [form, setForm] = useState<PackageFormInput>({
    id: initial?.id,
    title: initial?.title ?? "",
    slug: initial?.slug,
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? null,
    mode: initial?.mode ?? "simulation",
    difficulty: initial?.difficulty ?? "medium",
    durationMinutes: initial?.durationMinutes ?? 30,
    totalQuestions: initial?.totalQuestions ?? 30,
    isOpenAccess: initial?.isOpenAccess ?? true,
    passingGradeTotal: initial?.passingGradeTotal ?? null,
    passingGradeTwk: initial?.passingGradeTwk ?? null,
    passingGradeTiu: initial?.passingGradeTiu ?? null,
    passingGradeTkp: initial?.passingGradeTkp ?? null,
    targetSafeScore: initial?.targetSafeScore ?? null,
    showRanking: initial?.showRanking ?? false,
    subtests: initial?.subtests ?? [
      { subtest: "TWK", questionCount: 10, passingGrade: null },
      { subtest: "TIU", questionCount: 10, passingGrade: null },
      { subtest: "TKP", questionCount: 10, passingGrade: null },
    ],
  });

  function update<K extends keyof PackageFormInput>(k: K, v: PackageFormInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function save() {
    setErr(null);
    start(async () => {
      const res = await onSubmit(form);
      if (!res.ok) {
        setErr(res.error);
      } else if (!form.id) {
        router.push(`/admin/packages/${res.id}/edit`);
      } else {
        router.refresh();
      }
    });
  }

  function setStatus(status: "draft" | "review" | "published" | "archived") {
    if (!form.id || !onSetStatus) return;
    setPublishErrors([]);
    start(async () => {
      const res = await onSetStatus(form.id!, status);
      if (!res.ok) {
        setPublishErrors(res.errors);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div style={{ maxWidth: 860 }}>
      {err && (
        <div
          style={{
            padding: "0.75rem",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "0.45rem",
            color: "#FCA5A5",
            fontSize: "0.82rem",
            marginBottom: "1rem",
          }}
        >
          Gagal menyimpan: {err}
        </div>
      )}

      {publishErrors.length > 0 && (
        <div
          style={{
            padding: "0.75rem 0.9rem",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "0.45rem",
            color: "#FCD34D",
            fontSize: "0.82rem",
            marginBottom: "1rem",
          }}
        >
          <strong>Validasi publish gagal:</strong>
          <ul style={{ margin: "0.4rem 0 0 1.25rem", padding: 0 }}>
            {publishErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta */}
      <section className="glass-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
        <h3 style={sectionTitle}>Informasi Dasar</h3>
        <Field label="Judul">
          <input
            style={inputStyle}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </Field>
        <Field label="Deskripsi">
          <textarea
            rows={3}
            style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>
        <div style={gridTwo}>
          <Field label="Kategori">
            <select
              style={inputStyle}
              value={form.categoryId ?? ""}
              onChange={(e) => update("categoryId", e.target.value || null)}
            >
              <option value="" style={{ background: "#0A0F1E" }}>— Pilih —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={{ background: "#0A0F1E" }}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mode">
            <select
              style={inputStyle}
              value={form.mode}
              onChange={(e) => update("mode", e.target.value as "simulation")}
            >
              <option value="simulation" style={{ background: "#0A0F1E" }}>Simulasi</option>
              <option value="practice" style={{ background: "#0A0F1E" }}>Latihan</option>
            </select>
          </Field>
          <Field label="Tingkat">
            <select
              style={inputStyle}
              value={form.difficulty}
              onChange={(e) => update("difficulty", e.target.value as "easy")}
            >
              <option value="easy" style={{ background: "#0A0F1E" }}>Mudah</option>
              <option value="medium" style={{ background: "#0A0F1E" }}>Sedang</option>
              <option value="hard" style={{ background: "#0A0F1E" }}>Sulit</option>
            </select>
          </Field>
          <Field label="Durasi (menit)">
            <input
              type="number"
              min={1}
              style={inputStyle}
              value={form.durationMinutes}
              onChange={(e) => update("durationMinutes", Number(e.target.value))}
            />
          </Field>
          <Field label="Total Soal">
            <input
              type="number"
              min={1}
              style={inputStyle}
              value={form.totalQuestions}
              onChange={(e) => update("totalQuestions", Number(e.target.value))}
            />
          </Field>
          <Field label="Target Skor Aman">
            <input
              type="number"
              style={inputStyle}
              value={form.targetSafeScore ?? ""}
              onChange={(e) =>
                update("targetSafeScore", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
        </div>
      </section>

      {/* Passing grade */}
      <section className="glass-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
        <h3 style={sectionTitle}>Passing Grade</h3>
        <div style={gridTwo}>
          <Field label="Total">
            <input
              type="number"
              style={inputStyle}
              value={form.passingGradeTotal ?? ""}
              onChange={(e) =>
                update("passingGradeTotal", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label="TWK">
            <input
              type="number"
              style={inputStyle}
              value={form.passingGradeTwk ?? ""}
              onChange={(e) =>
                update("passingGradeTwk", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label="TIU">
            <input
              type="number"
              style={inputStyle}
              value={form.passingGradeTiu ?? ""}
              onChange={(e) =>
                update("passingGradeTiu", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label="TKP">
            <input
              type="number"
              style={inputStyle}
              value={form.passingGradeTkp ?? ""}
              onChange={(e) =>
                update("passingGradeTkp", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
        </div>
      </section>

      {/* Subtest composition */}
      <section className="glass-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
        <h3 style={sectionTitle}>Komposisi Subtes</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {form.subtests.map((s, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: "0.5rem",
                alignItems: "end",
              }}
            >
              <Field label="Subtes" compact>
                <select
                  style={inputStyle}
                  value={s.subtest}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      subtests: p.subtests.map((x, idx) =>
                        idx === i ? { ...x, subtest: e.target.value as "TWK" } : x
                      ),
                    }))
                  }
                >
                  {SUBTEST_OPTIONS.map((t) => (
                    <option key={t} value={t} style={{ background: "#0A0F1E" }}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Jumlah" compact>
                <input
                  type="number"
                  min={1}
                  style={inputStyle}
                  value={s.questionCount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      subtests: p.subtests.map((x, idx) =>
                        idx === i ? { ...x, questionCount: Number(e.target.value) } : x
                      ),
                    }))
                  }
                />
              </Field>
              <Field label="Passing grade" compact>
                <input
                  type="number"
                  style={inputStyle}
                  value={s.passingGrade ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      subtests: p.subtests.map((x, idx) =>
                        idx === i
                          ? {
                              ...x,
                              passingGrade: e.target.value === "" ? null : Number(e.target.value),
                            }
                          : x
                      ),
                    }))
                  }
                />
              </Field>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    subtests: p.subtests.filter((_, idx) => idx !== i),
                  }))
                }
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#FCA5A5",
                  borderRadius: "0.4rem",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                }}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((p) => ({
              ...p,
              subtests: [...p.subtests, { subtest: "TWK", questionCount: 5, passingGrade: null }],
            }))
          }
          style={{
            marginTop: "0.6rem",
            padding: "0.4rem 0.85rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px dashed rgba(255,255,255,0.15)",
            color: "#94A3B8",
            borderRadius: "0.4rem",
            fontSize: "0.78rem",
            cursor: "pointer",
          }}
        >
          + Tambah subtes
        </button>
      </section>

      {/* Flags */}
      <section className="glass-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
        <label style={checkLabel}>
          <input
            type="checkbox"
            checked={form.isOpenAccess}
            onChange={(e) => update("isOpenAccess", e.target.checked)}
          />
          Open access (dapat diakses semua user)
        </label>
        <label style={checkLabel}>
          <input
            type="checkbox"
            checked={form.showRanking}
            onChange={(e) => update("showRanking", e.target.checked)}
          />
          Tampilkan ranking pada hasil
        </label>
      </section>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn-primary"
          disabled={pending}
          onClick={save}
          style={{ padding: "0.6rem 1.25rem", fontSize: "0.88rem", fontWeight: 600 }}
        >
          {pending ? "Menyimpan..." : form.id ? "Simpan Perubahan" : "Buat Paket"}
        </button>

        {form.id && onSetStatus && initial?.status !== "published" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setStatus("published")}
            style={ghostBtn}
          >
            Publish
          </button>
        )}
        {form.id && onSetStatus && initial?.status === "published" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setStatus("draft")}
            style={ghostBtn}
          >
            Unpublish
          </button>
        )}
        {form.id && onDelete && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("Hapus paket ini? Ini tidak bisa dibatalkan.")) {
                start(async () => {
                  await onDelete(form.id!);
                });
              }
            }}
            style={{
              padding: "0.6rem 1rem",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#FCA5A5",
              borderRadius: "0.45rem",
              marginLeft: "auto",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Hapus Paket
          </button>
        )}
      </div>
    </div>
  );
}

// ─── shared styles ──────────────────────────────────────────────────────────

const sectionTitle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#F1F5F9",
  fontWeight: 600,
  marginBottom: "0.85rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0.4rem",
  color: "#F1F5F9",
  fontSize: "0.85rem",
  outline: "none",
};

const gridTwo: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "0.65rem",
};

const checkLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  color: "#CBD5E1",
  fontSize: "0.85rem",
  marginBottom: "0.5rem",
};

const ghostBtn: React.CSSProperties = {
  padding: "0.6rem 1rem",
  background: "rgba(96,165,250,0.1)",
  border: "1px solid rgba(96,165,250,0.25)",
  color: "#BFDBFE",
  borderRadius: "0.45rem",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
};

function Field({
  label,
  children,
  compact,
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <label style={{ display: "block", marginBottom: compact ? 0 : "0.6rem" }}>
      <span
        style={{
          display: "block",
          fontSize: "0.72rem",
          color: "#94A3B8",
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
