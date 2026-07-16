/** Format list price stored as cents (USD). */
export function formatListPrice(cents: number | null | undefined): string {
  if (cents == null || cents <= 0) return "on request";
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
