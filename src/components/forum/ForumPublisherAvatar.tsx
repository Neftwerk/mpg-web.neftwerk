"use client";

import { useResolvedProfilePicture } from "@/lib/use-profile-picture";

/**
 * The publisher's avatar on a forum post.
 *
 * The post list and the post page each drew their own hardcoded letter here,
 * which is why neither matched the mark the mobile app shows: the real picture
 * comes from the publisher account on the API. This renders that picture, and
 * falls back to the initial only when the account has none.
 */
export function ForumPublisherAvatar({
  profilePicture,
  fullName,
}: {
  profilePicture?: string;
  fullName: string;
}) {
  const src = useResolvedProfilePicture(profilePicture);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full border-2 border-[#38A8AB] bg-[#1A3F6C] object-cover"
      />
    );
  }

  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#38A8AB] bg-[#1A3F6C]">
      <span className="text-base font-bold text-white">
        {(fullName || "?")[0].toUpperCase()}
      </span>
    </div>
  );
}
