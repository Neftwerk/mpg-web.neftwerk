import { p256 } from "@noble/curves/p256";

const P256_CURVE_ORDER = BigInt(
  "0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E884F7857E090D884971C",
);
const P256_HALF_ORDER = P256_CURVE_ORDER / BigInt(2);

function normalizeLowS(signature: Uint8Array): Uint8Array {
  if (signature.length !== 64) {
    throw new Error("Expected 64-byte P-256 signature");
  }

  const r = signature.slice(0, 32);
  let s = BigInt(`0x${Buffer.from(signature.slice(32)).toString("hex")}`);

  if (s > P256_HALF_ORDER) {
    s = P256_CURVE_ORDER - s;
  }

  const sBytes = Buffer.from(s.toString(16).padStart(64, "0"), "hex");
  return Uint8Array.from([...r, ...sBytes]);
}

function toUncompressedHex(point: ReturnType<typeof p256.Signature.prototype.recoverPublicKey>): string {
  return Buffer.from(point.toRawBytes(false)).toString("hex").toLowerCase();
}

/** Derive the 65-byte SEC-1 collector pubkey from a mint auth digest + passkey signature. */
export function recoverCollectorPubkeyFromDigestSignature(
  digestHex: string,
  signatureHex: string,
): string | undefined {
  const digest = Buffer.from(digestHex.replace(/^0x/i, ""), "hex");
  const signature = Buffer.from(signatureHex.replace(/^0x/i, ""), "hex");

  if (digest.length !== 32 || signature.length !== 64) {
    return undefined;
  }

  const candidates = [Uint8Array.from(signature), normalizeLowS(Uint8Array.from(signature))];

  for (const compact of candidates) {
    for (let recovery = 0; recovery < 4; recovery += 1) {
      try {
        const sig = p256.Signature.fromCompact(compact).addRecoveryBit(recovery);
        const recovered = sig.recoverPublicKey(digest);
        const hex = toUncompressedHex(recovered);
        if (!/^04[0-9a-f]{128}$/.test(hex)) continue;
        if (p256.verify(compact, digest, recovered.toRawBytes(false))) {
          return hex;
        }
      } catch {
        continue;
      }
    }
  }

  return undefined;
}
