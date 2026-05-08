import type { ForumPost } from "@/lib/content";

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
  return (
    <article className="mb-4 border border-[#dbe2ea] bg-[#EEF1F6] p-4">
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="mb-3 w-full bg-slate-100 object-cover"
        src={post.imageUrl}
        alt={`Image shared by ${post.author}`}
      />

      {/* Actions row — heart + comment on left, "25 Likes" in teal on right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center text-slate-900 transition hover:bg-slate-100 rounded-full"
            aria-label="Like"
          >
            <HeartOutlineIcon />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center text-slate-900 transition hover:bg-slate-100 rounded-full"
            aria-label="Comment"
          >
            <ChatOutlineIcon />
          </button>
        </div>
        <span className="text-sm font-bold text-[#38A8AB]">{post.likes} Likes</span>
      </div>

      {/* View comments */}
      <p className="mt-1 text-sm text-slate-400">
        View all {post.commentsCount} comments
      </p>

      {/* Top comment */}
      {post.topComment ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          <span className="font-bold text-[#11181c]">{post.topComment.author}</span>
          {` ${post.topComment.text}`}
        </p>
      ) : null}
    </article>
  );
}
