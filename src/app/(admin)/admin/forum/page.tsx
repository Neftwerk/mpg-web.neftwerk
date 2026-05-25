"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PlusCircle, Search, Pin, MessageSquare, Heart, AlertTriangle, Eye, CheckCircle, ShieldAlert, Ban } from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  author: string;
  date: string;
  likes: number;
  comments: number;
  reports: number;
  pinned: boolean;
}

interface CommentData {
  id: string;
  commentText: string;
  author: string;
  postTitle: string;
  date: string;
  likes: number;
  status: "PENDING" | "APPROVED" | "HIDDEN" | "DELETED";
  spamFlag: boolean;
}

const MOCK_POSTS: ForumPost[] = [
  {
    id: "post-01",
    title: "Introducing ARTS-1: Art on Stellar",
    status: "PUBLISHED",
    author: "Adaeze Nwosu (Super Admin)",
    date: "2026-05-10",
    likes: 84,
    comments: 18,
    reports: 0,
    pinned: true,
  },
  {
    id: "post-02",
    title: "How ZK Commitments Protect Collector Privacy",
    status: "PUBLISHED",
    author: "Tobias Kraft (Admin)",
    date: "2026-05-18",
    likes: 56,
    comments: 12,
    reports: 3, // Alert state
    pinned: false,
  },
  {
    id: "post-03",
    title: "Roadmap Update: Primary Sales Launch",
    status: "SCHEDULED",
    author: "Adaeze Nwosu (Super Admin)",
    date: "2026-06-01",
    likes: 0,
    comments: 0,
    reports: 0,
    pinned: false,
  },
  {
    id: "post-04",
    title: "Gallery Spotlight: Meridian Contemporary",
    status: "DRAFT",
    author: "Yemi Adeyemi (Moderator)",
    date: "2026-05-24",
    likes: 0,
    comments: 0,
    reports: 0,
    pinned: false,
  },
];

