"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface LinkSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  kind?: "wallet" | "bank" | "card" | "artwork";
}

function textForSuccess(kind?: string) {
  if (kind === "artwork") return "Your artwork purchase is complete";
  if (kind === "card") return "Your credit card has been linked successfully";
  if (kind === "bank") return "Your bank has been linked successfully";
  return "Your wallet has been linked successfully";
}

export function LinkSuccessModal({ isOpen, onClose, kind }: LinkSuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleViewWallet = () => {
    onClose();
    router.push("/wallet");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-w-md w-full mx-4 bg-white p-8 text-center">
        {/* Wallet Image */}
        <div className="mb-6 flex justify-center">
          <img
            src="/icons/wallet.svg"
            alt="Wallet"
            className="w-16 h-16"
          />
        </div>

        {/* Success Message */}
        <p className="text-xl font-semibold text-[#1a3f6c] mb-6">
          {textForSuccess(kind)}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-200 bg-white font-bold text-slate-900 transition hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={handleViewWallet}
            className="px-6 py-3 border border-slate-200 bg-white font-bold text-slate-900 transition hover:bg-slate-100"
          >
            View wallet
          </button>
        </div>
      </div>
    </div>
  );
}