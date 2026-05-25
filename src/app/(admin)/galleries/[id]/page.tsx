"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GalleryOnboardingWizard } from "@/components/admin/GalleryOnboardingWizard";
import { ArrowLeft } from "lucide-react";

const MOCK_DETAILS: Record<string, any> = {
  "gal-001": {
    legalName: "Meridian Art Group LLC",
    dbaName: "Meridian Contemporary",
    internalRef: "gal-001",
    contactName: "Maya Okonkwo",
    contactEmail: "maya@meridianart.com",
    contactPhone: "+1-555-019-2834",
    displayName: "Meridian Contemporary",
    shortDesc: "A highly curated focus on emerging West African contemporary artists...",
    longDesc: "Meridian Contemporary represents dynamic emerging voices across West Africa...",
    address: "14 Kingsway Road, Ikoyi, Lagos, Nigeria",
    taxId: "RC-9284104-Z",
    walletAddress: "GCKFBEIYTKP3BPNM5Y72YOILXDGJ6ZV2IUCWQXQ7J3WYVZPQJM4Y3RK",
    complianceCheck1: true,
    complianceCheck2: true,
    complianceCheck3: true,
    approver: "Adaeze Nwosu",
    complianceComments: "All legal records verified. Clean background check. Wallet signature matches public registry.",
    agreementRef: "DS-MERIDIAN-2026-X8",
    agreementDate: "2026-01-15",
    agreementVersion: "v1.1",
    isActive: true,
  },
  "gal-002": {
    legalName: "Lagos BB Ltd",
    dbaName: "Lagos Black Box",
    internalRef: "gal-002",
    contactName: "Emre Demir",
    contactEmail: "emre@lagosblackbox.io",
    contactPhone: "+234-809-123-4567",
    displayName: "Lagos Black Box",
    shortDesc: "Experimental audio-visual exhibits and performance pieces inside an old shipping terminal.",
    longDesc: "Founded in 2024, Lagos Black Box is an independent multi-sensory art collective...",
    address: "Plot 12 Marina Waterfront, Lagos Island, Nigeria",
    taxId: "LBB-99214-A",
    walletAddress: "GDKLP5NZYMF3VCFKJFVH2H3RJVMCXBKHQMFJTQAHLZ6DTQZVBWQO5VY",
    complianceCheck1: true,
    complianceCheck2: false,
    complianceCheck3: false,
    approver: "Tobias Kraft",
    complianceComments: "Awaiting ID proof verification of corporate stakeholders.",
    agreementRef: "",
    agreementDate: "",
    agreementVersion: "",
    isActive: false,
  }
};

export default function GalleryDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "gal-001";

  // Fallback to Meridian Contemporary if id is not specifically mocked
  const galleryData = MOCK_DETAILS[id] || MOCK_DETAILS["gal-001"];

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
            Partner Management & Review
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Review verification checkpoints and adjust ongoing operational status for {galleryData.dbaName}
          </p>
        </div>
      </div>

      {/* Stepper Wizard component loaded with existing data */}
      <GalleryOnboardingWizard galleryId={id} initialData={galleryData} />
    </div>
  );
}
