// ============================================
// FILE 3: frontend/src/app/admin/page.tsx (UPDATED WITH EDIT BUTTON)
// ============================================
"use client";

import FormBuilder from "@/components/FormBuilder";
import {
  createForm,
  getForms,
  isAdmin,
  isAuthenticated,
  logout,
} from "@/lib/api";
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
}

export default function AdminDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, [router]);

  const checkAuthAndLoadData = async () => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      router.push("/forms");
      return;
    }

    setAuthChecked(true);
    await loadForms();
  };

  const loadForms = async () => {
    try {
      const formsData = await getForms();
      setForms(formsData);
    } catch (error) {
      console.error("Failed to load forms:", error);
      if ((error as any).response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async (formData: any) => {
    try {
      await createForm(formData);
      await loadForms();
      setShowFormBuilder(false);
      alert("Form created successfully!");
    } catch (error: any) {
      console.error("Failed to create form:", error);
      if (error.response?.status === 401) {
        alert("Please log in again");
        router.push("/login");
      } else {
        alert("Failed to create form. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!authChecked && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin() && isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage your forms and submissions</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/admin/forms/create")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create New Form
              </button>
              <button
                onClick={handleLogout}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showFormBuilder ? (
          <FormBuilder
            onSubmit={handleCreateForm}
            onCancel={() => setShowFormBuilder(false)}
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800">Forms</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {forms.length}
                </p>
                <p className="text-sm text-gray-600">forms created</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800">
                  Submissions
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {forms.reduce((acc, form) => acc + form.submission_count, 0)}
                </p>
                <p className="text-sm text-gray-600">total submissions</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800">Active</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {forms.filter((f) => f.is_active).length}
                </p>
                <p className="text-sm text-gray-600">active forms</p>
              </div>
            </div>

            {/* Forms List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Forms</h2>
              </div>

              {forms.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No forms created yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first form
                  </p>
                  <button
                    onClick={() => router.push("/admin/forms/create")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Form
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {forms.map((form) => (
                    <div key={form.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {form.name}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {form.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>/{form.slug}</span>
                            <span>{form.submission_count} submissions</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                form.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {form.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`/forms/${form.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Form
                          </a>
                          <button
                            onClick={() =>
                              router.push(`/admin/forms/edit/${form.id}`)
                            }
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
