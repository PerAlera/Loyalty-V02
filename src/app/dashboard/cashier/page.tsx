"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";

export default function CashierDashboard() {
  const { data: session } = useSession();
  
  const [token, setToken] = useState<string | null>(null);
  
  // State for Combined QR
  const [coffeeEnabled, setCoffeeEnabled] = useState(true);
  const [foodEnabled, setFoodEnabled] = useState(false);
  const [coffeeBeans, setCoffeeBeans] = useState<number>(1);
  const [foodPoints, setFoodPoints] = useState<number>(1);
  
  const [isStoreFoodEnabled, setIsStoreFoodEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    // Fetch store settings to see if food is enabled
    fetch("/api/cashier/settings")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.isFoodEnabled === "boolean") {
          setIsStoreFoodEnabled(data.isFoodEnabled);
        }
      })
      .catch(err => console.error("Settings fetch error:", err));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (token) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/cashier/qr/check?token=${token}`);
          if (res.ok) {
            const data = await res.json();
            if (data.isUsed) {
              setToken(null);
              setMessage({ text: "İşlem Başarılı! Müşteri QR Kodu Okuttu.", type: "success" });
            }
          }
        } catch (error) {
          console.error("QR Check Error", error);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token]);

  const generateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coffeeEnabled && !foodEnabled) {
      setMessage({ text: "Lütfen en az bir puan türü seçin.", type: "error" });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      const productType = coffeeEnabled && foodEnabled ? "BOTH" : foodEnabled ? "FOOD" : "COFFEE";
      const payload: any = { productType };
      if (coffeeEnabled) payload.beans = coffeeBeans;
      if (foodEnabled) payload.foodPoints = foodPoints;
      
      const res = await fetch("/api/cashier/qr/generate", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Müşteriye vermek istediğiniz puan türlerini seçin ve adetlerini belirleyin.</p>

        {token ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ padding: "1rem", background: "white", borderRadius: "1rem", border: "1px solid var(--border-color)", position: "relative" }}>
              <QRCodeSVG value={token} size={250} />
            </div>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              {coffeeEnabled && (
                <div style={{ background: "var(--primary)", color: "white", padding: "0.5rem 1rem", borderRadius: "2rem", fontWeight: "bold", fontSize: "1rem" }}>
                  ☕ {coffeeBeans} Kahve
                </div>
              )}
              {foodEnabled && (
                <div style={{ background: "#F59E0B", color: "white", padding: "0.5rem 1rem", borderRadius: "2rem", fontWeight: "bold", fontSize: "1rem" }}>
                  🍔 {foodPoints} Yemek
                </div>
              )}
            </div>
            <p style={{ color: "var(--text-secondary)" }}>Lütfen müşterinin bu kodu okutmasını bekleyin.</p>
            <button className="btn-secondary" onClick={() => setToken(null)} style={{ width: "100%" }}>Yeni Kod Oluştur</button>
          </div>
        ) : (
          <form onSubmit={generateToken} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Coffee Checkbox & Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", border: coffeeEnabled ? "2px solid var(--primary)" : "1px solid var(--border-color)", borderRadius: "0.75rem", background: coffeeEnabled ? "rgba(101, 67, 33, 0.05)" : "transparent", transition: "all 0.2s" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                <input type="checkbox" checked={coffeeEnabled} onChange={(e) => setCoffeeEnabled(e.target.checked)} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
                <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: coffeeEnabled ? "var(--primary)" : "var(--text-secondary)" }}>☕ Kahve Puanı</span>
              </label>
              {coffeeEnabled && (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <label style={{ flex: 1, textAlign: "left", color: "var(--text-secondary)", fontSize: "0.875rem" }}>Adet:</label>
                  <input type="number" min="1" className="form-input" style={{ width: "80px", textAlign: "center" }} value={coffeeBeans} onChange={e => setCoffeeBeans(parseInt(e.target.value))} required />
                </div>
              )}
            </div>

            {/* Food Checkbox & Input */}
            {isStoreFoodEnabled && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", border: foodEnabled ? "2px solid #F59E0B" : "1px solid var(--border-color)", borderRadius: "0.75rem", background: foodEnabled ? "rgba(245, 158, 11, 0.05)" : "transparent", transition: "all 0.2s" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={foodEnabled} onChange={(e) => setFoodEnabled(e.target.checked)} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
                  <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: foodEnabled ? "#F59E0B" : "var(--text-secondary)" }}>🍔 Yemek Puanı</span>
                </label>
                {foodEnabled && (
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <label style={{ flex: 1, textAlign: "left", color: "var(--text-secondary)", fontSize: "0.875rem" }}>Adet:</label>
                    <input type="number" min="1" className="form-input" style={{ width: "80px", textAlign: "center" }} value={foodPoints} onChange={e => setFoodPoints(parseInt(e.target.value))} required />
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "1rem", fontSize: "1.125rem", background: coffeeEnabled && !foodEnabled ? "var(--primary)" : foodEnabled && !coffeeEnabled ? "#F59E0B" : "#111827" }}>
              {loading ? "Oluşturuluyor..." : "QR Kod Oluştur"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
