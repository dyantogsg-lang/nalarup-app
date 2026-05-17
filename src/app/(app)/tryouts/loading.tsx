export default function TryoutsLoading() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div
          className="h-8 w-48 rounded-lg mb-2"
          style={{ background: "var(--border)" }}
        />
        <div
          className="h-4 w-72 rounded-lg"
          style={{ background: "var(--border)" }}
        />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass-card p-5 rounded-xl"
          >
            <div
              className="h-3 w-12 rounded mb-3"
              style={{ background: "var(--border)" }}
            />
            <div
              className="h-7 w-16 rounded"
              style={{ background: "var(--border)" }}
            />
          </div>
        ))}
      </div>

      {/* Filter skeleton */}
      <div className="glass-card p-4 mb-6">
        <div
          className="h-10 w-full rounded-xl mb-3"
          style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}
        />
        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-7 w-16 rounded-full"
              style={{ background: "var(--border)" }}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <div
            className="h-8 w-28 rounded-lg"
            style={{ background: "var(--border)" }}
          />
          <div
            className="h-8 w-28 rounded-lg"
            style={{ background: "var(--border)" }}
          />
        </div>
      </div>

      {/* Cards skeleton */}
      <div
        className="h-4 w-32 rounded mb-4"
        style={{ background: "var(--border)" }}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card p-5 flex flex-col gap-3">
            <div className="flex gap-1.5">
              <div
                className="h-5 w-12 rounded-full"
                style={{ background: "var(--border)" }}
              />
              <div
                className="h-5 w-14 rounded-full"
                style={{ background: "var(--border)" }}
              />
            </div>
            <div>
              <div
                className="h-5 w-3/4 rounded mb-2"
                style={{ background: "var(--border)" }}
              />
              <div
                className="h-3 w-full rounded mb-1"
                style={{ background: "var(--border)" }}
              />
              <div
                className="h-3 w-2/3 rounded"
                style={{ background: "var(--border)" }}
              />
            </div>
            <div className="flex gap-3">
              <div
                className="h-3 w-16 rounded"
                style={{ background: "var(--border)" }}
              />
              <div
                className="h-3 w-16 rounded"
                style={{ background: "var(--border)" }}
              />
            </div>
            <div
              className="h-9 w-full rounded-lg mt-auto"
              style={{ background: "var(--border)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
