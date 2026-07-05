import { Address, rpc, xdr } from "@stellar/stellar-sdk";

/** Soroban Option::None for wallet invoke args that SocketFi fills (passkey_sig, fee_pref). */
function scvNone(): xdr.ScVal {
  return xdr.ScVal.scvVoid();
}

/**
 * Deep-auth entry authorizing the wallet to call `factory.<targetFunction>`.
 * Map keys must be sorted alphabetically for Soroban (args, contract, fn_name).
 */
function buildFactoryInvokeAuthEntry(
  factoryContractId: string,
  targetFunction: string,
  contractArgs: xdr.ScVal[]
): xdr.ScVal {
  const factoryAddress = Address.fromString(factoryContractId);

  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("args"),
      val: xdr.ScVal.scvVec(contractArgs),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("contract"),
      val: factoryAddress.toScVal(),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("fn_name"),
      val: xdr.ScVal.scvSymbol(targetFunction),
    }),
  ]);
}

/**
 * Encode a wallet `dapp_invoker` call (7 args per on-chain contract spec).
 * passkey_sig is Void here; SocketFi injects it during the approval popup.
 */
export function buildWalletDappInvokerArgsXdr(opts: {
  factoryContractId: string;
  targetFunction: string;
  targetArgsXdr: string[];
  validUntilLedger: number;
}): string[] {
  const factoryAddress = Address.fromString(opts.factoryContractId);
  const contractArgs = opts.targetArgsXdr.map((argXdr) =>
    xdr.ScVal.fromXDR(argXdr, "base64")
  );

  const authEntry = buildFactoryInvokeAuthEntry(
    opts.factoryContractId,
    opts.targetFunction,
    contractArgs
  );

  const dappArgs: xdr.ScVal[] = [
    factoryAddress.toScVal(),
    xdr.ScVal.scvSymbol(opts.targetFunction),
    xdr.ScVal.scvVec(contractArgs),
    xdr.ScVal.scvVec([authEntry]),
    scvNone(),
    scvNone(),
    xdr.ScVal.scvU32(opts.validUntilLedger),
  ];

  return dappArgs.map((scVal) => scVal.toXDR("base64"));
}

/** On-chain max is 61 ledgers (WalletError::WindowTooLarge = 2155 above that). */
export const SOCKETFI_WALLET_MAX_LEDGER_WINDOW = 61;

/** Default kept below on-chain max to absorb ledger drift before the popup simulates. */
const DEFAULT_LEDGER_VALIDITY_WINDOW = 35;

function resolveLedgerValidityWindow(): number {
  const fromEnv = Number(
    process.env.NEXT_PUBLIC_SOCKETFI_LEDGER_WINDOW?.trim() ?? ""
  );
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return Math.min(
      Math.floor(fromEnv),
      SOCKETFI_WALLET_MAX_LEDGER_WINDOW
    );
  }
  return DEFAULT_LEDGER_VALIDITY_WINDOW;
}

export async function resolveWalletAuthValidUntilLedger(
  rpcUrl: string,
  ledgerWindow = resolveLedgerValidityWindow()
): Promise<number> {
  const server = new rpc.Server(rpcUrl);
  const latest = await server.getLatestLedger();
  return latest.sequence + ledgerWindow;
}
