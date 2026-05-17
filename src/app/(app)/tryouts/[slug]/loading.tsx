export default function TryoutDetailLoading() {
  return (
    <div className="max-w-[900px] mx-auto px-4 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div
        className="h-4 w-28 rounded mb-4"
        style={{ background: "var(--border)" }}
      />

      {/* Header card skeleton */}
      <div className="glass-card p-5 sm:p-8 mb-4">
        <div className="flex gap-2 mb-3">
          <div
            className="h-5 w-14 rounded-full"
            style={{ background: "var(--border)" }}
          />
          <div
            className="h-5 w-16 rounded-full"
            style={{ background: "var(--border)" }}
          />
        </div>
        <div
          className="h-7 w-3/4 rounded-lg mb-2"
          style={{ background: "var(--border)" }}
        />
        <div
          className="h-4 w-full rounded mb-1"
          style={{ background: "var(--border)" }}
        />
        <div
          className="h-4 w-2/3 rounded"
          style={{ background: "var(--border)" }}
        />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5">
            <div
              className="h-3 w-16 rounded mb-3"
              style={{ background: "var(--border)" }}
            />
            <div
              className="h-7 w-12 rounded"
              style={{ background: "var(--border)" }}
            />
          </div>
        ))}
      </div>

      {/* Sections skeleton */}
      <div className="flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-4">
            <div
              className="h-5 w-36 rounded mb-4"
              style={{ background: "var(--border)" }}
            />
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-14 w-full rounded-xl"
                  style={{ background: "var(--bg-card2)", border: "1px solid var(--border)" }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
