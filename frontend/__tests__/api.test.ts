// frontend/__tests__/api.test.ts
import axios from "axios";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock the axios instance methods
const mockApi = {
  get:  jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request:  { use: jest.fn() },
    response: { use: jest.fn() },
  },
};
(axios.create as jest.Mock).mockReturnValue(mockApi);

// Re-import after mock is set up
import {
  loginUser,
  registerClient,
  getForms,
  submitForm,
  getSubmissions,
} from "@/lib/api";

// Helper to mock document.cookie in jsdom
function mockCookie(value = "") {
  Object.defineProperty(document, "cookie", {
    writable: true,
    value,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("loginUser", () => {
  beforeEach(() => {
    mockCookie("");
  });

  it("sends username (not email) to the login endpoint", async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        access:  "access-token-123",   // SimpleJWT field name
        refresh: "refresh-token-456",
        user: { id: "1", email: "admin@test.com", role: "admin", is_staff: true,
                first_name: "Admin", last_name: "User" },
      },
    });

    const user = await loginUser({ email: "admin@test.com", password: "pass" });

    expect(mockApi.post).toHaveBeenCalledWith("/auth/login/", {
      username: "admin@test.com",  // must be 'username', not 'email'
      password: "pass",
    });
    expect(user.is_staff).toBe(true);
  });

  it("throws on invalid credentials", async () => {
    mockApi.post.mockRejectedValueOnce({ response: { status: 401 } });
    await expect(loginUser({ email: "bad@test.com", password: "wrong" })).rejects.toBeTruthy();
  });
});

describe("registerClient", () => {
  it("calls the register endpoint with user data", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { message: "Registration successful." } });
    await registerClient({ email: "new@test.com", password: "password123" });
    expect(mockApi.post).toHaveBeenCalledWith("/auth/register/", {
      email: "new@test.com",
      password: "password123",
    });
  });
});

describe("getForms", () => {
  it("returns results array from paginated response", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { count: 2, results: [{ id: "1", name: "Form A" }, { id: "2", name: "Form B" }] },
    });
    const forms = await getForms();
    expect(forms).toHaveLength(2);
    expect(forms[0].name).toBe("Form A");
  });

  it("returns plain array response directly", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: [{ id: "1", name: "Form A" }],
    });
    const forms = await getForms();
    expect(forms).toHaveLength(1);
  });
});

describe("submitForm", () => {
  it("POSTs to /submissions/ with form UUID and responses (not form_id + text_values)", async () => {
    const submissionId = "sub-uuid-123";
    mockApi.post.mockResolvedValueOnce({ data: { id: submissionId } });

    const result = await submitForm(
      "form-uuid-456",
      { full_name: "Jane Doe", age: "30" },
      {}
    );

    expect(mockApi.post).toHaveBeenCalledWith("/submissions/", {
      form:      "form-uuid-456",   // 'form', not 'form_id'
      responses: { full_name: "Jane Doe", age: "30" }, // 'responses', not 'text_values'
    });
    expect(result.id).toBe(submissionId);
  });

  it("uploads files to the /upload/ endpoint after creating submission", async () => {
    const submissionId = "sub-uuid-789";
    mockApi.post
      .mockResolvedValueOnce({ data: { id: submissionId } }) // submission create
      .mockResolvedValueOnce({ data: {} });                   // file upload

    const mockFile = new File(["content"], "id.pdf", { type: "application/pdf" });
    await submitForm("form-id", { name: "Test" }, { id_document: mockFile });

    // Second call should be the file upload
    const secondCall = mockApi.post.mock.calls[1];
    expect(secondCall[0]).toBe(`/submissions/${submissionId}/upload/`);
    expect(secondCall[1]).toBeInstanceOf(FormData);
  });
});

describe("getSubmissions", () => {
  it("returns results from paginated response", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { count: 1, results: [{ id: "sub-1", status: "submitted" }] },
    });
    const subs = await getSubmissions();
    expect(subs[0].status).toBe("submitted");
  });
});