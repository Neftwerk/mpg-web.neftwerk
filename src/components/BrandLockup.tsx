/**
 * The app logo, on its brand plinth.
 *
 * The MPG artwork ships only as a light variant — a white pentagon with pale
 * lettering — so against the cream page background it washed out. A "Light"
 * mark is drawn for a dark ground, and the plinth gives it one. The slate is
 * the same tone as the block in the wordmark this replaced, so the lockup
 * reads as deliberate rather than as a patch, and the corners are square like
 * every other surface in the app.
 *
 * If a dark export of the mark ever lands, point `src` at it and drop the
 * plinth — the mark can then sit directly on the page.
 *
 * The plinth is kept tight to the mark: it is there to give the artwork a dark
 * ground, not to be a panel of its own. The lockup is smaller on a phone so the
 * sign-in button still clears the fold on a 640px-tall screen.
 */
export function BrandLockup({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <span className="inline-flex items-center justify-center rounded-xl bg-[#334E57] px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[8px_8px_14px_rgba(229,222,217,0.9)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/mpg-logo.png"
          alt="My Pocket Gallery"
          className="h-[84px] sm:h-[116px] object-contain"
        />
      </span>
    </div>
  );
}
