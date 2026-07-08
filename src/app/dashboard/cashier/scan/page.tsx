"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function CashierScanPage() {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);
  const [scanning, setScanning] = useState(true);

  const handleScan = async (scannedData: string) => {
    setScanning(false);
    setMessage(null);
    try {
      const res = await fetch("/api/cashier/qr/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: scannedData })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Okuma başarısız", type: "error" });
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>Ödül Onayla</h1>
      </div>

      {message && (
        <div style={{ padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem", background: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)", color: message.type === "error" ? "var(--danger)" : "var(--success)" }}>
          {message.text}
        </div>
      )}

      <div className="surface-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", maxWidth: "500px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Barkod Okut</h2>
        <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>Müşterinin oluşturduğu ücretsiz kahve (ödül) barkodunu okutun.</p>
        
        {scanning ? (
          <div style={{ width: "100%", maxWidth: "300px", borderRadius: "1rem", overflow: "hidden" }}>
            <Scanner onScan={(result) => handleScan(result[0].rawValue)} />
          </div>
        ) : (
          <button className="btn-primary" onClick={() => { setScanning(true); setMessage(null); }}>Yeniden Okut</button>
        )}
      </div>

    </div>
  );
}
