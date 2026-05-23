"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LinkSuccessModal } from "@/components/LinkSuccessModal";

export default function LinkWalletPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLinkWallet = () => {
    // Here you would typically make an API call to link the wallet
    // For now, we'll just show the success modal
    setShowSuccessModal(true);
  };

  return (
    <AppShell title="Link Wallet">
      <div className="grid gap-4 max-w-[520px]">
        <label className="text-sm font-medium text-slate-700">Wallet address</label>
        <textarea
          className="w-full border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          rows={4}
          placeholder="Paste your wallet address here"
        />
        <button
          onClick={handleLinkWallet}
          className="btn-neumorph"
        >
          Link the wallet
        </button>
      </div>

      <LinkSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        kind="wallet"
      />
    </AppShell>
  );
}
