//frontend/src/lib/api.ts
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Enhanced response interceptor with security measures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't reveal whether it was a user or admin auth failure
    if (error.response?.status === 401) {
      // Clear auth data on 401 errors
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_role");

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Client registration - matches POST /api/auth/register/
export async function registerClient(userData: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  const response = await api.post("/auth/register/", userData);
  return response.data;
}

// Client login - matches POST /api/auth/login/
export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  try {
    // Backend expects 'username' field, not 'email'
    const response = await api.post("/auth/login/", {
      username: credentials.email,
      password: credentials.password,
    });

    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Set role based on user data from response
      const role = response.data.user?.is_admin ? "admin" : "user";
      localStorage.setItem("user_role", role);
    }

    return response.data;
  } catch (error: any) {
    // Return user-friendly error
    throw new Error(
      error.response?.data?.detail || "Invalid credentials. Please try again."
    );
  }
}

// Get current user
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// Get user role
export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_role");
}

// Check if user is admin
export function isAdmin(): boolean {
  return getUserRole() === "admin";
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

// Get all forms - matches GET /api/forms/
export async function getForms() {
  const response = await api.get("/forms/");
  return response.data;
}

// Get single form by slug - matches GET /api/forms/{slug}/
export async function getForm(slug: string) {
  const response = await api.get(`/forms/${slug}/`);
  return response.data;
}

// Submit form - matches POST /api/submissions/
export async function submitForm(
  formId: string,
  textValues: Record<string, any>,
  files: Record<string, File | File[]>
) {
  const formData = new FormData();

  // Add form_id
  formData.append("form_id", formId);

  // Add text values
  formData.append("text_values", JSON.stringify(textValues));

  // Add files
  Object.entries(files).forEach(([fieldName, file]) => {
    if (Array.isArray(file)) {
      file.forEach((f) => formData.append(fieldName, f));
    } else {
      formData.append(fieldName, file);
    }
  });

  const response = await api.post(`/submissions/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

// Get submissions - matches GET /api/submissions/
export async function getSubmissions(formId?: string) {
  const endpoint = formId ? `/submissions/?form_id=${formId}` : "/submissions/";
  const response = await api.get(endpoint);
  return response.data;
}

// Logout function
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
  }
}

// Token refresh - matches POST /api/auth/refresh/
export async function refreshToken() {
  try {
    const response = await api.post("/auth/refresh/");
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
    }
    return response.data;
  } catch (error) {
    logout();
    throw error;
  }
}

// Create form (admin only) - matches POST /api/forms/
async function createForm(formData: any) {
  const response = await api.post("/forms/", formData);
  return response.data;
}

export default api;
export { createForm };
