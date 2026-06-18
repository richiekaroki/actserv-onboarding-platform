// frontend/src/lib/api.ts
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Cookie helpers (cookies survive SSR; localStorage does not) ────────────
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ── Axios interceptors ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getCookie("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie("access_token");
      deleteCookie("refresh_token");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth state (in-memory; rehydrated on page load via loadCurrentUser) ─────
export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "client";
  is_staff: boolean;
}

let _currentUser: AuthUser | null = null;

export function getCurrentUser(): AuthUser | null {
  return _currentUser;
}

export function isAuthenticated(): boolean {
  return !!getCookie("access_token");
}

export function isAdmin(): boolean {
  return (
    !!_currentUser && (_currentUser.is_staff || _currentUser.role === "admin")
  );
}

// ── Auth API ───────────────────────────────────────────────────────────────
export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  // SimpleJWT expects the field named 'username'
  const response = await api.post("/auth/login/", {
    username: credentials.email,
    password: credentials.password,
  });

  // SimpleJWT returns 'access' and 'refresh' — NOT 'access_token'
  const { access, refresh, user } = response.data;
  setCookie("access_token", access, 1);
  setCookie("refresh_token", refresh, 7);
  _currentUser = user;
  return user;
}

export async function registerClient(userData: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  const response = await api.post("/auth/register/", userData);
  return response.data;
}

export async function loadCurrentUser(): Promise<AuthUser | null> {
  if (!isAuthenticated()) return null;
  try {
    const response = await api.get("/auth/me/");
    _currentUser = response.data;
    return _currentUser;
  } catch {
    return null;
  }
}

export function logout() {
  deleteCookie("access_token");
  deleteCookie("refresh_token");
  _currentUser = null;
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// ── Forms ──────────────────────────────────────────────────────────────────
export async function getForms() {
  const response = await api.get("/forms/");
  return Array.isArray(response.data)
    ? response.data
    : (response.data.results ?? []);
}

export async function getForm(slug: string) {
  const response = await api.get(`/forms/${slug}/`);
  return response.data;
}

export async function createForm(formData: {
  name: string;
  slug: string;
  description?: string;
  schema: object;
  is_active?: boolean;
}) {
  const response = await api.post("/forms/", formData);
  return response.data;
}

export async function updateForm(
  slug: string,
  formData: Partial<{
    name: string;
    description: string;
    is_active: boolean;
    schema: object;
  }>
) {
  const response = await api.patch(`/forms/${slug}/`, formData);
  return response.data;
}

// ── Fields ─────────────────────────────────────────────────────────────────
export async function createField(
  formSlug: string,
  fieldData: {
    key: string;
    label: string;
    field_type: string;
    required?: boolean;
    options?: unknown;
    validation?: unknown;
    order?: number;
    placeholder?: string;
    help_text?: string;
  }
) {
  const response = await api.post(`/forms/${formSlug}/fields/`, fieldData);
  return response.data;
}

export async function deleteField(formSlug: string, fieldId: string) {
  await api.delete(`/forms/${formSlug}/fields/${fieldId}/`);
}

// ── Submissions ────────────────────────────────────────────────────────────
// Two-step submission matches the backend's two-endpoint design:
//  1. POST /submissions/ with JSON responses → returns submission UUID
//  2. POST /submissions/{id}/upload/ for each file field
export async function submitForm(
  formId: string,
  textValues: Record<string, unknown>,
  files: Record<string, File | File[]>
): Promise<{ id: string }> {
  // Step 1: create submission (JSON only — no multipart here)
  const submissionRes = await api.post("/submissions/", {
    form: formId,           // backend expects UUID
    responses: textValues,  // backend expects 'responses', not 'text_values'
  });
  const submissionId: string = submissionRes.data.id;

  // Step 2: upload each file to the dedicated upload endpoint
  for (const [fieldKey, fileOrFiles] of Object.entries(files)) {
    const fileList = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    for (const file of fileList) {
      const fd = new FormData();
      fd.append("field_key", fieldKey);
      fd.append("file", file);
      await api.post(`/submissions/${submissionId}/upload/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
  }

  return submissionRes.data;
}

export async function getSubmissions() {
  const response = await api.get("/submissions/");
  return Array.isArray(response.data)
    ? response.data
    : (response.data.results ?? []);
}

export async function getSubmission(id: string) {
  const response = await api.get(`/submissions/${id}/`);
  return response.data;
}

export async function updateSubmissionStatus(id: string, status: string) {
  const response = await api.patch(`/submissions/${id}/status/`, { status });
  return response.data;
}

// ── Notifications ──────────────────────────────────────────────────────────
export async function getNotifications() {
  const response = await api.get("/notifications/");
  return Array.isArray(response.data)
    ? response.data
    : (response.data.results ?? []);
}

export async function markNotificationRead(id: string) {
  const response = await api.patch(`/notifications/${id}/`, { is_read: true });
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.post("/notifications/mark-all-read/");
  return response.data;
}

export default api;