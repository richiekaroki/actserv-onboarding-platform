// ============================================
// FILE 4: frontend/src/components/Navbar.tsx
// ============================================
"use client";

import { getCurrentUser } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const role = localStorage.getItem("user_role");
    setUser(currentUser);
    setUserRole(role);
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-800">
              FormBuilder
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link href="/forms" className="text-gray-600 hover:text-gray-900">
                Available Forms
              </Link>

              {/* Show admin link only to admins */}
              {userRole === "admin" && (
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.first_name || user.username}
                  {userRole === "admin" && (
                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("user_role");
                    window.location.href = "/";
                  }}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
