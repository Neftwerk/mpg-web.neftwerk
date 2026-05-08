import { AppShell } from "@/components/app-shell";
import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { forumPosts } from "@/lib/content";

export default function ForumPage() {
  return (
    <AppShell title="Forum">
      <div className="grid forum-feed">
        {forumPosts.map((post) => (
          <ForumPostCard key={post.id} post={post} />
        ))}
      </div>
    </AppShell>
  );
}
