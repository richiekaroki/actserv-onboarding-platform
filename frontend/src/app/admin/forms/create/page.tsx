// frontend/src/app/admin/forms/create/page.tsx
"use client";

import { createForm, createField } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";

// ── Example schemas used to pre-populate the JSON editor ──────────────────
const EXAMPLE_SCHEMAS = {
  basic: {
    fields: [
      { key: "full_name",  label: "Full Name",       field_type: "text",   required: true  },
      { key: "email",      label: "Email Address",    field_type: "email",  required: true  },
    ],
  },
  kyc: {
    fields: [
      { key: "full_name",     label: "Full Legal Name", field_type: "text", required: true,
        help_text: "As it appears on your government-issued ID" },
      { key: "date_of_birth", label: "Date of Birth",   field_type: "date", required: true  },
      { key: "nationality",   label: "Nationality",     field_type: "dropdown", required: true,
        options: ["Kenyan", "Ugandan", "Tanzanian", "Rwandan", "Other"] },
      { key: "id_document",   label: "ID Document",     field_type: "file", required: true,
        help_text: "Upload passport, national ID, or driver's license" },
      { key: "address_proof", label: "Proof of Address", field_type: "file", required: true },
    ],
  },
  loan: {
    fields: [
      { key: "full_name",          label: "Full Name",         field_type: "text",     required: true  },
      { key: "loan_amount",        label: "Loan Amount (KES)", field_type: "number",   required: true,
        help_text: "Enter the amount you wish to borrow" },
      { key: "employment_status",  label: "Employment Status", field_type: "dropdown", required: true,
        options: ["Employed", "Self-Employed", "Business Owner", "Unemployed"] },
      {
        // Conditional validation: income_proof only required when loan_amount > 100000
        key: "income_proof", label: "Income Proof", field_type: "file", required: false,
        help_text: "Required for loans above KES 100,000",
        conditional_required: {
          depends_on: "loan_amount", operator: "gt", value: 100000,
          message: "Income proof is required for loans above KES 100,000",
        },
      },
      { key: "terms_accepted", label: "I accept the terms and conditions",
        field_type: "checkbox", required: true },
    ],
  },
};

// Validate schema JSON before attempting to create the form
function validateSchema(schemaStr: string): string | null {
  try {
    const parsed = JSON.parse(schemaStr);
    if (!parsed.fields || !Array.isArray(parsed.fields)) return "Schema must have a 'fields' array";
    if (parsed.fields.length === 0) return "Schema must have at least one field";
    const validTypes = ["text","number","date","dropdown","checkbox","file","email","textarea"];
    for (let i = 0; i < parsed.fields.length; i++) {
      const f = parsed.fields[i];
      if (!f.key)        return `Field ${i + 1}: missing 'key'`;
      if (!f.label)      return `Field ${i + 1}: missing 'label'`;
      if (!validTypes.includes(f.field_type))
        return `Field ${i + 1}: invalid field_type '${f.field_type}'`;
      if (f.field_type === "dropdown" && !f.options)
        return `Field ${i + 1}: dropdown fields must have an 'options' array`;
    }
    return null;
  } catch (e: unknown) {
    return `Invalid JSON: ${(e as Error).message}`;
  }
}

