import { describe, it, expect } from "vitest";
import {
  isConversationNotification,
  getNotificationHref,
  isNotificationNavigable,
} from "@/lib/notification-routing";
import type { Notification } from "@/lib/notification-service";

function makeNotification(
  type: string,
  meta?: Record<string, unknown>
): Notification {
  return {
    _id: "n1",
    type,
    title: "Test",
    isRead: false,
    meta,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

describe("isConversationNotification", () => {
  it.each([
    "enquiry_created",
    "enquiry_message_new",
    "enquiry_admin_assigned",
    "enquiry_status_changed",
  ])("returns true for '%s'", (type) => {
    expect(isConversationNotification(type)).toBe(true);
  });

  it("returns false for non-conversation types", () => {
    expect(isConversationNotification("sale_ready_to_mint")).toBe(false);
    expect(isConversationNotification("payment_successful")).toBe(false);
    expect(isConversationNotification("random_type")).toBe(false);
  });
});

describe("getNotificationHref", () => {
  describe("conversation notifications", () => {
    it("returns /messages/:id for regular user", () => {
      const n = makeNotification("enquiry_created", { enquiryId: "enq1" });
      expect(getNotificationHref(n)).toBe("/messages/enq1");
    });

    it("returns /admin/enquiries/:id for admin role", () => {
      const n = makeNotification("enquiry_message_new", { enquiryId: "enq2" });
      expect(getNotificationHref(n, "admin")).toBe("/admin/enquiries/enq2");
    });

    it("returns /admin/enquiries/:id for super_admin role", () => {
      const n = makeNotification("enquiry_status_changed", { enquiryId: "enq3" });
      expect(getNotificationHref(n, "super_admin")).toBe("/admin/enquiries/enq3");
    });

    it("returns null when enquiryId is missing", () => {
      const n = makeNotification("enquiry_created", {});
      expect(getNotificationHref(n)).toBeNull();
    });

    it("returns null when enquiryId is not a string", () => {
      const n = makeNotification("enquiry_created", { enquiryId: 123 });
      expect(getNotificationHref(n)).toBeNull();
    });
  });

  describe("sale notifications", () => {
    it("returns /gallery for sale_ready_to_mint", () => {
      const n = makeNotification("sale_ready_to_mint");
      expect(getNotificationHref(n)).toBe("/gallery");
    });

    it("returns /gallery for sale_minted", () => {
      const n = makeNotification("sale_minted");
      expect(getNotificationHref(n)).toBe("/gallery");
    });
  });

  describe("payment notifications", () => {
    it.each([
      "payment_successful",
      "payment_failed",
      "refund_issued",
      "card_saved",
      "subscription_charged",
      "payout_initiated",
      "payout_completed",
    ])("returns null for '%s'", (type) => {
      const n = makeNotification(type);
      expect(getNotificationHref(n)).toBeNull();
    });
  });

  describe("support notifications", () => {
    it.each([
      "support_ticket_created",
      "support_reply",
      "support_assigned",
      "support_status_changed",
    ])("returns /support for '%s'", (type) => {
      const n = makeNotification(type);
      expect(getNotificationHref(n)).toBe("/support");
    });
  });

  it("returns null for unknown notification types", () => {
    const n = makeNotification("totally_unknown_type");
    expect(getNotificationHref(n)).toBeNull();
  });

  it("uses data field when meta is undefined", () => {
    const n: Notification = {
      _id: "n1",
      type: "enquiry_created",
      title: "Test",
      isRead: false,
      data: { enquiryId: "from-data" },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    expect(getNotificationHref(n)).toBe("/messages/from-data");
  });
});

describe("isNotificationNavigable", () => {
  it("returns true when href exists", () => {
    const n = makeNotification("sale_minted");
    expect(isNotificationNavigable(n)).toBe(true);
  });

  it("returns false when href is null", () => {
    const n = makeNotification("payment_successful");
    expect(isNotificationNavigable(n)).toBe(false);
  });
});
