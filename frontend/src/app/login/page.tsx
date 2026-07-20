import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In — Mr.Wam",
  description:
    "Sign in to your Mr.Wam account to access onboarding forms and track submissions.",
  openGraph: {
    title: "Sign In — Mr.Wam",
    description: "Sign in to your Mr.Wam account.",
    type: "website",
  },
};

export default function Page() {
  return <LoginClient />;
}
