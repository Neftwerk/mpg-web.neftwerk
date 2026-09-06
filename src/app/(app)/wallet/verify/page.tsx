"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { CircleCheck, FileText, ShieldCheck, Wallet } from "lucide-react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { Spinner } from "@/components/Spinner";
import { useUser } from "@/lib/UserContext";
import { fetchChainConfig } from "@/lib/chain-service";
import { useStellarSigner } from "@/lib/stellar-signing";
import { Inquiry, toPersonaInquiry, type PersonaInquiry } from "@/lib/persona";
import {
  getCollectorWallet,
  getKycStatus,
  simulateKycApproval,
  startActivation,
  startKyc,
  submitActivation,
  type KycState,
  type WalletAccountState,
} from "@/lib/collector-service";

/** Bridge reviews asynchronously, so the only signal is a poll. A plain GET. */
const POLL_MS = 5_000;

/**
 * The steps, in order.
 *
 * Activation is ours and Stellar-only: Bridge cannot deliver USDC to an account that
 * does not exist or has no trustline, so it has to happen before funding but has no
 * equivalent in Privy's flow. It leads because it depends on nothing else — only a
 * Stellar address, which exists from sign-in — so a collector who finishes the
 * identity check is immediately ready to fund rather than meeting one more step
 * after the long part.
 */
