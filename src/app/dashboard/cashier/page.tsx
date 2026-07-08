"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function CashierDashboard() {
  const { data: session } = useSession();
  const [beans, setBeans] = useState<number>(1);
  const [earnToken, setEarnToken] = useState<string | null>(null);
  
  const [mode, setMode] = useState<"IDLE" | "GENERATE" | "SCAN">("IDLE");
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch("/api/cashier/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beans })
      });
      const data = await res.json();
      if (res.ok) {
        setEarnToken(data.token);
        setMode("GENERATE");
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Bir hata oluştu", type: "error" });
    }
  };

  const handleScan = async (scannedData: string) => {
    // Kamerayı durdur
    setMode("IDLE");
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
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--text-primary)" }}>Kasiyer Paneli</h1>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* Kahve Ekleme (QR Üretme) */}
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "1rem" }}>Kahve (Puan) Ver</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Müşteriye vermek istediğiniz kahve adedini girin ve QR oluşturun.</p>
          
          {mode !== "GENERATE" ? (
            <form onSubmit={handleGenerateQR} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input 
                type="number" 
                min="1" 
                className="form-input" 
                value={beans} 
                onChange={e => setBeans(parseInt(e.target.value))} 
                required 
              />
              <button type="submit" className="btn-primary">Müşteri İçin QR Kod Oluştur</button>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ padding: "1rem", background: "white", borderRadius: "1rem" }}>
                {earnToken && <QRCodeSVG value={earnToken} size={200} />}
              </div>
              <p style={{ color: "var(--accent-color)", fontWeight: "bold" }}>Müşteriden bu kodu okutmasını isteyin.</p>
              <button className="btn-secondary" onClick={() => { setMode("IDLE"); setEarnToken(null); }}>İptal / Yeni İşlem</button>
            </div>
          )}
        </div>

        {/* Ödül Onaylama (Kamera ile QR Okuma) */}
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "1rem" }}>Ödül Doğrula</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Müşterinin ücretsiz kahve barkodunu kamerayla okutun.</p>
          
          {mode !== "SCAN" ? (
            <button className="btn-primary" onClick={() => setMode("SCAN")}>Kamerayı Aç ve Barkod Okut</button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "100%", maxWidth: "300px", borderRadius: "1rem", overflow: "hidden" }}>
                <Scanner 
                  onScan={(result) => handleScan(result[0].rawValue)}
                />
              </div>
              <button className="btn-secondary" onClick={() => setMode("IDLE")}>Kamerayı Kapat</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
