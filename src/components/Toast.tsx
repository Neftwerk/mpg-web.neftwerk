"use client";

import { Check } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastContextValue = { showToast: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

/** Brief confirmation that something happened. Top right, self-dismissing. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const DISMISS_AFTER_MS = 2600;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(null), DISMISS_AFTER_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* The live region is always mounted, not rendered alongside the message,
          so a screen reader announces each toast instead of only the first. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex justify-end"
      >
        {message && (
          <div className="toast-enter pointer-events-auto flex items-center gap-2 bg-[#334E57] px-4 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(17,24,28,0.18)]">
            <Check className="h-4 w-4 shrink-0 text-[#38A8AB]" aria-hidden />
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
