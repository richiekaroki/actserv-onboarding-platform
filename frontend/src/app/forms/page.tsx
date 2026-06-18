// frontend/src/app/forms/page.tsx
"use client";

import { getForms, getCurrentUser, loadCurrentUser } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Form {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  fields: { id: string }[];
}

export default function FormsList() {
  const [forms, setForms]     = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser().then((user) => {
      if (user) setUserName(user.first_name || user.email);
    });

    getForms()
      .then((data: Form[]) => {
        // Backend already filters to is_active=True for non-admin requests,
        // but filter client-side as a safety net too
        setForms(data.filter((f) => f.is_active));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "var(--color-surface)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div className="page-header flex items-end justify-between">
          <div>
            <h1 className="page-title">Available Forms</h1>
            <p className="page-subtitle">
              {userName
                ? `Welcome back, ${userName}`
                : "Select a form below to begin your submission"}
            </p>
          </div>
          <Link
            href="/login"
            className="text-xs font-mono tracking-widest uppercase transition-colors"
            style={{ color: "var(--color-ink-400)" }}
          >
            Sign out
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: "6rem",
                  background: "var(--color-ink-100)",
                  animation: "fadeIn 1s infinite alternate",
                }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && forms.length === 0 && (
          <div className="card text-center py-16">
            <p className="text-sm" style={{ color: "var(--color-ink-400)" }}>
              No forms are currently available.
            </p>
          </div>
        )}

        {/* Forms list */}
        {!loading && forms.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {forms.map((form, i) => (
              <Link
                key={form.id}
                href={`/forms/${form.slug}`}
                className="card-hover animate-fade-up"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  animationDelay: `${i * 70}ms`,
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.25rem",
                      color: "var(--color-ink-900)",
                    }}
                  >
                    {form.name}
                  </h3>
                  {form.description && (
                    <p
                      className="mt-1 text-sm"
                      style={{ color: "var(--color-ink-400)" }}
                    >
                      {form.description}
                    </p>
                  )}
                  <p
                    className="mt-3 text-xs font-mono"
                    style={{ color: "var(--color-ink-300)" }}
                  >
                    {form.fields?.length ?? 0} field
                    {(form.fields?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <span style={{ color: "var(--color-ink-300)", marginTop: "0.25rem" }}>
                  →
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* CTA for unauthenticated users */}
        {!getCurrentUser() && (
          <div
            className="card mt-8"
            style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}
          >
            <h3
              className="text-sm font-medium mb-1"
              style={{ color: "#1E40AF" }}
            >
              Create an account to track your submissions
            </h3>
            <p className="text-xs mb-4" style={{ color: "#3B82F6" }}>
              Register to save progress and view your submission history.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link href="/register" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
                Register
              </Link>
              <Link href="/login" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}