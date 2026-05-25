"use client";

import React from "react";
import Link from "next/link";
import { ForumPostEditor } from "@/components/admin/ForumPostEditor";
import { ArrowLeft } from "lucide-react";

export default function NewForumPostPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/forum"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#1A3F6C] hover:underline self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            Compose Editorial Article
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Publish announcements, developer updates, and spotlights directly to community feeds
          </p>
        </div>
      </div>

      {/* Editor workspace */}
      <ForumPostEditor />
    </div>
  );
}
