// frontend/src/lib/api.ts
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";





// ── Cookie helpers (cookies survive SSR; localStorage does not) ────────────
const COOKIE_REGEX_CACHE = new Map<string, RegExp>();
function getCookiePattern(name: string): RegExp {
  let re = COOKIE_REGEX_CACHE.get(name);
  if (!re) {
    re = new RegExp(`(?:^|; )${name}=([^;]*)`);
    COOKIE_REGEX_CACHE.set(name, re);
  }
  return re;
}
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(getCookiePattern(name));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict${secure}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ── Token refresh ──────────────────────────────────────────────────────────
let _isRefreshing = false;
let _refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getCookie("refresh_token");
  if (!refreshToken) throw new Error("No refresh token");

  // Deduplicate concurrent refresh attempts
  if (_isRefreshing && _refreshPromise) return _refreshPromise;

  _isRefreshing = true;
  _refreshPromise = (async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh/`,
        { refresh: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );
      const { access, refresh } = response.data;
      setCookie("access_token", access, 1);
      if (refresh) setCookie("refresh_token", refresh, 7);
      return access;
    } finally {
      _isRefreshing = false;
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Axios interceptors ─────────────────────────────────────────────────────
function setupInterceptors(instance: any) {
  if (instance?.interceptors) {
    instance.interceptors.request.use((config: { headers: { Authorization: string; }; }) => {
      const token = getCookie("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response: any) => response,
      async (error: { config?: any; response?: { status: number; data?: unknown }; message?: string }) => {
        const originalRequest = error.config;

        // Attempt token refresh on 401 (skip if this is the refresh call itself or already retried)
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/auth/refresh/") &&
          !originalRequest.url?.includes("/auth/login/")
        ) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          } catch {
            // Refresh failed — clear tokens and redirect to login
          }
        }

        if (error.response?.status === 401) {
          deleteCookie("access_token");
          deleteCookie("refresh_token");
          _currentUser = null;
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
  }
}

// ── Error message extraction ───────────────────────────────────────────────
export function extractErrorMessage(error: unknown): string {
  const err = error as { response?: { status?: number; data?: unknown }; message?: string };

  // 429 rate limit
  if (err.response?.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  // DRF error response shapes
  const data = err.response?.data;
  if (data && typeof data === "object") {
    // { detail: "..." }
    if ("detail" in data && typeof data.detail === "string") {
      return data.detail;
    }
    // { responses: "..." }
    if ("responses" in data && typeof data.responses === "string") {
      return data.responses;
    }
    // { field: ["error1", "error2"] } — take first error
    const firstKey = Object.keys(data)[0];
    if (firstKey && Array.isArray(data[firstKey])) {
      return `${firstKey}: ${data[firstKey][0]}`;
    }
  }

  // Fallback
  return err.message || "An unexpected error occurred. Please try again.";
}

let _apiInstance: any = null;

function getApiInstance() {
  if (!_apiInstance) {
    _apiInstance = (axios as any).create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });
    setupInterceptors(_apiInstance);
  }
  return _apiInstance;
}

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
  const response = await getApiInstance().post("/auth/login/", {
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
  const response = await getApiInstance().post("/auth/register/", userData);
  return response.data;
}

export async function loadCurrentUser(): Promise<AuthUser | null> {
  if (!isAuthenticated()) return null;
  try {
    const response = await getApiInstance().get("/auth/me/");
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
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getForms(page = 1): Promise<any[]> {
  const response = await getApiInstance().get(`/forms/?page=${page}`);
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}

export async function getForm(slug: string) {
  const response = await getApiInstance().get(`/forms/${slug}/`);
  return response.data;
}

export async function createForm(formData: {
  name: string;
  slug: string;
  description?: string;
  schema: object;
  is_active?: boolean;
}) {
  const response = await getApiInstance().post("/forms/", formData);
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
  const response = await getApiInstance().patch(`/forms/${slug}/`, formData);
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
  const response = await getApiInstance().post(`/forms/${formSlug}/fields/`, fieldData);
  return response.data;
}

export async function deleteField(formSlug: string, fieldId: string) {
  await getApiInstance().delete(`/forms/${formSlug}/fields/${fieldId}/`);
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
  const api = getApiInstance();
  const submissionRes = await api.post("/submissions/", {
    form: formId,           // backend expects UUID
    responses: textValues,  // backend expects 'responses', not 'text_values'
  });
  const submissionId: string = submissionRes.data.id;

  // Step 2: upload each file to the dedicated upload endpoint
  // Skip if user is not authenticated (backend requires auth for file uploads)
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

export async function getSubmissions(page = 1): Promise<PaginatedResponse<Record<string, unknown>>> {
  const response = await getApiInstance().get(`/submissions/?page=${page}`);
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}

export async function getSubmission(id: string) {
  const response = await getApiInstance().get(`/submissions/${id}/`);
  return response.data;
}

export async function updateSubmissionStatus(id: string, status: string) {
  const response = await getApiInstance().patch(`/submissions/${id}/status/`, { status });
  return response.data;
}

// ── Notifications ──────────────────────────────────────────────────────────
export async function getNotifications() {
  const response = await getApiInstance().get("/notifications/");
  return Array.isArray(response.data)
    ? response.data
    : (response.data.results ?? []);
}

export async function markNotificationRead(id: string) {
  const response = await getApiInstance().patch(`/notifications/${id}/`, { is_read: true });
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await getApiInstance().post("/notifications/mark-all-read/");
  return response.data;
}