export default function CreateFormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "", slug: "", description: "",
    schema: JSON.stringify(EXAMPLE_SCHEMAS.basic, null, 2),
    is_active: true,
  });
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSchemaChange = (value: string) => {
    setFormData((f) => ({ ...f, schema: value }));
    setSchemaError(validateSchema(value));
  };

  const loadExample = (key: keyof typeof EXAMPLE_SCHEMAS) => {
    const s = JSON.stringify(EXAMPLE_SCHEMAS[key], null, 2);
    setFormData((f) => ({ ...f, schema: s }));
    setSchemaError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schErr = validateSchema(formData.schema);
    if (schErr) { setSchemaError(schErr); return; }

    setLoading(true);
    setError("");

    try {
      const parsed = JSON.parse(formData.schema);

      // Step 1: create the Form record (schema JSON is stored as-is for reference)
      const created = await createForm({
        name:        formData.name,
        slug:        formData.slug,
        description: formData.description,
        schema:      parsed,
        is_active:   formData.is_active,
      });

      // Step 2: create each Field row via the nested endpoint
      // This is what makes validation actually work — the backend reads Field rows,
      // not schema.fields, when validating submissions.
      for (let i = 0; i < parsed.fields.length; i++) {
        const f = parsed.fields[i];
        await createField(created.slug, {
          key:        f.key,
          label:      f.label,
          field_type: f.field_type,
          required:   f.required ?? false,
          options:    f.options ?? null,
          validation: f.conditional_required
            ? { conditional_required: f.conditional_required }
            : null,
          order:       i,
          placeholder: f.placeholder ?? "",
          help_text:   f.help_text ?? "",
        });
      }

      router.push("/admin");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { slug?: string[]; name?: string[]; detail?: string } } };
      setError(
        e.response?.data?.slug?.[0] ??
        e.response?.data?.name?.[0] ??
        e.response?.data?.detail ??
        "Failed to create form. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        <div className="page-header">
          <h1 className="page-title">Create New Form</h1>
          <p className="page-subtitle">
            Define your form using JSON — fields are created as individual records
            so validation rules apply per-form automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name + Slug */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label className="label">Form name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData((f) => ({ ...f, name, slug: f.slug || generateSlug(name) }));
                }}
                placeholder="e.g. KYC Application"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Slug (URL) *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))
                }
                placeholder="e.g. kyc-application"
                required
                className="input"
              />
              <p className="text-xs mt-1" style={{ color: "var(--color-ink-300)", fontFamily: "var(--font-mono)" }}>
                /forms/{formData.slug || "your-slug"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this form"
              rows={2}
              className="input"
              style={{ resize: "none" }}
            />
          </div>

          {/* Schema editor */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label className="label" style={{ marginBottom: 0 }}>Schema (JSON) *</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["basic", "kyc", "loan"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => loadExample(key)}
                    style={{
                      fontSize: "0.7rem", fontFamily: "var(--font-mono)",
                      padding: "0.2rem 0.6rem",
                      border: "1px solid var(--color-ink-200)",
                      background: "var(--color-surface-raised)",
                      color: "var(--color-ink-600)",
                      cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em",
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={formData.schema}
              onChange={(e) => handleSchemaChange(e.target.value)}
              rows={18}
              className={`input ${schemaError ? "input-error" : ""}`}
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", resize: "vertical" }}
              required
            />

            {schemaError ? (
              <p className="mt-2 text-xs text-red-600">✗ {schemaError}</p>
            ) : (
              <p className="mt-2 text-xs" style={{ color: "#15803D" }}>✓ Valid JSON schema</p>
            )}

            <details className="mt-3">
              <summary
                className="text-xs cursor-pointer"
                style={{ color: "var(--color-ink-400)", fontFamily: "var(--font-mono)" }}
              >
                Schema reference
              </summary>
              <div
                className="mt-2 card text-xs"
                style={{ fontFamily: "var(--font-mono)", lineHeight: 1.8 }}
              >
                <strong>field_type:</strong> text · email · number · date · dropdown · checkbox · file · textarea<br />
                <strong>required:</strong> true / false<br />
                <strong>options:</strong> ["A", "B"] — dropdown only<br />
                <strong>conditional_required:</strong> {`{ depends_on, operator (gt/gte/lt/lte/eq/ne), value, message }`}
              </div>
            </details>
          </div>

          {/* Active toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4"
              style={{ accentColor: "var(--color-ink-900)" }}
            />
            <label htmlFor="is_active" className="text-sm" style={{ color: "var(--color-ink-700)" }}>
              Publish form immediately (visible to clients)
            </label>
          </div>

          {error && (
            <p className="text-sm px-4 py-3 bg-red-50 border border-red-200 text-red-700 mb-6">
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              disabled={loading || !!schemaError}
              className="btn-primary"
            >
              {loading ? "Creating…" : "Create form"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}