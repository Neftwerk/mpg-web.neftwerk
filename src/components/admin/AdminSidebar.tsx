"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image,
  FolderOpen,
  Palette,
  BadgeDollarSign,
  MessageSquare,
  Users,
  Cpu,
  ShieldAlert,
  History,
  FileBarChart2,
  Settings as SettingsIcon,
  X
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: "OPERATIONS",
    items: [
      { name: "Overview", href: "/admin/overview", icon: LayoutDashboard },
      { name: "Galleries", href: "/admin/galleries", icon: Image },
      { name: "Collections", href: "/admin/collections", icon: FolderOpen },
      { name: "Artworks", href: "/admin/artworks", icon: Palette },
    ],
  },
  {
    label: "COMMERCE",
    items: [
      { name: "Primary Sales & Mints", href: "/admin/sales", icon: BadgeDollarSign },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { name: "Forum & Editorial", href: "/admin/forum", icon: MessageSquare },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { name: "Users & Collectors", href: "/admin/users", icon: Users },
      { name: "Chain & Contracts", href: "/admin/chain", icon: Cpu },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { name: "Admins", href: "/admin/admins", icon: ShieldAlert },
      { name: "Audit Log", href: "/admin/audit", icon: History },
      { name: "Reports", href: "/admin/reports", icon: FileBarChart2 },
      { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 w-[240px] bg-[#f5f0ec] flex flex-col transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{
        boxShadow: "inset -4px 0 8px rgba(229,222,217,0.6)",
      }}
    >
      {/* Sidebar Header */}
      <div className="h-[60px] px-6 border-b border-black/5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-[#1A3F6C]">
            NEFTWERK
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A3F6C]/60 block -mt-1">
            Admin
          </span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 text-[#1A3F6C] hover:bg-black/5 rounded-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {/* Group Label */}
            <span className="px-3 text-[10px] font-bold tracking-widest text-[#1A3F6C]/60 block mb-2">
              {group.label}
            </span>

            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold transition-all duration-150 border-radius-0 ${
                      isActive
                        ? "nav-item-active"
                        : "text-[#11181c]/80 hover:bg-black/5 hover:text-[#1A3F6C]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
