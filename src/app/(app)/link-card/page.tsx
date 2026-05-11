"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LinkSuccessModal } from "@/components/LinkSuccessModal";

export default function LinkCardPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLinkCard = () => {
    // Here you would typically make an API call to link the card
    // For now, we'll just show the success modal
    setShowSuccessModal(true);
  };

  return (
    <AppShell title="Link Credit Card">
      <div className="grid gap-4 max-w-[620px]">
        <label className="text-sm font-medium text-slate-700">Name on card</label>
        <input
          className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="As printed on card"
        />
        <label className="text-sm font-medium text-slate-700">Card number</label>
        <input
          className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="1234 5678 9012 3456"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Expiry month</label>
            <input
              className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">CVV</label>
            <input
              className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="123"
            />
          </div>
        </div>
        <button
          onClick={handleLinkCard}
          className="btn-neumorph"
        >
          Link the card
        </button>
      </div>

      <LinkSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        kind="card"
      />
    </AppShell>
  );
}
