import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type Params = { id: string };

export default async function DiscoverArtworkPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  return (
    <AppShell title="Discover Artwork Details">
      <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/discover-${id}/700/520`}
          alt="Discover artwork"
          className="w-full rounded-[10px]"
        />
        <h2 className="mt-3 text-xl font-semibold text-slate-900">Fancy Free</h2>
        <p className="mt-2 text-sm text-slate-500">Token ID 2345 • ERC 721 • ETH</p>
        <Link
          href="/discover-redirect"
          className="mt-3 inline-block rounded-full border border-slate-200 bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-slate-100"
        >
          Buy now
        </Link>
      </div>
    </AppShell>
  );
}
