// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "ACTSERV Form Builder",
  description:
    "Dynamic onboarding forms for financial services — KYC, loans, investments, and more.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "ACTSERV Form Builder",
    description:
      "Build and manage dynamic onboarding forms for financial services — powered by Next.js and Tailwind CSS.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} antialiased bg-[radial-gradient(circle_at_top_left,_#dbeafe_0%,_#e0e7ff_40%,_#f8fafc_100%)] text-gray-800`}
      >
        <Navbar />
        <main className="pt-4 md:pt-6">{children}</main>
      </body>
    </html>
  );
}

