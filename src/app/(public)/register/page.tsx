"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ROUTES } from "@/lib/constants/routes";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 6) return { level: 0, label: "Terlalu pendek", color: "#EF4444" };
    if (password.length < 8) return { level: 1, label: "Lemah", color: "#F59E0B" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 3, label: "Kuat", color: "#22C55E" };
    return { level: 2, label: "Cukup", color: "#3B82F6" };
  })();

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
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(ROUTES.dashboard);
    router.refresh();
  }

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>
          Buat akun gratis
        </h1>
        <p style={{ color: "#94A3B8", fontSize: "0.875rem" }}>
          Daftar dalam 30 detik — langsung akses semua paket tryout
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Nama */}
        <div className="float-label-wrap">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder=" "
            autoComplete="name"
            className="input-field"
          />
          <label>Nama Lengkap</label>
        </div>

        {/* Email */}
        <div className="float-label-wrap">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder=" "
            autoComplete="email"
            className="input-field"
          />
          <label>Email</label>
        </div>

        {/* Password + strength */}
        <div>
          <div style={{ position: "relative" }}>
            <div className="float-label-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                autoComplete="new-password"
                className="input-field"
                style={{ paddingRight: "3rem" }}
              />
              <label>Password</label>
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute", right: "0.875rem", top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                color: "#475569", cursor: "pointer",
                display: "flex", alignItems: "center",
                padding: "0.25rem",
                transition: "color 150ms ease",
              }}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {/* Password strength bar */}
          {passwordStrength && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.3rem" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= passwordStrength.level - 1 ? passwordStrength.color : "#1E293B",
                    transition: "background 200ms ease",
                  }} />
                ))}
              </div>
              <span style={{ fontSize: "0.7rem", color: passwordStrength.color }}>{passwordStrength.label}</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "0.625rem",
            padding: "0.75rem 1rem",
            color: "#FCA5A5",
            fontSize: "0.82rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
          }}>
            <span style={{ flexShrink: 0 }}>⚠</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "0.8rem", fontSize: "0.95rem", marginTop: "0.25rem", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
              <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              Membuat akun...
            </span>
          ) : "Daftar Gratis"}
        </button>

        <p style={{ fontSize: "0.72rem", color: "#475569", textAlign: "center", lineHeight: 1.5 }}>
          Dengan mendaftar, kamu menyetujui penggunaan data untuk keperluan platform.
        </p>
      </form>

      <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#475569", fontSize: "0.82rem" }}>
        Sudah punya akun?{" "}
        <Link href={ROUTES.login} style={{ color: "#60A5FA", textDecoration: "none", fontWeight: 500 }}>
          Masuk
        </Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
