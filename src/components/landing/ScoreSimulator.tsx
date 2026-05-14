"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

const PG = { TWK: 65, TIU: 80, TKP: 166 };
const MAX = { TWK: 150, TIU: 175, TKP: 225 };

function SliderRow({
  label,
  value,
  min,
  max,
  pg,
  color,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  pg: number;
  color: string;
  onChange: (v: number) => void;
}) {
  const pass = value >= pg;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em" }}>{label}</span>
          <span style={{
            fontSize: "0.65rem", fontWeight: 600, padding: "0.1rem 0.45rem",
            borderRadius: "9999px",
            background: pass ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
            color: pass ? "#4ADE80" : "#FCA5A5",
          }}>
            {pass ? "✓ Lulus" : `−${pg - value}`}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
          <span className="num" style={{ fontSize: "1.1rem", fontWeight: 700, color: pass ? "#4ADE80" : "#FCA5A5" }}>{value}</span>
          <span style={{ fontSize: "0.65rem", color: "#475569" }}>/ PG {pg}</span>
        </div>
      </div>

      {/* Track with PG marker */}
      <div style={{ position: "relative" }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="score-slider"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #1E293B ${pct}%, #1E293B 100%)`,
          }}
          aria-label={`Skor ${label}`}
        />
        {/* PG marker */}
        <div style={{
          position: "absolute",
          left: `${((pg - min) / (max - min)) * 100}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 2,
          height: 12,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 1,
          pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

export default function ScoreSimulator() {
  const [twk, setTwk] = useState(72);
  const [tiu, setTiu] = useState(68);
  const [tkp, setTkp] = useState(148);

  const total = twk + tiu + tkp;
  const pgTotal = PG.TWK + PG.TIU + PG.TKP; // 311
  const passTwk = twk >= PG.TWK;
  const passTiu = tiu >= PG.TIU;
  const passTkp = tkp >= PG.TKP;
  const passAll = passTwk && passTiu && passTkp && total >= pgTotal;
  const gap = pgTotal - total;

  // Which subtests are failing
  const failing = [
    !passTwk && `TWK (−${PG.TWK - twk})`,
    !passTiu && `TIU (−${PG.TIU - tiu})`,
    !passTkp && `TKP (−${PG.TKP - tkp})`,
  ].filter(Boolean);

  return (
    <div className="glass-card" style={{
      padding: "2rem",
      maxWidth: 520,
      margin: "0 auto",
      background: "rgba(14,18,35,0.95)",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.5)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#F1F5F9", marginBottom: "0.2rem" }}>
            Simulasi Skor SKD
          </div>
          <div style={{ fontSize: "0.72rem", color: "#475569" }}>Geser untuk lihat posisi kamu</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="num" style={{
            fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em",
            color: passAll ? "#4ADE80" : gap <= 20 ? "#FCD34D" : "#F1F5F9",
            lineHeight: 1,
          }}>
            {total}
          </div>
          <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: "0.2rem" }}>
            Total · PG <span className="num">{pgTotal}</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <SliderRow label="TWK" value={twk} min={0} max={MAX.TWK} pg={PG.TWK} color="#60A5FA" onChange={setTwk} />
      <SliderRow label="TIU" value={tiu} min={0} max={MAX.TIU} pg={PG.TIU} color="#A78BFA" onChange={setTiu} />
      <SliderRow label="TKP" value={tkp} min={0} max={MAX.TKP} pg={PG.TKP} color="#4ADE80" onChange={setTkp} />

      {/* Result */}
      <div style={{
        marginTop: "0.5rem",
        padding: "1rem 1.25rem",
        borderRadius: "0.75rem",
        background: passAll
          ? "rgba(34,197,94,0.08)"
          : gap <= 20
          ? "rgba(245,158,11,0.08)"
          : "rgba(239,68,68,0.06)",
        border: `1px solid ${passAll ? "rgba(34,197,94,0.2)" : gap <= 20 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.15)"}`,
      }}>
        {passAll ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span style={{ fontSize: "1.1rem" }}>🎉</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#4ADE80" }}>Lulus passing grade SKD!</div>
              <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: "0.15rem" }}>Semua subtes dan total skor memenuhi syarat.</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
              <span style={{ fontSize: "1rem" }}>{gap <= 20 ? "⚡" : "📍"}</span>
              <span style={{ fontWeight: 700, fontSize: "0.875rem", color: gap <= 20 ? "#FCD34D" : "#F1F5F9" }}>
                {gap <= 20 ? `Hampir! Kurang ${gap} poin lagi` : `Kurang ${gap} poin dari passing grade`}
              </span>
            </div>
            {failing.length > 0 && (
              <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                Fokus ke: <span style={{ color: "#FCA5A5", fontWeight: 600 }}>{failing.join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <Link href={ROUTES.register} style={{ display: "block", marginTop: "1.25rem" }}>
        <button className="btn-primary" style={{ width: "100%", padding: "0.75rem", fontSize: "0.875rem", cursor: "pointer" }}>
          Tryout sekarang — lihat skor aslimu
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </Link>
    </div>
  );
}
