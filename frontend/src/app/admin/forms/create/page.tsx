// ============================================
// FILE 9: frontend/src/app/admin/forms/create/page.tsx
// ============================================
"use client";

import API from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EXAMPLE_SCHEMAS = {
  basic: {
    fields: [
      {
        key: "full_name",
        label: "Full Name",
        field_type: "text",
        required: true,
      },
      {
        key: "email",
        label: "Email Address",
        field_type: "text",
        required: true,
      },
    ],
  },
  kyc: {
    fields: [
      {
        key: "full_name",
        label: "Full Legal Name",
        field_type: "text",
        required: true,
        help_text: "As it appears on your ID",
      },
      {
        key: "date_of_birth",
        label: "Date of Birth",
        field_type: "date",
        required: true,
      },
      {
        key: "id_document",
        label: "ID Document",
        field_type: "file",
        required: true,
        help_text: "Upload passport, national ID, or driver's license",
      },
      {
        key: "address_proof",
        label: "Proof of Address",
        field_type: "file",
        required: true,
      },
    ],
  },
  loan: {
    fields: [
      {
        key: "full_name",
        label: "Full Name",
        field_type: "text",
        required: true,
      },
      {
        key: "loan_amount",
        label: "Loan Amount (KES)",
        field_type: "number",
        required: true,
        help_text: "Enter the amount you wish to borrow",
      },
      {
        key: "income_proof",
        label: "Income Proof",
        field_type: "file",
        required: false,
        conditional_required: {
          depends_on: "loan_amount",
          operator: "gt",
          value: 100000,
          message: "Income proof required for loans above KES 100,000",
        },
      },
      {
        key: "employment_status",
        label: "Employment Status",
        field_type: "dropdown",
        required: true,
        options: ["Employed", "Self-Employed", "Business Owner", "Unemployed"],
      },
      {
        key: "terms_accepted",
        label: "I accept the terms and conditions",
        field_type: "checkbox",
        required: true,
      },
    ],
  },
};

export default function CreateFormPage() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    schema: JSON.stringify(EXAMPLE_SCHEMAS.basic, null, 2),
    schema_version: 1,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [schemaError, setSchemaError] = useState("");
  const router = useRouter();

  const validateSchema = (schemaString: string): boolean => {
    try {
      const parsed = JSON.parse(schemaString);

      if (!parsed.fields || !Array.isArray(parsed.fields)) {
        setSchemaError("Schema must have a 'fields' array");
        return false;
      }

      if (parsed.fields.length === 0) {
        setSchemaError("Schema must have at least one field");
        return false;
      }

      const validFieldTypes = [
        "text",
        "number",
        "date",
        "dropdown",
        "checkbox",
        "file",
      ];

      for (let i = 0; i < parsed.fields.length; i++) {
        const field = parsed.fields[i];

        if (!field.key || typeof field.key !== "string") {
          setSchemaError(`Field ${i + 1}: Missing or invalid 'key'`);
          return false;
        }

        if (!field.label || typeof field.label !== "string") {
          setSchemaError(`Field ${i + 1}: Missing or invalid 'label'`);
          return false;
        }

        if (!validFieldTypes.includes(field.field_type)) {
          setSchemaError(
            `Field ${i + 1}: Invalid field_type '${
              field.field_type
            }'. Must be one of: ${validFieldTypes.join(", ")}`
          );
          return false;
        }

        if (field.field_type === "dropdown" && !field.options) {
          setSchemaError(
            `Field ${i + 1}: Dropdown fields must have 'options' array`
          );
          return false;
        }
      }

      setSchemaError("");
      return true;
    } catch (e: any) {
      setSchemaError(`Invalid JSON: ${e.message}`);
      return false;
    }
  };

  const handleSchemaChange = (newSchema: string) => {
    setFormData({ ...formData, schema: newSchema });
    validateSchema(newSchema);
  };

  const loadExample = (exampleKey: keyof typeof EXAMPLE_SCHEMAS) => {
    const schema = JSON.stringify(EXAMPLE_SCHEMAS[exampleKey], null, 2);
    setFormData({ ...formData, schema });
    setSchemaError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateSchema(formData.schema)) {
      setLoading(false);
      return;
    }

    try {
      const submissionData = {
        ...formData,
        schema: JSON.parse(formData.schema),
      };

      await API.post("forms/", submissionData);
      router.push("/admin");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to create form"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create New Form</h1>
          <p className="text-gray-600">
            Define your form schema using JSON configuration
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., KYC Application"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., kyc-application"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be accessible at /forms/{formData.slug || "your-slug"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Brief description of this form"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Schema (JSON) *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => loadExample("basic")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    Basic
                  </button>
                  <button
                    type="button"
                    onClick={() => loadExample("kyc")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    KYC
                  </button>
                  <button
                    type="button"
                    onClick={() => loadExample("loan")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    Loan
                  </button>
                </div>
              </div>

              <textarea
                value={formData.schema}
                onChange={(e) => handleSchemaChange(e.target.value)}
                className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 font-mono text-sm ${
                  schemaError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                rows={16}
                required
              />

              {schemaError ? (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-semibold">
                    ✗ Schema Error
                  </p>
                  <p className="text-red-600 text-sm mt-1">{schemaError}</p>
                </div>
              ) : (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm">✓ Valid JSON schema</p>
                </div>
              )}

              <details className="mt-2">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  Schema Documentation
                </summary>
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold mb-2">Field Types:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>
                      <code>text</code> - Single line text input
                    </li>
                    <li>
                      <code>number</code> - Numeric input
                    </li>
                    <li>
                      <code>date</code> - Date picker
                    </li>
                    <li>
                      <code>dropdown</code> - Select from options (requires{" "}
                      <code>options</code> array)
                    </li>
                    <li>
                      <code>checkbox</code> - True/false checkbox
                    </li>
                    <li>
                      <code>file</code> - File upload (supports multiple files)
                    </li>
                  </ul>
                  <h4 className="font-semibold mt-3 mb-2">
                    Conditional Validation:
                  </h4>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">
                    {`"conditional_required": {
  "depends_on": "loan_amount",
  "operator": "gt", // gt, gte, lt, lte, eq, ne
  "value": 100000,
  "message": "Required for loans above 100k"
}`}
                  </pre>
                </div>
              </details>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-semibold">
                  ✗ Error Creating Form
                </p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !!schemaError}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {loading ? "Creating..." : "Create Form"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
