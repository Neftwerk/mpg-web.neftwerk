import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Neft Mobile Web",
  description: "Web version of the Neft mobile app",
  icons: {
    icon: "/images/neftwerkfavicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className="lg:min-h-screen bg-[url('/images/deco-pattern-background.svg')] bg-cover bg-center bg-no-repeat lg:pt-4 pb-14 text-[#11181c]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
