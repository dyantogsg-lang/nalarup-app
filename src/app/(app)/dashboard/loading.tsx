/**
 * Dashboard loading skeleton — shown while server component fetches data.
 * Mobile-first layout matching the redesigned dashboard structure.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[var(--container-lg)] px-4 sm:px-6 animate-pulse">
      {/* Header skeleton */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <div className="h-8 w-48 rounded-lg bg-[var(--border)] mb-2" />
          <div className="h-4 w-64 rounded bg-[var(--border)]" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-[var(--border)]" />
      </header>

      {/* Score ring + stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 mb-4">
        {/* Ring card */}
        <div className="glass-card p-6 flex flex-col items-center">
          <div className="w-[120px] h-[120px] rounded-full border-8 border-[var(--border)] mb-4" />
          <div className="h-4 w-24 rounded bg-[var(--border)] mb-2" />
          <div className="h-3 w-32 rounded bg-[var(--border)]" />
        </div>

        {/* Stat cards grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="h-3 w-16 rounded bg-[var(--border)] mb-3" />
              <div className="h-7 w-12 rounded bg-[var(--border)] mb-2" />
              <div className="h-3 w-20 rounded bg-[var(--border)]" />
            </div>
          ))}
        </div>
      </div>

      {/* History skeleton */}
      <div className="glass-card p-5">
        <div className="h-4 w-28 rounded bg-[var(--border)] mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-[var(--border)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
