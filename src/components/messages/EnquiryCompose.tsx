"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createEnquiry,
  findEnquiryByArtworkId,
  getEnquiryErrorCode,
} from "@/lib/enquiry-service";
import { fetchPublicArtwork } from "@/lib/gallery-service";
import { NeftwerkImage } from "@/components/NeftwerkImage";

interface EnquiryComposeProps {
  artworkId: string;
  artworkTitle?: string;
}

const MIN_MESSAGE_LENGTH = 10;

export function EnquiryCompose({ artworkId, artworkTitle }: EnquiryComposeProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resolvedTitle, setResolvedTitle] = useState(artworkTitle ?? "");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const artwork = await fetchPublicArtwork(artworkId);
      if (cancelled || !artwork) return;
      if (!artworkTitle) setResolvedTitle(artwork.title);
      if (artwork.mediaUrl) setMediaUrl(artwork.mediaUrl);
    })();

    return () => {
      cancelled = true;
    };
  }, [artworkId, artworkTitle]);

  const displayTitle = resolvedTitle || artworkTitle;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = message.trim();
    if (trimmed.length < MIN_MESSAGE_LENGTH) {
      setError(`Message must be at least ${MIN_MESSAGE_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await createEnquiry({ artworkId, message: trimmed });

    if (res.ok) {
      router.replace(`/messages/${res.data.enquiry._id}`);
      return;
    }

    if (res.status === 409 && getEnquiryErrorCode(res.data) === "ENQUIRY_ALREADY_EXISTS") {
      const existing = await findEnquiryByArtworkId(artworkId);
      if (existing) {
        router.replace(`/messages/${existing._id}`);
        return;
      }
    }

    setError(res.message || "Could not submit enquiry. Please try again.");
    setSubmitting(false);
  };

  return (
    <div className="card-neumorph w-full max-w-md p-6 mt-4 space-y-4">
      <div className="flex items-start gap-3">
        {mediaUrl ? (
          <NeftwerkImage
            src={mediaUrl}
            alt={displayTitle || "Artwork"}
            className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-100"
            priority
          />
        ) : (
          <div className="w-16 h-16 rounded-lg shrink-0 bg-slate-100" aria-hidden />
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
            New enquiry
          </p>
          <h2 className="text-lg font-semibold text-[#11181c] mt-1">
            {displayTitle ? `Enquiry about ${displayTitle}` : "Price enquiry"}
          </h2>
          <p className="text-sm text-[#616161] mt-2 leading-relaxed">
            Ask the gallery about pricing for this artwork. They will reply here.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="enquiry-message"
            className="block text-xs font-semibold text-[#1A3F6C] mb-2"
          >
            Your message
          </label>
          <textarea
            id="enquiry-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={5000}
            placeholder="I am interested in this artwork. Could you share the price and availability?"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#11181c] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#38A8AB]/40 resize-none"
          />
          <p className="text-[10px] text-slate-400 mt-1 text-right">
            {message.trim().length}/5000
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-neumorph w-full disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send enquiry"}
        </button>
      </form>
    </div>
  );
}
