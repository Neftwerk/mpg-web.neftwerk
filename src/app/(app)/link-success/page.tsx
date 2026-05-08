import Link from "next/link";
import { AppShell } from "@/components/app-shell";

function textForSuccess(kind?: string) {
  if (kind === "card") return "Your credit card has been linked successfully";
  if (kind === "bank") return "Your bank has been linked successfully";
  return "Your wallet has been linked successfully";
}

export default async function LinkSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const kind = typeof query.kind === "string" ? query.kind : undefined;

  return (
    <AppShell title="Linked">
      <div className="card" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <p style={{ fontSize: 20, color: "#1a3f6c", marginBottom: 18 }}>{textForSuccess(kind ?? "wallet")}</p>
        <Link href="/wallet" className="btn">
          View wallet
        </Link>
      </div>
    </AppShell>
  );
}
