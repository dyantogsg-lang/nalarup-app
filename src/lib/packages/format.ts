/**
 * Formatting + presentation helpers for catalog & detail pages.
 */

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} jam` : `${h} jam ${m} menit`;
}

export function difficultyLabel(d: "easy" | "medium" | "hard"): string {
  switch (d) {
    case "easy":
      return "Mudah";
    case "medium":
      return "Sedang";
    case "hard":
      return "Sulit";
  }
}

export function modeLabel(m: "simulation" | "practice"): string {
  return m === "simulation" ? "Simulasi" : "Latihan";
}

export function modeColor(m: "simulation" | "practice"): {
  bg: string;
  fg: string;
  border: string;
} {
  return m === "simulation"
    ? { bg: "rgba(99,102,241,0.12)", fg: "#A5B4FC", border: "rgba(99,102,241,0.25)" }
    : { bg: "rgba(14,165,233,0.12)", fg: "#7DD3FC", border: "rgba(14,165,233,0.25)" };
}

export function difficultyColor(d: "easy" | "medium" | "hard"): {
  bg: string;
  fg: string;
} {
  switch (d) {
    case "easy":
      return { bg: "rgba(16,185,129,0.1)", fg: "#6EE7B7" };
    case "medium":
      return { bg: "rgba(245,158,11,0.1)", fg: "#FCD34D" };
    case "hard":
      return { bg: "rgba(239,68,68,0.1)", fg: "#FCA5A5" };
  }
}

export function ctaForAttemptStatus(status: string | null): {
  label: string;
  variant: "primary" | "ghost";
} {
  if (status === "in_progress") return { label: "Lanjutkan", variant: "primary" };
  if (status === "submitted") return { label: "Ulangi Tryout", variant: "ghost" };
  return { label: "Mulai Tryout", variant: "primary" };
}
