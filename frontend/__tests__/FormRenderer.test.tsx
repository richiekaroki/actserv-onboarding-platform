// frontend/__tests__/FormRenderer.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormRenderer, { type FormFieldDef } from "@/components/FormRenderer";

const baseField = (overrides: Partial<FormFieldDef> = {}): FormFieldDef => ({
  id:         "field-1",
  key:        "full_name",
  label:      "Full Name",
  field_type: "text",
  required:   true,
  options:    null,
  order:      0,
  help_text:  "",
  placeholder: "",
  ...overrides,
});

const mockSubmit = jest.fn().mockResolvedValue(undefined);

afterEach(() => jest.clearAllMocks());

describe("FormRenderer", () => {
  it("renders a text field with its label", () => {
    render(
      <FormRenderer
        fields={[baseField()]}
        formId="form-123"
        onSubmit={mockSubmit}
      />
    );
    expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
  });

  it("renders empty state when no fields are given", () => {
    render(<FormRenderer fields={[]} formId="form-123" onSubmit={mockSubmit} />);
    expect(screen.getByText(/no fields configured/i)).toBeInTheDocument();
  });

  it("shows validation error when required field is empty on submit", async () => {
    render(
      <FormRenderer
        fields={[baseField({ required: true })]}
        formId="form-123"
        onSubmit={mockSubmit}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with text values when form is valid", async () => {
    const user = userEvent.setup();
    render(
      <FormRenderer
        fields={[baseField()]}
        formId="form-123"
        onSubmit={mockSubmit}
      />
    );
    await user.type(screen.getByPlaceholderText(/enter full name/i), "Jane Doe");
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        "form-123",
        { full_name: "Jane Doe" },
        {}
      );
    });
  });

  it("renders dropdown with options", () => {
    const field = baseField({
      field_type: "dropdown",
      options: [
        { value: "employed", label: "Employed" },
        { value: "self-employed", label: "Self-Employed" },
      ],
      required: false,
    });
    render(<FormRenderer fields={[field]} formId="f" onSubmit={mockSubmit} />);
    expect(screen.getByText("Employed")).toBeInTheDocument();
    expect(screen.getByText("Self-Employed")).toBeInTheDocument();
  });

  it("renders checkbox field", () => {
    const field = baseField({
      key:        "terms",
      label:      "I accept the terms",
      field_type: "checkbox",
    });
    render(<FormRenderer fields={[field]} formId="f" onSubmit={mockSubmit} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText(/I accept the terms/i)).toBeInTheDocument();
  });

  it("shows help text when provided", () => {
    const field = baseField({ help_text: "As it appears on your ID" });
    render(<FormRenderer fields={[field]} formId="f" onSubmit={mockSubmit} />);
    expect(screen.getByText(/as it appears on your id/i)).toBeInTheDocument();
  });

  it("sorts fields by order property", () => {
    const fields: FormFieldDef[] = [
      baseField({ id: "f2", key: "last_name",  label: "Last Name",  order: 2 }),
      baseField({ id: "f1", key: "first_name", label: "First Name", order: 1 }),
    ];
    render(<FormRenderer fields={fields} formId="f" onSubmit={mockSubmit} />);
    const labels = screen.getAllByRole("textbox");
    // First Name (order=1) should appear before Last Name (order=2)
    expect(labels[0]).toHaveAttribute("placeholder", expect.stringMatching(/first name/i));
    expect(labels[1]).toHaveAttribute("placeholder", expect.stringMatching(/last name/i));
  });
});