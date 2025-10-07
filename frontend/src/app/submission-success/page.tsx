// ============================================
// FILE 1: frontend/src/app/submission-success/page.tsx (NEW)
// ============================================
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubmissionSuccessPage() {
  const searchParams = useSearchParams();
  const formSlug = searchParams.get("form");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/forms";
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Submission Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your form has been submitted successfully. We've received your
          information and will process it shortly.
        </p>

        {formSlug && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Form:</strong>{" "}
              {formSlug
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          </div>
        )}

        {/* Notification Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-left text-sm text-gray-700">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Admin will be notified of your submission</li>
                <li>Your documents will be reviewed</li>
                <li>You'll be contacted if additional info is needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-sm text-gray-500 mb-6">
          Redirecting to forms page in <strong>{countdown}</strong> seconds...
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/forms"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            View All Forms
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Back to Home
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact support or check your submission status in your
            dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
