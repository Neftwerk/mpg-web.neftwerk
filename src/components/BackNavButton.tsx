"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const BACK_ICON = "/images/backarrow.svg";

/** Shared hit target — must stay identical on every screen. */
export const BACK_HIT_CLASS =
  "flex-shrink-0 flex items-center justify-center w-10 h-10 -ml-2";

export const BACK_ICON_CLASS = "h-4 w-5 object-contain";

type BackNavButtonProps = {
  /** Default: Home. Mid-flow screens may pass a step parent. */
  href?: string;
  /** Mid-flow only: browser history step-back. */
  historyBack?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * One consistent back control: same icon, size, and placement.
 */
export function BackNavButton({
  href = "/home",
  historyBack = false,
  className = "",
  "aria-label": ariaLabel,
}: BackNavButtonProps) {
  const router = useRouter();
  const label =
    ariaLabel ??
    (historyBack ? "Back" : href === "/home" ? "Back to Home" : "Back");

  const icon = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={BACK_ICON} alt="" className={BACK_ICON_CLASS} aria-hidden />
  );

  if (historyBack) {
    return (
      <button
        type="button"
        onClick={() => router.back()}
        className={`${BACK_HIT_CLASS} ${className}`}
        aria-label={label}
      >
        {icon}
      </button>
    );
  }

  return (
    <Link href={href} className={`${BACK_HIT_CLASS} ${className}`} aria-label={label}>
      {icon}
    </Link>
  );
}
