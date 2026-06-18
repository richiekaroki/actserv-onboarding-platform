// frontend/__tests__/ConditionalValidation.test.tsx
// Tests the conditional_required validation logic — the key assessment edge case:
// "income proof only if loan amount > X"
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormRenderer, { type FormFieldDef } from "@/components/FormRenderer";

const mockSubmit = jest.fn().mockResolvedValue(undefined);
afterEach(() => jest.clearAllMocks());

const loanFields: FormFieldDef[] = [
  {
    id: "f1", key: "loan_amount", label: "Loan Amount", field_type: "number",
    required: true, options: null, order: 1, help_text: "", placeholder: "",
  },
  {
    id: "f2", key: "income_proof", label: "Income Proof", field_type: "file",
    required: false, options: null, order: 2, help_text: "", placeholder: "",
    conditional_required: {
      depends_on: "loan_amount", operator: "gt", value: 100000,
      message: "Income proof required for loans above KES 100,000",
    },
  },
];

describe("Conditional validation", () => {
  it("does NOT require income_proof when loan_amount <= 100000", async () => {
    const user = userEvent.setup();
    render(<FormRenderer fields={loanFields} formId="f" onSubmit={mockSubmit} />);

    await user.type(screen.getByPlaceholderText(/enter loan amount/i), "50000");
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      // No error about income proof
      expect(screen.queryByText(/income proof required/i)).not.toBeInTheDocument();
      // onSubmit WAS called (the form is valid)
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  it("DOES require income_proof when loan_amount > 100000", async () => {
    const user = userEvent.setup();
    render(<FormRenderer fields={loanFields} formId="f" onSubmit={mockSubmit} />);

    await user.type(screen.getByPlaceholderText(/enter loan amount/i), "200000");
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/income proof required for loans above/i)).toBeInTheDocument();
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  it("shows '(conditionally required)' label when threshold is exceeded", async () => {
    const user = userEvent.setup();
    render(<FormRenderer fields={loanFields} formId="f" onSubmit={mockSubmit} />);

    await user.type(screen.getByPlaceholderText(/enter loan amount/i), "150000");

    await waitFor(() => {
      expect(screen.getByText(/conditionally required/i)).toBeInTheDocument();
    });
  });

  it("hides '(conditionally required)' when threshold is not met", async () => {
    const user = userEvent.setup();
    render(<FormRenderer fields={loanFields} formId="f" onSubmit={mockSubmit} />);

    await user.type(screen.getByPlaceholderText(/enter loan amount/i), "1000");

    await waitFor(() => {
      expect(screen.queryByText(/conditionally required/i)).not.toBeInTheDocument();
    });
  });

  it("handles 'eq' operator correctly", async () => {
    const user = userEvent.setup();
    const fields: FormFieldDef[] = [
      {
        id: "f1", key: "status", label: "Status", field_type: "dropdown",
        required: true, order: 1, options: [{ value: "self-employed", label: "Self-Employed" }],
        help_text: "", placeholder: "",
      },
      {
        id: "f2", key: "business_reg", label: "Business Registration", field_type: "file",
        required: false, options: null, order: 2, help_text: "", placeholder: "",
        conditional_required: {
          depends_on: "status", operator: "eq", value: "self-employed",
          message: "Business registration required for self-employed applicants",
        },
      },
    ];

    render(<FormRenderer fields={fields} formId="f" onSubmit={mockSubmit} />);

    await user.selectOptions(screen.getByRole("combobox"), "self-employed");
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/business registration required/i)).toBeInTheDocument();
    });
  });
});