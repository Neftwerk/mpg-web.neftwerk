import React from "react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string | number;
  linkLabel?: string;
  linkHref?: string;
  alert?: boolean;
}

export function StatCard({
  label,
  value,
  linkLabel,
  linkHref,
  alert = false,
}: StatCardProps) {
  return (
    <div className="card-neumorph p-5 relative flex flex-col justify-between min-h-[120px] transition-transform duration-200">
      {/* Alert Indicator */}
      {alert && (
        <span className="absolute top-4 right-4 w-2 h-2 bg-red-600 animate-pulse rounded-none"></span>
      )}

      {/* Label */}
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1A3F6C]/70">
        {label}
      </span>

      {/* Value */}
      <span className="text-4xl font-extrabold text-[#11181c] tracking-tight my-2">
        {value}
      </span>

      {/* Link */}
      {linkLabel && linkHref ? (
        <Link
          href={linkHref}
          className="text-xs font-bold text-[#1A3F6C] underline hover:text-[#1A3F6C]/85 transition-colors self-start"
        >
          {linkLabel}
        </Link>
      ) : (
        <div className="h-4"></div>
      )}
    </div>
  );
}
