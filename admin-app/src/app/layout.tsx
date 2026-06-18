import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سوفت واليت - الإدارة",
  description: "لوحة إدارة سوفت واليت",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}