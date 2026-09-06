"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, Landmark, ShieldCheck } from "lucide-react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { Spinner } from "@/components/Spinner";
import { useUser } from "@/lib/UserContext";
import { fetchChainConfig } from "@/lib/chain-service";
import { getStellarExplorerTxUrl } from "@/lib/stellar-explorer";
import {
  createCollectorWallet,
  createDepositAccount,
  getCollectorWallet,
  getDepositAccount,
  getDepositQuote,
  getKycStatus,
  listDeposits,
  simulateKycApproval,
  type Deposit,
  type DepositQuote,
  type FiatDepositAccount,
  type KycState,
  type WalletAccountState,
} from "@/lib/collector-service";

/**
 * How often to re-read verification while it is outstanding.
 *
 * Bridge reviews asynchronously, and the collector may be working through
 * `/wallet/verify` in another tab. It is a plain GET, so leaving this running
 * costs nothing.
 */
const KYC_POLL_MS = 10_000;

const humanize = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Display only — the authoritative balance is the string Horizon returned. */
const formatUsdc = (amount: string) =>
  Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Bridge's KYC statuses, grouped by what the collector should take from them.
 *
 * `not_started` is deliberately absent: showing "verification not started" on the
 * wallet page would solicit a check we are billed for, which is the whole reason
 * verification lives behind an explicit action on a page of its own.
 */
const KYC_LABELS: Record<string, { label: string; tone: string }> = {
  incomplete: { label: "Verification incomplete", tone: "amber" },
  awaiting_questionnaire: {
    label: "Verification: more information needed",
    tone: "amber",
  },
  awaiting_ubo: { label: "Verification: more information needed", tone: "amber" },
  under_review: { label: "Verification under review", tone: "amber" },
  approved: { label: "KYC Verified", tone: "green" },
  // Bridge documents `approved`; Privy returns `active` for the same state. Missing
  // it meant the status row never rendered for a verified collector — and with it,
  // the sandbox approval control that lives inside that row.
  active: { label: "KYC Verified", tone: "green" },
  rejected: { label: "Verification not approved", tone: "red" },
  paused: { label: "Verification paused", tone: "red" },
  offboarded: { label: "Verification closed", tone: "red" },
  deposits_restricted: { label: "Deposits restricted", tone: "red" },
};

const TONES: Record<string, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  red: "border-red-200 bg-red-50 text-red-700",
};

const STELLAR_ACCOUNT = /^G[A-Z2-7]{55}$/;

/**
 * `GRUISNK…UTGRBJD` — the shape a Stellar address is read in.
 *
 * Seven characters each end: enough for someone to check an address against a
 * wallet or an explorer, where three was too few to be sure. All 56 characters of
 * base32 in full is unreadable at any size. Copy always yields the whole thing, and
 * the full value stays in `title`.
 */
const truncateAddress = (address: string) =>
  STELLAR_ACCOUNT.test(address)
    ? `${address.slice(0, 7)}…${address.slice(-7)}`
    : address;

