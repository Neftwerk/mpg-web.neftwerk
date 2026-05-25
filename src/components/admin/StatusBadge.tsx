import React from "react";

type BadgeVariant = "gallery" | "artwork" | "post" | "mint" | "user";

interface StatusBadgeProps {
  status: string;
  variant: BadgeVariant;
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const normStatus = status.toUpperCase().trim();

  let colorClasses = "bg-gray-100 text-gray-800 border-gray-200";

  if (variant === "gallery") {
    switch (normStatus) {
      case "PENDING":
        colorClasses = "bg-yellow-100 text-yellow-800 border-yellow-200";
        break;
      case "IN_REVIEW":
      case "IN_PROGRESS":
        colorClasses = "bg-blue-100 text-blue-800 border-blue-200";
        break;
      case "ACTIVE":
      case "APPROVED":
        colorClasses = "bg-green-100 text-green-800 border-green-200";
        break;
      case "SUSPENDED":
      case "SUSPEND":
        colorClasses = "bg-red-100 text-red-800 border-red-200";
        break;
      default:
        colorClasses = "bg-slate-100 text-slate-800 border-slate-200";
    }
  } else if (variant === "artwork") {
    switch (normStatus) {
      case "DRAFT":
        colorClasses = "bg-gray-100 text-gray-800 border-gray-200";
        break;
      case "READY":
        colorClasses = "bg-blue-100 text-blue-800 border-blue-200";
        break;
      case "LISTED":
        colorClasses = "bg-teal-100 text-teal-800 border-teal-200";
        break;
      case "MINTED":
        colorClasses = "bg-purple-100 text-purple-800 border-purple-200";
        break;
      default:
        colorClasses = "bg-slate-100 text-slate-800 border-slate-200";
    }
  } else if (variant === "post") {
    switch (normStatus) {
      case "DRAFT":
        colorClasses = "bg-gray-100 text-gray-800 border-gray-200";
        break;
      case "SCHEDULED":
        colorClasses = "bg-yellow-100 text-yellow-800 border-yellow-200";
        break;
      case "PUBLISHED":
        colorClasses = "bg-green-100 text-green-800 border-green-200";
        break;
      case "ARCHIVED":
        colorClasses = "bg-slate-200 text-slate-600 border-slate-300";
        break;
      default:
        colorClasses = "bg-slate-100 text-slate-800 border-slate-200";
    }
  } else if (variant === "mint") {
    switch (normStatus) {
      case "PENDING":
        colorClasses = "bg-yellow-100 text-yellow-800 border-yellow-200";
        break;
      case "PROCESSING":
        colorClasses = "bg-blue-100 text-blue-800 border-blue-200";
        break;
      case "CONFIRMED":
        colorClasses = "bg-green-100 text-green-800 border-green-200";
        break;
      case "FAILED":
        colorClasses = "bg-red-100 text-red-800 border-red-200";
        break;
      default:
        colorClasses = "bg-slate-100 text-slate-800 border-slate-200";
    }
  } else if (variant === "user") {
    switch (normStatus) {
      case "ACTIVE":
      case "ENABLED":
        colorClasses = "bg-green-100 text-green-800 border-green-200";
        break;
      case "DISABLED":
      case "SUSPENDED":
        colorClasses = "bg-red-100 text-red-800 border-red-200";
        break;
      case "MFA_ENABLED":
      case "MFA":
      case "TRUE":
        colorClasses = "bg-teal-100 text-teal-800 border-teal-200";
        break;
      case "MFA_DISABLED":
      case "FALSE":
        colorClasses = "bg-slate-200 text-slate-600 border-slate-300";
        break;
      default:
        colorClasses = "bg-slate-100 text-slate-800 border-slate-200";
    }
  }

  return (
    <span
      className={`status-badge border rounded-none uppercase select-none ${colorClasses}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
