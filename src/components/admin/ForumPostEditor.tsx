"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pin, Eye, Calendar, Upload, FileText } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { uploadImage, resolveStorageUrl } from "@/lib/storage-service";
import {
  archiveForumPost,
  createForumPost,
  updateForumPost,
  type CreateForumPostInput,
  type ForumPost,
} from "@/lib/forum-service";

interface EditorProps {
  postId?: string;
  initialData?: Partial<ForumPost> & {
    scheduleDate?: string;
    pinned?: boolean;
    imageUrl?: string;
  };
}

type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";

function toEditorStatus(status?: string): PostStatus {
  const normalized = (status || "draft").toUpperCase();
  if (normalized === "SCHEDULED" || normalized === "PUBLISHED") return normalized;
  return "DRAFT";
}

function toApiStatus(status: PostStatus): CreateForumPostInput["status"] {
  return status.toLowerCase() as CreateForumPostInput["status"];
}

function formatScheduleDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ForumPostEditor({ postId, initialData }: EditorProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // Form parameters
  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [tags, setTags] = useState(
    Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : ""
  );
  const [status, setStatus] = useState<PostStatus>(toEditorStatus(initialData?.status));
  const [scheduleDate, setScheduleDate] = useState(
    formatScheduleDate(initialData?.scheduleDate || initialData?.scheduledAt)
  );
  const [pinned, setPinned] = useState(initialData?.pinned ?? initialData?.isPinned ?? false);
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialData?.coverImage || initialData?.imageUrl || ""
  );
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const storedUrl = initialData?.coverImage || initialData?.imageUrl;

    if (!storedUrl) {
      setCoverImagePreview("");
      return;
    }

    setCoverImageUrl(storedUrl);
    void resolveStorageUrl(storedUrl).then((url) => {
      if (!cancelled) setCoverImagePreview(url);
    });

    return () => {
      cancelled = true;
    };
  }, [initialData?.coverImage, initialData?.imageUrl]);

  // Live Simulator interactive states matching mobile client
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(25);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<{ author: string; text: string }[]>([
    {
      author: "Ricardo Nabholz",
      text: "I am excited to own this new work from Veronica Ceci's brilliant Keeping House Series",
    }
  ]);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentsList((prev) => [
      ...prev,
      { author: "You", text: commentText.trim() },
    ]);
    setCommentText("");
  };

  const handleLikeToggle = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const revokePreviewIfBlob = (preview: string) => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveError("Please select an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSaveError("Image is too large. Please select an image smaller than 10MB.");
      e.target.value = "";
      return;
    }

    setSaveError("");
    revokePreviewIfBlob(coverImagePreview);
    const blobUrl = URL.createObjectURL(file);
    setCoverImagePreview(blobUrl);
    setUploadingCover(true);

    const uploadResult = await uploadImage(file);
    if (!uploadResult.ok) {
      setSaveError(uploadResult.message || "Failed to upload cover image.");
      revokePreviewIfBlob(blobUrl);
      setCoverImagePreview(coverImageUrl ? await resolveStorageUrl(coverImageUrl) : "");
      setUploadingCover(false);
      e.target.value = "";
      return;
    }

    setCoverImageUrl(uploadResult.data.url);
    setCoverImagePreview(uploadResult.data.downloadUrl);
    setUploadingCover(false);
    e.target.value = "";
  };

  const handleRemoveCoverImage = () => {
    revokePreviewIfBlob(coverImagePreview);
    setCoverImageUrl("");
    setCoverImagePreview("");
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSaveError("Post title is required.");
      return;
    }
    if (excerpt.trim().length < 10) {
      setSaveError("Excerpt must be at least 10 characters.");
      return;
    }
    if (!body.trim()) {
      setSaveError("Post body is required.");
      return;
    }
    if (status === "SCHEDULED" && !scheduleDate) {
      setSaveError("Schedule date is required for scheduled posts.");
      return;
    }
    if (uploadingCover) {
      setSaveError("Please wait for the cover image upload to finish.");
      return;
    }

    setSaving(true);
    setSaveError("");

    const payload: CreateForumPostInput = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      body: body.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
      status: toApiStatus(status),
      isPinned: pinned,
      coverImage: coverImageUrl || (postId ? null : undefined),
      ...(status === "SCHEDULED" && scheduleDate
        ? { scheduledAt: new Date(scheduleDate).toISOString() }
        : {}),
    };

    const result = postId
      ? await updateForumPost(postId, payload)
      : await createForumPost(payload);

    if (result.ok) {
      router.push("/admin/forum");
      return;
    }

    setSaveError(result.message || "Failed to save post.");
    setSaving(false);
  };

  const handleArchive = async () => {
    if (!postId) return;
    if (!confirm("Are you sure you want to archive this post? It will be retracted from directories.")) {
      return;
    }

    setSaving(true);
    setSaveError("");
    const result = await archiveForumPost(postId);
    if (result.ok) {
      router.push("/admin/forum");
      return;
    }

    setSaveError(result.message || "Failed to archive post.");
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start relative">
      {/* LEFT: EDITOR FORM (3 cols or full if preview hidden) */}
      <form
        onSubmit={handleSave}
        className={`card-neumorph p-6 space-y-6 ${showPreview ? "xl:col-span-3" : "xl:col-span-5"}`}
      >
        {/* Editor Header controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#1A3F6C]/60 uppercase leading-none">
              EDITING POST
            </span>
            {postId && <StatusBadge status={status} variant="post" />}
          </div>

          <div className="flex items-center gap-2">
            {/* Pin toggle */}
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              className={`btn-neumorph p-2 flex items-center gap-1 text-xs border-radius-0 ${
                pinned ? "bg-[#1A3F6C]/10 nav-item-active" : ""
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${pinned ? "fill-[#1A3F6C]" : ""}`} />
              <span>{pinned ? "Pinned" : "Pin Post"}</span>
            </button>

            {/* Preview toggle */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`btn-neumorph p-2 flex items-center gap-1.5 text-xs ${
                showPreview ? "bg-[#1A3F6C]/10 nav-item-active" : ""
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showPreview ? "Hide Preview" : "Split Preview"}</span>
            </button>
          </div>
        </div>

        {/* Large Prominent Title Input */}
        <div>
          <label className="field-label">Article Headline</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introducing ARTS-1: Art on Stellar..."
            className="input-neumorph w-full text-lg font-black uppercase tracking-wider py-3 border-b-2"
            required
          />
        </div>

        {/* Excerpt with Character Counter */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="field-label mb-0">Post Excerpt / Brief Summary</label>
            <span className="text-[9px] font-bold text-[#1A3F6C]/60">{excerpt.length}/280 Chars</span>
          </div>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, 280))}
            placeholder="Provide a compelling preview snippet for drop cards and feeds (max 280 characters)..."
            rows={2}
            className="input-neumorph w-full text-xs font-bold uppercase tracking-wider"
          />
        </div>

        {/* Cover image upload box */}
        <div>
          <label className="field-label">Header Cover Image</label>
          <input
            type="file"
            ref={coverImageInputRef}
            onChange={handleCoverImageChange}
            accept="image/*"
            className="hidden"
          />
          <div className="bg-white p-4 border border-dashed border-[#1A3F6C]/20 flex flex-col items-center justify-center gap-3 relative">
            {coverImagePreview ? (
              <div className="relative w-full h-36 bg-slate-100 overflow-hidden border border-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImagePreview}
                  alt="Header preview"
                  className="w-full h-full object-cover"
                />
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">
                      Uploading...
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveCoverImage}
                  disabled={uploadingCover}
                  className="absolute top-2 right-2 px-2 py-1 bg-black text-white text-[9px] font-black uppercase tracking-wider hover:bg-black/80 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-[#1A3F6C] opacity-75" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recommended sizes: 1200x630px JPG/PNG</span>
                <button
                  type="button"
                  onClick={() => coverImageInputRef.current?.click()}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-[#1A3F6C] hover:bg-[#1A3F6C]/90 active:scale-[0.97] transition-all border border-black shadow-[3px_3px_0px_rgba(0,0,0,0.15)]"
                >
                  Select Cover Media
                </button>
              </>
            )}
          </div>
        </div>

        {/* Body Textarea with Markdown instructions */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="field-label mb-0">Article Body Content</label>
            <span className="text-[8px] font-bold text-[#1A3F6C]/60 uppercase tracking-widest">
              Supports standard Markdown formatting
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="input-neumorph w-full text-sm font-mono font-medium leading-relaxed"
            placeholder="# Write your article body here in Markdown..."
          />
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
          {/* Tags */}
          <div>
            <label className="field-label">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="stellar, drops, metadata"
              className="input-neumorph w-full text-xs font-bold"
            />
          </div>

          {/* Status workflows */}
          <div>
            <label className="field-label">Publication Workflow State</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
            >
              <option value="DRAFT">DRAFT — Saved to pipeline</option>
              <option value="SCHEDULED">SCHEDULED — Wait for timeline</option>
              <option value="PUBLISHED">PUBLISHED — Release immediately</option>
            </select>
          </div>

          {/* Schedule Picker */}
          <div>
            <label className="field-label flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Schedule Release Date
            </label>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              disabled={status !== "SCHEDULED"}
              className="input-neumorph w-full text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Action button rows */}
        {saveError && (
          <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{saveError}</p>
        )}

        <div className="border-t border-black/10 pt-6 mt-6 flex justify-between gap-4 flex-wrap">
          {postId && (
            <button
              type="button"
              onClick={handleArchive}
              className="btn-neumorph py-2.5 px-4 text-xs font-black uppercase text-red-700 hover:bg-red-50 border border-red-200"
            >
              Archive Retract
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => router.push("/admin/forum")}
              className="btn-neumorph py-2.5 px-4 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingCover}
              className="btn-neumorph py-2.5 px-6 text-xs font-black uppercase tracking-widest text-[#f5f0ec] bg-[#1A3F6C] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Publication"}
            </button>
          </div>
        </div>
      </form>

      {/* RIGHT: LIVE PREVIEW DRAWER (2 cols) */}
      {showPreview && (
        <div
          className="xl:col-span-2 card-neumorph p-6 space-y-6 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto"
          style={{
            borderLeft: "2px solid #1A3F6C",
          }}
        >
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <span className="text-sm font-black text-[#1A3F6C] uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Public Simulator Panel
            </span>
            <button
              onClick={() => setShowPreview(false)}
              className="text-xs font-bold text-[#1A3F6C] hover:underline"
            >
              Close Simulator
            </button>
          </div>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-black/5 pb-2">
            Mobile Client Feed Preview
          </p>

          {/* Interactive Mobile Post Card Replication */}
          <article className="card-neumorph p-5 text-left bg-white border border-black/5">
            {/* Author row */}
            <div className="mb-3 flex items-center gap-3">
              {/* Neftwerk Avatar Badge */}
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#1A3F6C] flex-shrink-0 border-2 border-[#38A8AB]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 20V4h4l8 12V4h4v16h-4L8 8v12H4z" fill="white" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold text-[#1A3F6C]">Neftwerk News</h3>
                <p className="mt-0.5 text-xs text-slate-400">Just now</p>
              </div>
            </div>

            {/* Post text / headline & content */}
            <div className="mb-3">
              {title && (
                <h4 className="text-[15px] font-black text-[#1A3F6C] leading-snug tracking-wide uppercase mb-1">
                  {title}
                </h4>
              )}
              {excerpt && (
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 leading-relaxed">
                  {excerpt}
                </p>
              )}
              <p className="text-sm leading-6 text-[#11181c] whitespace-pre-wrap font-medium">
                {body || "Start writing inside the body editor..."}
              </p>
            </div>

            {/* Tags preview as inline hashtags */}
            {tags && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags
                  .split(",")
                  .filter(Boolean)
                  .map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs font-extrabold text-[#38A8AB] hover:underline cursor-pointer"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
              </div>
            )}

            {/* Main cover image with robust widescreen container layout */}
            {coverImagePreview ? (
              <div className="mb-3 w-full bg-slate-100 border border-black/5 overflow-hidden relative aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImagePreview}
                  alt="Post Cover Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="mb-3 w-full h-32 bg-slate-50 flex flex-col items-center justify-center border border-dashed border-black/10 p-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  No Cover Media Selected
                </span>
              </div>
            )}

            {/* Actions row — heart + comment on left, Likes count on right */}
            <div className="flex items-center justify-between border-t border-black/5 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLikeToggle}
                  className="inline-flex h-9 w-9 items-center justify-center text-slate-900 transition hover:bg-slate-100/10 active:scale-95"
                  aria-label="Like"
                >
                  {liked ? (
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="#E11D48" aria-hidden="true">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke="#1A3F6C"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowComments(!showComments)}
                  className="inline-flex h-9 w-9 items-center justify-center text-slate-900 transition hover:bg-slate-100/10 active:scale-95"
                  aria-label="Comment"
                >
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                      stroke="#1A3F6C"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <span className="text-sm font-bold text-[#38A8AB]">{likesCount} Likes</span>
            </div>

            {/* Comments Toggle Link */}
            <div className="flex flex-col items-start mt-2">
              <button
                type="button"
                onClick={() => setShowComments(!showComments)}
                className="text-[10px] font-bold text-slate-400 hover:underline uppercase tracking-wider"
              >
                {showComments ? "Hide Comments" : `View all ${commentsList.length} comments`}
              </button>
            </div>

            {/* Comments Section */}
            {showComments ? (
              <div className="mt-4 pt-4 border-t border-black/5 space-y-3">
                <div className="space-y-2">
                  {commentsList.map((c, idx) => (
                    <div key={idx} className="p-3 bg-[#f5f0ec]/45 border border-black/5 card-neumorph text-xs">
                      <span className="font-extrabold text-[#11181c] block text-[10px] uppercase tracking-wider mb-1">
                        {c.author}
                      </span>
                      <p className="text-slate-700 leading-relaxed font-medium">{c.text}</p>
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
                    className="flex-1 input-neumorph py-1.5 px-3 focus:ring-1 focus:ring-[#1A3F6C]/10 bg-slate-50 text-[11px]"
                  />
                  <button
                    type="submit"
                    className="btn-neumorph px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#1A3F6C] shrink-0 border border-black"
                  >
                    Post
                  </button>
                </form>
              </div>
            ) : (
              /* Top comment preview */
              commentsList.length > 0 && (
                <p className="mt-2 text-xs leading-5 text-slate-600 font-medium">
                  <span className="font-bold text-[#11181c] mr-1">{commentsList[0].author}</span>
                  {commentsList[0].text}
                </p>
              )
            )}
          </article>
        </div>
      )}
    </div>
  );
}