const STEPS = [
  { key: "activate", label: "Activate Wallet", Icon: Wallet },
  { key: "terms", label: "Terms of Service", Icon: FileText },
  { key: "identity", label: "Identity Verification", Icon: ShieldCheck },
  { key: "done", label: "Completed", Icon: CircleCheck },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/**
 * Which step the collector is on, computed from what Privy and the ledger report.
 *
 * Deliberately derived rather than held in state: verification can complete in
 * another tab, hours later, and local progress would be a lie by then.
 */
const currentStep = (
  kyc: KycState | null,
  wallet: WalletAccountState | null,
): StepKey => {
  if (!wallet?.exists || !wallet.hasUsdcTrustline) return "activate";
  if (!kyc) return "terms";
  if (kyc.stage === "tos") return "terms";
  if (kyc.stage !== "complete") return "identity";
  return "done";
};

function Progress({ step }: { step: StepKey }) {
  const index = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="card-neumorph space-y-3 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#11181c]">Progress</p>
        <p className="text-sm text-[#616161]">
          Step {index + 1} of {STEPS.length}
        </p>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[#4D91A7] transition-all"
          style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Icon per step rather than a number: the icon says what the step is, where
          "3" only says where it sits. Three states, distinguished by colour alone so
          the row keeps one shape throughout — a ring that fills or a circle that
          swells would shift the labels under it as the collector advances. */}
      <ol className="flex justify-between gap-2 pt-1">
        {STEPS.map(({ key, label, Icon }, i) => {
          const done = i < index;
          const current = i === index;

          return (
            <li
              key={key}
              className="flex flex-1 flex-col items-center gap-2 text-center"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-emerald-500 text-emerald-600"
                    : current
                      ? "border-[#4D91A7] text-[#4D91A7]"
                      : "border-slate-300 text-slate-400"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <span
                className={`text-[11px] font-medium leading-tight ${
                  done
                    ? "text-emerald-600"
                    : current
                      ? "text-[#4D91A7]"
                      : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function VerifyPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { authenticated, login } = usePrivy();
  const { signEnvelope } = useStellarSigner();

  const [menuOpen, setMenuOpen] = useState(false);
  const [kyc, setKyc] = useState<KycState | null>(null);
  const [wallet, setWallet] = useState<WalletAccountState | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  /** Gates the sandbox shortcut. From the backend, not an env var. */
  const [network, setNetwork] = useState<"testnet" | "mainnet" | null>(null);
  const [termsLink, setTermsLink] = useState<string | null>(null);
  const [inquiry, setInquiry] = useState<PersonaInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  /** Bridge's `signedAgreementId`, once its terms page reports one. */
  const agreementRef = useRef<string | null>(null);

  const step = currentStep(kyc, wallet);

  const refresh = useCallback(async () => {
    const [kycRes, walletRes] = await Promise.all([
      getKycStatus(),
      getCollectorWallet(),
    ]);
    if (kycRes.ok) setKyc(kycRes.data);
    if (walletRes.ok) setWallet(walletRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userLoading || !user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    fetchChainConfig()
      .then((config) => {
        setPassphrase(config.networkPassphrase);
        setNetwork(config.network);
      })
      .catch((err: Error) => setError(err.message));
  }, [refresh, user, userLoading]);

  // Stops at `done`: nothing is outstanding, so there is nothing to wait for.
  useEffect(() => {
    if (step === "done") {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }

    pollRef.current = setInterval(() => void refresh(), POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [step, refresh]);

  /**
   * Bridge posts a `signedAgreementId` to the parent window when its embedded terms
   * page is accepted. That is the only signal we get — Privy's status read reports
   * the identity check's state, never the terms'.
   */
  useEffect(() => {
    if (step !== "terms") return;

    const onMessage = (event: MessageEvent) => {
      let hostname: string;
      try {
        hostname = new URL(event.origin).hostname;
      } catch {
        return;
      }
      // Checked on the parsed hostname, so `evil-bridge.xyz` fails.
      if (hostname !== "bridge.xyz" && !hostname.endsWith(".bridge.xyz")) return;

      const data = event.data as { signedAgreementId?: string } | undefined;
      if (!data?.signedAgreementId) return;

      // Held for the next `startKyc`, which is what ties the acceptance to the KYC
      // link Privy issues. A ref rather than state: nothing renders from it, and a
      // re-render here would remount the terms iframe under the collector.
      agreementRef.current = data.signedAgreementId;

      startedRef.current = false;
      void refresh();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [step, refresh]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Asks Privy for the next hosted page. Reused for both of the first two steps —
   * it answers with the terms link while those are outstanding and the identity
   * link afterwards, which is the ordering rule the backend owns.
   */
  const onStartKyc = () =>
    run(async () => {
      const res = await startKyc(agreementRef.current ?? undefined);
      if (!res.ok) throw new Error(res.message);
      setKyc(res.data);

      if (res.data.stage === "tos") {
        setTermsLink(res.data.link ?? null);
        return;
      }

      if (res.data.link) {
        const parsed = toPersonaInquiry(res.data.link);
        if (parsed) setInquiry(parsed);
        else window.open(res.data.link, "_blank", "noopener,noreferrer");
      }
    });

  // Fetched once per step rather than on every poll: `startKyc` is what produces
  // the hosted links, and asking repeatedly would create checks Bridge bills for.
  useEffect(() => {
    if (loading || startedRef.current) return;
    if (step !== "terms" && step !== "identity") return;
    if (step === "terms" && termsLink) return;
    if (step === "identity" && inquiry) return;

    startedRef.current = true;
    void onStartKyc();
    // Deliberately keyed on the step alone. Including `onStartKyc`, `termsLink` or
    // `inquiry` would re-run this as they settle, and each run asks Privy for a
    // fresh hosted link — which is the call Bridge bills for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, step]);

  const onActivate = () =>
    run(async () => {
      if (!passphrase) throw new Error("Chain configuration is still loading.");

      const envelope = await startActivation();
      if (!envelope.ok) throw new Error(envelope.message);

      // Signed over the hash computed from this envelope, checked against the one
      // the server quoted for it.
      const signature = await signEnvelope({
        xdr: envelope.data.xdr,
        address: envelope.data.address,
        networkPassphrase: passphrase,
        expectedHash: envelope.data.hash,
      });

      const submitted = await submitActivation({
        xdr: envelope.data.xdr,
        signature,
      });
      if (!submitted.ok) throw new Error(submitted.message);

      await refresh();
    });

  return (
    <>
      <MobileTopBar title="Verification" onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Verification</h1>
      </header>

      <div className="mx-auto mt-20 max-w-2xl space-y-4 p-5 pb-28 lg:mt-0 lg:pb-4">
        {userLoading || loading ? (
          <div className="card-neumorph flex items-center justify-center gap-3 p-8">
            <Spinner className="h-5 w-5" />
            <p className="text-sm text-[#616161]">Loading…</p>
          </div>
        ) : !user ? (
          <section className="card-neumorph space-y-4 p-8 text-center">
            <h2 className="text-xl font-semibold text-[#11181c]">
              Log in to continue
            </h2>
            <a
              href="/login?redirect=%2Fwallet%2Fverify"
              className="btn-neumorph block w-full text-center"
            >
              Log in
            </a>
          </section>
        ) : (
          <>
            <Progress step={step} />

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <section className="card-neumorph space-y-3 p-6">
              {step === "terms" && (
                <>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-[#11181c]">
                    <FileText className="h-5 w-5 text-[#4D91A7]" aria-hidden />
                    Terms of Service
                  </h2>
                  <p className="text-sm text-[#616161]">
                    Bridge is the provider that converts your transfer into USDC.
                    Accept their terms to continue.
                  </p>
                  {termsLink ? (
                    <>
                      <iframe
                        src={termsLink}
                        title="Bridge terms of service"
                        className="h-[55dvh] w-full rounded-2xl border border-slate-200"
                      />
                      {/* Acceptance normally advances on its own. This stays as the
                          fallback for a browser that blocks the message, and is
                          harmless early: asking again returns the same link. */}
                      <button
                        type="button"
                        onClick={() => void refresh()}
                        className="w-full text-xs text-[#4D91A7] underline"
                      >
                        Already accepted? Continue
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Spinner className="h-5 w-5" />
                      <p className="text-sm text-[#616161]">Preparing…</p>
                    </div>
                  )}
                </>
              )}

              {step === "identity" && (
                <>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-[#11181c]">
                    <ShieldCheck className="h-5 w-5 text-[#4D91A7]" aria-hidden />
                    Identity Verification
                  </h2>
                  <p className="text-sm text-[#616161]">
                    A one-time identity check. You will need a photo ID and your
                    camera.
                  </p>
                  {inquiry ? (
                    // The SDK sets only maxHeight/maxWidth on its iframe, never
                    // height or width, so the frame collapses to the HTML default
                    // of 300x150 without dimensions supplied here.
                    <div className="h-[70vh] min-h-[480px] w-full overflow-hidden rounded-2xl border border-slate-200 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0">
                      <Inquiry
                        inquiryId={inquiry.inquiryId}
                        templateId={inquiry.templateId}
                        environmentId={inquiry.environmentId}
                        referenceId={inquiry.referenceId}
                        fields={inquiry.fields}
                        frameWidth="100%"
                        frameHeight="100%"
                        // Drops `allow-top-navigation-by-user-activation` from the
                        // SDK's defaults, which Persona documents as "allows
                        // redirect on completion" — a redirect that would take the
                        // whole page.
                        sandboxAttributes={["allow-forms", "allow-modals"]}
                        // Persona saying "done" is not Bridge saying "approved", so
                        // the server decides which step comes next.
                        onComplete={() => void refresh()}
                        onError={() =>
                          setError("The identity check could not be loaded.")
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Spinner className="h-5 w-5" />
                      <p className="text-sm text-[#616161]">Preparing…</p>
                    </div>
                  )}
                  {/* Bridge never approves sandbox customers on its own, so a test
                      collector finishes the check and then waits forever. The route
                      behind this does not exist on mainnet. */}
                  {network === "testnet" && (
                    <button
                      type="button"
                      onClick={() =>
                        void run(async () => {
                          const res = await simulateKycApproval();
                          if (!res.ok) throw new Error(res.message);
                          setKyc(res.data);
                          await refresh();
                        })
                      }
                      disabled={busy}
                      className="w-full text-xs text-[#4D91A7] underline disabled:opacity-50"
                    >
                      {busy ? "Approving…" : "Simulate approval (sandbox)"}
                    </button>
                  )}
                </>
              )}

              {step === "activate" && (
                <>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-[#11181c]">
                    <Wallet className="h-5 w-5 text-[#4D91A7]" aria-hidden />
                    Activate Wallet
                  </h2>
                  <p className="text-sm text-[#616161]">
                    Activate your wallet to continue.
                  </p>
                  {authenticated ? (
                    <button
                      type="button"
                      onClick={onActivate}
                      disabled={busy || !passphrase}
                      className="btn-neumorph w-full disabled:opacity-50"
                    >
                      {busy ? "Waiting for your signature…" : "Activate wallet"}
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <p>Sign in to your wallet to approve this.</p>
                      <button
                        type="button"
                        onClick={() => login()}
                        className="mt-1 underline"
                      >
                        Sign in
                      </button>
                    </div>
                  )}
                </>
              )}

              {step === "done" && (
                <div className="space-y-4 py-4 text-center">
                  {/* The disc carries the weight here — this is the one screen in
                      the flow with nothing to do on it, so the confirmation has to
                      be the thing you see rather than a glyph above a heading. */}
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
                    <CircleCheck
                      className="h-11 w-11 text-emerald-600"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-[#11181c]">All Set!</h2>
                  <p className="text-sm text-[#616161]">
                    Your identity is verified and your wallet is ready to hold USDC.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/wallet")}
                    className="btn-neumorph w-full"
                  >
                    Return to wallet
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
