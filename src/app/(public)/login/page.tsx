import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ width: "100%", maxWidth: 400, padding: "0 1.5rem" }}>
          <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", color: "#64748B" }}>
            Memuat...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
