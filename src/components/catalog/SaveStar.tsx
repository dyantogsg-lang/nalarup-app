"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "nalarup-saved-packages";

function getSavedPackages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function toggleSaved(slug: string): boolean {
  const saved = getSavedPackages();
  const idx = saved.indexOf(slug);
  if (idx >= 0) {
    saved.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return false;
  } else {
    saved.push(slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  }
}

export function SaveStar({ slug }: { slug: string }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(getSavedPackages().includes(slug));
  }, [slug]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleSaved(slug);
    setIsSaved(next);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isSaved ? "Hapus dari simpanan" : "Simpan paket"}
      title={isSaved ? "Hapus dari simpanan" : "Simpan paket"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "4px",
        transition: "transform 150ms ease, opacity 150ms ease",
        transform: isSaved ? "scale(1.1)" : "scale(1)",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isSaved ? "#F59E0B" : "none"}
        stroke={isSaved ? "#F59E0B" : "var(--text-dim)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: "fill 200ms ease, stroke 200ms ease",
          filter: isSaved ? "drop-shadow(0 0 3px rgba(245,158,11,0.5))" : "none",
        }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
