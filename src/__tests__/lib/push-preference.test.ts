import { describe, it, expect, beforeEach } from "vitest";
import { getPushPreference, setPushPreference } from "@/lib/push-preference";

describe("push-preference", () => {
  it("returns 'off' by default when nothing is stored", () => {
    expect(getPushPreference()).toBe("off");
  });

  it("stores and retrieves 'minimal' preference", () => {
    setPushPreference("minimal");
    expect(getPushPreference()).toBe("minimal");
  });

  it("stores and retrieves 'off' preference", () => {
    setPushPreference("minimal");
    setPushPreference("off");
    expect(getPushPreference()).toBe("off");
  });

  it("returns 'off' for unknown stored values", () => {
    localStorage.setItem("neft_push_pref_v1", "all");
    expect(getPushPreference()).toBe("off");
  });
});
