interface LevelBadgeProps {
  level: number;
  className?: string;
}

function getRankName(level: number): string {
  if (level >= 50) return "Legend";
  if (level >= 40) return "Master";
  if (level >= 30) return "Expert";
  if (level >= 20) return "Warrior";
  if (level >= 10) return "Explorer";
  if (level >= 5) return "Apprentice";
  return "Novice";
}

function getRankColor(level: number): { border: string; text: string; glow: string } {
  if (level >= 50) return { border: "border-amber-400", text: "text-amber-400", glow: "shadow-[0_0_16px_rgba(251,191,36,0.3)]" };
  if (level >= 40) return { border: "border-violet-400", text: "text-violet-400", glow: "shadow-[0_0_16px_rgba(167,139,250,0.3)]" };
  if (level >= 30) return { border: "border-blue-400", text: "text-blue-400", glow: "shadow-[0_0_16px_rgba(96,165,250,0.3)]" };
  if (level >= 20) return { border: "border-emerald-400", text: "text-emerald-400", glow: "shadow-[0_0_16px_rgba(52,211,153,0.3)]" };
  if (level >= 10) return { border: "border-teal-400", text: "text-teal-400", glow: "shadow-[0_0_12px_rgba(45,212,191,0.2)]" };
  if (level >= 5) return { border: "border-sky-400", text: "text-sky-400", glow: "" };
  return { border: "border-gray-400", text: "text-gray-400", glow: "" };
}

/**
 * LevelBadge — Shield-shaped level indicator with rank name.
 */
export function LevelBadge({ level, className = "" }: LevelBadgeProps) {
  const rank = getRankName(level);
  const colors = getRankColor(level);

  return (
    <div
      className={`inline-flex flex-col items-center gap-1 ${className}`}
      role="img"
      aria-label={`Level ${level} — ${rank}`}
    >
      {/* Shield shape via clip-path */}
      <div
        className={`relative flex h-14 w-12 items-center justify-center border-2 ${colors.border} ${colors.glow} bg-white/[0.04]`}
        style={{
          clipPath: "polygon(50% 0%, 100% 15%, 100% 70%, 50% 100%, 0% 70%, 0% 15%)",
        }}
        aria-hidden="true"
      >
        <span className={`text-lg font-bold ${colors.text}`}>{level}</span>
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
        {rank}
      </span>
    </div>
  );
}
