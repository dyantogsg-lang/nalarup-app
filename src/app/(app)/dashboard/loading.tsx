/**
 * Dashboard loading skeleton — dark themed with glassmorphism pulse.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[var(--container-lg)] px-4 sm:px-6 pb-8">
      {/* HUD Top Bar skeleton */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse" />
            </div>
          </div>
          <div className="flex-1 h-4 rounded-full bg-white/[0.06] animate-pulse" />
          <div className="h-8 w-16 rounded-full bg-white/[0.06] animate-pulse" />
        </div>
      </div>

      {/* Bento Grid skeleton */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(140px,auto)]">
        {/* Large score card */}
        <div className="sm:col-span-2 row-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-white/[0.06] animate-pulse mb-4" />
          <div className="h-6 w-20 rounded-full bg-white/[0.06] animate-pulse" />
        </div>

        {/* Daily challenge card */}
        <div className="sm:col-span-2 lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" />
          </div>
          <div className="h-5 w-48 rounded bg-white/[0.06] animate-pulse mb-3" />
          <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse mb-2" />
          <div className="h-3 w-3/4 rounded bg-white/[0.04] animate-pulse mb-6" />
          <div className="h-10 w-32 rounded-xl bg-white/[0.06] animate-pulse" />
        </div>

        {/* Streak card */}
        <div className="col-span-1 rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col items-center justify-center">
          <div className="h-3 w-12 rounded bg-white/[0.06] animate-pulse mb-4" />
          <div className="h-10 w-10 rounded bg-white/[0.06] animate-pulse mb-2" />
          <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse mt-2" />
          <div className="flex gap-1 mt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm bg-white/[0.06] animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Stats card */}
        <div className="col-span-1 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse mb-5" />
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse mb-2" />
                <div className="h-7 w-14 rounded bg-white/[0.06] animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* History card */}
        <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex justify-between mb-4">
            <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white/[0.06] animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-white/[0.06] animate-pulse" />
                    <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-12 rounded bg-white/[0.06] animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Recommended card */}
        <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-20 rounded bg-white/[0.06] animate-pulse" />
          </div>
          <div className="h-5 w-40 rounded bg-white/[0.06] animate-pulse mb-2" />
          <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse mb-6" />
          <div className="h-10 w-28 rounded-xl bg-white/[0.06] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
