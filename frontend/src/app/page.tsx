// frontend/src/app/page.tsx
"use client";

import { isAdmin, isAuthenticated } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin]   = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setAdmin(isAdmin());
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#F5F4F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .hero-text { animation: fadeUp 0.7s ease forwards; }
        .hero-text-delay { animation: fadeUp 0.7s 0.15s ease forwards; opacity:0; animation-fill-mode:forwards; }
        .hero-btns { animation: fadeUp 0.7s 0.3s ease forwards; opacity:0; animation-fill-mode:forwards; }
        .stat-card:hover { background: #141414 !important; }
        .feature-card:hover { border-color: rgba(201,168,76,0.3) !important; }
        .nav-link:hover { color: rgba(255,255,255,0.9) !important; }
        .cta-primary:hover { background: #b8922e !important; }
        .cta-secondary:hover { border-color: rgba(255,255,255,0.4) !important; color: white !important; }
      `}</style>

      {/* ── Fixed nav ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 2.5rem", height:"4rem",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(10,10,10,0.92)", backdropFilter:"blur(12px)" }}>
        <Link href="/" style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"1.375rem",
          color:"#F5F4F0", letterSpacing:"-0.01em", textDecoration:"none" }}>
          ActServ
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
          {authed ? (
            <>
              <Link href={admin ? "/admin" : "/forms"} className="nav-link"
                style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)",
                  letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none", transition:"color 0.2s" }}>
                {admin ? "Dashboard" : "My Forms"}
              </Link>
              <Link href="/login" className="nav-link"
                style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)",
                  letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none", transition:"color 0.2s" }}>
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link"
                style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)",
                  padding:"0.5rem 1rem", border:"1px solid rgba(255,255,255,0.15)",
                  letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none", transition:"color 0.2s, border-color 0.2s" }}>
                Sign in
              </Link>
              <Link href="/register" className="cta-primary"
                style={{ fontSize:"0.72rem", color:"#0A0A0A", background:"#C9A84C",
                  padding:"0.5rem 1.25rem", letterSpacing:"0.1em", textTransform:"uppercase",
                  textDecoration:"none", fontWeight:600, transition:"background 0.2s" }}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop:"9rem", paddingBottom:"6rem",
        padding:"9rem 2.5rem 6rem", maxWidth:"1200px", margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"center" }}>

          {/* Left copy */}
          <div>
            <div className="hero-text" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem",
              background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.25)",
              padding:"0.375rem 1rem", marginBottom:"2rem" }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%",
                background:"#C9A84C", display:"inline-block", animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:"0.65rem", color:"#C9A84C", letterSpacing:"0.14em", textTransform:"uppercase" }}>
                Trusted by financial institutions
              </span>
            </div>

            <h1 className="hero-text" style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(2.75rem,5vw,4.25rem)", fontWeight:400,
              lineHeight:1.05, letterSpacing:"-0.02em", margin:"0 0 1.5rem" }}>
              Onboarding,<br />
              <em style={{ color:"#C9A84C", fontStyle:"italic" }}>done right.</em>
            </h1>

            <p className="hero-text-delay" style={{ fontSize:"0.95rem", color:"rgba(255,255,255,0.45)",
              lineHeight:1.75, maxWidth:"400px", margin:"0 0 2.5rem",
              fontFamily:"'DM Sans',sans-serif" }}>
              Dynamic KYC, loan applications, and investment declarations — built for
              financial services firms that need flexibility without complexity.
            </p>

            <div className="hero-btns" style={{ display:"flex", gap:"0.875rem", flexWrap:"wrap" }}>
              <Link href={authed ? (admin ? "/admin" : "/forms") : "/register"}
                className="cta-primary"
                style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem",
                  background:"#C9A84C", color:"#0A0A0A",
                  padding:"0.875rem 2rem", fontSize:"0.8rem", fontWeight:600,
                  letterSpacing:"0.08em", textDecoration:"none", textTransform:"uppercase",
                  transition:"background 0.2s" }}>
                Get started →
              </Link>
              <Link href="/forms" className="cta-secondary"
                style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem",
                  background:"transparent", color:"rgba(255,255,255,0.6)",
                  border:"1px solid rgba(255,255,255,0.18)", padding:"0.875rem 2rem",
                  fontSize:"0.8rem", letterSpacing:"0.08em", textDecoration:"none",
                  textTransform:"uppercase", transition:"border-color 0.2s, color 0.2s" }}>
                View forms
              </Link>
            </div>
          </div>

          {/* Right — feature grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px",
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.07)" }}>
            {[
              { value:"KYC",    label:"Know Your Customer",   sub:"Identity verification forms" },
              { value:"Loans",  label:"Loan Applications",    sub:"Dynamic approval workflows"  },
              { value:"Async",  label:"Live Notifications",   sub:"Celery-powered admin alerts" },
              { value:"v∞",     label:"Schema Versioning",    sub:"Evolve forms, keep history"  },
            ].map((item) => (
              <div key={item.value} className="stat-card"
                style={{ background:"#0A0A0A", padding:"2rem 1.5rem", transition:"background 0.2s" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"2rem", color:"#C9A84C", margin:"0 0 0.5rem", fontWeight:500 }}>
                  {item.value}
                </p>
                <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.8)",
                  margin:"0 0 0.25rem", fontWeight:500, fontFamily:"'DM Sans',sans-serif" }}>
                  {item.label}
                </p>
                <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.35)", margin:0,
                  fontFamily:"'DM Sans',sans-serif" }}>
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height:"1px", background:"rgba(255,255,255,0.07)", margin:"0 2.5rem" }} />

      {/* ── Stats strip ── */}
      <section style={{ maxWidth:"1200px", margin:"0 auto", padding:"3.5rem 2.5rem",
        display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"2rem" }}>
        {[
          { num:"50K+",  desc:"Forms created"     },
          { num:"95%",   desc:"Faster onboarding" },
          { num:"99.9%", desc:"Uptime SLA"        },
          { num:"24/7",  desc:"Admin access"      },
        ].map((s) => (
          <div key={s.num} style={{ textAlign:"center" }}>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"2.5rem", color:"#F5F4F0", margin:"0 0 0.375rem", fontWeight:500 }}>
              {s.num}
            </p>
            <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)",
              textTransform:"uppercase", letterSpacing:"0.1em", margin:0,
              fontFamily:"'DM Sans',sans-serif" }}>
              {s.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ── Divider ── */}
      <div style={{ height:"1px", background:"rgba(255,255,255,0.07)", margin:"0 2.5rem" }} />

      {/* ── Features ── */}
      <section style={{ maxWidth:"1200px", margin:"0 auto", padding:"5rem 2.5rem" }}>
        <div style={{ marginBottom:"3rem" }}>
          <p style={{ fontSize:"0.7rem", color:"#C9A84C", letterSpacing:"0.14em",
            textTransform:"uppercase", marginBottom:"1rem", fontFamily:"'DM Sans',sans-serif" }}>
            — What it does
          </p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"clamp(2rem,4vw,3rem)", fontWeight:400, margin:0 }}>
            Every form type,<br />
            <em style={{ color:"#C9A84C" }}>one platform.</em>
          </h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px",
          background:"rgba(255,255,255,0.07)" }}>
          {[
            {
              icon:"◈", title:"Dynamic Fields",
              desc:"Text, numbers, dates, dropdowns, checkboxes, file uploads. Schema versioning keeps old submissions intact as forms evolve.",
              tags:["text","number","date","file"],
            },
            {
              icon:"◉", title:"Conditional Logic",
              desc:"Income proof only if loan amount exceeds a threshold. Any operator: gt, lt, eq, ne. Per-form, per-field validation rules.",
              tags:["gt · lt · eq","per-field","server-validated"],
            },
            {
              icon:"◎", title:"Async Notifications",
              desc:"Every submission fires a Celery task that creates in-app notifications and sends email to all staff. Retries on failure.",
              tags:["Celery","Redis","Email"],
            },
          ].map((f) => (
            <div key={f.title} className="feature-card"
              style={{ background:"#0A0A0A", padding:"2.5rem 2rem",
                border:"1px solid transparent", transition:"border-color 0.2s" }}>
              <p style={{ fontSize:"1.75rem", color:"#C9A84C", margin:"0 0 1.25rem" }}>{f.icon}</p>
              <h3 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"1.375rem", fontWeight:400, margin:"0 0 0.875rem", color:"#F5F4F0" }}>
                {f.title}
              </h3>
              <p style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.45)",
                lineHeight:1.7, margin:"0 0 1.5rem", fontFamily:"'DM Sans',sans-serif" }}>
                {f.desc}
              </p>
              <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                {f.tags.map((t) => (
                  <span key={t} style={{ fontSize:"0.65rem", color:"rgba(201,168,76,0.7)",
                    border:"1px solid rgba(201,168,76,0.2)", padding:"0.2rem 0.6rem",
                    fontFamily:"'DM Mono',monospace,sans-serif", letterSpacing:"0.05em" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ── */}
      <section style={{ background:"#C9A84C", padding:"5rem 2.5rem", textAlign:"center" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",
          fontSize:"clamp(2rem,4vw,3rem)", fontWeight:400, color:"#0A0A0A",
          margin:"0 0 1rem", lineHeight:1.15 }}>
          Ready to transform your onboarding?
        </h2>
        <p style={{ fontSize:"0.95rem", color:"rgba(10,10,10,0.6)",
          maxWidth:"480px", margin:"0 auto 2.5rem", lineHeight:1.7,
          fontFamily:"'DM Sans',sans-serif" }}>
          Join financial institutions streamlining client onboarding — from KYC to loan approvals.
        </p>
        <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/register"
            style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem",
              background:"#0A0A0A", color:"#F5F4F0",
              padding:"1rem 2.5rem", fontSize:"0.8rem", fontWeight:600,
              letterSpacing:"0.08em", textDecoration:"none", textTransform:"uppercase" }}>
            Create account →
          </Link>
          <Link href="/login"
            style={{ display:"inline-flex", alignItems:"center",
              background:"transparent", color:"#0A0A0A",
              border:"1px solid rgba(10,10,10,0.3)",
              padding:"1rem 2.5rem", fontSize:"0.8rem",
              letterSpacing:"0.08em", textDecoration:"none", textTransform:"uppercase" }}>
            Sign in
          </Link>
        </div>
        <p style={{ fontSize:"0.72rem", color:"rgba(10,10,10,0.45)",
          marginTop:"1.5rem", fontFamily:"'DM Sans',sans-serif" }}>
          No credit card required · Free to get started
        </p>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.07)", padding:"2rem 2.5rem",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        maxWidth:"1200px", margin:"0 auto" }}>
        <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",
          fontSize:"1.125rem", color:"rgba(255,255,255,0.35)" }}>
          ActServ
        </span>
        <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.2)",
          letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>
          © 2025 ActServ Africa
        </span>
      </footer>
    </div>
  );
}