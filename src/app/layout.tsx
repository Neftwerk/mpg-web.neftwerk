import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { DecoBackground } from "@/components/DecoBackground";

export const metadata: Metadata = {
  title: "My Pocket Gallery",
  description: "Browse, collect and build your own gallery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_MEDIA_HOST ? (
          <>
            <link
              rel="dns-prefetch"
              href={`https://${process.env.NEXT_PUBLIC_MEDIA_HOST}`}
            />
            <link
              rel="preconnect"
              href={`https://${process.env.NEXT_PUBLIC_MEDIA_HOST}`}
              crossOrigin="anonymous"
            />
          </>
        ) : null}
      </head>
      <body
        suppressHydrationWarning
        className="lg:min-h-screen lg:pt-4 pb-14 text-[#11181c]"
      >
        <DecoBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
