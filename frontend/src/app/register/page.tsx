import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Create Account — Mr.Wam",
  description:
    "Register for a Mr.Wam account to access onboarding forms, track submissions, and streamline your KYC process.",
  openGraph: {
    title: "Create Account — Mr.Wam",
    description: "Register for a Mr.Wam account to access onboarding forms.",
    type: "website",
  },
};

export default function Page() {
  return <RegisterClient />;
}
