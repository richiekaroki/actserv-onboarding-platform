// frontend/__tests__/FieldTypes.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import FormRenderer, { type FormFieldDef } from "@/components/FormRenderer";

const mockSubmit = jest.fn();

function field(overrides: Partial<FormFieldDef>): FormFieldDef {
  return {
    id: "f1", key: "test_field", label: "Test Field",
    field_type: "text", required: false, options: null,
    order: 0, help_text: "", placeholder: "",
    ...overrides,
  };
}

describe("All field types render correctly", () => {
  it("text field", () => {
    render(<FormRenderer fields={[field({ field_type: "text" })]} formId="f" onSubmit={mockSubmit} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  it("email field", () => {
    render(<FormRenderer fields={[field({ field_type: "email", key: "email", label: "Email" })]} formId="f" onSubmit={mockSubmit} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("number field", () => {
    render(<FormRenderer fields={[field({ field_type: "number" })]} formId="f" onSubmit={mockSubmit} />);
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("date field", () => {
    const { container } = render(<FormRenderer fields={[field({ field_type: "date" })]} formId="f" onSubmit={mockSubmit} />);
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it("dropdown field renders options", () => {
    render(
      <FormRenderer
        fields={[field({
          field_type: "dropdown",
          options: [{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }],
        })]}
        formId="f"
        onSubmit={mockSubmit}
      />
    );
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("dropdown accepts string options (legacy format)", () => {
    render(
      <FormRenderer
        fields={[field({ field_type: "dropdown", options: ["Alpha", "Beta"] as unknown as FormFieldDef["options"] })]}
        formId="f"
        onSubmit={mockSubmit}
      />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("checkbox field renders a checkbox input", () => {
    render(<FormRenderer fields={[field({ field_type: "checkbox" })]} formId="f" onSubmit={mockSubmit} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("file field renders a file input", () => {
    const { container } = render(<FormRenderer fields={[field({ field_type: "file" })]} formId="f" onSubmit={mockSubmit} />);
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it("textarea field renders a textarea element", () => {
    render(<FormRenderer fields={[field({ field_type: "textarea" })]} formId="f" onSubmit={mockSubmit} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument(); // textarea has implicit textbox role
  });
});