// frontend/components/FormRenderer.tsx
"use client";

import { useState } from "react";
import { FieldErrors, useForm, UseFormRegister } from "react-hook-form";

interface ConditionalValidation {
  depends_on: string;
  operator: "gt" | "lt" | "eq" | "gte" | "lte" | "ne";
  value: number | string;
  message?: string;
}

interface FormField {
  key: string;
  label: string;
  field_type: "text" | "number" | "date" | "dropdown" | "checkbox" | "file";
  required?: boolean;
  options?: string[];
  conditional_required?: ConditionalValidation;
  help_text?: string;
}

interface Props {
  schema: {
    fields: FormField[];
  };
  formSlug: string;
  onSubmit: (
    formSlug: string,
    textValues: Record<string, any>,
    files: Record<string, File | File[]>
  ) => Promise<void>;
}

interface FieldInputProps {
  field: FormField;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  watchValues: Record<string, any>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function evaluateConditional(
  conditional: ConditionalValidation,
  dependentValue: any
): boolean {
  const { operator, value } = conditional;
  const depVal = parseFloat(dependentValue) || dependentValue;

  // FIXED: Properly handle number to string conversion
  const compareVal = typeof value === "string" ? value : String(value);

  switch (operator) {
    case "gt":
      return depVal > compareVal;
    case "gte":
      return depVal >= compareVal;
    case "lt":
      return depVal < compareVal;
    case "lte":
      return depVal <= compareVal;
    case "eq":
      return depVal == compareVal;
    case "ne":
      return depVal != compareVal;
    default:
      return false;
  }
}

function FieldInput({ field, register, errors, watchValues }: FieldInputProps) {
  const error = errors[field.key];
  const inputBaseClass =
    "w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const errorClass = "border-red-500 bg-red-50";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  const isConditionallyRequired = field.conditional_required
    ? evaluateConditional(
        field.conditional_required,
        watchValues[field.conditional_required.depends_on]
      )
    : false;

  const isRequired = field.required || isConditionallyRequired;
  const requiredMessage = isConditionallyRequired
    ? field.conditional_required?.message || `${field.label} is required`
    : field.required
    ? `${field.label} is required`
    : false;

  switch (field.field_type) {
    case "text":
    case "number":
    case "date":
      return (
        <div className="mb-6">
          <label className={labelClass}>
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
            {isConditionallyRequired && (
              <span className="text-xs text-orange-600 ml-2">
                (conditionally required)
              </span>
            )}
          </label>
          <input
            type={field.field_type}
            {...register(field.key, {
              required: requiredMessage,
            })}
            className={`${inputBaseClass} ${error ? errorClass : ""}`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
          {field.help_text && (
            <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm mt-1">
              {error.message as string}
            </p>
          )}
        </div>
      );

    case "dropdown":
      return (
        <div className="mb-6">
          <label className={labelClass}>
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
            {isConditionallyRequired && (
              <span className="text-xs text-orange-600 ml-2">
                (conditionally required)
              </span>
            )}
          </label>
          <select
            {...register(field.key, {
              required: requiredMessage,
            })}
            className={`${inputBaseClass} ${error ? errorClass : ""}`}
          >
            <option value="">Select an option...</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {field.help_text && (
            <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm mt-1">
              {error.message as string}
            </p>
          )}
        </div>
      );

    case "checkbox":
      return (
        <div className="mb-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              {...register(field.key, {
                required: requiredMessage,
              })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label className="text-sm text-gray-700">
                {field.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
                {isConditionallyRequired && (
                  <span className="text-xs text-orange-600 ml-2">
                    (conditionally required)
                  </span>
                )}
              </label>
              {field.help_text && (
                <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
              )}
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1">
              {error.message as string}
            </p>
          )}
        </div>
      );

    case "file":
      return (
        <div className="mb-6">
          <label className={labelClass}>
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
            {isConditionallyRequired && (
              <span className="text-xs text-orange-600 ml-2">
                (conditionally required)
              </span>
            )}
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            {...register(field.key, {
              required: requiredMessage,
              validate: (files: FileList) => {
                if (!files || files.length === 0) {
                  return isRequired ? requiredMessage : true;
                }

                for (let i = 0; i < files.length; i++) {
                  const file = files[i];

                  if (file.size > MAX_FILE_SIZE) {
                    return `File "${file.name}" exceeds 5MB limit`;
                  }

                  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                    return `File "${file.name}" has invalid type. Only PDF, JPG, PNG, DOC, DOCX allowed`;
                  }
                }

                return true;
              },
            })}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Max 5MB per file. Multiple files allowed. Formats: PDF, JPG, PNG,
            DOC, DOCX
          </p>
          {field.help_text && (
            <p className="text-xs text-blue-600 mt-1">{field.help_text}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm mt-1">
              {error.message as string}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}

export default function FormRenderer({ schema, formSlug, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const watchedValues = watch();

  const onFormSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const textValues: Record<string, any> = {};
      const files: Record<string, File | File[]> = {};

      for (const [key, value] of Object.entries(data)) {
        if (value instanceof FileList && value.length > 0) {
          if (value.length === 1) {
            files[key] = value[0];
          } else {
            files[key] = Array.from(value);
          }
        } else if (typeof value === "boolean") {
          textValues[key] = value;
        } else if (value !== undefined && value !== null && value !== "") {
          textValues[key] = value;
        }
      }

      await onSubmit(formSlug, textValues, files);

      setSubmitSuccess(true);
      reset();

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const fields = schema?.fields || [];

  if (fields.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-6 border border-yellow-200 rounded-lg bg-yellow-50 text-center">
        <p className="text-yellow-800 font-semibold">No form fields found.</p>
        <p className="text-sm text-yellow-600 mt-2">
          This form doesn't have any fields configured yet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {submitSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✓ Form submitted successfully!
          </p>
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">✗ {submitError}</p>
        </div>
      )}

      <form
        onSubmit={onFormSubmit}
        className="p-6 border border-gray-300 rounded-lg shadow-sm bg-white"
        encType="multipart/form-data"
      >
        {fields.map((field, i) => (
          <FieldInput
            key={i}
            field={field}
            register={register}
            errors={errors}
            watchValues={watchedValues}
          />
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Form"
          )}
        </button>
      </form>
    </div>
  );
}
