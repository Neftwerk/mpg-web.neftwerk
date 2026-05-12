import { AppRouteLayout } from "@/components/app-route-layout";
import { UserProvider } from "@/lib/UserContext";

export default function AppSegmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <AppRouteLayout>{children}</AppRouteLayout>
    </UserProvider>
  );
}
