"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export interface FilterOptions {
  categories: { slug: string; name: string }[];
}

const MODE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Mode" },
  { value: "simulation", label: "Simulasi" },
  { value: "practice", label: "Latihan" },
];

const DIFFICULTY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Level" },
  { value: "easy", label: "Mudah" },
  { value: "medium", label: "Sedang" },
  { value: "hard", label: "Sulit" },
];

export function CatalogFilters({ categories }: FilterOptions) {
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("q") ?? "");
  const category = params.get("cat") ?? "all";
  const mode = params.get("mode") ?? "all";
  const difficulty = params.get("diff") ?? "all";

  // Full navigation to trigger server re-render
  const navigate = useCallback((qs: string) => {
    const base = window.location.pathname;
    window.location.href = qs ? `${base}?${qs}` : base;
  }, []);

  // Debounce search — only navigate if value actually changed from URL
  useEffect(() => {
    const currentQ = params.get("q") ?? "";
    const trimmed = search.trim();
    if (trimmed === currentQ) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      navigate(next.toString());
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all" || value === "") next.delete(key);
    else next.set(key, value);
    navigate(next.toString());
  };

  const resetAll = () => {
    setSearch("");
    navigate("");
  };

  const hasActiveFilter =
    category !== "all" ||
    mode !== "all" ||
    difficulty !== "all" ||
    search.trim().length > 0;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      marginBottom: "1.5rem",
      padding: "1.25rem 1.5rem",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "1rem",
    }}>
      {/* Search with icon */}
      <div style={{ position: "relative" }}>
        <svg
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-dim)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            left: "0.875rem",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="search"
          placeholder="Cari paket tryout…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem 0.75rem 2.5rem",
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            color: "var(--text-primary)",
            fontSize: "0.88rem",
            outline: "none",
          }}
        />
      </div>

      {/* Category chips — bigger */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <Chip
          label="Semua"
          active={category === "all"}
          onClick={() => setParam("cat", "all")}
        />
        {categories.map((c) => (
          <Chip
            key={c.slug}
            label={c.name}
            active={category === c.slug}
            onClick={() => setParam("cat", c.slug)}
          />
        ))}
      </div>

      {/* Mode + difficulty dropdowns */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <Select
          value={mode}
          onChange={(v) => setParam("mode", v)}
          options={MODE_OPTIONS}
          label="Mode"
        />
        <Select
          value={difficulty}
          onChange={(v) => setParam("diff", v)}
          options={DIFFICULTY_OPTIONS}
          label="Level"
        />
        {hasActiveFilter && (
          <button
            onClick={resetAll}
            style={{
              marginLeft: "auto",
              padding: "0.5rem 1rem",
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              borderRadius: "0.625rem",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: 500,
              transition: "border-color 150ms ease",
            }}
          >
            ✕ Reset filter
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "999px",
        border: active
          ? "1px solid rgba(37,99,235,0.4)"
          : "1px solid var(--border)",
        background: active
          ? "rgba(37,99,235,0.1)"
          : "var(--bg-base)",
        color: active ? "var(--blue)" : "var(--text-muted)",
        fontSize: "0.82rem",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <label style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      color: "var(--text-muted)",
      fontSize: "0.82rem",
    }}>
      <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--bg-base)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          padding: "0.45rem 0.75rem",
          borderRadius: "0.5rem",
          fontSize: "0.82rem",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "var(--bg-base)" }}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
