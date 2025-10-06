// frontend/__tests__/api.test.ts

describe("API Authentication - Basic", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test("localStorage set and get operations", () => {
    const testToken = "test-token-123";

    // Simulate setting token
    localStorage.setItem("authToken", testToken);
    expect(localStorage.getItem("authToken")).toBe(testToken);

    // Simulate getting token
    const retrievedToken = localStorage.getItem("authToken");
    expect(retrievedToken).toBe(testToken);
  });

  test("localStorage remove operations", () => {
    // Set a token first
    localStorage.setItem("authToken", "existing-token");
    expect(localStorage.getItem("authToken")).toBe("existing-token");

    // Remove the token
    localStorage.removeItem("authToken");
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  test("localStorage returns null for non-existent items", () => {
    expect(localStorage.getItem("nonExistentKey")).toBeNull();
  });
});
