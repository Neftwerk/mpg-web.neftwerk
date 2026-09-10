/** Indeterminate activity indicator — a spinning ring, no dependency. */
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Working"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-[#4D91A7] ${className}`}
    />
  );
}
