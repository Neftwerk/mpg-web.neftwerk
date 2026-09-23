import { PHASE_PRODUCTION_BUILD } from "next/constants";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

/**
 * Public values the production bundle cannot be built without.
 *
 * `NEXT_PUBLIC_*` is inlined at build time, not read at runtime, so setting
 * these only on the running service is too late — the bundle is already built
 * without them. They have to be present in the *build* environment.
 */
const REQUIRED_AT_BUILD = ["NEXT_PUBLIC_PRIVY_APP_ID"] as const;

/**
 * Without `NEXT_PUBLIC_PRIVY_APP_ID` the build still gets as far as prerendering
 * before `PrivyAppProvider` — which wraps the whole (app) and (auth) route
 * groups — rejects the empty id. That surfaces as "Cannot initialize the Privy
 * provider with an invalid Privy app ID" on whichever page happened to render
 * first, which names neither the variable nor the fix. Checking here fails in
 * the first second instead, and says what to do.
 */
export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const missing = REQUIRED_AT_BUILD.filter((name) => !process.env[name]?.trim());
    if (missing.length > 0) {
      throw new Error(
        `Missing build-time environment ${
          missing.length > 1 ? "variables" : "variable"
        }: ${missing.join(", ")}.\n\n` +
          "These are NEXT_PUBLIC_* values, which Next.js inlines into the client " +
          "bundle during `next build`. Setting them only on the running service " +
          "does not work — they must exist in the environment that runs the " +
          "build.\n\n" +
          "  • GitHub Actions: already supplied in .github/workflows/ci.yml\n" +
          "  • Docker: pass with --build-arg and re-export with ARG/ENV before " +
          "`npm run build`\n" +
          "  • Railway / Render / Fly: set it as a build variable, not just a " +
          "runtime one\n" +
          "  • Local: add it to .env\n",
      );
    }
  }
  return nextConfig;
}
