import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  description:
    "Dynamic onboarding forms for financial services — KYC, loan applications, investment declarations. SOC 2 compliant, enterprise-grade security.",
  openGraph: {
    title: "Mr.Wam — Client Onboarding Platform",
    description:
      "Build and manage dynamic onboarding forms for financial services.",
    type: "website",
    locale: "en_US",
    url: "https://onboarding-frontend.vercel.app",
  },
  twitter: {
    card: "summary",
    description:
      "Dynamic onboarding forms for financial services — KYC, loan applications, investment declarations.",
  },
};

export default function Page() {
  return <HomePageClient />;
}
