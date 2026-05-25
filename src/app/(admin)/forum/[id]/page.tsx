"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ForumPostEditor } from "@/components/admin/ForumPostEditor";
import { ArrowLeft } from "lucide-react";

const MOCK_POSTS_DETAILS: Record<string, any> = {
  "post-01": {
    title: "Introducing ARTS-1: Art on Stellar",
    excerpt: "The first formal release specification details for digital art on Stellar. Learn how to sequence and catalog smart split rules.",
    body: "### Introducing ARTS-1 Standard\n\nWe are proud to announce the formal release of the **ARTS-1 standard** on the Stellar network. This protocol enables native digital artworks to carry built-in split payout instructions, metadata references, and zero-knowledge commitment validations.\n\n#### Key Architectural Enhancements\n- **Decentralized Split Registries**: Direct smart routing to custom payout nodes.\n- **IPFS Persistence**: Zero dependency on static backend file repositories.\n- **ZK Proof Bindings**: Maintain high-fidelity transaction validation while retaining complete privacy.",
    tags: "stellar, arts-1, specs, contracts",
    status: "PUBLISHED",
    scheduleDate: "",
    pinned: true,
  },
  "post-02": {
    title: "How ZK Commitments Protect Collector Privacy",
    excerpt: "An architectural review of how we embed zero knowledge parameters inside digital ledger records to mask transaction sizes.",
    body: "### Zero Knowledge Mechanics\n\nPrivacy remains a vital pillar for contemporary art collectors globally. The integration of ZK commitments inside our smart metadata validations ensures that buyers can prove legitimacy without exposing secondary ledger balances.\n\n#### Validation Workflow\n1. Generate local commit hash on asset claim.\n2. Submit validator verify transaction.\n3. Bound commitment parameters natively to token minting structures.",
    tags: "zk-proofs, privacy, security, ledger",
    status: "PUBLISHED",
    scheduleDate: "",
    pinned: false,
  }
};

export default function EditForumPostPage() {
  const params = useParams();
  const id = (params?.id as string) || "post-01";

  const postData = MOCK_POSTS_DETAILS[id] || MOCK_POSTS_DETAILS["post-01"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/forum"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#1A3F6C] hover:underline self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            Edit Editorial Post
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Modify publication settings, adjust scheduling gates, and update tag parameters
          </p>
        </div>
      </div>

      {/* Editor loaded with existing post parameters */}
      <ForumPostEditor postId={id} initialData={postData} />
    </div>
  );
}
