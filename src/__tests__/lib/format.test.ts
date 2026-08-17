import { describe, it, expect } from "vitest";
import { formatListPrice } from "@/lib/format";

describe("formatListPrice", () => {
  it("returns 'on request' for null", () => {
    expect(formatListPrice(null)).toBe("on request");
  });

  it("returns 'on request' for undefined", () => {
    expect(formatListPrice(undefined)).toBe("on request");
  });

  it("returns 'on request' for 0", () => {
    expect(formatListPrice(0)).toBe("on request");
  });

  it("returns 'on request' for negative values", () => {
    expect(formatListPrice(-500)).toBe("on request");
  });

  it("formats whole dollar amounts", () => {
    expect(formatListPrice(10000)).toBe("$100.00");
  });

  it("formats cents correctly", () => {
    expect(formatListPrice(1999)).toBe("$19.99");
  });

  it("formats single cent", () => {
    expect(formatListPrice(1)).toBe("$0.01");
  });

  it("formats large amounts with comma separators", () => {
    expect(formatListPrice(1000000)).toBe("$10,000.00");
  });

  it("formats amounts under a dollar", () => {
    expect(formatListPrice(50)).toBe("$0.50");
  });
});