const MOCK_COMMENTS: CommentData[] = [
  {
    id: "com-301",
    commentText: "This is a massive step forward for the Stellar network's digital art ecosystem. Can't wait for drops!",
    author: "Jin Park",
    postTitle: "Introducing ARTS-1: Art on Stellar",
    date: "2026-05-11",
    likes: 12,
    status: "APPROVED",
    spamFlag: false,
  },
  {
    id: "com-302",
    commentText: "Check this website for free crypto rewards fast! http://fakecryptolink.xyz/scam",
    author: "Anon Collector 98",
    postTitle: "Introducing ARTS-1: Art on Stellar",
    date: "2026-05-12",
    likes: 0,
    status: "PENDING",
    spamFlag: true, // Marked spam
  },
  {
    id: "com-303",
    commentText: "Does the zero knowledge proof hide the actual transaction amounts or just buyer key associations?",
    author: "Sofia Reyes",
    postTitle: "How ZK Commitments Protect Collector Privacy",
    date: "2026-05-19",
    likes: 6,
    status: "PENDING",
    spamFlag: false,
  },
  {
    id: "com-304",
    commentText: "This project is garbage, completely useless code. Devs are scam artists.",
    author: "TrollMaster99",
    postTitle: "How ZK Commitments Protect Collector Privacy",
    date: "2026-05-20",
    likes: 1,
    status: "HIDDEN",
    spamFlag: false,
  },
];

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_POSTS);
  const [comments, setComments] = useState<CommentData[]>(MOCK_COMMENTS);
  const [searchTerm, setSearchTerm] = useState("");

  // Comment Actions
  const handleApproveComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "APPROVED" } : c))
    );
  };

  const handleHideComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "HIDDEN" } : c))
    );
  };

  const handleDeleteComment = (id: string) => {
    const reason = prompt("Enter deletion audit reason:");
    if (reason) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "DELETED" } : c))
      );
      alert(`Comment ${id} deleted under audit reference: ${reason}`);
    }
  };

  // Filter lists
  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComments = comments.filter((c) =>
    c.commentText.toLowerCase().includes(searchTerm.toLowerCase()) || c.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table Columns - Posts
  const postColumns: Column<ForumPost>[] = [
    {
      key: "title",
      header: "Post Title",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.pinned && <Pin className="w-3.5 h-3.5 text-[#1A3F6C] shrink-0" fill="#1A3F6C" />}
          <span className="font-extrabold text-[#11181c]">{row.title}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} variant="post" />,
    },
    {
      key: "author",
      header: "Author",
      render: (row) => <span className="font-semibold text-xs text-[#1A3F6C]">{row.author}</span>,
    },
    {
      key: "date",
      header: "Publish/Sched Date",
      render: (row) => <span className="text-xs font-bold">{row.date}</span>,
    },
    {
      key: "engagement",
      header: "Likes / Comments",
      render: (row) => (
        <div className="flex items-center gap-4 text-xs font-bold text-[#11181c]/70">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#1A3F6C]/85" /> {row.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-[#1A3F6C]/85" /> {row.comments}
          </span>
        </div>
      ),
    },
    {
      key: "reports",
      header: "Reports",
      render: (row) => (
        <span
          className={`text-xs font-black ${
            row.reports > 0 ? "text-red-700 bg-red-100 px-2 py-0.5" : "text-[#1A3F6C]/60"
          }`}
        >
          {row.reports} Reports
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Link
          href={`/admin/forum/${row.id}`}
          className="btn-neumorph px-2.5 py-1 text-xs font-bold flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Edit</span>
        </Link>
      ),
    },
  ];

  // Table Columns - Comments
  const commentColumns: Column<CommentData>[] = [
    {
      key: "commentText",
      header: "Comment Description",
      render: (row) => (
        <div className="max-w-[280px] sm:max-w-none">
          <p className="text-xs font-medium text-[#11181c] italic leading-tight truncate sm:whitespace-normal">
            &ldquo;{row.commentText}&rdquo;
          </p>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-1">
            under: {row.postTitle}
          </span>
        </div>
      ),
    },
    {
      key: "author",
      header: "Creator",
      render: (row) => <span className="font-extrabold text-xs">{row.author}</span>,
    },
    {
      key: "date",
      header: "Submitted",
      render: (row) => <span className="text-xs font-bold text-slate-500">{row.date}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`status-badge text-[9px] ${
            row.status === "APPROVED"
              ? "bg-green-100 text-green-800"
              : row.status === "HIDDEN"
              ? "bg-slate-200 text-slate-700"
              : row.status === "DELETED"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "spam",
      header: "Trust",
      render: (row) =>
        row.spamFlag ? (
          <span className="status-badge bg-rose-100 text-rose-800 border border-rose-200 text-[8px] flex items-center gap-1 py-0.5 px-1.5 self-start">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>Spam Flag</span>
          </span>
        ) : (
          <span className="text-[10px] text-emerald-700 font-extrabold uppercase">Verified</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          {row.status !== "APPROVED" && (
            <button
              onClick={() => handleApproveComment(row.id)}
              className="btn-neumorph p-1 text-emerald-800"
              title="Approve"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          {row.status !== "HIDDEN" && row.status !== "DELETED" && (
            <button
              onClick={() => handleHideComment(row.id)}
              className="btn-neumorph p-1 text-[#1A3F6C]"
              title="Hide"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          )}
          {row.status !== "DELETED" && (
            <button
              onClick={() => handleDeleteComment(row.id)}
              className="btn-neumorph p-1 text-red-700 font-bold"
              title="Audit Delete"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            Forum & Editorial Moderation
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Publish educational articles and moderate community discussions
          </p>
        </div>

        <Link
          href="/admin/forum/new"
          className="btn-neumorph py-2.5 px-4 font-bold text-sm gap-2 flex items-center self-start sm:self-auto"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-black/5 border border-black/5 self-start max-w-sm">
        <button
          onClick={() => {
            setActiveTab("posts");
            setSearchTerm("");
          }}
          className={`flex-1 py-2 px-4 text-xs font-black uppercase tracking-wider border-radius-0 transition-all ${
            activeTab === "posts" ? "bg-[#1A3F6C] text-[#f5f0ec]" : "text-[#1A3F6C] hover:bg-black/5"
          }`}
        >
          Articles & Posts
        </button>
        <button
          onClick={() => {
            setActiveTab("comments");
            setSearchTerm("");
          }}
          className={`flex-1 py-2 px-4 text-xs font-black uppercase tracking-wider border-radius-0 transition-all ${
            activeTab === "comments" ? "bg-[#1A3F6C] text-[#f5f0ec]" : "text-[#1A3F6C] hover:bg-black/5"
          }`}
        >
          Global Comments Queue
        </button>
      </div>

      {/* Search */}
      <div className="card-neumorph p-4">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#1A3F6C]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={activeTab === "posts" ? "Search posts..." : "Search comment strings..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-neumorph w-full pl-9"
          />
        </div>
      </div>

      {/* Data tables depending on tab */}
      <div className="w-full">
        {activeTab === "posts" ? (
          <DataTable columns={postColumns} data={filteredPosts} />
        ) : (
          <DataTable columns={commentColumns} data={filteredComments} />
        )}
      </div>
    </div>
  );
}
