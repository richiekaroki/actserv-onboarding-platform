// ============================================
// FILE 7: frontend/src/app/forms/page.tsx
// ============================================
"use client";

import { getCurrentUser, getForms } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Form {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

export default function FormsList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const formsData = await getForms();
      // Only show active forms to clients
      const activeForms = formsData.filter((form: Form) => form.is_active);
      setForms(activeForms);
    } catch (error) {
      console.error("Failed to load forms:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Available Forms
          </h1>
          <p className="text-gray-600">
            {user
              ? `Welcome, ${user.first_name}!`
              : "Please select a form to fill"}
          </p>
        </div>

        {forms.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No forms available
            </h3>
            <p className="text-gray-600">
              There are no active forms available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">
                    {form.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {form.description}
                  </p>
                  <Link
                    href={`/forms/${form.slug}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fill Form
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to action for unauthenticated users */}
        {!user && (
          <div className="max-w-2xl mx-auto mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
            <h3 className="font-semibold text-blue-800 mb-2">
              Create an account to track your submissions
            </h3>
            <p className="text-blue-600 text-sm mb-4">
              Register to save your form progress and view submission history.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
