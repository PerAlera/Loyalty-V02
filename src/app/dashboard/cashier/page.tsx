"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";

export default function CashierDashboard() {
  const { data: session } = useSession();
  
  const [token, setToken] = useState<string | null>(null);
  const [beans, setBeans] = useState<number>(1);
  const [productType, setProductType] = useState<"COFFEE" | "FOOD">("COFFEE");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  const generateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cashier/qr/generate", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beans, productType })
      });
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.token);
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Bir hata oluştu", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <div className="dashboard-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>Kasiyer Paneli</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", color: "var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "bold" }}>
            Çıkış
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem", background: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)", color: message.type === "error" ? "var(--danger)" : "var(--success)" }}>
          {message.text}
        </div>
      )}

      <div className="surface-card" style={{ textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>Müşteriye Puan Ver</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Müşteriye vermek istediğiniz puan türünü ve adedini seçin.</p>

        {token ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ padding: "1rem", background: "white", borderRadius: "1rem", border: "1px solid var(--border-color)", position: "relative" }}>
              <QRCodeSVG value={token} size={250} />
              <div style={{ position: "absolute", top: -15, right: -15, background: productType === "COFFEE" ? "var(--primary)" : "#F59E0B", color: "white", padding: "0.5rem", borderRadius: "50%", fontWeight: "bold", fontSize: "1.2rem", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {beans}
              </div>
            </div>
            <p style={{ color: "var(--text-secondary)", fontWeight: "bold", fontSize: "1.1rem" }}>
              {productType === "COFFEE" ? "Kahve Puanı" : "Yemek Puanı"}
            </p>
            <p style={{ color: "var(--text-secondary)" }}>Lütfen müşterinin bu kodu okutmasını bekleyin.</p>
            <button className="btn-secondary" onClick={() => setToken(null)} style={{ width: "100%" }}>Yeni Kod Oluştur</button>
          </div>
        ) : (
          <form onSubmit={generateToken} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div style={{ display: "flex", background: "var(--bg-primary)", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              <button
                type="button"
                onClick={() => setProductType("COFFEE")}
                style={{ flex: 1, padding: "0.75rem", border: "none", cursor: "pointer", fontWeight: "bold", background: productType === "COFFEE" ? "var(--primary)" : "transparent", color: productType === "COFFEE" ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}
              >
                ☕ Kahve
              </button>
              <button
                type="button"
                onClick={() => setProductType("FOOD")}
                style={{ flex: 1, padding: "0.75rem", border: "none", cursor: "pointer", fontWeight: "bold", background: productType === "FOOD" ? "#F59E0B" : "transparent", color: productType === "FOOD" ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}
              >
                🍔 Yemek
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
              <label style={{ fontWeight: "bold", color: "var(--text-secondary)", fontSize: "0.875rem" }}>Puan Adedi</label>
              <input 
                type="number" 
                min="1" 
                className="form-input" 
                value={beans} 
                onChange={e => setBeans(parseInt(e.target.value))} 
                required 
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "1rem", fontSize: "1.125rem", background: productType === "COFFEE" ? "var(--primary)" : "#F59E0B" }}>
              {loading ? "Oluşturuluyor..." : "QR Kod Oluştur"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
