// frontend/src/components/FormBuilder.tsx
"use client";

import { useState } from "react";

interface FormField {
  key: string;
  label: string;
  field_type: "text" | "number" | "date" | "dropdown" | "checkbox" | "file";
  required: boolean;
  options?: string[];
}

interface FormSchema {
  fields: FormField[];
}

interface Props {
  onSubmit: (formData: {
    name: string;
    description: string;
    slug: string;
    schema: FormSchema;
  }) => void;
  onCancel: () => void;
}

export default function FormBuilder({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [schema, setSchema] = useState<FormSchema>({ fields: [] });
  const [jsonError, setJsonError] = useState<string | null>(null);

  const sampleSchema: FormSchema = {
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
      {
        key: "loan_amount",
        label: "Loan Amount",
        field_type: "number",
        required: true,
      },
      {
        key: "employment_status",
        label: "Employment Status",
        field_type: "dropdown",
        required: true,
        options: ["Employed", "Self-Employed", "Unemployed"],
      },
      {
        key: "agree_terms",
        label: "I agree to the terms",
        field_type: "checkbox",
        required: true,
      },
    ],
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      setSchema(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError("Invalid JSON format");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !schema.fields.length) {
      alert("Please fill all required fields");
      return;
    }

    onSubmit({ name, description, slug, schema });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Form</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Form Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) {
                setSlug(generateSlug(e.target.value));
              }
            }}
            placeholder="e.g., KYC Application"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this form"
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL) *
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g., kyc-application"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Will be accessible at /forms/{slug}
          </p>
        </div>

        {/* JSON Schema */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schema (JSON) *
          </label>
          <textarea
            value={JSON.stringify(schema, null, 2)}
            onChange={handleJsonChange}
            rows={12}
            className={`w-full font-mono text-sm border rounded-lg p-3 focus:outline-none focus:ring-2 ${
              jsonError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            required
          />
          {jsonError && (
            <p className="text-red-500 text-sm mt-1">{jsonError}</p>
          )}
        </div>

        {/* Schema Documentation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">
            Schema Documentation
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>field_type</strong>: text, number, date, dropdown,
              checkbox, file
            </p>
            <p>
              <strong>required</strong>: true/false
            </p>
            <p>
              <strong>options</strong>: Array of strings (for dropdown)
            </p>
            <button
              type="button"
              onClick={() => setSchema(sampleSchema)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Load example schema
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Form
          </button>
        </div>
      </form>
    </div>
  );
}
