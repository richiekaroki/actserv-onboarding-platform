// frontend/src/app/login/page.tsx
"use client";

import { loginUser } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await loginUser({ email, password });
      // loginUser stores tokens in cookies and sets _currentUser
      router.push(user.is_staff ? "/admin" : "/forms");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-surface)" }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg focus:outline-none" style={{ color: "var(--color-ink-900)" }}>
        Skip to main content
      </a>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: "var(--color-ink-900)" }}
      >
        <div className="relative">
          <div
            className="text-xs font-mono tracking-widest uppercase mb-12"
            style={{ color: "var(--color-gold)" }}
          >
            Mr.Wam Africa
          </div>
          <h1
            className="text-6xl font-semibold leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "white" }}
          >
            Onboarding
            <br />
            <span style={{ color: "var(--color-gold)" }}>Platform</span>
          </h1>
          <p className="mt-6 text-sm leading-relaxed max-w-sm" style={{ color: "var(--color-ink-300)" }}>
            Secure, dynamic form management for financial services. KYC, loan
            applications, and investment declarations — all in one place.
          </p>
        </div>

        <div className="relative flex gap-8 text-xs font-mono" style={{ color: "var(--color-ink-400)" }}>
          <span>SOC 2 Compliant</span>
          <span>256-bit Encryption</span>
          <span>ISO 27001</span>
        </div>
      </div>

      {/* ── Right panel ── */}
      <main className="flex-1 flex items-center justify-center p-8" id="main-content">
        <div className="w-full max-w-md animate-fade-up">

          <div className="mb-10">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", color: "var(--color-ink-900)" }}>
              Welcome back
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-ink-600)" }}>
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mrwam.com"
                required
                className="input"
              />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label htmlFor="password" className="label" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" className="text-xs transition-colors" style={{ color: "var(--color-ink-600)" }}>
                  Forgot your password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>

            {error && (
              <p className="text-sm px-4 py-3 bg-red-50 border border-red-200 text-red-600" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    className="animate-spin"
                    style={{
                      width: "1rem", height: "1rem",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      display: "inline-block",
                    }}
                  />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: "var(--color-ink-400)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="link-hover"
              style={{ color: "var(--color-ink-900)", textDecoration: "underline", textUnderlineOffset: "4px", display: "inline-block", padding: "0.5rem 0.25rem" }}
            >
              Register here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}