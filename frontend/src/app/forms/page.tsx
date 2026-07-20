import type { Metadata } from "next";
import FormsListClient from "./FormsListClient";

export const metadata: Metadata = {
  title: "Available Forms",
  description:
    "Browse and complete onboarding forms — KYC, loan applications, and investment declarations.",
  openGraph: {
    title: "Available Forms — Mr.Wam",
    description: "Browse and complete onboarding forms.",
    type: "website",
  },
};

export default function Page() {
  return <FormsListClient />;
}
