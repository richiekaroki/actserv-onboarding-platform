// ============================================
// FILE 8: frontend/src/app/forms/[slug]/page.tsx
// ============================================
"use client";

import FormRenderer from "@/components/FormRenderer";
import { submitForm as apiSubmitForm, getForm } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientFormPage() {
  const { slug } = useParams();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;

    getForm(slug as string)
      .then((data) => {
        setForm(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Failed to load form. Please try again."
        );
        setLoading(false);
      });
  }, [slug]);

  // Create a wrapper function that returns Promise<void>
  const handleFormSubmit = async (
    formSlug: string,
    textValues: Record<string, any>,
    files: Record<string, File | File[]>
  ): Promise<void> => {
    try {
      // Use form.id (UUID) instead of form.slug for the API call
      await apiSubmitForm(form.id, textValues, files);

      console.log("Form submitted successfully");

      // Optional: Redirect to success page
      // router.push('/submission-success');
    } catch (error: any) {
      console.error("Form submission failed:", error);

      // Provide user-friendly error message
      if (error.response?.data) {
        throw new Error(
          error.response.data.detail || "Submission failed. Please try again."
        );
      } else {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-sm border">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-semibold mb-2">Form Error</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-sm border">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-700 text-lg font-semibold mb-2">
            Form Not Found
          </p>
          <p className="text-gray-600 mb-6">
            The form you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h1 className="text-3xl font-bold text-gray-800">{form.name}</h1>
            {form.description && (
              <p className="text-gray-600 mt-2">{form.description}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span>
                📝 {form.schema?.fields?.length || 0} field
                {form.schema?.fields?.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="p-6">
            <FormRenderer
              schema={form.schema}
              formSlug={form.slug}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
