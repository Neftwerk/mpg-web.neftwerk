"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePrivy, useIdentityToken } from "@privy-io/react-auth";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { useUser } from "@/lib/UserContext";
import { linkPrivyAccount } from "@/lib/auth-service";

export default function WalletPage() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading: userLoading, refresh } = useUser();
  const { ready, authenticated, login } = usePrivy();
  const { identityToken } = useIdentityToken();
  const [status, setStatus] = useState<"idle" | "linking" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const walletAddress = (user as { walletAddress?: string } | null)?.walletAddress;
  const privyUserId = (user as { privyUserId?: string } | null)?.privyUserId;
  const isLinked = Boolean(privyUserId);

  useEffect(() => {
    if (!authenticated || !identityToken || isLinked || status === "linking") return;

    setStatus("linking");
    setError(null);

    linkPrivyAccount(identityToken)
      .then((result) => {
        if (!result.ok) {
          setError(result.message || "Could not link your wallet. Please try again.");
          setStatus("error");
          return;
        }
        setStatus("idle");
        void refresh();
      })
      .catch(() => {
        setError("Could not link your wallet. Please try again.");
        setStatus("error");
      });
  }, [authenticated, identityToken, isLinked, status, refresh]);

  const connecting = !ready || status === "linking";

  return (
    <>
      <MobileTopBar title={t("nav.wallet")} onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">{t("nav.wallet")}</h1>
      </header>

      <div className="p-5 mt-20 lg:mt-0 pb-28 lg:pb-4 flex items-center justify-center min-h-[60dvh]">
        <div className="card-neumorph w-full max-w-md p-8 text-center space-y-4">
          {userLoading ? (
            <p className="text-sm text-[#616161]">Loading…</p>
          ) : isLinked ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
                Connected
              </p>
              <h2 className="text-xl font-semibold text-[#11181c]">Wallet linked</h2>
              <p className="text-sm text-[#616161] break-all leading-relaxed">
                {walletAddress || "Your wallet is linked to your account."}
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
                Wallet
              </p>
              <h2 className="text-xl font-semibold text-[#11181c]">
                Connect your wallet
              </h2>
              <p className="text-sm text-[#616161] leading-relaxed">
                Link a wallet to your account to manage your purchased artworks.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="button"
                onClick={() => login()}
                disabled={connecting}
                className="w-full rounded-full bg-[#11181c] text-white text-sm font-semibold py-3 disabled:opacity-50"
              >
                {connecting ? "Connecting…" : "Connect Wallet"}
              </button>
            </>
          )}
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
