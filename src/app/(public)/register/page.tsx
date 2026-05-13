"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ROUTES } from "@/lib/constants/routes";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Profile akan dibuat via trigger/webhook atau route handler
    router.push(ROUTES.dashboard);
    router.refresh();
  }

  return (
    <div style={{ width: "100%", maxWidth: 420, padding: "0 1.5rem" }}>
      <div className="glass-card" style={{ padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.4rem",
              background: "linear-gradient(135deg, #60A5FA, #A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            NalarUp
          </span>
          <p style={{ color: "#64748B", fontSize: "0.875rem" }}>
            Daftar gratis — mulai latihan sekarang
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94A3B8", marginBottom: "0.4rem" }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Nama kamu"
              style={{
                width: "100%",
                padding: "0.65rem 0.875rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                color: "#F1F5F9",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94A3B8", marginBottom: "0.4rem" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="kamu@email.com"
              style={{
                width: "100%",
                padding: "0.65rem 0.875rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                color: "#F1F5F9",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94A3B8", marginBottom: "0.4rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimal 6 karakter"
              style={{
                width: "100%",
                padding: "0.65rem 0.875rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                color: "#F1F5F9",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                color: "#FCA5A5",
                fontSize: "0.8rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
          >
            {loading ? "Mendaftar..." : "Daftar Gratis"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.25rem",
            padding: "0.875rem",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            color: "#6EE7B7",
            textAlign: "center",
          }}
        >
          Semua paket tryout open access — tidak perlu kartu kredit
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "#64748B", fontSize: "0.8rem" }}>
          Sudah punya akun?{" "}
          <Link href={ROUTES.login} style={{ color: "#60A5FA", textDecoration: "none" }}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
