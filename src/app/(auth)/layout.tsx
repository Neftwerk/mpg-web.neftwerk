import { PrivyAppProvider } from "@/components/PrivyAppProvider";

export default function AuthSegmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PrivyAppProvider>{children}</PrivyAppProvider>;
}
