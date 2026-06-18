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

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: "var(--color-ink-900)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute top-0 left-0 h-full"
          style={{ width: "3px", background: "var(--color-gold)" }}
        />

        <div className="relative">
          <div
            className="text-xs font-mono tracking-widest uppercase mb-12"
            style={{ color: "var(--color-gold)" }}
          >
            ActServ Africa
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-up">

          <div className="mb-10">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", color: "var(--color-ink-900)" }}>
              Welcome back
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-ink-400)" }}>
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@actserv.com"
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>

            {error && (
              <p className="text-sm px-4 py-3 bg-red-50 border border-red-200 text-red-600">
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
              className="underline underline-offset-4 transition-colors"
              style={{ color: "var(--color-ink-900)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--color-gold)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-ink-900)")}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}