// frontend/__tests__/FileValidation.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FormRenderer, { type FormFieldDef } from "@/components/FormRenderer";

const mockSubmit = jest.fn().mockResolvedValue(undefined);
afterEach(() => jest.clearAllMocks());

const fileField: FormFieldDef = {
  id: "f1", key: "id_document", label: "ID Document", field_type: "file",
  required: true, options: null, order: 0, help_text: "", placeholder: "",
};

function makeFile(name: string, type: string, sizeBytes: number): File {
  const file = new File(["x".repeat(sizeBytes)], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

describe("File field validation", () => {
  it("rejects files over 5 MB", async () => {
    render(<FormRenderer fields={[fileField]} formId="f" onSubmit={mockSubmit} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const bigFile = makeFile("huge.pdf", "application/pdf", 6 * 1024 * 1024);

    Object.defineProperty(input, "files", {
      value: Object.assign([bigFile], { item: (i: number) => [bigFile][i], length: 1 }),
    });
    fireEvent.change(input);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/exceeds the 5 mb limit/i)).toBeInTheDocument();
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("rejects files with disallowed MIME types", async () => {
    render(<FormRenderer fields={[fileField]} formId="f" onSubmit={mockSubmit} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const badFile = makeFile("script.exe", "application/x-msdownload", 1024);

    Object.defineProperty(input, "files", {
      value: Object.assign([badFile], { item: (i: number) => [badFile][i], length: 1 }),
    });
    fireEvent.change(input);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/not an allowed file type/i)).toBeInTheDocument();
    });
  });

  it("accepts valid PDF within size limit", async () => {
    render(<FormRenderer fields={[fileField]} formId="f" onSubmit={mockSubmit} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const goodFile = makeFile("id.pdf", "application/pdf", 1024 * 1024); // 1 MB

    Object.defineProperty(input, "files", {
      value: Object.assign([goodFile], { item: (i: number) => [goodFile][i], length: 1 }),
    });
    fireEvent.change(input);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  it("shows required error when no file is uploaded and field is required", async () => {
    render(<FormRenderer fields={[fileField]} formId="f" onSubmit={mockSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/id document is required/i)).toBeInTheDocument();
    });
  });
});