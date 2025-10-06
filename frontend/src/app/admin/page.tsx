// Admin form list
// frontend/src/app/admin/page.tsx
"use client";

import API, { logout } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();

  const loadForms = () => {
    API.get("forms/")
      .then((res) => {
        setForms(Array.isArray(res.data) ? res.data : res.data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          router.push("/admin/login");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleDelete = async (formId: number, formName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${formName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(formId);
    try {
      await API.delete(`forms/${formId}/`);
      setForms(forms.filter((f) => f.id !== formId));
    } catch (err) {
      alert("Failed to delete form. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your forms and submissions
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/forms/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Create New Form
            </Link>
            <button
              onClick={handleLogout}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Forms</h2>
            <p className="text-gray-600">
              {forms.length} form{forms.length !== 1 ? "s" : ""} created
            </p>
          </div>

          <div className="p-6">
            {forms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-300 text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg mb-2">
                  No forms created yet.
                </p>
                <p className="text-gray-400 mb-6">
                  Get started by creating your first form
                </p>
                <Link
                  href="/admin/forms/create"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Create Form
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="border rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {form.name}
                          </h3>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {form.slug}
                          </span>
                        </div>
                        {form.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {form.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>
                            {form.schema?.fields?.length || 0} field
                            {form.schema?.fields?.length !== 1 ? "s" : ""}
                          </span>
                          <span>•</span>
                          <span>
                            Created{" "}
                            {new Date(form.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 ml-4">
                        <Link
                          href={`/forms/${form.slug}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2 rounded hover:bg-blue-50 transition-colors"
                        >
                          View Form
                        </Link>
                        <button
                          onClick={() => handleDelete(form.id, form.name)}
                          disabled={deletingId === form.id}
                          className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === form.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
