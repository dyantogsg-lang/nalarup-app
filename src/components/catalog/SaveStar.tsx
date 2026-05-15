"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "nalarup-saved-packages";
const STORAGE_EVENT = "nalarup-saved-packages-change";

function getSavedPackages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function getSavedPackagesFromSnapshot(snapshot: string): string[] {
  try {
    return JSON.parse(snapshot);
  } catch {
    return [];
  }
}

function getSavedSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function subscribeToSavedPackages(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  window.addEventListener("focus", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
}

function writeSavedPackages(saved: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function toggleSaved(slug: string): boolean {
  const saved = getSavedPackages();
  const idx = saved.indexOf(slug);
  if (idx >= 0) {
    saved.splice(idx, 1);
    writeSavedPackages(saved);
    return false;
  } else {
    saved.push(slug);
    writeSavedPackages(saved);
    return true;
  }
}

export function SaveStar({ slug }: { slug: string }) {
  const savedSnapshot = useSyncExternalStore(subscribeToSavedPackages, getSavedSnapshot, () => "[]");
  const isSaved = getSavedPackagesFromSnapshot(savedSnapshot).includes(slug);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(slug);
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
