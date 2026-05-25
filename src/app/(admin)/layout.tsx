import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import React from "react";

export const metadata = {
  title: "Neftwerk Admin Dashboard",
  description: "Strict Neumorphic Admin Panel",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  // Protect all admin routes using a mock cookie check
  if (!session) {
    redirect("/login?error=unauthorized");
  }

  return <AdminShell>{children}</AdminShell>;
}
