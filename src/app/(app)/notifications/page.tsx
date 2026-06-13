"use client";

import { useState, useEffect, useCallback } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { NotificationSkeleton } from "@/components/Skeletons";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  type Notification,
} from "@/lib/notification-service";

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  );
}

function NotificationsContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (pageNum = 1, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await getNotifications({ page: pageNum, limit: 20 });
      if (res.ok) {
        const data = (res.data as any)?.data || res.data;
        const fetched: Notification[] = data?.notifications || [];
        const pagination = data?.pagination;

        if (append) {
          setNotifications((prev) => [...prev, ...fetched]);
        } else {
          setNotifications(fetched);
        }
        setUnreadCount(data?.unreadCount ?? 0);
        setHasMore(pagination?.hasNextPage ?? false);
        setError("");
      } else {
        if (!append) setError(res.message || "Failed to load notifications.");
      }

      setLoading(false);
      setLoadingMore(false);
    },
    []
  );

  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setActionLoading(id);
    const res = await markNotificationAsRead(id);
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setActionLoading(null);
  };

  const handleMarkAllRead = async () => {
    setActionLoading("all-read");
    const res = await markAllNotificationsAsRead();
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const res = await deleteNotification(id);
    if (res.ok) {
      const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setActionLoading(null);
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete all notifications? This cannot be undone.")) return;
    setActionLoading("all-delete");
    const res = await deleteAllNotifications();
    if (res.ok) {
      setNotifications([]);
      setUnreadCount(0);
    }
    setActionLoading(null);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNotifications(next, true);
  };

  // Format timestamp
  function timeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <>
      <MobileTopBar title="Notifications" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
      </header>

      <div className="px-4 pb-28 mt-20 lg:mt-0 max-w-lg mx-auto">
        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between mt-4 mb-4">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={actionLoading === "all-read"}
                className="text-xs font-bold text-[#1A3F6C] uppercase tracking-wider hover:underline disabled:opacity-50"
              >
                {actionLoading === "all-read" ? "Marking..." : `Mark all as read (${unreadCount})`}
              </button>
            )}
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={actionLoading === "all-delete"}
              className="text-xs font-bold text-red-400 uppercase tracking-wider hover:underline disabled:opacity-50 ml-auto"
            >
              {actionLoading === "all-delete" ? "Deleting..." : "Clear all"}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-4">
            <NotificationSkeleton count={4} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="card-neumorph text-center py-10 mt-4">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button
              type="button"
              onClick={() => fetchNotifications(1)}
              className="btn-neumorph px-6"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <div className="card-neumorph text-center py-12 mt-4">
            <svg className="mx-auto mb-3 text-slate-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="text-[15px] font-semibold text-[#1A3F6C] mb-1">
              All caught up!
            </p>
            <p className="text-xs text-slate-400">
              No notifications yet. They will appear here when you get one.
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-2 mt-4">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`card-neumorph p-4 flex items-start gap-3 transition ${
                  !n.isRead ? "border-l-4 border-l-[#38A8AB] bg-[#38A8AB]/5" : ""
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full grid place-items-center ${
                  !n.isRead ? "bg-[#38A8AB]/20" : "bg-slate-100"
                }`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={n.isRead ? "#94a3b8" : "#38A8AB"} strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.isRead ? "font-bold text-[#1A3F6C]" : "text-[#11181c]"}`}>
                    {n.title || n.message}
                  </p>
                  {n.title && n.message && n.title !== n.message && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n._id)}
                      disabled={actionLoading === n._id}
                      className="text-[9px] font-bold text-[#38A8AB] uppercase tracking-wider hover:underline disabled:opacity-50"
                    >
                      Read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(n._id)}
                    disabled={actionLoading === n._id}
                    className="text-[9px] font-bold text-slate-400 uppercase tracking-wider hover:underline hover:text-red-400 disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-neumorph px-10 disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
