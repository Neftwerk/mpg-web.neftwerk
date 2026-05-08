import { AppShell } from "@/components/app-shell";

export default function ScanQrPage() {
  return (
    <AppShell title="Scan QR">
      <div className="grid" style={{ justifyItems: "center" }}>
        <div
          className="card"
          style={{ width: 320, height: 320, borderRadius: 8, display: "grid", placeItems: "center" }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "4px solid #7b8083",
              display: "grid",
              placeItems: "center",
              color: "#7b8083",
              fontWeight: 700,
            }}
          >
            QR
          </div>
        </div>
        <button className="btn" type="button">
          Scan QR
        </button>
      </div>
    </AppShell>
  );
}
