"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("q") ?? "");
  const category = params.get("cat") ?? "all";
  const mode = params.get("mode") ?? "all";
  const difficulty = params.get("diff") ?? "all";

  // Debounce search updates to URL
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (search.trim()) next.set("q", search.trim());
      else next.delete("q");
      const qs = next.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [search, params, router]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all" || value === "") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  const resetAll = () => {
    setSearch("");
    router.replace("?", { scroll: false });
  };

  const hasActiveFilter =
    category !== "all" ||
    mode !== "all" ||
    difficulty !== "all" ||
    search.trim().length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      {/* Search */}
      <input
        type="search"
        placeholder="Cari paket tryout…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "0.7rem 1rem",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "0.6rem",
          color: "#F1F5F9",
          fontSize: "0.9rem",
          outline: "none",
        }}
      />

      {/* Category chips */}
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
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
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
              padding: "0.45rem 0.9rem",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94A3B8",
              borderRadius: "0.45rem",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Reset filter
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
        padding: "0.4rem 0.85rem",
        borderRadius: "999px",
        border: active
          ? "1px solid rgba(96,165,250,0.5)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "rgba(96,165,250,0.15)"
          : "rgba(255,255,255,0.02)",
        color: active ? "#BFDBFE" : "#94A3B8",
        fontSize: "0.8rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
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
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        color: "#94A3B8",
        fontSize: "0.8rem",
      }}
    >
      <span style={{ color: "#64748B" }}>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#F1F5F9",
          padding: "0.4rem 0.6rem",
          borderRadius: "0.4rem",
          fontSize: "0.8rem",
          outline: "none",
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
