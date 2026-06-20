// frontend/src/app/admin/forms/edit/page.tsx
// Accessed as /admin/forms/edit?slug=form-slug
"use client";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { getForm, updateForm, createField, deleteField } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

interface FieldRow {
  id: string;
  key: string;
  label: string;
  field_type: string;
  required: boolean;
  order: number;
  options: unknown;
  help_text: string;
  placeholder: string;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  schema_version: number;
  fields: FieldRow[];
}

const FIELD_TYPES = ["text","email","number","date","dropdown","checkbox","file","textarea"];

function EditFormPageInner() {
  const searchParams = useSearchParams();
  const slug         = searchParams.get("slug") ?? "";
  const router       = useRouter();

  const [form,       setForm]       = useState<FormData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");

  // New field being added
  const [newField, setNewField] = useState({
    key: "", label: "", field_type: "text",
    required: false, help_text: "", placeholder: "",
  });

  useEffect(() => {
    if (!slug) { router.push("/admin"); return; }
    getForm(slug)
      .then((data) => setForm(data))
      .catch(() => setError("Form not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleMetaUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      await updateForm(slug, {
        name:        form.name,
        description: form.description,
        is_active:   form.is_active,
      });
      setSuccess("Form updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !newField.key || !newField.label) return;
    setSaving(true);
    try {
      const created = await createField(slug, {
        ...newField,
        order: form.fields.length,
      });
      setForm((f) => f ? { ...f, fields: [...f.fields, created] } : f);
      setNewField({ key: "", label: "", field_type: "text", required: false, help_text: "", placeholder: "" });
      setSuccess("Field added.");
      setTimeout(() => setSuccess(""), 2000);
    } catch {
      setError("Failed to add field.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Delete this field? Existing submissions are not affected.")) return;
    try {
      await deleteField(slug, fieldId);
      setForm((f) => f ? { ...f, fields: f.fields.filter((field) => field.id !== fieldId) } : f);
    } catch {
      setError("Failed to delete field.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-surface)" }}>
        <span className="animate-spin" style={{ width: "2rem", height: "2rem", border: "2px solid var(--color-ink-100)", borderTopColor: "var(--color-ink-900)", borderRadius: "50%", display: "inline-block" }} />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-surface)" }}>
        <div className="card text-center py-16">
          <p style={{ color: "var(--color-ink-400)" }}>{error || "Form not found."}</p>
          <button onClick={() => router.push("/admin")} className="btn-secondary mt-6">← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        <button onClick={() => router.push("/admin")} className="text-xs font-mono tracking-widest uppercase mb-8 block" style={{ color: "var(--color-ink-400)" }}>
          ← Back to dashboard
        </button>

        {/* ── Form metadata ── */}
        <div className="page-header">
          <h1 className="page-title">Edit: {form.name}</h1>
          <p className="page-subtitle">Schema v{form.schema_version} · {form.fields.length} fields</p>
        </div>

        {error   && <p className="text-sm px-4 py-3 bg-red-50  border border-red-200  text-red-700  mb-6">{error}</p>}
        {success && <p className="text-sm px-4 py-3 bg-green-50 border border-green-200 text-green-700 mb-6">{success}</p>}

        <form onSubmit={handleMetaUpdate} style={{ marginBottom: "3rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label className="label">Form name</label>
              <input className="input" value={form.name}
                onChange={(e) => setForm((f) => f ? { ...f, name: e.target.value } : f)} />
            </div>
            <div>
              <label className="label">Slug</label>
              <input className="input" value={form.slug} disabled style={{ background: "var(--color-surface-sunken)", cursor: "not-allowed" }} />
              <p className="text-xs mt-1 font-mono" style={{ color: "var(--color-ink-300)" }}>Slug cannot be changed after creation</p>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">Description</label>
            <textarea className="input" rows={2} style={{ resize: "none" }} value={form.description}
              onChange={(e) => setForm((f) => f ? { ...f, description: e.target.value } : f)} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <input type="checkbox" id="is_active" checked={form.is_active}
              onChange={(e) => setForm((f) => f ? { ...f, is_active: e.target.checked } : f)}
              style={{ accentColor: "var(--color-ink-900)" }} />
            <label htmlFor="is_active" className="text-sm" style={{ color: "var(--color-ink-700)" }}>
              Form is active (visible to clients)
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        {/* ── Existing fields ── */}
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--color-ink-900)", marginBottom: "1rem" }}>
          Fields
        </h2>

        {form.fields.length === 0 ? (
          <div className="card text-center py-8 mb-6">
            <p className="text-sm" style={{ color: "var(--color-ink-400)" }}>No fields yet. Add one below.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
            {[...form.fields].sort((a, b) => a.order - b.order).map((field) => (
              <div key={field.id} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <p className="text-sm font-medium" style={{ color: "var(--color-ink-900)" }}>{field.label}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-ink-400)" }}>
                    key: {field.key} · type: {field.field_type}
                    {field.required && " · required"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteField(field.id)}
                  className="text-xs"
                  style={{ color: "#B91C1C", cursor: "pointer", background: "none", border: "none" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Add new field ── */}
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-ink-900)", marginBottom: "1rem" }}>
          Add Field
        </h3>
        <form onSubmit={handleAddField} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="label">Key</label>
              <input className="input" value={newField.key} placeholder="e.g. full_name"
                onChange={(e) => setNewField((f) => ({ ...f, key: e.target.value.replace(/\s+/g, "_").toLowerCase() }))} required />
            </div>
            <div>
              <label className="label">Label</label>
              <input className="input" value={newField.label} placeholder="e.g. Full Name"
                onChange={(e) => setNewField((f) => ({ ...f, label: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={newField.field_type}
                onChange={(e) => setNewField((f) => ({ ...f, field_type: e.target.value }))}>
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="label">Placeholder</label>
              <input className="input" value={newField.placeholder}
                onChange={(e) => setNewField((f) => ({ ...f, placeholder: e.target.value }))} />
            </div>
            <div>
              <label className="label">Help text</label>
              <input className="input" value={newField.help_text}
                onChange={(e) => setNewField((f) => ({ ...f, help_text: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--color-ink-700)", cursor: "pointer" }}>
              <input type="checkbox" checked={newField.required}
                onChange={(e) => setNewField((f) => ({ ...f, required: e.target.checked }))}
                style={{ accentColor: "var(--color-ink-900)" }} />
              Required field
            </label>
            <button type="submit" disabled={saving} className="btn-primary" style={{ marginLeft: "auto" }}>
              {saving ? "Adding…" : "Add field"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default function EditFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EditFormPageInner />
    </Suspense>
  );
}
