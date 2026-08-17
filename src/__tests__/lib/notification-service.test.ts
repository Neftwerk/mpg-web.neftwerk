import { describe, it, expect } from "vitest";
import { normalizeNotification } from "@/lib/notification-service";

describe("normalizeNotification", () => {
  it("normalizes a well-formed notification", () => {
    const raw = {
      _id: "abc123",
      userId: "user1",
      type: "enquiry_created",
      title: "New enquiry",
      body: "Someone enquired",
      isRead: false,
      meta: { enquiryId: "enq1" },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T12:00:00Z",
    };

    const result = normalizeNotification(raw);

    expect(result._id).toBe("abc123");
    expect(result.userId).toBe("user1");
    expect(result.type).toBe("enquiry_created");
    expect(result.title).toBe("New enquiry");
    expect(result.body).toBe("Someone enquired");
    expect(result.isRead).toBe(false);
    expect(result.meta).toEqual({ enquiryId: "enq1" });
  });

  it("uses message field when body is missing", () => {
    const raw = {
      _id: "n1",
      type: "test",
      title: "Test",
      message: "From message field",
      isRead: true,
      createdAt: "",
      updatedAt: "",
    };

    const result = normalizeNotification(raw);
    expect(result.body).toBe("From message field");
    expect(result.message).toBe("From message field");
  });

  it("falls back to empty string when both body and message are missing", () => {
    const raw = {
      _id: "n1",
      type: "test",
      title: "Test",
      isRead: false,
      createdAt: "",
      updatedAt: "",
    };

    const result = normalizeNotification(raw);
    expect(result.body).toBe("");
  });

  it("uses data as meta when meta is missing", () => {
    const raw = {
      _id: "n1",
      type: "test",
      title: "Test",
      isRead: false,
      data: { artworkId: "art1" },
      createdAt: "",
      updatedAt: "",
    };

    const result = normalizeNotification(raw);
    expect(result.meta).toEqual({ artworkId: "art1" });
    expect(result.data).toEqual({ artworkId: "art1" });
  });

  it("handles missing optional fields gracefully", () => {
    const raw = {
      _id: undefined,
      type: undefined,
      title: undefined,
      isRead: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    } as unknown as Record<string, unknown>;

    const result = normalizeNotification(raw);
    expect(result._id).toBe("");
    expect(result.type).toBe("");
    expect(result.title).toBe("");
    expect(result.isRead).toBe(false);
  });

  it("converts userId to string", () => {
    const raw = {
      _id: "n1",
      userId: 12345,
      type: "test",
      title: "Test",
      isRead: false,
      createdAt: "",
      updatedAt: "",
    };

    const result = normalizeNotification(raw);
    expect(result.userId).toBe("12345");
  });
});
