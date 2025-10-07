// ============================================
// FILE 6: frontend/src/app/page.tsx
// ============================================
"use client";

import { isAdmin, isAuthenticated } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    setIsUserAuthenticated(isAuthenticated());
    setIsUserAdmin(isAdmin());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Dynamic Form Builder 
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create customizable onboarding forms for financial services. Support
            KYC, loan applications, investment declarations, and more.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/forms"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              View Available Forms
            </Link>

            {isUserAdmin && (
              <Link
                href="/admin"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold text-lg"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-blue-600 text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Dynamic Forms
            </h3>
            <p className="text-gray-600">
              Create forms with text, numbers, dates, dropdowns, and file
              uploads. Fully customizable for any use case.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-green-600 text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Async Notifications
            </h3>
            <p className="text-gray-600">
              Get instant admin notifications when forms are submitted. Powered
              by Celery for reliable background processing.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-purple-600 text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Admin Dashboard
            </h3>
            <p className="text-gray-600">
              Full control over forms and submissions with secure admin access.
              Monitor activity and manage form responses.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8">
            Browse available forms or create your own with our admin dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/forms"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Browse Forms
            </Link>
            {!isUserAuthenticated && (
              <Link
                href="/register"
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-semibold"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
