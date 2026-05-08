import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neft Mobile Web",
  description: "Web version of the Neft mobile app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] text-[#11181c]">{children}</body>
    </html>
  );
}
