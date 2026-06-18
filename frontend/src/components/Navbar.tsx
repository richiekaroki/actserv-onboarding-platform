// frontend/src/components/Navbar.tsx
"use client";

import {
  getCurrentUser,
  isAdmin,
  isAuthenticated,
  loadCurrentUser,
  logout,
} from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Rehydrate the in-memory user from /api/auth/me/ on mount
  useEffect(() => {
    loadCurrentUser().finally(() => setReady(true));
  }, []);

  // Don't render until auth is resolved to avoid a flash of wrong state
  if (!ready) return null;

  const user = getCurrentUser();
  const userIsAdmin = isAdmin();
  const authed = isAuthenticated();

  const adminLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/forms", label: "Forms" },
    { href: "/admin/forms/create", label: "New Form" },
  ];
  const clientLinks = [{ href: "/forms", label: "Available Forms" }];
  const navLinks = userIsAdmin ? adminLinks : clientLinks;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav
      style={{
        background: "var(--color-surface-raised)",
        borderBottom: "1px solid var(--color-ink-100)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "4rem",
        }}
      >
        {/* Logo */}
        <Link
          href={userIsAdmin ? "/admin" : "/forms"}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            color: "var(--color-ink-900)",
            textDecoration: "none",
          }}
        >
          ActServ
        </Link>

        {/* Nav links */}
        {authed && (
          <div
            style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.375rem 1rem",
                  fontSize: "0.875rem",
                  color: isActive(link.href)
                    ? "var(--color-ink-900)"
                    : "var(--color-ink-400)",
                  fontWeight: isActive(link.href) ? 500 : 400,
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* User area */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {authed && user ? (
            <>
              <span
                className="font-mono text-xs hidden sm:block"
                style={{ color: "var(--color-ink-400)" }}
              >
                {user.email}
              </span>
              {userIsAdmin && (
                <span
                  className="badge"
                  style={{
                    background: "var(--color-ink-50)",
                    border: "1px solid var(--color-ink-200)",
                    color: "var(--color-ink-600)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  ADMIN
                </span>
              )}
              <button
                onClick={logout}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-ink-400)",
                  border: "1px solid var(--color-ink-200)",
                  padding: "0.375rem 0.75rem",
                  background: "transparent",
                  cursor: "pointer",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "var(--color-ink-900)";
                  e.currentTarget.style.borderColor = "var(--color-ink-400)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "var(--color-ink-400)";
                  e.currentTarget.style.borderColor = "var(--color-ink-200)";
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link
                href="/login"
                className="btn-secondary"
                style={{ padding: "0.375rem 0.875rem", fontSize: "0.8rem" }}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary"
                style={{ padding: "0.375rem 0.875rem", fontSize: "0.8rem" }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
