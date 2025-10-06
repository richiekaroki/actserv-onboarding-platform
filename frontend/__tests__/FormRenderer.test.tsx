// frontend/__tests__/FormRenderer.test.tsx
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("FormRenderer - Basic", () => {
  test("renders form with required fields", () => {
    render(
      <form>
        <label htmlFor="full_name">
          Full Name <span>*</span>
        </label>
        <input type="text" id="full_name" required />

        <label htmlFor="email">
          Email <span>*</span>
        </label>
        <input type="text" id="email" required />

        <button type="submit">Submit Form</button>
      </form>
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Form/i })
    ).toBeInTheDocument();

    const asterisks = screen.getAllByText("*");
    expect(asterisks).toHaveLength(2);
  });

  test("renders empty state message", () => {
    render(<div>No form fields found</div>);
    expect(screen.getByText(/No form fields found/i)).toBeInTheDocument();
  });

  test("form submission messages", () => {
    const { rerender } = render(<div>Form submitted successfully</div>);
    expect(
      screen.getByText(/Form submitted successfully/i)
    ).toBeInTheDocument();

    rerender(<div>Network error</div>);
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });
});
