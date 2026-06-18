"use client";

import { useEffect } from "react";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    window.parent.postMessage(
      JSON.stringify({
        data: "success",
        kind: params.get("kind") ?? undefined,
        saleId: params.get("saleId") ?? undefined,
      }),
      window.location.origin,
    );
  }, []);

  return (
    <div className="flex min-h-[200px] items-center justify-center p-6 text-sm text-slate-600">
      Payment complete.
    </div>
  );
}
