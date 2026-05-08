import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function DiscoverRedirectPage() {
  return (
    <AppShell title="Back">
      <div className="rounded-[12px] border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="mb-5 text-lg font-semibold text-slate-900">
          Buy now flow will happen in a third party application
        </p>
        <Link
          href="/discover"
          className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-slate-100"
        >
          Continue
        </Link>
      </div>
    </AppShell>
  );
}
