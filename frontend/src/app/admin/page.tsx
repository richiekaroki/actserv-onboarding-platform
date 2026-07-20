import type { Metadata } from "next";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard — Mr.Wam",
  description:
    "Manage onboarding forms, review submissions, and track client progress.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminDashboardClient />;
}
