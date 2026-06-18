import type { MintPrepData } from "./mint-types";

type OnChainSplit = {
  address: string;
  bps: number;
  role: string;
};

const buildSplitEntryScVal = (
  entry: OnChainSplit,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xdr: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Address: any,
) =>
  xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("address"),
      val: Address.fromString(entry.address).toScVal(),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("bps"),
      val: xdr.ScVal.scvU32(entry.bps),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("role"),
      val: xdr.ScVal.scvSymbol(entry.role),
    }),
  ]);

const readInvokeContractArgs = (operation: { body: () => unknown }): string[] => {
  const body = operation.body() as {
    switch: () => { name: string };
    _value: {
      hostFunction: () => {
        invokeContract: () => {
          args: () => unknown[];
        };
      };
    };
  };

  if (body.switch().name !== "invokeHostFunction") {
    throw new Error("Expected invokeHostFunction operation");
  }

  const invoke = body._value.hostFunction().invokeContract();
  const args = invoke.args() as Array<{ toXDR: (format: string) => string }>;
  return args.map((arg) => arg.toXDR("base64"));
};

/** Build base64 ScVal XDR args for ARTS-1 factory `mint` (SocketFi transaction-intents). */
export async function buildMintArgsXdr(
  prep: MintPrepData,
  collectorSignature: string,
): Promise<string[]> {
  const { Address, Contract, xdr } = await import("@stellar/stellar-sdk");

  const splits = xdr.ScVal.scvVec(
    prep.primarySaleSplits.map((entry) => buildSplitEntryScVal(entry, xdr, Address)),
  );

  const contract = new Contract(prep.chain.arts1FactoryContractId);
  const operation = contract.call(
    "mint",
    xdr.ScVal.scvSymbol(prep.onChainArtworkId),
    Address.fromString(prep.ownerAddress).toScVal(),
    Address.fromString(prep.artistAddress).toScVal(),
    xdr.ScVal.scvString(prep.metadataCid),
    xdr.ScVal.scvU32(prep.royaltyBps),
    splits,
    xdr.ScVal.scvBytes(Buffer.from(prep.provenancePreimage, "hex")),
    xdr.ScVal.scvBytes(Buffer.from(prep.collectorPubkey, "hex")),
    xdr.ScVal.scvBytes(Buffer.from(prep.neftwerkSignature, "hex")),
    xdr.ScVal.scvBytes(Buffer.from(collectorSignature.replace(/^0x/i, ""), "hex")),
  );

  return readInvokeContractArgs(operation);
}
