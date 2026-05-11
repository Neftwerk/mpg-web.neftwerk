"use client";
import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { forumPosts } from "@/lib/content";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { useState } from "react";
export default function ForumPage() {
   const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <>
      <MobileTopBar title="Forum" onMenuOpen={() => setMenuOpen(true)} />
      <div className="grid forum-feed mt-20 lg:mt-0">
        {forumPosts.map((post) => (
          <ForumPostCard key={post.id} post={post} />
        ))}
      </div>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

    </>
  );
}
