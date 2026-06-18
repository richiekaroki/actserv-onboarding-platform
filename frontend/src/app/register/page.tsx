// frontend/src/app/register/page.tsx
"use client";

import { registerClient, loginUser } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email:"", password:"", first_name:"", last_name:"" });
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");
  const [emailError, setEmailError] = useState("");
  const [passError,  setPassError]  = useState("");
  const router = useRouter();

  const validateEmail = (v: string) => {
    if (!v) { setEmailError(""); return true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(""); return true;
  };

  const validatePassword = (v: string) => {
    if (!v) { setPassError(""); return true; }
    if (v.length < 8)           { setPassError("Minimum 8 characters");                             return false; }
    if (!/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/\d/.test(v)) {
      setPassError("Must include uppercase, lowercase, and a number"); return false;
    }
    setPassError(""); return true;
  };

  const getStrength = (p: string) => {
    if (!p) return { pct: 0, label: "", color: "" };
    let s = 0;
    if (p.length >= 8)  s++;
    if (p.length >= 12) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p))    s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    if (s <= 2) return { pct: (s/6)*100, label:"Weak",   color:"#ef4444" };
    if (s <= 4) return { pct: (s/6)*100, label:"Medium", color:"#f59e0b" };
    return              { pct: (s/6)*100, label:"Strong", color:"#22c55e" };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (name === "email"    && value) validateEmail(value);
    if (name === "password" && value) validatePassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.email) || !validatePassword(formData.password)) return;
    setLoading(true); setError("");
    try {
      await registerClient(formData);
      await loginUser({ email: formData.email, password: formData.password });
      router.push("/forms");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { email?: string[]; password?: string[]; detail?: string } }; message?: string };
      setError(
        e.response?.data?.email?.[0] ??
        e.response?.data?.password?.[0] ??
        e.response?.data?.detail ??
        e.message ??
        "Registration failed. Please try again."
      );
    } finally { setLoading(false); }
  };

  const strength = getStrength(formData.password);

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--color-surface)", padding:"2rem" }}>
      <div style={{ width:"100%", maxWidth:"420px" }}>
        <Link href="/" style={{ fontSize:"0.7rem", color:"var(--color-ink-400)", fontFamily:"var(--font-mono)",
          letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none", display:"block", marginBottom:"2rem" }}>
          ← Back
        </Link>

        <h2 style={{ fontFamily:"var(--font-display)", fontSize:"2.25rem", color:"var(--color-ink-900)",
          marginBottom:"0.5rem" }}>
          Create account
        </h2>
        <p style={{ fontSize:"0.875rem", color:"var(--color-ink-400)", marginBottom:"2rem" }}>
          Register to access onboarding forms
        </p>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          {error && (
            <p style={{ fontSize:"0.875rem", padding:"0.75rem 1rem",
              background:"#fef2f2", border:"1px solid #fecaca", color:"#b91c1c" }}>
              {error}
            </p>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div>
              <label className="label">First name</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange}
                placeholder="Jane" className="input" />
            </div>
            <div>
              <label className="label">Last name</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange}
                placeholder="Doe" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Email address *</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange}
              onBlur={() => validateEmail(formData.email)}
              placeholder="jane@example.com" required
              className={`input ${emailError ? "input-error" : ""}`} />
            {emailError && <p style={{ fontSize:"0.75rem", color:"#dc2626", marginTop:"0.375rem" }}>{emailError}</p>}
          </div>

          <div>
            <label className="label">Password *</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange}
              onBlur={() => validatePassword(formData.password)}
              placeholder="Minimum 8 characters" required minLength={8}
              className={`input ${passError ? "input-error" : ""}`} />

            {formData.password && (
              <div style={{ marginTop:"0.5rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
                <div style={{ flex:1, height:"3px", background:"var(--color-ink-100)", borderRadius:"2px" }}>
                  <div style={{ height:"100%", borderRadius:"2px", background:strength.color,
                    width:`${strength.pct}%`, transition:"width 0.3s, background 0.3s" }} />
                </div>
                <span style={{ fontSize:"0.7rem", color:strength.color, fontFamily:"var(--font-mono)",
                  minWidth:"3.5rem", textAlign:"right" }}>
                  {strength.label}
                </span>
              </div>
            )}
            {passError && <p style={{ fontSize:"0.75rem", color:"#dc2626", marginTop:"0.375rem" }}>{passError}</p>}
            <p style={{ fontSize:"0.7rem", color:"var(--color-ink-300)", marginTop:"0.375rem" }}>
              At least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <button type="submit" disabled={loading || !!emailError || !!passError}
            className="btn-primary" style={{ justifyContent:"center", marginTop:"0.5rem" }}>
            {loading ? (
              <span style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <span className="animate-spin" style={{ width:"1rem", height:"1rem",
                  border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white",
                  borderRadius:"50%", display:"inline-block" }} />
                Creating account…
              </span>
            ) : "Create account"}
          </button>

          <p style={{ textAlign:"center", fontSize:"0.875rem", color:"var(--color-ink-400)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color:"var(--color-ink-900)",
              textDecoration:"underline", textUnderlineOffset:"3px" }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}