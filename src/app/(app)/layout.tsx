import { AppRouteLayout } from "@/components/app-route-layout";

export default function AppSegmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppRouteLayout>{children}</AppRouteLayout>;
}
