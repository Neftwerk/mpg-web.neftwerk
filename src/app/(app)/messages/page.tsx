"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { EnquiryInbox } from "@/components/messages/EnquiryInbox";
import { EnquiryCompose } from "@/components/messages/EnquiryCompose";
import { useUser } from "@/lib/UserContext";
import type { EnquiryListItem } from "@/lib/enquiry-types";
import {
  findEnquiryByArtworkId,
  listEnquiries,
} from "@/lib/enquiry-service";
import { useEnquirySocket } from "@/lib/use-enquiry-socket";

export default function MessagesPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<MessagesFallback />}>
        <MessagesContent />
      </Suspense>
    </AuthGuard>
  );
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const artworkId = searchParams.get("artworkId");
  const artworkTitle = searchParams.get("artwork") ?? undefined;

  const [menuOpen, setMenuOpen] = useState(false);
  const [enquiries, setEnquiries] = useState<EnquiryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composeReady, setComposeReady] = useState(!artworkId);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const viewerRole = typeof user?.role === "string" ? user.role : undefined;
  const canCreateEnquiry = viewerRole === "customer";

  const fetchInbox = useCallback(async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    const res = await listEnquiries({ page: pageNum, limit: 20 });

    if (res.ok) {
      const fetched = res.data.enquiries;
      setEnquiries((prev) => (append ? [...prev, ...fetched] : fetched));
      setHasMore(res.data.pagination.hasNextPage);
      setError("");
    } else if (!append) {
      setError(res.message || "Failed to load messages.");
    }

    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    if (!artworkId) {
      fetchInbox(1, false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      const existing = await findEnquiryByArtworkId(artworkId);
      if (cancelled) return;

      if (existing) {
        router.replace(`/messages/${existing._id}`);
        return;
      }

      setComposeReady(true);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [artworkId, fetchInbox, router]);

  useEnquirySocket({
    enquiryId: null,
    onInboxUpdate: useCallback(() => {
      if (!artworkId) {
        setPage(1);
        fetchInbox(1, false);
      }
    }, [artworkId, fetchInbox]),
  });

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchInbox(next, true);
  };

  const showCompose = Boolean(artworkId && composeReady && canCreateEnquiry);
  const showRoleWarning = Boolean(artworkId && composeReady && !canCreateEnquiry);

  return (
    <>
      <MobileTopBar title="Messages" onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Messages</h1>
      </header>

      <div className="px-4 pb-28 mt-20 lg:mt-0 max-w-lg mx-auto">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A3F6C] border-t-transparent" />
          </div>
        )}

        {!loading && showCompose && artworkId && (
          <EnquiryCompose artworkId={artworkId} artworkTitle={artworkTitle} />
        )}

        {!loading && showRoleWarning && (
          <div className="card-neumorph text-center py-10 mt-4 space-y-3">
            <p className="text-sm text-[#616161]">
              Only collectors can message galleries about artworks. You can still
              view and reply to conversations in your inbox.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/messages")}
              className="btn-neumorph px-6"
            >
              View inbox
            </button>
          </div>
        )}

        {!loading && !artworkId && error && (
          <div className="card-neumorph text-center py-10 mt-4">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button
              type="button"
              onClick={() => fetchInbox(1)}
              className="btn-neumorph px-6"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !artworkId && !error && (
          <EnquiryInbox enquiries={enquiries} viewerRole={viewerRole} />
        )}

        {!loading && !artworkId && !error && hasMore && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-neumorph px-10 disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function MessagesFallback() {
  return (
    <>
      <MobileTopBar title="Messages" onMenuOpen={() => {}} />
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Messages</h1>
      </header>
      <div className="flex justify-center py-16 mt-20 lg:mt-0">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A3F6C] border-t-transparent" />
      </div>
    </>
  );
}
