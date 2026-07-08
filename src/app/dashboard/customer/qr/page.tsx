"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function CustomerQRPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<{ beans: number, rewards: number } | null>(null);
  const [mode, setMode] = useState<"IDLE" | "GENERATE" | "SCAN">("IDLE");
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);
  const [redeemToken, setRedeemToken] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/customer/wallet").then(res => res.ok ? res.json() : null).then(data => {
      if(data) setWallet(data.wallet);
    });
  }, []);

  const handleGenerateRedeemQR = async () => {
    setMessage(null);
    try {
      const res = await fetch("/api/customer/qr/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setRedeemToken(data.token);
        setMode("GENERATE");
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Bir hata oluştu", type: "error" });
    }
  };

  const handleScan = async (scannedData: string) => {
    setMode("IDLE");
    setMessage(null);
    try {
      const res = await fetch("/api/customer/qr/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: scannedData })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
        setWallet({ beans: data.newBeans, rewards: data.newRewards });
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
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>QR İşlemleri</h1>
      </div>

      {message && (
        <div style={{ padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem", background: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)", color: message.type === "error" ? "var(--danger)" : "var(--success)", border: `1px solid ${message.type === "error" ? "var(--danger)" : "var(--success)"}` }}>
          {message.text}
        </div>
      )}

      {mode === "IDLE" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="surface-card" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Puan Kazan</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Kasiyerin gösterdiği QR kodu okutun.</p>
            <button className="btn-primary" onClick={() => setMode("SCAN")}>Kamerayı Aç</button>
          </div>

          <div className="surface-card" style={{ textAlign: "center", border: wallet?.rewards && wallet.rewards > 0 ? "2px solid var(--success)" : "1px solid var(--border-color)" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Ödül Kullan</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Ücretsiz kahve hakkınızı kullanın.</p>
            <button 
              className="btn-primary" 
              style={{ background: wallet?.rewards && wallet.rewards > 0 ? "var(--success)" : "var(--border-color)", cursor: wallet?.rewards && wallet.rewards > 0 ? "pointer" : "not-allowed" }}
              onClick={handleGenerateRedeemQR}
              disabled={!wallet?.rewards || wallet.rewards < 1}
            >
              {wallet?.rewards && wallet.rewards > 0 ? "QR Kod Oluştur" : "Yetersiz Ödül"}
            </button>
          </div>
        </div>
      )}

      {mode === "SCAN" && (
        <div className="surface-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Barkod Okut</h2>
          <div style={{ width: "100%", maxWidth: "300px", borderRadius: "1rem", overflow: "hidden" }}>
            <Scanner onScan={(result) => handleScan(result[0].rawValue)} />
          </div>
          <button className="btn-secondary" onClick={() => setMode("IDLE")}>İptal</button>
        </div>
      )}

      {mode === "GENERATE" && (
        <div className="surface-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "2rem 1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>QR Kodunuz</h2>
          <div style={{ padding: "1rem", background: "white", borderRadius: "1rem", border: "1px solid var(--border-color)" }}>
            {redeemToken && <QRCodeSVG value={redeemToken} size={220} />}
          </div>
          <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>Kasiyere göstermek için kodu okutun.</p>
          <button className="btn-secondary" onClick={() => { setMode("IDLE"); setRedeemToken(null); }} style={{ width: "100%", marginTop: "1rem" }}>Kodu Gizle</button>
        </div>
      )}

    </div>
  );
}
