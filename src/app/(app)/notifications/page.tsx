"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Notifications live in Messages now — one calm inbox. */
export default function NotificationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/messages");
  }, [router]);

  return (
    <div className="flex justify-center py-16 mt-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A3F6C] border-t-transparent" />
    </div>
  );
}
