"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ForumPost } from "@/lib/forum-service";
import { reactToPost } from "@/lib/forum-service";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import { useUser } from "@/lib/UserContext";

// ─── Icons ───

function HeartOutlineIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="#1A3F6C"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartFilledIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="#E11D48" aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function ChatOutlineIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="#1A3F6C"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  );
}

/* Neftwerk News logo — teal circle outline with stylised "N" icon */
function NeftwerkAvatar({ profilePicture }: { profilePicture?: string }) {
  if (profilePicture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profilePicture}
        alt="Author"
        className="h-11 w-11 rounded-full object-cover flex-shrink-0 border-2 border-[#38A8AB]"
      />
    );
  }
  return (
    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#1A3F6C] flex-shrink-0 border-2 border-[#38A8AB]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 20V4h4l8 12V4h4v16h-4L8 8v12H4z" fill="white" />
      </svg>
    </div>
  );
}

// ─── Helpers ───

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

// ─── Component ───

type Props = { post: ForumPost; priority?: boolean };

export function ForumPostCard({ post, priority = false }: Props) {
  const { user } = useUser();
  const [liked, setLiked] = useState(post.userReaction === "like");
  const [likesCount, setLikesCount] = useState(post.likeCount);
  const [reacting, setReacting] = useState(false);

  const handleLikeToggle = async () => {
    if (!user) return; // must be signed in
    if (reacting) return;
    setReacting(true);

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    const result = await reactToPost(post._id, "like");
    if (result.ok) {
      // Use server values
      const data = (result.data as any)?.data || result.data;
      setLikesCount(data.likeCount ?? likesCount);
      setLiked(data.userReaction === "like");
    } else {
      // Revert on error
      setLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
    setReacting(false);
  };

  const authorName = post.author?.fullName || "Neftwerk News";
  const authorPic = post.author?.profilePicture;

  return (
    <article className="card-neumorph mb-4">
      {/* Author row */}
      <div className="mb-3 flex items-center gap-3">
        <NeftwerkAvatar profilePicture={authorPic} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-[#1A3F6C]">{authorName}</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {formatTimeAgo(post.publishedAt || post.createdAt)}
          </p>
        </div>
      </div>

      {/* Title */}
      <Link href={`/forum/${post.slug}`} className="block">
        <h2 className="text-[16px] font-bold text-[#1A3F6C] mb-2 hover:underline leading-snug">
          {post.title}
        </h2>
      </Link>

      {/* Post excerpt */}
      <p className="mb-3 text-sm leading-6 text-[#11181c] line-clamp-3">
        {post.excerpt || post.body}
      </p>

      {/* Cover image */}
      {post.coverImage && (
        <Link href={`/forum/${post.slug}`} className="block">
          <NeftwerkImage
            className="mb-3 w-full bg-slate-100 object-cover max-h-[300px]"
            src={post.coverImage}
            alt={post.title}
            priority={priority}
          />
        </Link>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
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

      {/* Actions row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Like */}
          <button
            type="button"
            onClick={handleLikeToggle}
            disabled={!user || reacting}
            className="inline-flex items-center gap-1.5 text-slate-900 transition hover:bg-slate-100/10 active:scale-95 disabled:opacity-50"
            aria-label="Like"
            title={user ? "Like this post" : "Sign in to like"}
          >
            {liked ? <HeartFilledIcon /> : <HeartOutlineIcon />}
            <span className="text-[13px] font-bold text-[#38A8AB]">{likesCount}</span>
          </button>

          {/* Comments */}
          <Link
            href={`/forum/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-slate-900 transition hover:bg-slate-100/10"
          >
            <ChatOutlineIcon />
            <span className="text-[13px] font-medium text-slate-500">{post.commentCount}</span>
          </Link>

          {/* Views */}
          <div className="inline-flex items-center gap-1">
            <EyeIcon />
            <span className="text-[12px] text-slate-400">{post.viewCount}</span>
          </div>
        </div>

        {/* Read more link */}
        <Link
          href={`/forum/${post.slug}`}
          className="text-xs font-bold text-[#1A3F6C] hover:underline uppercase tracking-wider"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}
