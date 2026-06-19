"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ForumPostEditor } from "@/components/admin/ForumPostEditor";
import { getForumPostById, type ForumPost } from "@/lib/forum-service";
import { ArrowLeft } from "lucide-react";

export default function EditForumPostPage() {
  const params = useParams();
  const id = params?.id as string;
  const [initialData, setInitialData] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadPost = async () => {
      setLoading(true);
      setError("");

      const result = await getForumPostById(id);
      if (cancelled) return;

      if (!result.ok) {
        setError(result.message || "Failed to load post.");
        setLoading(false);
        return;
      }

      const post =
        (result.data as { data?: { post?: ForumPost } })?.data?.post ||
        (result.data as { post?: ForumPost })?.post;

      if (!post) {
        setError("Post not found.");
        setLoading(false);
        return;
      }

      setInitialData(post);
      setLoading(false);
    };

    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/forum"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#1A3F6C] hover:underline self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            Edit Editorial Post
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Modify publication settings, adjust scheduling gates, and update tag parameters
          </p>
        </div>
      </div>

      {loading && (
        <div className="card-neumorph p-8 text-center text-sm font-bold uppercase tracking-widest text-[#1A3F6C]/60">
          Loading post...
        </div>
      )}

      {!loading && error && (
        <div className="card-neumorph p-8 text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Link href="/admin/forum" className="btn-neumorph px-6 py-2 text-xs font-bold uppercase">
            Back to Forum
          </Link>
        </div>
      )}

      {!loading && !error && initialData && (
        <ForumPostEditor postId={id} initialData={initialData} />
      )}
    </div>
  );
}
