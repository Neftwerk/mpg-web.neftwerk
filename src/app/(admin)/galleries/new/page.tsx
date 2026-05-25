"use client";

import React from "react";
import Link from "next/link";
import { GalleryOnboardingWizard } from "@/components/admin/GalleryOnboardingWizard";
import { ArrowLeft } from "lucide-react";

export default function NewGalleryOnboardingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/galleries"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#1A3F6C] hover:underline self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            New Gallery Partner Onboarding
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Establish legal entities, payouts, public profile credentials, and compliance review
          </p>
        </div>
      </div>

      {/* Stepper Wizard component */}
      <GalleryOnboardingWizard />
    </div>
  );
}
