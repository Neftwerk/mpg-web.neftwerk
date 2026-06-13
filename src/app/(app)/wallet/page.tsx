"use client";

import { useCallback, useEffect, useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { authenticateSocketFi } from "@/lib/socketfi-auth";
import { fetchUsdTokenBalance } from "@/lib/socketfi-balance";
import {
  getSocketFiWalletAddress,
  getStoredSocketFiSession,
} from "@/lib/socketfi-session";
import type { SocketFiSession } from "@socketfi/react";

export default function WalletPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<SocketFiSession | null>(null);
  const [balanceLabel, setBalanceLabel] = useState<string | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const walletAddress = getSocketFiWalletAddress(session);

  const loadBalance = useCallback(async (activeSession: SocketFiSession) => {
    setError(null);
    const result = await fetchUsdTokenBalance(activeSession);

    if (result.ok) {
      setBalanceLabel(result.balanceLabel);
    } else if (!result.silent && result.message) {
      setBalanceLabel(null);
      setError(result.message);
    } else {
      setBalanceLabel(null);
    }
  }, []);

  useEffect(() => {
    setSession(getStoredSocketFiSession());
    setLoading(false);
  }, []);

  const handleShowBalance = async () => {
    setFetchingBalance(true);
    setError(null);

    let activeSession = session ?? getStoredSocketFiSession();

    if (!activeSession) {
      const authResult = await authenticateSocketFi("wallet");
      if (!authResult.ok) {
        if (!authResult.cancelled && authResult.message) {
          setError(authResult.message);
        }
        setFetchingBalance(false);
        return;
      }
      activeSession = authResult.session;
      setSession(activeSession);
    }

    await loadBalance(activeSession);
    setBalanceVisible(true);
    setFetchingBalance(false);
  };

  const handleHideBalance = () => {
    setBalanceVisible(false);
    setError(null);
  };

  const handleCopy = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = walletAddress;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <MobileTopBar title="Wallet" onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Wallet</h1>
      </header>

      <div className="p-5 mt-20 lg:mt-0 pb-28 lg:pb-4">
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <p className="text-sm text-[#616161] mb-2">Wallet</p>
        <div className="relative mb-6">
          <select
            className="w-full appearance-none bg-white border border-slate-200 px-4 py-3.5 text-[15px] font-medium text-[#11181c] outline-none focus:border-[#4D91A7] focus:ring-1 focus:ring-[#4D91A7]/20 pr-10"
            defaultValue="mpg"
          >
            <option value="mpg">My Pocket Gallery Wallet</option>
          </select>
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="#1A3F6C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="bg-white border border-[#BAC4C8] text-center py-6 px-4 mb-2">
          {loading || fetchingBalance ? (
            <div className="space-y-3">
              <div className="h-4 w-24 bg-[#e0ddd8] animate-pulse mx-auto" />
              <div className="h-8 w-40 bg-[#e0ddd8] animate-pulse mx-auto" />
            </div>
          ) : balanceVisible && balanceLabel ? (
            <>
              <p className="text-sm text-[#464646] mb-2">USD Balance</p>
              <p className="text-[28px] font-semibold text-[#1A3F6C] mb-4">
                {balanceLabel}
              </p>
              {walletAddress && (
                <>
                  <p className="text-sm text-[#464646] mb-2">Wallet Address</p>
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-sm text-[#1A3F6C] font-medium truncate max-w-[280px] underline underline-offset-2">
                      {walletAddress}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-shrink-0 p-1 transition active:scale-95"
                      aria-label="Copy address"
                    >
                      {copied ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#38A8AB"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src="/images/copybutton.svg"
                          alt="Copy"
                          className="h-[20px] w-[20px]"
                        />
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : balanceVisible ? (
            <>
              <p className="text-sm text-[#464646] mb-2">USD Balance</p>
              <p className="text-[28px] font-semibold text-[#1A3F6C]">$0.00</p>
            </>
          ) : (
            <>
              <p className="text-sm text-[#464646] mb-3">Balance hidden</p>
              <p className="text-xs text-slate-400">
                Tap Show balance to authenticate and view your USD balance.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-5 mt-8">
          {balanceVisible ? (
            <button
              type="button"
              onClick={handleHideBalance}
              className="btn-neumorph w-[85%]"
            >
              Hide balance
            </button>
          ) : (
            <button
              type="button"
              onClick={handleShowBalance}
              disabled={fetchingBalance}
              className="btn-neumorph w-[85%] disabled:opacity-50"
            >
              {fetchingBalance ? "Loading…" : "Show balance"}
            </button>
          )}
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
