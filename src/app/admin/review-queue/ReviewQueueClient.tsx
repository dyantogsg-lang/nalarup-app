"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReviewQueueItem } from "@/lib/admin/reviewQueries";

interface Props {
  items: ReviewQueueItem[];
  currentSubtest: string;
  currentVerified: string;
  page: number;
  pageSize: number;
  approveAction: (
    id: string,
    notes?: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  rejectAction: (
    id: string,
    notes: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  editApproveAction: (input: {
    id: string;
    questionText?: string;
    explanation?: string;
    explanationShort?: string | null;
    notes?: string;
    options?: { id?: string; text: string; isCorrect?: boolean; scoreValue?: number }[];
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  bulkApproveAction: (
    ids: string[]
  ) => Promise<{ ok: true; count: number } | { ok: false; error: string }>;
}

export function ReviewQueueClient({
  items,
  currentSubtest,
  currentVerified,
  page,
  pageSize,
  approveAction,
  rejectAction,
  editApproveAction,
  bulkApproveAction,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function navigate(params: Record<string, string | undefined>) {
    const usp = new URLSearchParams();
    if (params.subtest && params.subtest !== "all") usp.set("subtest", params.subtest);
    if (params.verified) usp.set("verified", params.verified);
    if (params.page && params.page !== "1") usp.set("page", params.page);
    router.push(`/admin/review-queue?${usp.toString()}`);
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function toggleAll() {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  }

  function handleApprove(id: string) {
    setFeedback(null);
    start(async () => {
      const res = await approveAction(id);
      if (res.ok) {
        setFeedback("✓ Soal disetujui");
        router.refresh();
      } else setFeedback(`✗ ${res.error}`);
    });
  }

  function handleReject(id: string) {
    const notes = prompt("Alasan penolakan:");
    if (!notes) return;
    setFeedback(null);
    start(async () => {
      const res = await rejectAction(id, notes);
      if (res.ok) {
        setFeedback("✓ Soal ditolak (archived)");
        router.refresh();
      } else setFeedback(`✗ ${res.error}`);
    });
  }

  function handleBulkApprove() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Approve ${ids.length} soal sekaligus?`)) return;
    setFeedback(null);
    start(async () => {
      const res = await bulkApproveAction(ids);
      if (res.ok) {
        setFeedback(`✓ ${res.count} soal disetujui`);
        setSelected(new Set());
        router.refresh();
      } else setFeedback(`✗ ${res.error}`);
    });
  }

  return (
    <div>
      {/* Filter bar */}
      <div
        className="glass-card"
        style={{
          padding: "0.85rem 1rem",
          marginBottom: "1rem",
          display: "flex",
          gap: "0.65rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Select
          label="Subtest"
          value={currentSubtest}
          options={[
            { value: "all", label: "Semua" },
            { value: "TWK", label: "TWK" },
            { value: "TIU", label: "TIU" },
            { value: "TKP", label: "TKP" },
            { value: "SKB", label: "SKB" },
          ]}
          onChange={(v) => navigate({ subtest: v, verified: currentVerified, page: "1" })}
        />
        <Select
          label="Status"
          value={currentVerified}
          options={[
            { value: "no", label: "Belum verified" },
            { value: "yes", label: "Sudah verified" },
            { value: "all", label: "Semua" },
          ]}
          onChange={(v) => navigate({ subtest: currentSubtest, verified: v, page: "1" })}
        />
        <div style={{ flex: 1 }} />
        {selected.size > 0 && (
          <button
            type="button"
            onClick={handleBulkApprove}
            disabled={pending}
            className="btn-primary"
            style={{ padding: "0.45rem 0.9rem", fontSize: "0.78rem", cursor: "pointer" }}
          >
            ✓ Bulk Approve ({selected.size})
          </button>
        )}
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.6rem 0.9rem",
            background: feedback.startsWith("✓")
              ? "rgba(52,211,153,0.08)"
              : "rgba(239,68,68,0.08)",
            border: `1px solid ${
              feedback.startsWith("✓") ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"
            }`,
            borderRadius: "0.4rem",
            color: feedback.startsWith("✓") ? "#6EE7B7" : "#FCA5A5",
            fontSize: "0.8rem",
            marginBottom: "0.85rem",
          }}
        >
          {feedback}
        </div>
      )}

      {/* Bulk select header */}
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          alignItems: "center",
          padding: "0.45rem 0.85rem",
          marginBottom: "0.6rem",
          fontSize: "0.78rem",
          color: "#94A3B8",
        }}
      >
        <input
          type="checkbox"
          checked={selected.size === items.length && items.length > 0}
          onChange={toggleAll}
        />
        <span>{selected.size} dipilih dari {items.length} soal</span>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: "2rem", textAlign: "center", color: "#64748B", fontSize: "0.85rem" }}
        >
          Tidak ada soal yang cocok filter ini.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {items.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              selected={selected.has(q.id)}
              onToggle={() => toggleSelect(q.id)}
              isEditing={editing === q.id}
              onEdit={() => setEditing(editing === q.id ? null : q.id)}
              onApprove={() => handleApprove(q.id)}
              onReject={() => handleReject(q.id)}
              editApproveAction={editApproveAction}
              onEditDone={() => {
                setEditing(null);
                setFeedback("✓ Soal di-edit & disetujui");
                router.refresh();
              }}
              pending={pending}
              startTransition={start}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {items.length === pageSize && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.25rem" }}>
          {page > 1 && (
            <Link
              href={`/admin/review-queue?subtest=${currentSubtest}&verified=${currentVerified}&page=${page - 1}`}
              className="btn-ghost"
              style={{ padding: "0.45rem 0.9rem", fontSize: "0.78rem", textDecoration: "none" }}
            >
              ← Prev
            </Link>
          )}
          <Link
            href={`/admin/review-queue?subtest=${currentSubtest}&verified=${currentVerified}&page=${page + 1}`}
            className="btn-ghost"
            style={{ padding: "0.45rem 0.9rem", fontSize: "0.78rem", textDecoration: "none" }}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#94A3B8" }}>
      {label}:
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "0.4rem 0.7rem",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "0.35rem",
          color: "#F1F5F9",
          fontSize: "0.8rem",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#0A0F1E" }}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function QuestionCard({
  q,
  selected,
  onToggle,
  isEditing,
  onEdit,
  onApprove,
  onReject,
  editApproveAction,
  onEditDone,
  pending,
  startTransition,
}: {
  q: ReviewQueueItem;
  selected: boolean;
  onToggle: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  editApproveAction: Props["editApproveAction"];
  onEditDone: () => void;
  pending: boolean;
  startTransition: (cb: () => void) => void;
}) {
  const [text, setText] = useState(q.questionText);
  const [exp, setExp] = useState(q.explanation ?? "");
  const [expShort, setExpShort] = useState(q.explanationShort ?? "");
  const [opts, setOpts] = useState(q.options.map((o) => ({ ...o })));
  const [notes, setNotes] = useState("");

  function saveEdit() {
    startTransition(async () => {
      const res = await editApproveAction({
        id: q.id,
        questionText: text,
        explanation: exp,
        explanationShort: expShort || null,
        notes: notes || undefined,
        options: opts.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
          scoreValue: o.scoreValue,
        })),
      });
      if (res.ok) onEditDone();
    });
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: "1rem 1.15rem",
        borderColor: q.verified ? "rgba(52,211,153,0.3)" : undefined,
      }}
    >
      <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
        <input type="checkbox" checked={selected} onChange={onToggle} style={{ marginTop: "0.3rem" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <Badge color="#60A5FA" bg="rgba(96,165,250,0.12)">{q.subtest}</Badge>
            <Badge color="#94A3B8" bg="rgba(255,255,255,0.04)">{q.difficulty}</Badge>
            {q.scoringType === "weighted_options" && (
              <Badge color="#F472B6" bg="rgba(244,114,182,0.12)">weighted 1-5</Badge>
            )}
            {q.verified ? (
              <Badge color="#6EE7B7" bg="rgba(52,211,153,0.12)">✓ verified</Badge>
            ) : (
              <Badge color="#FBBF24" bg="rgba(251,191,36,0.12)">unverified</Badge>
            )}
            {q.topicName && <Badge color="#A78BFA" bg="rgba(167,139,250,0.1)">{q.topicName}</Badge>}
            {q.sourceNote && (
              <span style={{ fontSize: "0.7rem", color: "#64748B", marginLeft: "auto" }}>
                {q.sourceNote}
              </span>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              style={editTextStyle}
            />
          ) : (
            <p style={{ color: "#F1F5F9", fontSize: "0.88rem", lineHeight: 1.55, marginBottom: "0.7rem" }}>
              {q.questionText}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.7rem" }}>
            {(isEditing ? opts : q.options).map((o, idx) => (
              <div
                key={o.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.4rem 0.65rem",
                  background:
                    q.scoringType === "single_correct" && o.isCorrect
                      ? "rgba(52,211,153,0.08)"
                      : q.scoringType === "weighted_options" && o.scoreValue === 5
                      ? "rgba(52,211,153,0.08)"
                      : "rgba(255,255,255,0.02)",
                  border:
                    q.scoringType === "single_correct" && o.isCorrect
                      ? "1px solid rgba(52,211,153,0.25)"
                      : q.scoringType === "weighted_options" && o.scoreValue === 5
                      ? "1px solid rgba(52,211,153,0.25)"
                      : "1px solid rgba(255,255,255,0.04)",
                  borderRadius: "0.35rem",
                  fontSize: "0.82rem",
                  color: "#CBD5E1",
                }}
              >
                <span style={{ fontWeight: 600, minWidth: 20 }}>{o.label}.</span>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={o.text}
                      onChange={(e) => {
                        const next = [...opts];
                        next[idx] = { ...next[idx], text: e.target.value };
                        setOpts(next);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.25rem 0.45rem",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "0.25rem",
                        color: "#F1F5F9",
                        fontSize: "0.8rem",
                      }}
                    />
                    {q.scoringType === "weighted_options" ? (
                      <select
                        value={o.scoreValue}
                        onChange={(e) => {
                          const next = [...opts];
                          next[idx] = { ...next[idx], scoreValue: Number(e.target.value) };
                          setOpts(next);
                        }}
                        style={{
                          padding: "0.2rem 0.4rem",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#F1F5F9",
                          borderRadius: "0.25rem",
                          fontSize: "0.78rem",
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n} style={{ background: "#0A0F1E" }}>
                            {n}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem" }}>
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={o.isCorrect}
                          onChange={() => {
                            const next = opts.map((x, i) => ({ ...x, isCorrect: i === idx }));
                            setOpts(next);
                          }}
                        />
                        Benar
                      </label>
                    )}
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{o.text}</span>
                    {q.scoringType === "weighted_options" && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: o.scoreValue === 5 ? "#6EE7B7" : "#94A3B8",
                          minWidth: 18,
                          textAlign: "right",
                        }}
                      >
                        {o.scoreValue}
                      </span>
                    )}
                    {q.scoringType === "single_correct" && o.isCorrect && (
                      <span style={{ fontSize: "0.7rem", color: "#6EE7B7", fontWeight: 600 }}>✓</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {isEditing ? (
            <>
              <textarea
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                rows={3}
                placeholder="Pembahasan lengkap"
                style={editTextStyle}
              />
              <input
                type="text"
                value={expShort}
                onChange={(e) => setExpShort(e.target.value)}
                placeholder="Pembahasan ringkas"
                style={{ ...editTextStyle, marginTop: "0.4rem" }}
              />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan review (opsional)"
                style={{ ...editTextStyle, marginTop: "0.4rem", fontSize: "0.78rem" }}
              />
            </>
          ) : (
            q.explanation && (
              <div
                style={{
                  padding: "0.5rem 0.7rem",
                  background: "rgba(96,165,250,0.05)",
                  borderLeft: "2px solid rgba(96,165,250,0.4)",
                  borderRadius: "0.3rem",
                  fontSize: "0.78rem",
                  color: "#94A3B8",
                  lineHeight: 1.55,
                  marginBottom: "0.5rem",
                }}
              >
                <strong style={{ color: "#BFDBFE" }}>Pembahasan:</strong> {q.explanation}
              </div>
            )
          )}

          {q.reviewedByName && (
            <div style={{ fontSize: "0.7rem", color: "#64748B", marginBottom: "0.5rem" }}>
              Direview oleh {q.reviewedByName}{" "}
              {q.reviewedAt && (
                <span>· {new Date(q.reviewedAt).toLocaleString("id-ID")}</span>
              )}
              {q.reviewNotes && <span> · "{q.reviewNotes}"</span>}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={pending}
                  className="btn-primary"
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem", cursor: "pointer" }}
                >
                  💾 Simpan & Approve
                </button>
                <button
                  type="button"
                  onClick={onEdit}
                  className="btn-ghost"
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem", cursor: "pointer" }}
                >
                  Batal
                </button>
              </>
            ) : (
              !q.verified && (
                <>
                  <button
                    type="button"
                    onClick={onApprove}
                    disabled={pending}
                    style={{
                      padding: "0.4rem 0.85rem",
                      fontSize: "0.78rem",
                      background: "rgba(52,211,153,0.12)",
                      border: "1px solid rgba(52,211,153,0.3)",
                      color: "#6EE7B7",
                      borderRadius: "0.35rem",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="btn-ghost"
                    style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem", cursor: "pointer" }}
                  >
                    ✎ Edit & Approve
                  </button>
                  <button
                    type="button"
                    onClick={onReject}
                    disabled={pending}
                    style={{
                      padding: "0.4rem 0.85rem",
                      fontSize: "0.78rem",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      color: "#FCA5A5",
                      borderRadius: "0.35rem",
                      cursor: "pointer",
                    }}
                  >
                    ✗ Reject
                  </button>
                </>
              )
            )}
            <a
              href={`/admin/questions/${q.id}/edit`}
              style={{
                padding: "0.4rem 0.85rem",
                fontSize: "0.78rem",
                color: "#94A3B8",
                textDecoration: "none",
                marginLeft: "auto",
              }}
            >
              Buka editor lengkap →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span
      style={{
        padding: "0.18rem 0.5rem",
        background: bg,
        border: `1px solid ${bg.replace("0.12", "0.25").replace("0.1", "0.25").replace("0.04", "0.15")}`,
        color,
        borderRadius: "0.3rem",
        fontSize: "0.7rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

const editTextStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.65rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0.3rem",
  color: "#F1F5F9",
  fontSize: "0.85rem",
  fontFamily: "inherit",
  resize: "vertical",
  outline: "none",
  marginBottom: "0.5rem",
};
