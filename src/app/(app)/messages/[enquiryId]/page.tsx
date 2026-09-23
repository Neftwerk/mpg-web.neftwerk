"use client";

import { Suspense, useState } from "react";
import { useParams } from "next/navigation";
import { MobileMenu } from "@/components/sidebar/Sidebar";
import { PageHeader } from "@/components/PageHeader";
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
      <PageHeader
        title="Messages"
        backHref="/messages"
        backLabel="Back to Messages"
        onMenuOpen={() => setMenuOpen(true)}
      />

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
      <PageHeader title="Messages" backHref="/messages" onMenuOpen={() => {}} />
      <div className="flex justify-center py-16 mt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A3F6C] border-t-transparent" />
      </div>
    </>
  );
}
