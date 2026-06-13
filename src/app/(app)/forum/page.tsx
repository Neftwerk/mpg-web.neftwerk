"use client";

import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { useState, useEffect, useCallback } from "react";
import { getForumPosts, type ForumPost } from "@/lib/forum-service";

export default function ForumPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchPosts = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const result = await getForumPosts({
        page: pageNum,
        limit: 10,
        search: search || undefined,
        tags: activeTag || undefined,
        sortBy: "publishedAt",
        sortOrder: "desc",
      });

      if (result.ok) {
        const data = (result.data as any)?.data || result.data;
        const fetched: ForumPost[] = data?.posts || [];
        const pagination = data?.pagination;

        if (append) {
          setPosts((prev) => [...prev, ...fetched]);
        } else {
          setPosts(fetched);
          // Collect unique tags from the first page
          const tags = new Set<string>();
          fetched.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
          setAllTags((prev) => {
            const merged = new Set([...prev, ...tags]);
            return Array.from(merged);
          });
        }

        setHasMore(pagination?.hasNextPage ?? fetched.length >= 10);
        setError("");
      } else {
        if (!append) setError(result.message || "Failed to load posts.");
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [search, activeTag]
  );

  // Fetch on mount and when search/tag change
  useEffect(() => {
    setPage(1);
    fetchPosts(1, false);
  }, [fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(activeTag === tag ? "" : tag);
  };

  return (
    <>
      <MobileTopBar title="Forum" onMenuOpen={() => setMenuOpen(true)} />

      <div className="px-4 pb-28 mt-20 lg:mt-0">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mb-4 mt-4">
          <input
            className="w-full border border-slate-200 bg-white/60 pl-4 pr-10 py-3 text-[15px] placeholder:text-[#888] outline-none transition focus:border-[#4D91A7] focus:ring-1 focus:ring-[#4D91A7]/20 shadow-sm"
            placeholder="Search forum posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1A3F6C] transition"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* Tag filter chips */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider border transition
                  ${
                    activeTag === tag
                      ? "bg-[#1A3F6C] text-white border-[#1A3F6C]"
                      : "text-[#38A8AB] bg-[#38A8AB]/10 border-[#38A8AB]/20 hover:bg-[#38A8AB]/20"
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-neumorph animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-11 w-11 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-full bg-slate-200 rounded mb-2" />
                <div className="h-3 w-2/3 bg-slate-200 rounded mb-3" />
                <div className="h-40 w-full bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="card-neumorph text-center py-10">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button
              type="button"
              onClick={() => fetchPosts(1, false)}
              className="btn-neumorph px-6"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="card-neumorph text-center py-12">
            <svg className="mx-auto mb-3 text-slate-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <p className="text-[15px] font-semibold text-[#1A3F6C] mb-1">No posts found</p>
            <p className="text-xs text-slate-400">
              {search || activeTag
                ? "Try adjusting your search or filters."
                : "Check back later for new content."}
            </p>
          </div>
        )}

        {/* Posts feed */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid forum-feed">
            {posts.map((post) => (
              <ForumPostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && !error && hasMore && posts.length > 0 && (
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
