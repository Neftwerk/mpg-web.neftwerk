/**
 * Push preferences — minimal / off by default.
 * Device-local until a server preference API exists.
 */

const PUSH_KEY = "neft_push_pref_v1";

export type PushPreference = "off" | "minimal";

export function getPushPreference(): PushPreference {
  if (typeof window === "undefined") return "off";
  const raw = localStorage.getItem(PUSH_KEY);
  if (raw === "minimal") return "minimal";
  return "off";
}

export function setPushPreference(value: PushPreference) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PUSH_KEY, value);
}
