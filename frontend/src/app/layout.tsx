// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ActServ — Client Onboarding",
  description:
    "Dynamic onboarding forms for financial services — KYC, loans, investments, and more.",
  openGraph: {
    title: "ActServ — Client Onboarding",
    description:
      "Build and manage dynamic onboarding forms for financial services.",
    type: "website",
    locale: "en_US",
  },
};

// Navbar is NOT rendered here because:
// 1. Some pages (login, register, homepage) have their own nav or no nav
// 2. Navbar uses client-only cookie auth — including it in a server layout
//    causes hydration mismatches
// Each page that needs the nav imports <Navbar /> directly.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}