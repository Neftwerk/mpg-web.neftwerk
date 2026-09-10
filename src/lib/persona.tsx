"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/Spinner";

/**
 * Persona's embedded inquiry flow.
 *
 * Client-side only: the package is a UMD bundle that reads `self` on import, which
 * would crash the server render even inside a client component. Imported whole —
 * its bundle sets `module.exports` to the component itself, so the named and
 * default exports its `.d.ts` advertises do not exist at runtime, and reaching for
 * either yields undefined.
 */
export const Inquiry = dynamic(() => import("persona-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center gap-3">
      <Spinner className="h-5 w-5" />
      <p className="text-sm text-[#616161]">Loading the identity check…</p>
    </div>
  ),
});

export interface PersonaInquiry {
  /** Set when starting a fresh check. Mutually exclusive with `inquiryId`. */
  templateId?: string;
  environmentId?: string;
  referenceId?: string;
  /** Set when resuming a check already in progress. */
  inquiryId?: string;
  fields: Record<string, string>;
}

/**
 * Reads Persona's SDK options out of the hosted link Privy returns.
 *
 * The hosted pages set `X-Frame-Options: SAMEORIGIN` and cannot be embedded, so the
 * SDK is used instead — it takes the same identifiers the link already carries.
 * `referenceId` is Bridge's customer id and is what ties the inquiry back to them;
 * `fields.iqt_token` is Bridge's prefill token. Both pass through unchanged so the
 * check Persona runs is the one Bridge is waiting on.
 */
export const toPersonaInquiry = (link: string): PersonaInquiry | null => {
  try {
    const params = new URL(link).searchParams;

    const fields: Record<string, string> = {};
    params.forEach((value, key) => {
      const match = key.match(/^fields\[(.+)\]$/);
      if (match?.[1]) fields[match[1]] = value;
    });

    // A continuation — Bridge's questionnaire, or any step it adds after the
    // identity check — comes back identified by inquiry id rather than template.
    const inquiryId = params.get("inquiry-id");
    if (inquiryId) {
      return {
        inquiryId,
        environmentId: params.get("environment-id") ?? undefined,
        fields,
      };
    }

    const templateId = params.get("inquiry-template-id");
    if (!templateId) return null;

    return {
      templateId,
      environmentId: params.get("environment-id") ?? undefined,
      referenceId: params.get("reference-id") ?? undefined,
      fields,
    };
  } catch {
    return null;
  }
};
