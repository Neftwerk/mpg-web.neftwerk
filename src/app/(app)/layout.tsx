import { AppRouteLayout } from "@/components/app-route-layout";
import { PrivyAppProvider } from "@/components/PrivyAppProvider";

export default function AppSegmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PrivyAppProvider>
      <AppRouteLayout>{children}</AppRouteLayout>
    </PrivyAppProvider>
  );
}
