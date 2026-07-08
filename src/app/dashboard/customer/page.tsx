"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<{ beans: number, rewards: number } | null>(null);
  const [redeemToken, setRedeemToken] = useState<string | null>(null);
  
  const [mode, setMode] = useState<"IDLE" | "GENERATE" | "SCAN">("IDLE");
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/customer/wallet");
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

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

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="dashboard-header">
        <h1 style={{ color: "var(--text-primary)" }}>Müşteri Paneli</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>{session?.user?.name} {session?.user?.surname}</span>
          <button className="btn-secondary" onClick={() => signOut({ callbackUrl: '/' })} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            Çıkış Yap
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem", background: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", color: message.type === "error" ? "var(--danger)" : "var(--success)", border: `1px solid ${message.type === "error" ? "var(--danger)" : "var(--success)"}` }}>
          {message.text}
        </div>
      )}

      {/* Cüzdan Özeti */}
      <div className="grid-2" style={{ marginBottom: "3rem" }}>
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Biriken Çekirdek (Puan)</h3>
          <div style={{ fontSize: "3.5rem", fontWeight: "bold", color: "var(--accent-color)" }}>{wallet?.beans || 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Kazanılan Ücretsiz Kahve</h3>
          <div style={{ fontSize: "3.5rem", fontWeight: "bold", color: "var(--success)" }}>{wallet?.rewards || 0}</div>
        </div>
      </div>

      <div className="grid-2">
        
        {/* Puan Kazanma (Kasiyer QR Okutma) */}
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "1rem" }}>Kahve (Puan) Kazan</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Kasiyerin oluşturduğu barkodu kameranızla okutarak puan kazanın.</p>
          
          {mode !== "SCAN" ? (
            <button className="btn-primary" onClick={() => setMode("SCAN")}>Kamerayı Aç ve Barkod Okut</button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "100%", maxWidth: "300px", borderRadius: "1rem", overflow: "hidden" }}>
                <Scanner 
                  onScan={(result) => handleScan(result[0].rawValue)}
                />
              </div>
              <button className="btn-secondary" onClick={() => setMode("IDLE")}>İptal</button>
            </div>
          )}
        </div>

        {/* Ödül Kullanma (Müşteri QR Üretme) */}
        <div className="glass-panel" style={{ textAlign: "center", border: wallet?.rewards && wallet.rewards > 0 ? "2px solid var(--success)" : "" }}>
          <h2 style={{ marginBottom: "1rem" }}>Ödül Kullan</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Ücretsiz kahve hakkınızı kullanmak için kasiyere barkod gösterin.</p>
          
          {mode !== "GENERATE" ? (
            <button 
              className="btn-primary" 
              style={{ background: wallet?.rewards && wallet.rewards > 0 ? "var(--success)" : "var(--border-color)", cursor: wallet?.rewards && wallet.rewards > 0 ? "pointer" : "not-allowed" }}
              onClick={handleGenerateRedeemQR}
              disabled={!wallet?.rewards || wallet.rewards < 1}
            >
              {wallet?.rewards && wallet.rewards > 0 ? "Kahvemi Al (QR Kod Oluştur)" : "Yetersiz Bakiye"}
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ padding: "1rem", background: "white", borderRadius: "1rem" }}>
                {redeemToken && <QRCodeSVG value={redeemToken} size={200} />}
              </div>
              <p style={{ color: "var(--success)", fontWeight: "bold" }}>Kasiyerden bu kodu okutmasını isteyin.</p>
              <button className="btn-secondary" onClick={() => { setMode("IDLE"); setRedeemToken(null); fetchWallet(); }}>Kapat</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
