// frontend/lib/api.ts with proper Auth
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/apii",
});

// Initialize auth token from localStorage on page load
if (typeof window !== "undefined") {
  const token = localStorage.getItem("authToken");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  } else {
    delete api.defaults.headers.common["Authorization"];
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function logout() {
  setAuthToken(null);
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

export interface ConditionalValidation {
  depends_on: string;
  operator: "gt" | "lt" | "eq" | "gte" | "lte" | "ne";
  value: number | string;
  message?: string;
}

export interface FormField {
  key: string;
  label: string;
  field_type: "text" | "number" | "date" | "dropdown" | "checkbox" | "file";
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditional_required?: ConditionalValidation;
  help_text?: string;
}

export interface FormSchema {
  id: number;
  name: string;
  slug: string;
  description?: string;
  schema: {
    fields: FormField[];
  };
  created_at: string;
  updated_at: string;
}

export async function getForm(slug: string): Promise<FormSchema> {
  const response = await api.get(`/forms/${slug}/`);
  return response.data;
}

export async function submitForm(
  formSlug: string,
  textValues: Record<string, any>,
  files: Record<string, File | File[]>
) {
  const formData = new FormData();

  formData.append("form", formSlug);
  formData.append("responses", JSON.stringify(textValues));

  Object.entries(files).forEach(([fieldKey, fileValue]) => {
    if (Array.isArray(fileValue)) {
      fileValue.forEach((file) => formData.append(`file__${fieldKey}`, file));
    } else if (fileValue) {
      formData.append(`file__${fieldKey}`, fileValue);
    }
  });

  return api.post("/submissions/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export default api;
