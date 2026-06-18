// frontend/src/app/admin/page.tsx
"use client";

import {
  getForms,
  getSubmissions,
  getNotifications,
  updateSubmissionStatus,
  loadCurrentUser,
  isAdmin,
  logout,
} from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Form {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  submission_count: number;
  fields: { id: string }[];
}

interface Submission {
  id: string;
  form: string;
  status: "submitted" | "reviewed" | "approved" | "rejected";
  created_at: string;
  client_identifier: string | null;
  submitted_by: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [forms,       setForms]       = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [unread,      setUnread]      = useState(0);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    loadCurrentUser().then((user) => {
      if (!user || !isAdmin()) {
        router.push(user ? "/forms" : "/login");
        return;
      }
      fetchAll();
    });
  }, []);

  const fetchAll = async () => {
    try {
      const [formsData, subsData, notifsData] = await Promise.all([
        getForms(),
        getSubmissions(),
        getNotifications(),
      ]);
      setForms(formsData);
      setSubmissions(subsData);
      setUnread(notifsData.filter((n: { is_read: boolean }) => !n.is_read).length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateSubmissionStatus(id, status);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: status as Submission["status"] } : s
        )
      );
    } catch {
      alert("Failed to update status.");
    }
  };

  const pending = submissions.filter((s) => s.status === "submitted").length;
  const totalSubmissions = submissions.length;

  const statCards = [
    { label: "Total Forms",    value: forms.length,      href: "/admin/forms",         accent: "var(--color-ink-900)" },
    { label: "Submissions",    value: totalSubmissions,   href: "#submissions",          accent: "var(--color-gold)"    },
    { label: "Pending Review", value: pending,            href: "#submissions",          accent: "#F59E0B"               },
    { label: "Unread Alerts",  value: unread,             href: "/admin/notifications",  accent: "#3B82F6"               },
  ];

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-surface)" }}
      >
        <span
          className="animate-spin"
          style={{
            width: "2rem", height: "2rem",
            border: "2px solid var(--color-ink-100)",
            borderTopColor: "var(--color-ink-900)",
            borderRadius: "50%",
            display: "inline-block",
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>

      {/* ── Top bar ── */}
      <div
        style={{
          background: "var(--color-surface-raised)",
          borderBottom: "1px solid var(--color-ink-100)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--color-ink-900)" }}>
          ActServ Admin
        </span>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/admin/forms/create" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
            + New Form
          </Link>
          <button onClick={logout} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* ── Stat cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "3rem",
          }}
        >
          {statCards.map((s, i) => (
            <Link
              key={s.label}
              href={s.href}
              className="card-hover animate-fade-up"
              style={{
                borderLeft: `4px solid ${s.accent}`,
                animationDelay: `${i * 60}ms`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            >
              <p style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", color: "var(--color-ink-900)", lineHeight: 1 }}>
                {s.value}
              </p>
              <p className="text-xs font-mono tracking-wide mt-1" style={{ color: "var(--color-ink-400)" }}>
                {s.label}
              </p>
            </Link>
          ))}
        </div>

        {/* ── Forms ── */}
        <div style={{ marginBottom: "3rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--color-ink-900)" }}>
              Forms
            </h2>
            <Link
              href="/admin/forms/create"
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: "var(--color-ink-400)" }}
            >
              Create new →
            </Link>
          </div>

          {forms.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-sm" style={{ color: "var(--color-ink-400)" }}>
                No forms yet.{" "}
                <Link href="/admin/forms/create" style={{ color: "var(--color-ink-900)", textDecoration: "underline" }}>
                  Create your first form
                </Link>
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="card"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--color-ink-900)" }}>
                      {form.name}
                    </h3>
                    <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-ink-300)" }}>
                      /{form.slug} · {form.fields?.length ?? 0} fields · {form.submission_count} submissions
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <span
                      className="badge"
                      style={
                        form.is_active
                          ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }
                          : { background: "var(--color-ink-50)", color: "var(--color-ink-400)", border: "1px solid var(--color-ink-200)" }
                      }
                    >
                      {form.is_active ? "active" : "inactive"}
                    </span>
                    <Link
                      href={`/forms/${form.slug}`}
                      target="_blank"
                      className="text-xs"
                      style={{ color: "var(--color-ink-400)", textDecoration: "underline" }}
                    >
                      Preview
                    </Link>
                    <Link
                      href={`/admin/forms/edit?slug=${form.slug}`}
                      className="text-xs"
                      style={{ color: "var(--color-ink-700)", textDecoration: "underline" }}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent submissions ── */}
        <div id="submissions">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--color-ink-900)" }}>
              Recent Submissions
            </h2>
            {unread > 0 && (
              <Link
                href="/admin/notifications"
                className="text-xs font-mono tracking-widest uppercase"
                style={{ color: "#3B82F6" }}
              >
                {unread} unread alert{unread > 1 ? "s" : ""} →
              </Link>
            )}
          </div>

          {submissions.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-sm" style={{ color: "var(--color-ink-400)" }}>No submissions yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {submissions.slice(0, 10).map((sub) => (
                <div
                  key={sub.id}
                  className="card"
                  style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-mono text-sm" style={{ color: "var(--color-ink-900)" }}>
                      {sub.id.slice(0, 8)}…
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-ink-400)" }}>
                      {sub.client_identifier ?? sub.submitted_by ?? "Anonymous"} ·{" "}
                      {new Date(sub.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Inline status changer */}
                  <select
                    value={sub.status}
                    onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                    style={{
                      fontSize: "0.75rem",
                      fontFamily: "var(--font-mono)",
                      border: "1px solid var(--color-ink-200)",
                      padding: "0.25rem 0.5rem",
                      background: "var(--color-surface-raised)",
                      color: "var(--color-ink-700)",
                      cursor: "pointer",
                    }}
                  >
                    <option value="submitted">submitted</option>
                    <option value="reviewed">reviewed</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>

                  <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}