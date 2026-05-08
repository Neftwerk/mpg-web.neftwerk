import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function NewCollectionPage() {
  return (
    <AppShell title="New Collection">
      <div className="grid gap-4 max-w-[620px]">
        <label className="text-sm font-medium text-slate-700">Collection name</label>
        <input
          className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          defaultValue="#African art"
        />
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          rows={4}
          placeholder="Optional notes for this collection"
        />
        <Link
          href="/collections"
          className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-slate-100"
        >
          Create Collection
        </Link>
      </div>
    </AppShell>
  );
}
