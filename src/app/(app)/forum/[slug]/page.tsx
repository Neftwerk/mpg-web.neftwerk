"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import { useUser } from "@/lib/UserContext";
import {
  getForumPostBySlug,
  getPostComments,
  addComment,
  editComment,
  deleteComment,
  reactToPost,
  reactToComment,
  reportComment,
  FORUM_PUBLISHER_NAME,
  type ForumPost,
  type ForumComment,
} from "@/lib/forum-service";
import { isPresignedMediaUrl, resolveProfilePictureUrl } from "@/lib/storage-service";

// ─── Helpers ───

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NeftwerkPostAvatar() {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#1A3F6C] border-2 border-[#38A8AB]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 20V4h4l8 12V4h4v16h-4L8 8v12H4z" fill="white" />
      </svg>
    </div>
  );
}

function CommentAvatar({
  profilePicture,
  fullName,
}: {
  profilePicture?: string;
  fullName: string;
}) {
  const [src, setSrc] = useState<string | null>(
    profilePicture && isPresignedMediaUrl(profilePicture) ? profilePicture : null,
  );

  useEffect(() => {
    let cancelled = false;

    if (!profilePicture) {
      setSrc(null);
      return;
    }

    if (isPresignedMediaUrl(profilePicture)) {
      setSrc(profilePicture);
      return;
    }

    void resolveProfilePictureUrl(profilePicture).then((url) => {
      if (!cancelled && url) setSrc(url);
    });

    return () => {
      cancelled = true;
    };
  }, [profilePicture]);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-6 w-6 rounded-full object-cover" />
    );
  }

  return (
    <div className="h-6 w-6 rounded-full bg-[#1A3F6C] grid place-items-center">
      <span className="text-[9px] text-white font-bold">
        {(fullName || "?")[0].toUpperCase()}
      </span>
    </div>
  );
}

// ─── Comment Component ───

