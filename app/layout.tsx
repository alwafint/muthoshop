import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "মুঠোশপ | অনলাইন গ্রোসারি শপ",
  description: "হাতের মুঠোয় প্রয়োজনীয় পণ্য",
  manifest: "/manifest.json", // ম্যানিফেস্ট ফাইল লিঙ্ক
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "মুঠোশপ",
  },
};

// মোবাইলের থিম কালার সেট করা
export const viewport: Viewport = {
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={inter.className}>{children}</body>
    </html>
  );
}