function InstructionRows({ instructions }: { instructions: Record<string, unknown> }) {
  const rows = Object.entries(instructions).flatMap(([key, value]) => {
    if (value === null || value === undefined || value === "") return [];
    if (Array.isArray(value)) return [[key, value.join(", ")] as const];
    if (typeof value === "object") {
      // Bridge nests one level (e.g. bank address). Flatten rather than recurse:
      // deeper nesting has never appeared, and a tree here would read as noise.
      return Object.entries(value as Record<string, unknown>)
        .filter(([, inner]) => inner !== null && inner !== undefined && inner !== "")
        .map(([innerKey, inner]) => [`${key} ${innerKey}`, String(inner)] as const);
    }
    return [[key, String(value)] as const];
  });

  return (
    <dl className="divide-y divide-slate-200">
      {rows.map(([key, value]) => (
        <div key={key} className="flex items-start justify-between gap-3 py-2">
          <dt className="text-xs uppercase tracking-wide text-[#616161]">
            {humanize(key)}
          </dt>
          <dd className="flex items-center gap-2 text-right text-sm font-medium text-[#11181c]">
            <span className="break-all">{value}</span>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(value)}
              className="shrink-0 text-[11px] text-[#4D91A7] underline"
            >
              Copy
            </button>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function WalletPage() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading: userLoading, patchUser } = useUser();

  const [wallet, setWallet] = useState<WalletAccountState | null>(null);
  const [kyc, setKyc] = useState<KycState | null>(null);
  const [depositAccount, setDepositAccount] = useState<FiatDepositAccount | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  /** Drives the sandbox-only approval shortcut. From the backend, not an env var. */
  const [network, setNetwork] = useState<"testnet" | "mainnet" | null>(null);

  const [loading, setLoading] = useState(true);
  /** Set when the API answers 401, whatever the user context believes. */
  const [signedOut, setSignedOut] = useState(false);

  /**
   * Whether there is a usable session.
   *
   * `user` alone is not enough: `UserProvider` assigns whatever the profile
   * response parsed to, and an empty object is truthy. Requiring an identifying
   * field, and honouring a 401 from the API, means a visitor with a stale token
   * gets the login prompt rather than an error they cannot act on.
   */
  const hasSession = Boolean(user?.id ?? user?.email) && !signedOut;
  /**
   * Whether the wallet read actually answered.
   *
   * Without this, a failed read is indistinguishable from a collector who has no
   * wallet — and the page then tells them provisioning failed and offers a button
   * that cannot work either.
   */
  const [walletKnown, setWalletKnown] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fundAmount, setFundAmount] = useState("");
  const [quote, setQuote] = useState<DepositQuote | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    // Read everything at once: each panel's state depends on more than one of these,
    // and a sequential chain would make the page pop into shape a step at a time.
    const [walletRes, kycRes, accountRes, depositsRes] = await Promise.all([
      getCollectorWallet(),
      getKycStatus(),
      getDepositAccount(),
      listDeposits(),
    ]);

    if (kycRes.ok) setKyc(kycRes.data);
    if (accountRes.ok) setDepositAccount(accountRes.data);
    if (depositsRes.ok) setDeposits(depositsRes.data);

    if (walletRes.ok) {
      setWallet(walletRes.data);
      setWalletKnown(true);
    } else {
      setWalletKnown(false);

      // The API is the authority on whether there is a session, not the user
      // context: a stale token in localStorage, or a profile response that parsed
      // to an empty object, both leave `user` truthy while every call 401s.
      // Trusting the context alone showed a signed-out visitor an error instead of
      // a login prompt.
      if (walletRes.status === 401) {
        setSignedOut(true);
        setLoading(false);
        return;
      }

      // Only the wallet read failing is worth surfacing — the rest are legitimately
      // empty before onboarding starts, and their errors would read as broken.
      //
      // Never the raw message: it carries API paths and provider detail, and
      // "Route not found: GET /api/collector/wallet" is not something a collector
      // can act on. The detail stays in the console for us.
      console.error("[wallet] could not read wallet state:", walletRes.message);
      setError("We couldn't load your wallet. Please try again.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // No session, nothing to read. Skipping the calls avoids a burst of 401s and
    // the flash of an empty wallet before the login prompt renders.
    if (userLoading || !hasSession) return;

    // Reading the collector's state on mount is exactly the external-system sync an
    // effect is for; both calls resolve asynchronously, so no state is set during
    // the render pass. The rule cannot see through `load`, so it is silenced here
    // rather than the fetches being restructured to satisfy it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    fetchChainConfig()
      .then((config) => setNetwork(config.network))
      .catch((err: Error) => console.error("[wallet] chain config:", err.message));
  }, [load, hasSession, userLoading]);

  /**
   * Keeps the page current while verification is outstanding.
   *
   * The collector completes it on `/wallet/verify`, which may be another tab, and
   * Bridge reviews asynchronously — so nothing here is told when it clears. The
   * wallet is re-read alongside it because activation happens on that same page and
   * changes the balance card and the readiness gate below.
   */
  useEffect(() => {
    if (!kyc || kyc.canPayInFiat) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }

    pollRef.current = setInterval(() => {
      void getKycStatus().then((res) => {
        if (res.ok) setKyc(res.data);
      });
      void getCollectorWallet().then((res) => {
        if (res.ok) setWallet(res.data);
      });
    }, KYC_POLL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [kyc]);

  const hasWallet = Boolean(wallet?.address);
  const activated = Boolean(wallet?.exists && wallet?.hasUsdcTrustline);
  /**
   * Whether verification is behind us.
   *
   * `canPayInFiat` is Bridge's capability flag, and it can sit at `pending` long
   * after the check itself is done — Bridge reports only `external_account`
   * outstanding, which is the collector's own bank account and a payout concern.
   * Gating on it alone sent a fully verified collector back to verification.
   *
   * The check's own state is the honest signal. Bridge still refuses the deposit
   * account if it disagrees, and that refusal is translated rather than guessed.
   */
  const verified = Boolean(kyc?.canPayInFiat) || kyc?.stage === "complete";
  /** Everything the backend requires before a deposit account can exist. */
  const readyToFund = hasWallet && verified && activated;

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const onCreateWallet = () =>
    run("wallet", async () => {
      const res = await createCollectorWallet();
      if (!res.ok) throw new Error(res.message);
      patchUser({ stellarAddress: res.data.address });
      await load();
    });

  const onFund = () =>
    run("fund", async () => {
      const amount = Number(fundAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Enter how much you want in your wallet.");
      }

      // Quoted first, and it costs nothing: the gross is the only number the
      // collector can act on, and wiring the amount they typed would leave them
      // short of it.
      const quoted = await getDepositQuote(amount);
      if (!quoted.ok) throw new Error(quoted.message);
      setQuote(quoted.data);

      if (depositAccount) return;

      const created = await createDepositAccount();
      if (!created.ok) throw new Error(created.message);
      setDepositAccount(created.data);
    });

  /**
   * Sandbox shortcut past Bridge's manual approval.
   *
   * Bridge never approves sandbox customers on its own, so a test collector would
   * otherwise sit in `under_review` and nothing past verification could be reached.
   * The route does not exist on mainnet.
   */
  const onSimulateApproval = () =>
    run("simulate", async () => {
      const res = await simulateKycApproval();
      if (!res.ok) throw new Error(res.message);
      setKyc(res.data);
      await load();
    });

  return (
    <>
      <MobileTopBar title={t("nav.wallet")} onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">{t("nav.wallet")}</h1>
      </header>

      <div className="mx-auto mt-20 max-w-2xl space-y-4 p-5 pb-28 lg:mt-0 lg:pb-4">
        {userLoading ? (
          <div className="card-neumorph flex items-center justify-center gap-3 p-8">
            <Spinner className="h-5 w-5" />
            <p className="text-sm text-[#616161]">Loading…</p>
          </div>
        ) : !hasSession ? (
          /* Signed out. The whole wallet is replaced rather than shown empty
             alongside an error: a balance of $0.00 and a Fund button are not
             things a signed-out visitor can act on, and an error box would blame
             the app for what is just a missing session. */
          <section className="card-neumorph space-y-4 p-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
              Wallet
            </p>
            <h2 className="text-xl font-semibold text-[#11181c]">
              Log in to access your wallet
            </h2>
            <p className="text-sm text-[#616161]">
              Your balance, funding details and deposits live here once you are
              logged in.
            </p>
            <a
              href="/login?redirect=%2Fwallet"
              className="btn-neumorph block w-full text-center"
            >
              Log in
            </a>
          </section>
        ) : loading ? (
          <div className="card-neumorph flex items-center justify-center gap-3 p-8">
            <Spinner className="h-5 w-5" />
            <p className="text-sm text-[#616161]">Loading…</p>
          </div>
        ) : (
          <>
            <section className="card-neumorph space-y-2 p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
                Balance
              </p>
              <p className="text-3xl font-semibold text-[#11181c]">
                ${wallet ? formatUsdc(wallet.usdcBalance) : "0.00"}
                <span className="ml-2 text-sm font-normal text-[#616161]">USDC</span>
              </p>
              {wallet?.address ? (
                <div className="flex items-center gap-2">
                  <p
                    className="font-mono text-xs text-[#616161]"
                    title={wallet.address}
                  >
                    {truncateAddress(wallet.address)}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      void navigator.clipboard?.writeText(wallet.address ?? "")
                    }
                    className="shrink-0 text-[11px] text-[#4D91A7] underline"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#616161]">No wallet yet.</p>
              )}
            </section>

            {kyc?.kycStatus && KYC_LABELS[kyc.kycStatus] && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  TONES[KYC_LABELS[kyc.kycStatus]!.tone]
                }`}
              >
                <p className="font-medium">{KYC_LABELS[kyc.kycStatus]!.label}</p>
                {/* Sandbox never approves on its own, so `canPayInFiat` stays false
                    and funding keeps routing back to verification however many times
                    the check is completed. Absent on mainnet, where the route behind
                    it does not exist either. */}
                {network === "testnet" && kyc.stage !== "complete" && (
                  <button
                    type="button"
                    onClick={onSimulateApproval}
                    disabled={busy === "simulate"}
                    className="mt-2 text-xs underline disabled:opacity-50"
                  >
                    {busy === "simulate"
                      ? "Approving…"
                      : "Simulate approval (sandbox)"}
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {walletKnown && !hasWallet && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p>
                  We create your wallet when you sign in, and it did not complete.
                </p>
                <button
                  type="button"
                  onClick={onCreateWallet}
                  disabled={busy === "wallet"}
                  className="mt-1 underline disabled:opacity-50"
                >
                  {busy === "wallet" ? "Creating…" : "Create it now"}
                </button>
              </div>
            )}

            {/* Verification is never started from here — Bridge bills per check, so
                it stays behind a deliberate click, on a page that walks through the
                whole thing in order. */}
            {walletKnown && hasWallet && !readyToFund && (
              <section className="card-neumorph space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4D91A7]/10 text-[#4D91A7]">
                    <Landmark className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-[#11181c]">
                      Bank Account Deposits
                    </h2>
                    <p className="text-sm text-[#616161]">
                      Want to add funds by bank transfer? Start by setting up your
                      deposit account.
                    </p>
                  </div>
                </div>

                {/* The step itself, set apart from the card that introduces it —
                    what is being asked for is a different thing from why. */}
                <div className="rounded-2xl border border-[#4D91A7]/30 bg-[#4D91A7]/[0.07] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#4D91A7]"
                      aria-hidden
                    />
                    <div className="w-full space-y-3">
                      {/* Mirrors the order of `/wallet/verify`, where activation
                          leads: it depends on nothing but the address, so it is the
                          step a collector is on until it is done. */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-[#11181c]">
                          {!activated
                            ? "Activate your wallet"
                            : "Complete Identity Verification"}
                        </h3>
                        <p className="text-sm text-[#616161]">
                          {!activated
                            ? "One quick step to prepare your wallet to hold USDC."
                            : "Funding by bank transfer needs a one-time identity check. It takes a few minutes and runs here in the app."}
                        </p>
                      </div>
                      <Link
                        href="/wallet/verify"
                        className="btn-neumorph inline-flex items-center gap-1.5"
                      >
                        {!activated
                          ? "Activate wallet"
                          : kyc?.stage && kyc.stage !== "tos"
                            ? "Continue verification"
                            : "Start Verification"}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {readyToFund && (
              <section className="card-neumorph space-y-3 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
                  Add funds
                </p>
                <p className="text-sm text-[#616161]">
                  Fund by bank transfer. Tell us how much you want in your wallet and
                  we will tell you what to send.
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="Amount in USD"
                    className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={onFund}
                    disabled={busy === "fund"}
                    className="btn-neumorph shrink-0 disabled:opacity-50"
                  >
                    {busy === "fund" ? "…" : "Fund"}
                  </button>
                </div>

                {quote && (
                  <div className="card-neumorph-inset space-y-1 p-4">
                    <p className="text-2xl font-semibold text-[#11181c]">
                      Send ${quote.gross}
                    </p>
                    <p className="text-sm text-[#616161]">
                      ${quote.fee} conversion fee ({quote.feePercent}%) — ${quote.net}{" "}
                      arrives in your wallet.
                    </p>
                    {quote.belowMinimum && (
                      <p className="text-sm text-red-600">
                        Below the ${quote.minimum} minimum for this transfer method.
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}

            {depositAccount?.deposit_instructions && (
              <section className="card-neumorph space-y-3 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
                  Transfer to
                </p>
                <InstructionRows instructions={depositAccount.deposit_instructions} />
                <p className="text-xs text-[#616161]">
                  These details are permanent — the same ones work for every future
                  transfer, and no reference code is needed.
                </p>
              </section>
            )}

            {deposits.length > 0 && (
              <section className="card-neumorph space-y-3 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
                  Deposits
                </p>
                <ul className="divide-y divide-slate-200">
                  {deposits.map((deposit) => (
                    <li
                      key={deposit._id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#11181c]">
                          ${formatUsdc(deposit.amount)} {deposit.assetCode}
                        </p>
                        <p className="text-xs text-[#616161]">
                          {new Date(deposit.ledgerCloseAt).toLocaleString()}
                        </p>
                      </div>
                      <a
                        href={getStellarExplorerTxUrl(deposit.transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-[11px] text-[#4D91A7] underline"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
