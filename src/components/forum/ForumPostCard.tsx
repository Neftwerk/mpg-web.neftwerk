import React, { useState } from "react";
import type { ForumPost } from "@/lib/content";
import { NeftwerkImage } from "@/components/NeftwerkImage";

function HeartOutlineIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <svg width={24} height={24} viewBox="0 0 24 24" fill="#E11D48" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}

function ChatOutlineIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
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

/* Neftwerk News logo — teal circle outline with stylised "N" icon
   Matches the Figma design: circle with teal border, "N" inside */
function NeftwerkAvatar() {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#1A3F6C] flex-shrink-0 border-2 border-[#38A8AB]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 20V4h4l8 12V4h4v16h-4L8 8v12H4z"
          fill="white"
        />
      </svg>
    </div>
  );
}

type Props = { post: ForumPost };

export function ForumPostCard({ post }: Props) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<{ author: string; text: string }[]>(
    post.topComment ? [post.topComment] : []
  );
  const [commentText, setCommentText] = useState("");

  const handleLikeToggle = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentsList((prev) => [
      ...prev,
      { author: "You", text: commentText.trim() },
    ]);
    setCommentText("");
  };

  return (
    <article className="card-neumorph mb-4">
      {/* Author row */}
      <div className="mb-3 flex items-center gap-3">
        <NeftwerkAvatar />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-[#1A3F6C]">{post.author}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{post.timeAgo}</p>
        </div>
      </div>

      {/* Post body */}
      <p className="mb-3 text-sm leading-6 text-[#11181c]">{post.body}</p>

      {/* Post image */}
      <NeftwerkImage
        className="mb-3 w-full bg-slate-100 object-cover"
        src={post.imageUrl}
        alt={`Image shared by ${post.author}`}
      />

      {/* Actions row — heart + comment on left, "25 Likes" in teal on right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLikeToggle}
            className="inline-flex h-9 w-9 items-center justify-center text-slate-900 transition hover:bg-slate-100/10 active:scale-95"
            aria-label="Like"
          >
            {liked ? <HeartFilledIcon /> : <HeartOutlineIcon />}
          </button>
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="inline-flex h-9 w-9 items-center justify-center text-slate-900 transition hover:bg-slate-100/10 active:scale-95"
            aria-label="Comment"
          >
            <ChatOutlineIcon />
          </button>
        </div>
        <span className="text-sm font-bold text-[#38A8AB]">{likesCount} Likes</span>
      </div>

      {/* View comments toggle link */}
      <div className="flex flex-col items-start mt-2">
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="text-xs font-bold text-slate-400 hover:underline uppercase tracking-wider"
        >
          {showComments ? "Hide Comments" : `View all ${commentsList.length} comments`}
        </button>
      </div>

      {/* Top comment / Expanded Comments View */}
      {showComments ? (
        <div className="mt-4 pt-4 border-t border-black/5 space-y-3">
          {/* Comments List */}
          <div className="space-y-2">
            {commentsList.map((c, idx) => (
              <div key={idx} className="p-3 bg-[#f5f0ec]/45 border border-black/5 card-neumorph">
                <span className="font-extrabold text-[#11181c] block text-[11px] uppercase tracking-wider mb-1">
                  {c.author}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Comment input form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 input-neumorph text-xs py-2 px-3 focus:ring-1 focus:ring-[#1A3F6C]/10"
              style={{ fontSize: "12px" }}
            />
            <button
              type="submit"
              className="btn-neumorph px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1A3F6C] shrink-0"
              style={{ padding: "8px 16px" }}
            >
              Post
            </button>
          </form>
        </div>
      ) : (
        /* Render only top comment if comments are collapsed */
        commentsList.length > 0 && (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            <span className="font-bold text-[#11181c]">{commentsList[0].author}</span>
            {` ${commentsList[0].text}`}
          </p>
        )
      )}
    </article>
  );
}
