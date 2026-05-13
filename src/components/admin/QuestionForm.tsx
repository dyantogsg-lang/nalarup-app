"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { QuestionFormInput } from "@/lib/admin/questionActions";

interface Props {
  initial?: Partial<QuestionFormInput> & { id?: string; status?: string };
  topics: { id: string; name: string; subtest: string | null }[];
  categories: { id: string; name: string }[];
  onSubmit: (input: QuestionFormInput) => Promise<
    | { ok: true; id: string }
    | { ok: false; errors: string[] }
  >;
  onSetStatus?: (
    id: string,
    status: "draft" | "reviewed" | "published" | "archived"
  ) => Promise<{ ok: true } | { ok: false; errors: string[] }>;
  onDelete?: (id: string) => Promise<void>;
}

export function QuestionForm({
  initial,
  topics,
  categories,
  onSubmit,
  onSetStatus,
  onDelete,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errs, setErrs] = useState<string[]>([]);

  const [form, setForm] = useState<QuestionFormInput>({
    id: initial?.id,
    questionText: initial?.questionText ?? "",
    subtest: initial?.subtest ?? "TWK",
    scoringType: initial?.scoringType ?? "single_correct",
    difficulty: initial?.difficulty ?? "medium",
    topicId: initial?.topicId ?? null,
    categoryId: initial?.categoryId ?? null,
    explanation: initial?.explanation ?? "",
    explanationShort: initial?.explanationShort ?? "",
    sourceNote: initial?.sourceNote ?? "",
    options:
      initial?.options ??
      [
        { label: "A", text: "", isCorrect: false, scoreValue: 1 },
        { label: "B", text: "", isCorrect: false, scoreValue: 1 },
        { label: "C", text: "", isCorrect: false, scoreValue: 1 },
        { label: "D", text: "", isCorrect: false, scoreValue: 1 },
        { label: "E", text: "", isCorrect: false, scoreValue: 1 },
      ],
  });

  function update<K extends keyof QuestionFormInput>(k: K, v: QuestionFormInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function setOption(i: number, patch: Partial<QuestionFormInput["options"][number]>) {
    setForm((p) => ({
      ...p,
      options: p.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    }));
  }

  function setCorrectIndex(i: number) {
    if (form.scoringType !== "single_correct") return;
    setForm((p) => ({
      ...p,
      options: p.options.map((o, idx) => ({ ...o, isCorrect: idx === i })),
    }));
  }

  function save() {
    setErrs([]);
    start(async () => {
      const res = await onSubmit(form);
      if (!res.ok) setErrs(res.errors);
      else if (!form.id) router.push(`/admin/questions/${res.id}/edit`);
      else router.refresh();
    });
  }

  function setStatus(status: "draft" | "reviewed" | "published" | "archived") {
    if (!form.id || !onSetStatus) return;
    setErrs([]);
    start(async () => {
      const res = await onSetStatus(form.id!, status);
      if (!res.ok) setErrs(res.errors);
      else router.refresh();
    });
  }

  return (
    <div style={{ maxWidth: 860 }}>
      {errs.length > 0 && (
        <div
          style={{
            padding: "0.75rem 0.9rem",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "0.45rem",
            color: "#FCD34D",
            fontSize: "0.8rem",
            marginBottom: "1rem",
          }}
        >
          <strong>Validasi gagal:</strong>
          <ul style={{ margin: "0.4rem 0 0 1.2rem", padding: 0 }}>
            {errs.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="glass-card" style={section}>
        <h3 style={sectionTitle}>Soal</h3>
        <Field label="Teks soal">
          <textarea
            rows={4}
            style={{ ...input, fontFamily: "inherit", resize: "vertical" }}
            value={form.questionText}
            onChange={(e) => update("questionText", e.target.value)}
          />
        </Field>
        <div style={gridTwo}>
          <Field label="Subtes">
            <select
              style={input}
              value={form.subtest}
              onChange={(e) => update("subtest", e.target.value as "TWK")}
            >
              <option value="TWK" style={bg}>TWK</option>
              <option value="TIU" style={bg}>TIU</option>
              <option value="TKP" style={bg}>TKP</option>
              <option value="SKB" style={bg}>SKB</option>
            </select>
          </Field>
          <Field label="Tipe scoring">
            <select
              style={input}
              value={form.scoringType}
              onChange={(e) => update("scoringType", e.target.value as "single_correct")}
            >
              <option value="single_correct" style={bg}>Single correct (TWK/TIU)</option>
              <option value="weighted_options" style={bg}>Weighted 1-5 (TKP)</option>
            </select>
          </Field>
          <Field label="Tingkat">
            <select
              style={input}
              value={form.difficulty}
              onChange={(e) => update("difficulty", e.target.value as "easy")}
            >
              <option value="easy" style={bg}>Mudah</option>
              <option value="medium" style={bg}>Sedang</option>
              <option value="hard" style={bg}>Sulit</option>
            </select>
          </Field>
          <Field label="Topik">
            <select
              style={input}
              value={form.topicId ?? ""}
              onChange={(e) => update("topicId", e.target.value || null)}
            >
              <option value="" style={bg}>— Pilih —</option>
              {topics
                .filter((t) => !t.subtest || t.subtest === form.subtest)
                .map((t) => (
                  <option key={t.id} value={t.id} style={bg}>
                    {t.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Kategori">
            <select
              style={input}
              value={form.categoryId ?? ""}
              onChange={(e) => update("categoryId", e.target.value || null)}
            >
              <option value="" style={bg}>— Pilih —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={bg}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Catatan sumber">
            <input
              style={input}
              value={form.sourceNote ?? ""}
              onChange={(e) => update("sourceNote", e.target.value)}
              placeholder="opsional"
            />
          </Field>
        </div>
      </section>

      <section className="glass-card" style={section}>
        <h3 style={sectionTitle}>Opsi Jawaban</h3>
        <p style={hint}>
          {form.scoringType === "single_correct"
            ? "Pilih satu opsi yang benar."
            : "Setiap opsi punya skor 1-5. Tepat satu opsi harus bernilai 5."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {form.options.map((o, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr 100px auto",
                gap: "0.55rem",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                style={{ ...input, width: 60, textAlign: "center", fontWeight: 600 }}
                value={o.label}
                onChange={(e) => setOption(i, { label: e.target.value.toUpperCase().slice(0, 2) })}
              />
              <input
                type="text"
                style={input}
                placeholder={`Teks opsi ${o.label}`}
                value={o.text}
                onChange={(e) => setOption(i, { text: e.target.value })}
              />
              {form.scoringType === "single_correct" ? (
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#CBD5E1", fontSize: "0.8rem" }}>
                  <input
                    type="radio"
                    name="correct"
                    checked={o.isCorrect}
                    onChange={() => setCorrectIndex(i)}
                  />
                  Benar
                </label>
              ) : (
                <select
                  style={input}
                  value={o.scoreValue}
                  onChange={(e) => setOption(i, { scoreValue: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n} style={bg}>
                      {n} poin
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, options: p.options.filter((_, idx) => idx !== i) }))
                }
                style={{
                  padding: "0.3rem 0.55rem",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#FCA5A5",
                  borderRadius: "0.3rem",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (form.options.length >= 6) return;
            const nextLabel = String.fromCharCode(
              65 + form.options.length
            );
            setForm((p) => ({
              ...p,
              options: [
                ...p.options,
                { label: nextLabel, text: "", isCorrect: false, scoreValue: 1 },
              ],
            }));
          }}
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
          + Tambah opsi
        </button>
      </section>

      <section className="glass-card" style={section}>
        <h3 style={sectionTitle}>Pembahasan</h3>
        <Field label="Pembahasan lengkap">
          <textarea
            rows={4}
            style={{ ...input, fontFamily: "inherit", resize: "vertical" }}
            value={form.explanation ?? ""}
            onChange={(e) => update("explanation", e.target.value)}
          />
        </Field>
        <Field label="Ringkasan singkat (untuk Mode Review Cepat)">
          <input
            style={input}
            value={form.explanationShort ?? ""}
            onChange={(e) => update("explanationShort", e.target.value)}
          />
        </Field>
      </section>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn-primary"
          disabled={pending}
          onClick={save}
          style={{ padding: "0.6rem 1.25rem", fontSize: "0.88rem", fontWeight: 600 }}
        >
          {pending ? "Menyimpan..." : form.id ? "Simpan Perubahan" : "Buat Soal"}
        </button>
        {form.id && onSetStatus && initial?.status !== "published" && (
          <button type="button" disabled={pending} onClick={() => setStatus("published")} style={ghost}>
            Publish
          </button>
        )}
        {form.id && onSetStatus && initial?.status === "published" && (
          <button type="button" disabled={pending} onClick={() => setStatus("draft")} style={ghost}>
            Unpublish
          </button>
        )}
        {form.id && onDelete && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("Hapus soal ini? Ini juga akan menghapus answer attempts terkait.")) {
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
            Hapus Soal
          </button>
        )}
      </div>
    </div>
  );
}

// styles
const section: React.CSSProperties = {
  padding: "1.25rem 1.5rem",
  marginBottom: "1rem",
};
const sectionTitle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#F1F5F9",
  fontWeight: 600,
  marginBottom: "0.65rem",
};
const hint: React.CSSProperties = { color: "#64748B", fontSize: "0.75rem", marginBottom: "0.6rem" };
const input: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.7rem",
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
const ghost: React.CSSProperties = {
  padding: "0.6rem 1rem",
  background: "rgba(96,165,250,0.1)",
  border: "1px solid rgba(96,165,250,0.25)",
  color: "#BFDBFE",
  borderRadius: "0.45rem",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
};
const bg = { background: "#0A0F1E" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: "0.55rem" }}>
      <span style={{ display: "block", fontSize: "0.72rem", color: "#94A3B8", marginBottom: "0.3rem" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
