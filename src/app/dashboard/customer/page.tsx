"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { User, Check, X, Gift } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QRCodeSVG } from "qrcode.react";

type ModalType = "NONE" | "SCAN" | "REDEEM" | "CAMPAIGNS" | "SUCCESS";

export default function CustomerHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<{ beans: number, rewards: number } | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalType, setModalType] = useState<ModalType>("NONE");
  const [successMessage, setSuccessMessage] = useState("");
  const [redeemToken, setRedeemToken] = useState<string | null>(null);

  // Polling ref
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const requiredCoffees = 8; 

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, announcementsRes] = await Promise.all([
        fetch("/api/customer/wallet"),
        fetch("/api/announcements")
      ]);
      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data.wallet);
      }
      if (announcementsRes.ok) {
        const data = await announcementsRes.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Modal helpers
  const openModal = (type: ModalType) => setModalType(type);
  const closeModal = () => {
    setModalType("NONE");
    setRedeemToken(null);
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setModalType("SUCCESS");
    setTimeout(() => {
      closeModal();
    }, 2500);
  };

  // --- SCAN (QR Okut Kazan) Logic ---
  const handleScan = async (scannedData: string) => {
    setModalType("NONE"); 
    try {
      const res = await fetch("/api/customer/qr/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: scannedData })
      });
      const data = await res.json();
      if (res.ok) {
        setWallet({ beans: data.newBeans, rewards: data.newRewards });
        showSuccess("Puan Başarıyla Eklendi!");
      } else {
        alert(data.error || "Hata oluştu.");
      }
    } catch (err) {
      alert("Okuma başarısız");
    }
  };

  // --- REDEEM (Ödül Kullan) Logic ---
  const handleOpenRedeem = async () => {
    if (!wallet?.rewards || wallet.rewards < 1) return;
    
    try {
      const res = await fetch("/api/customer/qr/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setRedeemToken(data.token);
        openModal("REDEEM");
        startPollingForRedeem();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Bir hata oluştu");
    }
  };

  const startPollingForRedeem = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch("/api/customer/wallet");
        if (res.ok) {
          const data = await res.json();
          setWallet((prev) => {
            if (prev && data.wallet.rewards < prev.rewards) {
              if (pollInterval.current) clearInterval(pollInterval.current);
              showSuccess("Ödülünüz Başarıyla Kullanıldı! Afiyet Olsun ☕");
            }
            return data.wallet;
          });
        }
      } catch (err) {}
    }, 3000);
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  const currentBeans = wallet?.beans || 0;
  const progress = Math.min(currentBeans, requiredCoffees);
  const hasReward = wallet?.rewards !== undefined && wallet.rewards > 0;

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      padding: "2rem 1.5rem",
      backgroundColor: "var(--bg-primary)",
      position: "relative"
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

      {/* Başlık ve İllüstrasyon */}
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

        {/* Kahve Bardağı İllüstrasyonu */}
        <div style={{ 
          width: "150px", 
          height: "200px", 
          position: "relative", 
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            width: "120px",
            height: "160px",
            backgroundColor: "#E6D5C3",
            border: "4px solid #000",
            borderRadius: "10px 10px 40px 40px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
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
              <div style={{ color: "#EF4444", fontSize: "1.5rem" }}>❤️</div>
            </div>
          </div>
        </div>

        {/* DEV HEDİYE KUPONU veya İLERLEME ÇUBUĞU */}
        {hasReward ? (
          <div style={{
            width: "100%",
            padding: "1.5rem",
            marginBottom: "4rem",
            backgroundColor: "#F59E0B", // Altın rengi
            borderRadius: "1rem",
            border: "2px solid #B45309",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 10px 25px rgba(245, 158, 11, 0.4)",
            animation: "pulseGlow 2s infinite"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: "bold", opacity: 0.9 }}>Tebrikler!</span>
              <span style={{ fontSize: "1.25rem", fontWeight: "bold", fontFamily: "var(--font-caveat)", letterSpacing: "1px" }}>
                1 Ücretsiz Kahveniz Hazır ☕
              </span>
            </div>
            <Gift size={40} color="white" />
          </div>
        ) : (
          <div style={{ width: "100%", padding: "0 1rem", marginBottom: "4rem" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              position: "relative",
              alignItems: "center"
            }}>
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
        )}

        {/* Butonlar */}
        <div style={{ width: "100%", maxWidth: "300px", display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <button 
            className="btn-primary" 
            onClick={() => openModal("SCAN")}
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
              onClick={handleOpenRedeem}
              style={{ 
                fontSize: "0.875rem", 
                padding: "1rem 0",
                opacity: hasReward ? 1 : 0.5,
                backgroundColor: hasReward ? "#F59E0B" : "transparent",
                color: hasReward ? "white" : "var(--primary)",
                borderColor: hasReward ? "#B45309" : "var(--primary)",
                boxShadow: hasReward ? "0 0 15px rgba(245, 158, 11, 0.6)" : "none",
                cursor: hasReward ? "pointer" : "not-allowed",
                fontWeight: hasReward ? "bold" : "normal"
              }}
              disabled={!hasReward}
            >
              Ödül Kullan
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => openModal("CAMPAIGNS")}
              style={{ fontSize: "0.875rem", padding: "1rem 0" }}
            >
              Kampanyalar
            </button>
          </div>
          
        </div>
      </div>

      {/* MODAL (Pop-up) YAPI */}
      {modalType !== "NONE" && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(5px)",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          
          <div className="fade-in" style={{
            width: "calc(100% - 100px)",
            maxWidth: "400px",
            backgroundColor: "white",
            border: "2px solid #000",
            borderRadius: "2rem",
            padding: "2rem 1.5rem",
            position: "relative",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}>
            
            {modalType !== "SUCCESS" && (
              <button onClick={closeModal} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer" }}>
                <X size={24} color="#000" />
              </button>
            )}

            {modalType === "SCAN" && (
              <>
                <h2 className="font-caveat" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Barkod Okut</h2>
                <div style={{ width: "100%", borderRadius: "1rem", overflow: "hidden", border: "2px solid var(--primary)" }}>
                  <Scanner onScan={(result) => handleScan(result[0].rawValue)} />
                </div>
                <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Kasiyerin gösterdiği kodu taratın.
                </p>
              </>
            )}

            {modalType === "REDEEM" && (
              <>
                <h2 className="font-caveat" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Ödül Kodunuz</h2>
                <div style={{ padding: "1rem", background: "white", borderRadius: "1rem", border: "2px solid var(--primary)" }}>
                  {redeemToken && <QRCodeSVG value={redeemToken} size={180} />}
                </div>
                <p style={{ marginTop: "1.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Bu kodu kasiyere gösterin. Kod okunduğunda bu ekran otomatik kapanacaktır.
                </p>
              </>
            )}

            {modalType === "CAMPAIGNS" && (
              <>
                <h2 className="font-caveat" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Kampanyalar</h2>
                {announcements.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxHeight: "300px", overflowY: "auto" }}>
                    {announcements.map((ann) => (
                      <div key={ann.id} style={{ padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "1rem", textAlign: "left" }}>
                        <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{ann.title}</h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{ann.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-secondary)" }}>Şu an aktif kampanya bulunmuyor.</p>
                )}
              </>
            )}

            {modalType === "SUCCESS" && (
              <>
                <div style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  backgroundColor: "var(--success)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  marginBottom: "1.5rem", animation: "fadeIn 0.5s ease-out"
                }}>
                  <Check size={40} color="white" strokeWidth={4} />
                </div>
                <h2 className="font-caveat" style={{ fontSize: "2rem", color: "var(--success)", lineHeight: 1.2 }}>
                  {successMessage}
                </h2>
              </>
            )}

          </div>
        </div>
      )}

      {/* Global animasyonlar */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); transform: scale(1); }
          50% { box-shadow: 0 0 20px 10px rgba(245, 158, 11, 0); transform: scale(1.02); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); transform: scale(1); }
        }
      `}} />
    </div>
  );
}
