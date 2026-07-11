"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Coffee, Check, Circle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<{ beans: number, rewards: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Tasarıma göre 8 kahve gereksinimi var gibi duruyor, şimdilik sabit veya API'dan
  const requiredCoffees = 8; 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  const currentBeans = wallet?.beans || 0;
  const progress = Math.min(currentBeans, requiredCoffees);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      padding: "2rem 1.5rem",
      backgroundColor: "var(--bg-primary)"
    }}>
      
      {/* Üst Bar: Logo ve Profil */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div style={{ 
          fontFamily: "var(--font-caveat)", 
          fontSize: "2rem", 
          fontWeight: "bold",
          border: "2px solid var(--primary)",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          lineHeight: 1,
          color: "var(--primary)"
        }}>
          Jay's<br/><span style={{fontSize: "1rem"}}>Cafe</span>
        </div>
        <Link href="/dashboard/customer/profile" style={{ color: "var(--text-primary)" }}>
          <User size={32} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Başlık ve Kahve İllüstrasyonu */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h1 className="font-caveat" style={{ 
          fontSize: "3rem", 
          textAlign: "center", 
          lineHeight: 1.1, 
          marginBottom: "2rem",
          color: "var(--text-primary)"
        }}>
          Hoş Geldin<br/>{session?.user?.name}
        </h1>

        {/* Kahve Bardağı (İllüstrasyon yer tutucu) */}
        <div style={{ 
          width: "150px", 
          height: "200px", 
          position: "relative", 
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {/* Basit CSS Kahve Bardağı Çizimi */}
          <div style={{
            width: "120px",
            height: "160px",
            backgroundColor: "#E6D5C3", // Bardak rengi
            border: "4px solid #000",
            borderRadius: "10px 10px 40px 40px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            {/* Kapak */}
            <div style={{
              width: "140px",
              height: "20px",
              backgroundColor: "#8C715A",
              border: "4px solid #000",
              borderRadius: "10px",
              position: "absolute",
              top: "-20px"
            }}></div>
            <div style={{
              width: "120px",
              height: "10px",
              backgroundColor: "#8C715A",
              border: "4px solid #000",
              borderBottom: "none",
              borderRadius: "10px 10px 0 0",
              position: "absolute",
              top: "-30px"
            }}></div>
            {/* Etiket */}
            <div style={{
              width: "100%",
              height: "60px",
              backgroundColor: "#C29B73",
              borderTop: "4px solid #000",
              borderBottom: "4px solid #000",
              marginTop: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              {/* Kalp */}
              <div style={{ color: "#EF4444", fontSize: "1.5rem" }}>❤️</div>
            </div>
          </div>
        </div>

        {/* İlerleme Çubuğu (Progress Bar) */}
        <div style={{ width: "100%", padding: "0 1rem", marginBottom: "4rem" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            position: "relative",
            alignItems: "center"
          }}>
            {/* Arka plan çizgisi */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "0",
              right: "0",
              height: "2px",
              backgroundColor: "#000",
              zIndex: 0,
              transform: "translateY(-50%)"
            }}></div>

            {/* Adımlar */}
            {Array.from({ length: requiredCoffees }).map((_, i) => (
              <div key={i} style={{ 
                zIndex: 1, 
                backgroundColor: "var(--bg-primary)",
                padding: "2px"
              }}>
                {i < progress ? (
                  <div style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: "#000",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <Check size={10} color="white" strokeWidth={4} />
                  </div>
                ) : (
                  <div style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: "white",
                    border: "2px solid #000",
                    borderRadius: "50%"
                  }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Butonlar */}
        <div style={{ width: "100%", maxWidth: "300px", display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <button 
            className="btn-primary" 
            onClick={() => router.push("/dashboard/customer/qr")}
            style={{ 
              padding: "1.25rem", 
              fontSize: "1.25rem", 
              boxShadow: "0 4px 14px rgba(101, 67, 33, 0.4)",
              lineHeight: 1.2
            }}
          >
            Qr Okut<br/>Kazan
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <button 
              className="btn-secondary" 
              onClick={() => router.push("/dashboard/customer/qr?mode=redeem")}
              style={{ fontSize: "0.875rem", padding: "1rem 0" }}
            >
              Ödül Kullan
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => router.push("/dashboard/customer/history")}
              style={{ fontSize: "0.875rem", padding: "1rem 0" }}
            >
              Kampanyalar
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
