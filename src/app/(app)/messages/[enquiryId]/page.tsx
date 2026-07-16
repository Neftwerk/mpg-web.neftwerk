"use client";

import { Suspense, useState } from "react";
import { useParams } from "next/navigation";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { EnquiryThread } from "@/components/messages/EnquiryThread";

export default function EnquiryThreadPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<ThreadFallback />}>
        <ThreadContent />
      </Suspense>
    </AuthGuard>
  );
}

function ThreadContent() {
  const params = useParams();
  const enquiryId = typeof params.enquiryId === "string" ? params.enquiryId : "";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <MobileTopBar
        title="Messages"
        backHref="/messages"
        onMenuOpen={() => setMenuOpen(true)}
      />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Messages</h1>
      </header>

      <div className="px-4 pb-28 mt-20 lg:mt-0 max-w-lg mx-auto">
        {enquiryId ? (
          <EnquiryThread enquiryId={enquiryId} />
        ) : (
          <p className="text-sm text-red-500 text-center py-10">Invalid enquiry.</p>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function ThreadFallback() {
  return (
    <>
      <MobileTopBar title="Messages" backHref="/messages" onMenuOpen={() => {}} />
      <div className="flex justify-center py-16 mt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A3F6C] border-t-transparent" />
      </div>
    </>
  );
}
