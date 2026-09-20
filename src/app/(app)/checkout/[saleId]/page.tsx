"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { CircleCheck, ShieldCheck } from "lucide-react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { Spinner } from "@/components/Spinner";
import { useUser } from "@/lib/UserContext";
import { fetchChainConfig } from "@/lib/chain-service";
import { getStellarExplorerTxUrl } from "@/lib/stellar-explorer";
import { decodePayments, useStellarSigner } from "@/lib/stellar-signing";
import {
  buildPayment,
  submitPayment,
  type PurchaseEnvelope,
} from "@/lib/purchase-service";

interface Params {
  saleId: string;
}

/** Cents to a displayable amount. The authoritative figure is the decoded XDR. */
const formatCents = (cents: number) =>
  (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const truncate = (address: string) =>
  /^G[A-Z2-7]{55}$/.test(address)
    ? `${address.slice(0, 7)}…${address.slice(-7)}`
    : address;

/**
 * Where the payment has got to.
 *
 * A failure returns to `review` rather than to `loading`, because once an envelope
 * exists it must be reused: the retry resends it, and nothing on this page composes
 * a second one.
 */
type Stage = "loading" | "review" | "signing" | "submitting" | "done";

export default function CheckoutPage({ params }: { params: Promise<Params> }) {
  const { saleId } = use(params);

  const { user, loading: userLoading } = useUser();
  const { authenticated, login } = usePrivy();
  const { signEnvelope } = useStellarSigner();

  const [menuOpen, setMenuOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("loading");
  const [envelope, setEnvelope] = useState<PurchaseEnvelope | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * The signature, kept so a failed submit can be retried with it.
   *
   * Retrying must resend the envelope and signature already in hand. Rebuilding
   * takes a fresh sequence number, and a fresh sequence number is a second
   * payment — so this is what makes retry safe rather than expensive.
   *
   * State rather than a ref, because the button label and the retry note are both
   * derived from it: a ref would leave them showing the wrong thing until some
   * other change happened to re-render.
   */
  const [signature, setSignature] = useState<string | null>(null);

  /** One compose per mount. React runs effects twice in development. */
  const composed = useRef(false);

  const compose = useCallback(async () => {
    const [built, config] = await Promise.all([
      buildPayment(saleId),
      fetchChainConfig().catch(() => null),
    ]);

    if (!config) {
      setError("We could not read the chain configuration. Please try again.");
      return;
    }
    setPassphrase(config.networkPassphrase);

    if (!built.ok) {
      setError(built.message);
      return;
    }

    setEnvelope(built.data);
    setStage("review");
  }, [saleId]);

  useEffect(() => {
    if (userLoading || !user || composed.current) return;
    composed.current = true;

    // Composing the payment is the external sync this page exists for; it resolves
    // asynchronously, so nothing is set during the render pass.
    void compose();
  }, [compose, user, userLoading]);

  /** Submits what is already signed. Never composes. */
  const send = useCallback(
    async (xdr: string, signature: string) => {
      setStage("submitting");
      const result = await submitPayment(saleId, { xdr, signature });

      if (!result.ok) {
        // The envelope and signature stay in hand, so Try again resends rather
        // than rebuilding.
        setError(result.message);
        setStage("review");
        return;
      }

      setTxHash(result.data.txHash);
      setStage("done");
    },
    [saleId],
  );

  const onPay = async () => {
    if (!envelope || !passphrase) return;
    setError(null);

    // Already signed, and the submit failed. Resend the same bytes.
    if (signature) {
      await send(envelope.xdr, signature);
      return;
    }

    setStage("signing");
    try {
      const signed = await signEnvelope({
        xdr: envelope.xdr,
        address: user!.stellarAddress!,
        networkPassphrase: passphrase,
        // Checked against the hash computed from the XDR itself, so a tampered
        // response cannot obtain a signature over something else.
        expectedHash: envelope.hash,
      });
      setSignature(signed);
      await send(envelope.xdr, signed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign the payment.");
      setStage("review");
    }
  };

  // What the transaction actually says, read from the envelope rather than from
  // the server's summary of it. `splits` only supplies the labels below.
  const payments =
    envelope && passphrase ? decodePayments(envelope.xdr, passphrase) : [];

  const roleFor = (destination: string) =>
    envelope?.splits.find((s) => s.toAddress === destination)?.role;

  return (
    <>
      <MobileTopBar title="Checkout" onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Checkout</h1>
      </header>

      <div className="mx-auto mt-20 max-w-2xl space-y-4 p-5 pb-28 lg:mt-0 lg:pb-4">
        {userLoading || (stage === "loading" && !error) ? (
          <div className="card-neumorph flex items-center justify-center gap-3 p-8">
            <Spinner className="h-5 w-5" />
            <p className="text-sm text-[#616161]">Preparing your payment…</p>
          </div>
        ) : !user ? (
          <section className="card-neumorph space-y-4 p-8 text-center">
            <h2 className="text-xl font-semibold text-[#11181c]">
              Log in to complete this purchase
            </h2>
            <a
              href={`/login?redirect=${encodeURIComponent(`/checkout/${saleId}`)}`}
              className="btn-neumorph block w-full text-center"
            >
              Log in
            </a>
          </section>
        ) : stage === "done" ? (
          <section className="card-neumorph space-y-4 p-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
              <CircleCheck
                className="h-11 w-11 text-emerald-600"
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
            <h2 className="text-xl font-semibold text-[#11181c]">Payment complete</h2>
            <p className="text-sm text-[#616161]">
              Paid from your wallet. The artwork is yours.
            </p>
            {txHash && (
              <a
                href={getStellarExplorerTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#4D91A7] underline"
              >
                View the transaction
              </a>
            )}
            <Link href="/collections" className="btn-neumorph block w-full text-center">
              Go to my collection
            </Link>
          </section>
        ) : (
          <>
            {envelope && (
              <section className="card-neumorph space-y-2 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
                  Total
                </p>
                <p className="text-3xl font-semibold text-[#11181c]">
                  ${formatCents(envelope.amountCents)}
                  <span className="ml-2 text-sm font-normal text-[#616161]">USDC</span>
                </p>
                <p className="text-xs text-[#616161]">
                  Paid from your wallet balance in a single transaction.
                </p>
              </section>
            )}

            {payments.length > 0 && (
              <section className="card-neumorph space-y-3 p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[#11181c]">
                  <ShieldCheck className="h-5 w-5 text-[#4D91A7]" aria-hidden />
                  What you are signing
                </h2>
                {/* Read out of the transaction, not out of the server's summary of
                    it. Asking someone to approve a payment on our description of
                    it would make the description the thing they trust. */}
                <ul className="divide-y divide-slate-200">
                  {payments.map((payment, index) => (
                    <li
                      key={`${payment.destination}-${index}`}
                      className="flex items-start justify-between gap-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#11181c]">
                          {roleFor(payment.destination) ?? "Payee"}
                        </p>
                        <p
                          className="font-mono text-xs text-[#616161]"
                          title={payment.destination}
                        >
                          {truncate(payment.destination)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium text-[#11181c]">
                        {payment.amount} {payment.assetCode}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-[#616161]">
                  Everyone is paid in the same transaction, or nobody is.
                </p>
              </section>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
                {signature && (
                  <p className="mt-1 text-xs">
                    Your payment is already signed. Trying again resends it — it
                    cannot charge you twice.
                  </p>
                )}
              </div>
            )}

            {envelope &&
              (authenticated ? (
                <button
                  type="button"
                  onClick={onPay}
                  disabled={stage === "signing" || stage === "submitting"}
                  className="btn-neumorph w-full disabled:opacity-50"
                >
                  {stage === "signing"
                    ? "Waiting for your signature…"
                    : stage === "submitting"
                      ? "Submitting…"
                      : signature
                        ? "Try again"
                        : `Pay $${formatCents(envelope.amountCents)}`}
                </button>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <p>Sign in to your wallet to approve this payment.</p>
                  <button
                    type="button"
                    onClick={() => login()}
                    className="mt-1 underline"
                  >
                    Sign in
                  </button>
                </div>
              ))}

            {!envelope && error && (
              <Link href="/discover" className="btn-neumorph block w-full text-center">
                Back to browsing
              </Link>
            )}
          </>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
