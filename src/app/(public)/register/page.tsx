"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ROUTES } from "@/lib/constants/routes";
import { AlertBox, EyeIcon } from "@/components/ui";

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
    if (password.length < 6) return { level: 0, label: "Terlalu pendek", color: "var(--danger)" };
    if (password.length < 8) return { level: 1, label: "Lemah", color: "var(--amber)" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 3, label: "Kuat", color: "var(--green)" };
    return { level: 2, label: "Cukup", color: "var(--blue)" };
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
      const message = authError.message.toLowerCase().includes("already")
        ? "Email ini sudah terdaftar. Masuk atau gunakan email lain."
        : "Pendaftaran belum berhasil. Cek email/password lalu coba lagi.";
      setError(message);
      setLoading(false);
      return;
    }

    router.push(ROUTES.dashboard);
    router.refresh();
  }

  return (
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
          Buat akun gratis
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Daftar dalam 30 detik — langsung akses semua paket tryout
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nama */}
        <div className="float-label-wrap">
          <input
            id="register-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder=" "
            autoComplete="name"
            className="input-field"
            aria-invalid={!!error}
            aria-describedby={error ? "register-error" : undefined}
          />
          <label htmlFor="register-name">Nama Lengkap</label>
        </div>

        {/* Email */}
        <div className="float-label-wrap">
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder=" "
            autoComplete="email"
            className="input-field"
            aria-invalid={!!error}
            aria-describedby={error ? "register-error" : undefined}
          />
          <label htmlFor="register-email">Email</label>
        </div>

        {/* Password + strength */}
        <div>
          <div className="relative">
            <div className="float-label-wrap">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                autoComplete="new-password"
                className="input-field pr-12"
                aria-invalid={!!error}
                aria-describedby={error ? "register-error register-password-strength" : "register-password-strength"}
              />
              <label htmlFor="register-password">Password</label>
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center p-1 bg-transparent border-none cursor-pointer transition-colors duration-150"
              style={{ color: "var(--text-dim)" }}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {/* Password strength bar */}
          {passwordStrength && (
            <div id="register-password-strength" className="mt-2">
              <div className="flex gap-1 mb-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-[3px] rounded-sm transition-colors duration-200"
                    style={{
                      background: i <= passwordStrength.level - 1 ? passwordStrength.color : "var(--border)",
                    }}
                  />
                ))}
              </div>
              <span className="text-[0.7rem]" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <AlertBox variant="error" className="text-[0.82rem]">
            {error}
          </AlertBox>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-[0.95rem] mt-1"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
              Membuat akun...
            </span>
          ) : "Daftar Gratis"}
        </button>

        <p className="text-[0.72rem] text-center leading-relaxed" style={{ color: "var(--text-dim)" }}>
          Dengan mendaftar, kamu menyetujui penggunaan data untuk keperluan platform.
        </p>
      </form>

      <p className="text-center mt-6 text-[0.82rem]" style={{ color: "var(--text-dim)" }}>
        Sudah punya akun?{" "}
        <Link href={ROUTES.login} className="font-medium no-underline hover:underline" style={{ color: "var(--blue-light)" }}>
          Masuk
        </Link>
      </p>
    </div>
  );
}
