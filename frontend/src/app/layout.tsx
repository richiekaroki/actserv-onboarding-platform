// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mr.Wam — Client Onboarding",
  description:
    "Dynamic onboarding forms for financial services — KYC, loans, investments, and more.",
  openGraph: {
    title: "Mr.Wam — Client Onboarding",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}