"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Assigned {
  id: string; // package_questions row id
  orderNumber: number;
  questionId: string;
  subtest: string;
  questionText: string;
  status: string;
}
interface Candidate {
  id: string;
  questionText: string;
  subtest: string;
  status: string;
}

interface Props {
  packageId: string;
  initialAssigned: Assigned[];
  candidates: Candidate[];
  onAssign: (packageId: string, questionId: string) => Promise<{ ok: boolean; error?: string }>;
  onRemove: (packageId: string, questionId: string) => Promise<void>;
}

export function AssignedQuestionsManager({
  packageId,
  initialAssigned,
  candidates,
  onAssign,
  onRemove,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");

  const assignedIds = new Set(initialAssigned.map((a) => a.questionId));
  const filtered = candidates.filter(
    (c) =>
      !assignedIds.has(c.id) &&
      (search.trim() === "" ||
        c.questionText.toLowerCase().includes(search.toLowerCase()) ||
        c.subtest.toLowerCase().includes(search.toLowerCase()))
  );

  function assign(qid: string) {
    start(async () => {
      await onAssign(packageId, qid);
      router.refresh();
    });
  }
  function remove(qid: string) {
    start(async () => {
      await onRemove(packageId, qid);
      router.refresh();
    });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="assigned-grid">
      <div>
        <h4 style={{ fontSize: "0.85rem", color: "#F1F5F9", marginBottom: "0.5rem" }}>
          Terassign ({initialAssigned.length})
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: 420, overflowY: "auto" }}>
          {initialAssigned.length === 0 && (
            <p style={{ color: "#64748B", fontSize: "0.8rem" }}>Belum ada soal.</p>
          )}
          {initialAssigned.map((q) => (
            <div key={q.id} style={rowStyle}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.2rem" }}>
                  <span style={orderBadge}>#{q.orderNumber}</span>
                  <span style={subtestBadge}>{q.subtest}</span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "0.25rem",
                      background: q.status === "published" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.1)",
                      color: q.status === "published" ? "#6EE7B7" : "#FCD34D",
                    }}
                  >
                    {q.status}
                  </span>
                </div>
                <div style={{ color: "#CBD5E1", fontSize: "0.78rem", lineHeight: 1.4 }}>
                  {q.questionText.length > 90 ? `${q.questionText.slice(0, 90)}…` : q.questionText}
                </div>
              </div>
              <button
                disabled={pending}
                onClick={() => remove(q.questionId)}
                style={removeBtn}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: "0.85rem", color: "#F1F5F9", marginBottom: "0.5rem" }}>
          Bank Soal ({candidates.length - initialAssigned.length} tersedia)
        </h4>
        <input
          placeholder="Cari soal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.45rem 0.7rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#F1F5F9",
            borderRadius: "0.35rem",
            fontSize: "0.82rem",
            marginBottom: "0.45rem",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: 370, overflowY: "auto" }}>
          {filtered.length === 0 && (
            <p style={{ color: "#64748B", fontSize: "0.8rem" }}>Tidak ada soal cocok.</p>
          )}
          {filtered.slice(0, 50).map((c) => (
            <div key={c.id} style={rowStyle}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.2rem" }}>
                  <span style={subtestBadge}>{c.subtest}</span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "0.25rem",
                      background: c.status === "published" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.1)",
                      color: c.status === "published" ? "#6EE7B7" : "#FCD34D",
                    }}
                  >
                    {c.status}
                  </span>
                </div>
                <div style={{ color: "#CBD5E1", fontSize: "0.78rem", lineHeight: 1.4 }}>
                  {c.questionText.length > 90 ? `${c.questionText.slice(0, 90)}…` : c.questionText}
                </div>
              </div>
              <button disabled={pending} onClick={() => assign(c.id)} style={addBtn}>
                +
              </button>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 780px) {
          .assigned-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.55rem",
  padding: "0.5rem 0.65rem",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "0.4rem",
  alignItems: "flex-start",
};
const orderBadge: React.CSSProperties = {
  fontSize: "0.65rem",
  background: "rgba(96,165,250,0.12)",
  color: "#BFDBFE",
  padding: "0.1rem 0.35rem",
  borderRadius: "0.2rem",
};
const subtestBadge: React.CSSProperties = {
  fontSize: "0.65rem",
  background: "rgba(167,139,250,0.12)",
  color: "#C4B5FD",
  padding: "0.1rem 0.4rem",
  borderRadius: "0.25rem",
};
const removeBtn: React.CSSProperties = {
  padding: "0.2rem 0.55rem",
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.2)",
  color: "#FCA5A5",
  borderRadius: "0.3rem",
  cursor: "pointer",
  fontSize: "1rem",
  lineHeight: 1,
};
const addBtn: React.CSSProperties = {
  padding: "0.2rem 0.55rem",
  background: "rgba(16,185,129,0.1)",
  border: "1px solid rgba(16,185,129,0.2)",
  color: "#6EE7B7",
  borderRadius: "0.3rem",
  cursor: "pointer",
  fontSize: "1rem",
  lineHeight: 1,
};
