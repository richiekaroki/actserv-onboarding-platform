// frontend/src/app/page.tsx
import FeatureCard from "@/components/FeatureCard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f0f9ff,_#e0e7ff,_#f5f3ff)]">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Dynamic Form Builder
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create customizable onboarding forms for financial services. Support
            KYC, loan applications, investment declarations, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16">
            <Link
              href="/forms/kyc-form"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
            >
              Try Demo Form
            </Link>
            <Link
              href="/admin"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:shadow-md transition-all duration-300"
            >
              Admin Dashboard
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              emoji="📝"
              color="text-blue-600"
              title="Dynamic Forms"
              description="Create forms with text, numbers, dates, dropdowns, and file uploads."
            />
            <FeatureCard
              emoji="⚡"
              color="text-green-600"
              title="Async Notifications"
              description="Get instant admin notifications via Celery when forms are submitted."
            />
            <FeatureCard
              emoji="🔒"
              color="text-purple-600"
              title="Admin Dashboard"
              description="Full control over forms and submissions with secure admin access."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
