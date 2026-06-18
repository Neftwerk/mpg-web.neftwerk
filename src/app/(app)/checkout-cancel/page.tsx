"use client";

import { useEffect } from "react";

export default function CheckoutCancelPage() {
  useEffect(() => {
    window.parent.postMessage(
      JSON.stringify({ data: "cancel" }),
      window.location.origin,
    );
  }, []);

  return (
    <div className="flex min-h-[200px] items-center justify-center p-6 text-sm text-slate-600">
      Checkout cancelled.
    </div>
  );
}
