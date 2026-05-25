"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { PlusCircle, FileText, Download, ArrowRight, Activity } from "lucide-react";

// Mock Audit Log Data (realistic)
const RECENT_ACTIVITIES = [
  {
    id: 1,
    actor: "Adaeze Nwosu",
    action: "GALLERY_ACTIVATED",
    target: "Lagos Black Box",
    time: "10 mins ago",
  },
  {
    id: 2,
    actor: "Tobias Kraft",
    action: "ARTWORK_MINTED",
    target: "Chromatic Dissolution No. 4",
    time: "45 mins ago",
  },
  {
    id: 3,
    actor: "Yemi Adeyemi",
    action: "COMMENT_REJECTED",
    target: "Post ID #401",
    time: "2 hours ago",
  },
  {
    id: 4,
    actor: "Adaeze Nwosu",
    action: "ROLE_UPDATED",
    target: "Tobias Kraft",
    time: "3 hours ago",
  },
  {
    id: 5,
    actor: "Tobias Kraft",
    action: "COLLECTION_PUBLISHED",
    target: "Bodies in Transit",
    time: "5 hours ago",
  },
  {
    id: 6,
    actor: "Yemi Adeyemi",
    action: "COMMENT_APPROVED",
    target: "Post ID #302",
    time: "Yesterday",
  },
  {
    id: 7,
    actor: "Adaeze Nwosu",
    action: "MINT_RETRIED",
    target: "Sovereign Blue",
    time: "Yesterday",
  },
  {
    id: 8,
    actor: "Tobias Kraft",
    action: "GALLERY_SUSPENDED",
    target: "The Sublevel Project",
    time: "2 days ago",
  },
  {
    id: 9,
    actor: "Adaeze Nwosu",
    action: "CLAIM_REVOKED",
    target: "Claim Link ID #92",
    time: "3 days ago",
  },
  {
    id: 10,
    actor: "System",
    action: "ZK_COMMITMENT_BOUND",
    target: "Erosion Study III",
    time: "4 days ago",
  },
];

export default function OverviewPage() {
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
          System Overview
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
          Real-time metrics and operations hub
        </p>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Galleries Pending Review"
          value={7}
          linkLabel="Review Queue →"
          linkHref="/admin/galleries"
          alert={true}
        />
        <StatCard
          label="Open Primary Sales"
          value={12}
          linkLabel="View Sales →"
          linkHref="/admin/sales"
        />
        <StatCard label="Unclaimed Claims" value={34} />
        <StatCard
          label="Failed Mints"
          value={2}
          linkLabel="Resolve →"
          linkHref="/admin/sales"
          alert={true}
        />
        <StatCard
          label="Forum Comment Reports"
          value={5}
          linkLabel="Moderate →"
          linkHref="/admin/forum"
          alert={true}
        />
        <div className="card-neumorph p-5 flex flex-col justify-between min-h-[120px]">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1A3F6C]/70">
            Environment Mode
          </span>
          <div className="my-2">
            {isProduction ? (
              <span className="status-badge bg-green-100 text-green-800 text-[10px] py-1 px-3 border border-green-200">
                PRODUCTION
              </span>
            ) : (
              <span className="status-badge bg-amber-100 text-amber-800 text-[10px] py-1 px-3 border border-amber-200">
                STAGING
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold text-[#1A3F6C]/60 uppercase tracking-widest">
            Connected: Stellar Testnet
          </span>
        </div>
      </div>

      {/* Columns: Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#1A3F6C] flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Operations Audit Trail
            </h3>
            <Link
              href="/admin/audit"
              className="text-xs font-bold uppercase tracking-wider text-[#1A3F6C] hover:underline"
            >
              Full Log →
            </Link>
          </div>

          <div className="card-neumorph p-4">
            <div
              className="card-neumorph-inset p-2 max-h-[460px] overflow-y-auto divide-y divide-black/5"
              style={{
                boxShadow: "inset 3px 3px 6px rgba(229,222,217,1), inset -3px -3px 6px rgba(255,255,255,1)",
              }}
            >
              {RECENT_ACTIVITIES.map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 flex items-center justify-between hover:bg-black/[0.02] transition-colors"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-xs font-black text-[#11181c]">
                      {activity.actor}
                    </span>
                    <code className="text-[10px] font-bold text-[#1A3F6C] bg-[#1A3F6C]/10 px-2 py-0.5 rounded-none uppercase">
                      {activity.action}
                    </code>
                    <span className="text-xs text-[#11181c]/70 truncate max-w-[200px] sm:max-w-none">
                      {activity.target}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A3F6C]/50 shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1A3F6C]">
            Quick Administrative Actions
          </h3>

          <div className="card-neumorph p-6 flex flex-col gap-4">
            <Link href="/admin/galleries/new" className="btn-neumorph w-full gap-2 p-3 font-bold text-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Onboard New Gallery</span>
            </Link>

            <Link href="/admin/forum/new" className="btn-neumorph w-full gap-2 p-3 font-bold text-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Compose Forum Post</span>
            </Link>

            <Link href="/admin/reports" className="btn-neumorph w-full gap-2 p-3 font-bold text-sm">
              <FileText className="w-4 h-4" />
              <span>Export System Report</span>
            </Link>

            <div className="border-t border-black/10 my-2 pt-4">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#1A3F6C]/60 mb-2">
                Operational Status
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-600 rounded-none animate-pulse"></span>
                <span className="text-xs font-bold text-[#11181c] uppercase tracking-wider">
                  All Systems Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
