"use client";

/**
 * Whether the user has moved between pages inside the app in this tab.
 *
 * A back control that calls `router.back()` is right when there is somewhere to
 * go back to, and wrong on a cold entry — a shared link, a refresh, a new tab —
 * where it either does nothing or throws the user out of the app entirely.
 * `window.history.length` cannot tell those apart, because it counts entries
 * from before the app was ever opened. Counting our own navigations can.
 *
 * Module state, not storage: it describes this tab's session and should reset
 * with it.
 */
let inAppNavigations = 0;

export function noteInAppNavigation(): void {
  inAppNavigations += 1;
}

export function hasInAppHistory(): boolean {
  return inAppNavigations > 0;
}
