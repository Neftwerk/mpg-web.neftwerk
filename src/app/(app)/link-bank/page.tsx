"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LinkSuccessModal } from "@/components/LinkSuccessModal";

export default function LinkBankPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLinkBank = () => {
    // Here you would typically make an API call to link the bank
    // For now, we'll just show the success modal
    setShowSuccessModal(true);
  };

  return (
    <AppShell title="Link Bank Account">
      <div className="grid gap-4 max-w-[620px]">
        <label className="text-sm font-medium text-slate-700">Name on the account</label>
        <input
          className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="As shown on statements"
        />
        <label className="text-sm font-medium text-slate-700">Routing number</label>
        <input
          className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="9-digit routing number"
        />
        <label className="text-sm font-medium text-slate-700">Account number</label>
        <input
          className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="Account number"
        />
        <button
          onClick={handleLinkBank}
          className="btn-neumorph"
        >
          Link the bank
        </button>
      </div>

      <LinkSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        kind="bank"
      />
    </AppShell>
  );
}
