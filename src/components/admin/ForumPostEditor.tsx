"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin, Eye, Calendar, Upload, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface EditorProps {
  postId?: string;
  initialData?: any;
}

export function ForumPostEditor({ postId, initialData }: EditorProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  // Form parameters
  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [body, setBody] = useState(
    initialData?.body ||
      "### Understanding the Protocol\n\nStellar anchors provide critical off-ramps..."
  );
  const [tags, setTags] = useState(initialData?.tags || "stellar, arts-1, zk-proofs");
  const [status, setStatus] = useState<"DRAFT" | "SCHEDULED" | "PUBLISHED">(initialData?.status || "DRAFT");
  const [scheduleDate, setScheduleDate] = useState(initialData?.scheduleDate || "");
  const [pinned, setPinned] = useState(initialData?.pinned || false);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Post title is required!");
      return;
    }
    alert(`Post ${postId ? "updated" : "created"} successfully under state ${status}!`);
    router.push("/forum");
  };

  const handleArchive = () => {
    if (confirm("Are you sure you want to archive this post? It will be retracted from directories.")) {
      alert("Post archived successfully.");
      router.push("/forum");
    }
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
          <div className="card-neumorph p-4 border border-dashed border-[#1A3F6C]/20 flex flex-col items-center justify-center gap-2">
            <Upload className="w-6 h-6 text-[#1A3F6C] opacity-75" />
            <span className="text-[10px] font-bold">Recommended sizes: 1200x630px JPG/PNG</span>
            <button type="button" className="btn-neumorph text-[10px] font-black py-1 px-3 mt-1">
              Select Cover Media
            </button>
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
              onClick={() => router.push("/forum")}
              className="btn-neumorph py-2.5 px-4 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-neumorph py-2.5 px-6 text-xs font-black uppercase tracking-widest text-[#f5f0ec] bg-[#1A3F6C]"
            >
              Save Publication
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

          {/* Simulated Article Layout */}
          <article className="space-y-4 text-left">
            {/* Header image banner block */}
            <div className="w-full aspect-[2/1] bg-black/5 flex items-center justify-center text-slate-400 border border-black/5">
              <span className="text-[10px] font-bold uppercase tracking-widest">
                [ Header Image Banner Placement ]
              </span>
            </div>

            {/* Metadata info */}
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#1A3F6C]/60">
              <span>By Adaeze Nwosu</span>
              <span>•</span>
              <span>{new Date().toISOString().split("T")[0]}</span>
            </div>

            {/* Simulated Title */}
            <h1 className="text-xl font-extrabold text-[#11181c] leading-tight uppercase tracking-wider">
              {title || "Enter article headline..."}
            </h1>

            {/* Tags preview */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags
                .split(",")
                .filter(Boolean)
                .map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[9px] font-extrabold bg-[#1A3F6C]/10 text-[#1A3F6C] px-2 py-0.5"
                  >
                    #{tag.trim()}
                  </span>
                ))}
            </div>

            {/* Excerpt panel */}
            {excerpt && (
              <div
                className="card-neumorph-inset p-3 bg-black/[0.01] italic border border-black/5"
                style={{
                  boxShadow: "inset 2px 2px 5px rgba(229,222,217,0.7), inset -2px -2px 5px rgba(255,255,255,1)",
                }}
              >
                <p className="text-xs font-bold text-[#11181c]/70 leading-relaxed">
                  &ldquo;{excerpt}&rdquo;
                </p>
              </div>
            )}

            {/* Body contents rendered (simplified viewer) */}
            <div className="text-xs text-[#11181c] leading-relaxed font-medium space-y-3 whitespace-pre-wrap border-t border-black/5 pt-4">
              {body || "Start writing inside the body editor..."}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