function CommentItem({
  comment,
  userId,
  onReply,
  onRefresh,
  threadMode,
}: {
  comment: ForumComment;
  userId?: string;
  onReply?: (parentId: string) => void;
  onRefresh: () => void;
  threadMode: "flat" | "threaded";
}) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [saving, setSaving] = useState(false);
  const [liked, setLiked] = useState(comment.userReaction === "like");
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);

  const isOwner = userId && comment.author?._id === userId;

  const handleEdit = async () => {
    if (!editBody.trim()) return;
    setSaving(true);
    const res = await editComment(comment._id, editBody.trim());
    if (res.ok) {
      setEditing(false);
      onRefresh();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    await deleteComment(comment._id);
    onRefresh();
  };

  const handleLike = async () => {
    if (!userId) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    const res = await reactToComment(comment._id, "like");
    if (res.ok) {
      const data = (res.data as any)?.data || res.data;
      setLikeCount(data.likeCount ?? likeCount);
      setLiked(data.userReaction === "like");
    } else {
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    await reportComment(comment._id, reportReason.trim());
    setReportSent(true);
    setShowReport(false);
    setReportReason("");
  };

  return (
    <div
      className="p-3 bg-[#f5f0ec]/45 border border-black/5 card-neumorph"
      style={{ marginLeft: threadMode === "threaded" ? `${Math.min(comment.depth * 16, 48)}px` : 0 }}
    >
      {/* Author */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <CommentAvatar
            profilePicture={comment.author?.profilePicture}
            fullName={comment.author?.fullName || "Anonymous"}
          />
          <span className="font-extrabold text-[#11181c] text-[11px] uppercase tracking-wider">
            {comment.author?.fullName || "Anonymous"}
          </span>
          <span className="text-[10px] text-slate-400">
            {formatTimeAgo(comment.createdAt)}
          </span>
          {comment.isEdited && (
            <span className="text-[9px] text-slate-400 italic">(edited)</span>
          )}
        </div>
      </div>

      {/* Body */}
      {editing ? (
        <div className="mt-1">
          <textarea
            className="w-full border border-slate-300 bg-white px-2 py-2 text-xs outline-none resize-none focus:border-[#4D91A7]"
            rows={2}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
          />
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={handleEdit}
              disabled={saving}
              className="text-[10px] font-bold text-[#1A3F6C] uppercase tracking-wider hover:underline disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditBody(comment.body);
              }}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-700 leading-relaxed">{comment.body}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={handleLike}
          disabled={!userId}
          className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-[#E11D48] transition disabled:opacity-40"
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill={liked ? "#E11D48" : "none"}
            stroke={liked ? "#E11D48" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {likeCount > 0 && likeCount}
        </button>

        {threadMode === "threaded" && userId && onReply && (
          <button
            type="button"
            onClick={() => onReply(comment._id)}
            className="text-[10px] font-bold text-[#1A3F6C] uppercase tracking-wider hover:underline"
          >
            Reply
          </button>
        )}

        {isOwner && !editing && (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="text-[10px] font-bold text-red-400 uppercase tracking-wider hover:underline"
            >
              Delete
            </button>
          </>
        )}

        {userId && !isOwner && !reportSent && (
          <button
            type="button"
            onClick={() => setShowReport(!showReport)}
            className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:underline"
          >
            Report
          </button>
        )}
        {reportSent && (
          <span className="text-[10px] text-green-500 font-bold">Reported ✓</span>
        )}
      </div>

      {/* Report form */}
      {showReport && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="Reason for reporting..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="flex-1 text-xs border border-slate-300 px-2 py-1.5 outline-none focus:border-[#4D91A7]"
          />
          <button
            type="button"
            onClick={handleReport}
            className="text-[10px] font-bold text-[#1A3F6C] uppercase px-3 py-1.5 border border-[#1A3F6C]/20 hover:bg-[#1A3F6C]/5"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───

export default function ForumPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Post reactions
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reacting, setReacting] = useState(false);

  // Comments
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [threadMode, setThreadMode] = useState<"flat" | "threaded">("flat");

  // New comment form
  const [commentBody, setCommentBody] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch Post ───
  useEffect(() => {
    if (!slug) return;

    (async () => {
      setLoading(true);
      const res = await getForumPostBySlug(slug);
      if (res.ok && res.data?.post) {
        const p = res.data.post;
        setPost(p);
        setLiked(p.userReaction === "like");
        setLikeCount(p.likeCount ?? 0);
        setError("");
      } else {
        setError(res.message || "Post not found.");
      }
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    setLiked(post.userReaction === "like");
    setLikeCount(post.likeCount);
  }, [post?._id, post?.userReaction, post?.likeCount]);

  // ─── Fetch Comments ───
  const fetchComments = useCallback(
    async (pageNum = 1, append = false) => {
      if (!post?._id) return;
      setLoadingComments(true);

      const res = await getPostComments(post._id, {
        page: pageNum,
        limit: 20,
        flat: true,
      });

      if (res.ok && res.data) {
        const fetched = res.data.comments || [];
        const pagination = res.data.pagination;
        const mode = res.data.commentThreadMode || "flat";

        if (append) {
          setComments((prev) => [...prev, ...fetched]);
        } else {
          setComments(fetched);
        }
        setHasMoreComments(pagination?.hasNextPage ?? false);
        setThreadMode(mode);
      }
      setLoadingComments(false);
    },
    [post?._id]
  );

  useEffect(() => {
    if (post?._id) {
      fetchComments(1, false);
    }
  }, [post?._id, fetchComments]);

  // ─── Actions ───

  const handleLike = async () => {
    if (!user || !post || reacting) return;
    setReacting(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    const res = await reactToPost(post._id, "like");
    if (res.ok && res.data) {
      setLikeCount(res.data.likeCount);
      setLiked(res.data.userReaction === "like");
      setPost((current) =>
        current
          ? {
              ...current,
              likeCount: res.data!.likeCount,
              userReaction: res.data!.userReaction,
            }
          : current,
      );
    } else {
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
    setReacting(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !post || submitting) return;
    setSubmitting(true);

    const res = await addComment(post._id, commentBody.trim(), replyToId || undefined);
    if (res.ok) {
      setCommentBody("");
      setReplyToId(null);
      await fetchComments(1, false);
    }
    setSubmitting(false);
  };

  const loadMoreComments = () => {
    const next = commentPage + 1;
    setCommentPage(next);
    fetchComments(next, true);
  };

  // ─── Render ───

  if (loading) {
    return (
      <>
        <MobileTopBar title="Forum" onMenuOpen={() => setMenuOpen(true)} />
        <div className="px-4 pb-28 mt-20 lg:mt-0">
          <div className="card-neumorph animate-pulse mt-4">
            <div className="h-6 w-3/4 bg-[#e0ddd8] rounded mb-3" />
            <div className="h-4 w-1/3 bg-[#e0ddd8] rounded mb-4" />
            <div className="h-48 w-full bg-[#e0ddd8] mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-[#e0ddd8] rounded" />
              <div className="h-3 w-full bg-[#e0ddd8] rounded" />
              <div className="h-3 w-2/3 bg-[#e0ddd8] rounded" />
            </div>
          </div>
        </div>
        <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <MobileTopBar title="Forum" onMenuOpen={() => setMenuOpen(true)} />
        <div className="px-4 pb-28 mt-20 lg:mt-0">
          <div className="card-neumorph text-center py-12 mt-4">
            <p className="text-sm text-red-500 mb-3">{error || "Post not found"}</p>
            <Link href="/forum" className="btn-neumorph px-6 inline-block">
              Open Forum
            </Link>
          </div>
        </div>
        <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </>
    );
  }

  return (
    <>
      <MobileTopBar title="Forum" onMenuOpen={() => setMenuOpen(true)} />

      <div className="px-4 pb-28 mt-20 lg:mt-0 max-w-2xl mx-auto">
        {/* Post */}
        <article className="card-neumorph mb-6 mt-4">
          {/* Author & Date */}
          <div className="flex items-center gap-3 mb-4">
            <NeftwerkPostAvatar />
            <div>
              <p className="text-[15px] font-bold text-[#1A3F6C]">{FORUM_PUBLISHER_NAME}</p>
              <p className="text-xs text-slate-400">
                {formatDate(post.publishedAt || post.createdAt)}
              </p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-[#1A3F6C] mb-3 leading-snug">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#38A8AB] bg-[#38A8AB]/10 border border-[#38A8AB]/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Cover image */}
          {post.coverImage && (
            <NeftwerkImage
              className="mb-4 w-full bg-slate-100 object-cover max-h-[400px]"
              src={post.coverImage}
              alt={post.title}
            />
          )}

          {/* Body */}
          <div
            className="prose prose-sm max-w-none text-[#11181c] leading-7 mb-5"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* Stats & Like */}
          <div className="flex items-center justify-between border-t border-black/5 pt-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleLike}
                disabled={!user || reacting}
                className="inline-flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                aria-label={liked ? "Unlike" : "Like"}
                aria-pressed={liked}
                title={user ? (liked ? "Unlike this post" : "Like this post") : "Sign in to like"}
              >
                {liked ? (
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="#E11D48" aria-hidden>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg
                    width={22}
                    height={22}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1A3F6C"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
                <span
                  className={`text-[13px] font-bold ${liked ? "text-[#E11D48]" : "text-[#38A8AB]"}`}
                >
                  {likeCount}
                </span>
              </button>

              <span className="text-[12px] text-slate-400 flex items-center gap-1">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                {post.commentCount} comments
              </span>

              <span className="text-[12px] text-slate-400 flex items-center gap-1">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {post.viewCount} views
              </span>
            </div>
          </div>
        </article>

        {/* ─── Comments Section ─── */}
        {post.commentsEnabled && (
          <section className="mb-8">
            <h3 className="text-[15px] font-bold text-[#1A3F6C] mb-4">
              Comments ({post.commentCount})
            </h3>

            {/* New comment form */}
            {user ? (
              <form onSubmit={handleComment} className="mb-5">
                {replyToId && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                    <span>Replying to a comment</span>
                    <button
                      type="button"
                      onClick={() => setReplyToId(null)}
                      className="text-red-400 font-bold hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    className="flex-1 input-neumorph text-xs py-2.5 px-3 focus:ring-1 focus:ring-[#1A3F6C]/10"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentBody.trim()}
                    className="btn-neumorph px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[#1A3F6C] shrink-0 disabled:opacity-50"
                  >
                    {submitting ? "..." : "Post"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="card-neumorph text-center py-4 mb-5">
                <p className="text-xs text-slate-500">
                  <Link href="/login" className="text-[#1A3F6C] font-bold hover:underline">
                    Sign in
                  </Link>{" "}
                  to leave a comment.
                </p>
              </div>
            )}

            {/* Comments list */}
            {loadingComments && comments.length === 0 ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="card-neumorph animate-pulse p-3">
                    <div className="h-3 w-24 bg-[#e0ddd8] rounded mb-2" />
                    <div className="h-3 w-full bg-[#e0ddd8] rounded" />
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              <div className="space-y-2">
                {comments.map((c) => (
                  <CommentItem
                    key={c._id}
                    comment={c}
                    userId={user?.id}
                    onReply={(parentId) => {
                      setReplyToId(parentId);
                      document.querySelector<HTMLInputElement>("input[placeholder='Write a comment...']")?.focus();
                    }}
                    onRefresh={() => fetchComments(1, false)}
                    threadMode={threadMode}
                  />
                ))}
              </div>
            )}

            {/* Load more comments */}
            {hasMoreComments && (
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={loadMoreComments}
                  className="text-xs font-bold text-[#1A3F6C] hover:underline uppercase tracking-wider"
                >
                  Load more comments
                </button>
              </div>
            )}
          </section>
        )}

        {!post.commentsEnabled && (
          <p className="text-xs text-slate-400 text-center py-4 card-neumorph">
            Comments are disabled for this post.
          </p>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
