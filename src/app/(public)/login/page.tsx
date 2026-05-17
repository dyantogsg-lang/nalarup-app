import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[420px] px-6">
          <div className="glass-card p-10 text-center text-[var(--text-muted)]">
            Memuat...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
