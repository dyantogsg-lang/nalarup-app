const QUESTION_TEXT =
  "Pancasila sebagai dasar negara Indonesia memiliki kedudukan sebagai sumber dari segala sumber hukum. Pernyataan tersebut bermakna bahwa…";

const OPTIONS = [
  { label: "A", text: "Pancasila menjadi pedoman tertulis seluruh peraturan." },
  { label: "B", text: "Setiap peraturan harus bersumber pada nilai Pancasila.", correct: true },
  { label: "C", text: "Pancasila otomatis menjadi undang-undang dasar." },
  { label: "D", text: "Pancasila hanya berlaku pada hukum konstitusi." },
  { label: "E", text: "Setiap norma sosial wajib menggunakan Pancasila." },
];

const NAV_GRID = [
  { n: 1, status: "answered" },
  { n: 2, status: "answered" },
  { n: 3, status: "doubt" },
  { n: 4, status: "current" },
  { n: 5, status: "empty" },
  { n: 6, status: "empty" },
  { n: 7, status: "answered" },
  { n: 8, status: "empty" },
  { n: 9, status: "empty" },
  { n: 10, status: "doubt" },
] as const;

export default function HeroExamMockup() {
  return (
    <div
      style={{
        position: "relative",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
        padding: "1.25rem",
        boxShadow:
          "0 30px 80px -20px rgba(37,99,235,0.18), 0 10px 30px -10px rgba(124,58,237,0.12)",
      }}
    >
      {/* Top: timer + subtest tag */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="badge badge-blue">TWK</span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
            Soal 4 / 110
          </span>
        </div>
        <div
          className="num"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "var(--amber-subtle)",
            color: "var(--amber)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "0.5rem",
            padding: "0.3rem 0.65rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--amber)",
              display: "inline-block",
            }}
          />
          01:24:37
        </div>
      </div>

      {/* Question */}
      <p
        style={{
          fontSize: "0.92rem",
          lineHeight: 1.65,
          color: "var(--text-primary)",
          margin: 0,
          marginBottom: "1rem",
        }}
      >
        {QUESTION_TEXT}
      </p>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
        {OPTIONS.map((opt) => {
          const isSelected = opt.correct;
          return (
            <div
              key={opt.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.55rem 0.75rem",
                borderRadius: "0.625rem",
                border: `1px solid ${isSelected ? "rgba(37,99,235,0.55)" : "var(--border)"}`,
                background: isSelected ? "var(--blue-subtle)" : "transparent",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `1.5px solid ${isSelected ? "var(--blue)" : "var(--border-focus)"}`,
                  background: isSelected ? "var(--blue)" : "transparent",
                  color: isSelected ? "#fff" : "var(--text-dim)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {opt.label}
              </span>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: isSelected ? "var(--text-primary)" : "var(--text-muted)",
                  lineHeight: 1.5,
                }}
              >
                {opt.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Navigation grid */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "0.85rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
          {NAV_GRID.map((cell) => {
            const styleByStatus: Record<string, React.CSSProperties> = {
              answered: { background: "var(--blue)", color: "#fff", border: "1px solid var(--blue)" },
              current: {
                background: "var(--bg-card)",
                color: "var(--blue)",
                border: "2px solid var(--blue)",
                boxShadow: "0 0 0 2px var(--blue-subtle)",
              },
              doubt: {
                background: "var(--amber-subtle)",
                color: "var(--amber)",
                border: "1px solid rgba(245,158,11,0.4)",
              },
              empty: {
                background: "transparent",
                color: "var(--text-dim)",
                border: "1px solid var(--border)",
              },
            };
            return (
              <span
                key={cell.n}
                className="num"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "0.4rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  ...styleByStatus[cell.status],
                }}
              >
                {cell.n}
              </span>
            );
          })}
        </div>
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--text-dim)",
            whiteSpace: "nowrap",
          }}
        >
          +100
        </span>
      </div>
    </div>
  );
}
