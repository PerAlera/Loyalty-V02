"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { User, Check, X, Gift, Coffee } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QRCodeSVG } from "qrcode.react";

type ModalType = "NONE" | "SCAN" | "REDEEM" | "CAMPAIGNS" | "SUCCESS";

export default function CustomerHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<{ beans: number, rewards: number, foodPoints: number, foodRewards: number } | null>(null);
  const [requiredCoffees, setRequiredCoffees] = useState(10);
  const [requiredFoods, setRequiredFoods] = useState(10);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalType, setModalType] = useState<ModalType>("NONE");
  const [successMessage, setSuccessMessage] = useState("");
  const [redeemToken, setRedeemToken] = useState<string | null>(null);
  const [redeemType, setRedeemType] = useState<"COFFEE" | "FOOD" | null>(null);
  const [rotation, setRotation] = useState(0);

  // Polling ref
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

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
        if (data.requiredCoffees) setRequiredCoffees(data.requiredCoffees);
        if (data.requiredFoods) setRequiredFoods(data.requiredFoods);
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
    setRedeemType(null);
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
        setWallet({ 
          beans: data.newBeans, 
          rewards: data.newRewards,
          foodPoints: data.newFoodPoints,
          foodRewards: data.newFoodRewards
        });
        showSuccess(data.message || "Puan Başarıyla Eklendi!");
      } else {
        alert(data.error || "Hata oluştu.");
      }
    } catch (err) {
      alert("Okuma başarısız");
    }
  };

  // --- REDEEM (Ödül Kullan) Logic ---
  const handleOpenRedeem = async (type: "COFFEE" | "FOOD") => {
    if (type === "COFFEE" && (!wallet?.rewards || wallet.rewards < 1)) return;
    if (type === "FOOD" && (!wallet?.foodRewards || wallet.foodRewards < 1)) return;
    
    try {
      const res = await fetch("/api/customer/qr/generate", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: type })
      });
      const data = await res.json();
      if (res.ok) {
        setRedeemToken(data.token);
        setRedeemType(type);
        openModal("REDEEM");
        startPollingForRedeem(type);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Bir hata oluştu");
    }
  };

  const startPollingForRedeem = (type: "COFFEE" | "FOOD") => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch("/api/customer/wallet");
        if (res.ok) {
          const data = await res.json();
          setWallet((prev) => {
            if (prev) {
              const currentReward = type === "COFFEE" ? data.wallet.rewards : data.wallet.foodRewards;
              const prevReward = type === "COFFEE" ? prev.rewards : prev.foodRewards;
              
              if (currentReward < prevReward) {
                if (pollInterval.current) clearInterval(pollInterval.current);
                showSuccess("Ödülünüz Başarıyla Kullanıldı! Afiyet Olsun 🎉");
              }
            }
            return data.wallet;
          });
        }
      } catch (err) {}
    }, 3000);
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  const currentBeans = wallet?.beans || 0;
  const progressCoffee = Math.min(currentBeans, requiredCoffees);
  const hasRewardCoffee = wallet?.rewards !== undefined && wallet.rewards > 0;

  const currentFood = wallet?.foodPoints || 0;
  const progressFood = Math.min(currentFood, requiredFoods);
  const hasRewardFood = wallet?.foodRewards !== undefined && wallet.foodRewards > 0;

  const renderCoffeeFace = () => (
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-start", padding: "0 0.5rem"
    }}>
      <div style={{ width: "120px", height: "160px", position: "relative", marginBottom: "2rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Image src="/kahve.svg" alt="Kahve" width={120} height={160} style={{ objectFit: "contain" }} priority />
      </div>
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "var(--text-secondary)" }}>Kahve Çekirdekleri</span>
          <span style={{ fontSize: "0.875rem", color: "var(--primary)" }}>{currentBeans} / {requiredCoffees}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", alignItems: "center" }}>
          <div style={{ position: "absolute", top: "50%", left: "0", right: "0", height: "2px", backgroundColor: "#000", zIndex: 0, transform: "translateY(-50%)" }}></div>
          {Array.from({ length: requiredCoffees }).map((_, i) => {
            const isLast = i === requiredCoffees - 1;
            return (
              <div key={i} style={{ zIndex: 1, backgroundColor: "var(--bg-primary)", padding: "2px" }}>
                {i < progressCoffee ? (
                  <div style={{ width: isLast ? "24px" : "16px", height: isLast ? "24px" : "16px", backgroundColor: isLast ? "var(--primary)" : "#000", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {isLast ? <Gift size={14} color="white" /> : <Check size={10} color="white" strokeWidth={4} />}
                  </div>
                ) : (
                  <div style={{ width: isLast ? "24px" : "16px", height: isLast ? "24px" : "16px", backgroundColor: "white", border: "2px solid #000", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {isLast && <Gift size={14} color="#000" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderFoodFace = () => (
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-start", padding: "0 0.5rem"
    }}>
      <div style={{ width: "120px", height: "160px", position: "relative", marginBottom: "2rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Image src="/yemek.svg" alt="Yemek" width={120} height={160} style={{ objectFit: "contain" }} priority />
      </div>
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "var(--text-secondary)" }}>Yemek Puanları</span>
          <span style={{ fontSize: "0.875rem", color: "#F59E0B" }}>{currentFood} / {requiredFoods}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", alignItems: "center" }}>
          <div style={{ position: "absolute", top: "50%", left: "0", right: "0", height: "2px", backgroundColor: "#000", zIndex: 0, transform: "translateY(-50%)" }}></div>
          {Array.from({ length: requiredFoods }).map((_, i) => {
            const isLast = i === requiredFoods - 1;
            return (
              <div key={i} style={{ zIndex: 1, backgroundColor: "var(--bg-primary)", padding: "2px" }}>
                {i < progressFood ? (
                  <div style={{ width: isLast ? "24px" : "16px", height: isLast ? "24px" : "16px", backgroundColor: isLast ? "#F59E0B" : "#000", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {isLast ? <Gift size={14} color="white" /> : <Check size={10} color="white" strokeWidth={4} />}
                  </div>
                ) : (
                  <div style={{ width: isLast ? "24px" : "16px", height: isLast ? "24px" : "16px", backgroundColor: "white", border: "2px solid #000", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {isLast && <Gift size={14} color="#000" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: "100dvh", 
      display: "flex", 
      flexDirection: "column",
      padding: "1.5rem 1rem", 
      backgroundColor: "var(--bg-primary)",
      position: "relative",
      overflowX: "hidden",
      overflowY: "auto"
    }}>
      
      {/* Üst Bar: Logo ve Profil */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ 
          fontFamily: "var(--font-caveat)", 
          fontSize: "1.5rem", 
          fontWeight: "bold",
          border: "2px solid var(--primary)",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          lineHeight: 1,
          color: "var(--primary)"
        }}>
          Jay's<br/><span style={{fontSize: "0.75rem"}}>Cafe</span>
        </div>
        <Link href="/dashboard/customer/profile" style={{ color: "var(--text-primary)" }}>
          <User size={28} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Başlık ve İllüstrasyon */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h1 className="font-caveat" style={{ 
          fontSize: "2.5rem", 
          textAlign: "center", 
          lineHeight: 1.1, 
          marginBottom: "1rem", // Reduced margin
          color: "var(--text-primary)"
        }}>
          Hoş Geldin<br/>{session?.user?.name}
        </h1>

        {/* 3D KÜP (SONSUZ DÖNGÜ) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "340px", margin: "0 auto 2rem auto", gap: "0.5rem" }}>
          <button onClick={() => setRotation(r => r + 90)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}>
            <span style={{ fontSize: "2rem", color: "var(--primary)" }}>{"<"}</span>
          </button>

          <div style={{ perspective: "1000px", width: "240px", height: "340px", position: "relative" }}>
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              transformStyle: "preserve-3d",
              transform: `translateZ(-120px) rotateY(${rotation}deg)`
            }}>
              {/* Ön Yüz (0 deg) - Kahve */}
              <div style={{ position: "absolute", width: "240px", height: "340px", backfaceVisibility: "hidden", transform: "rotateY(0deg) translateZ(120px)", backgroundColor: "var(--bg-primary)" }}>
                {renderCoffeeFace()}
              </div>
              {/* Sağ Yüz (90 deg) - Yemek */}
              <div style={{ position: "absolute", width: "240px", height: "340px", backfaceVisibility: "hidden", transform: "rotateY(90deg) translateZ(120px)", backgroundColor: "var(--bg-primary)" }}>
                {renderFoodFace()}
              </div>
              {/* Arka Yüz (180 deg) - Kahve */}
              <div style={{ position: "absolute", width: "240px", height: "340px", backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(120px)", backgroundColor: "var(--bg-primary)" }}>
                {renderCoffeeFace()}
              </div>
              {/* Sol Yüz (-90 deg) - Yemek */}
              <div style={{ position: "absolute", width: "240px", height: "340px", backfaceVisibility: "hidden", transform: "rotateY(-90deg) translateZ(120px)", backgroundColor: "var(--bg-primary)" }}>
                {renderFoodFace()}
              </div>
            </div>
          </div>

          <button onClick={() => setRotation(r => r - 90)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}>
            <span style={{ fontSize: "2rem", color: "var(--primary)" }}>{">"}</span>
          </button>
        </div>

        {/* Butonlar */}
        <div style={{ width: "100%", maxWidth: "300px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <button 
            className="btn-primary" 
            onClick={() => openModal("SCAN")}
            style={{ 
              padding: "1rem", 
              fontSize: "1.2rem", 
              boxShadow: "0 4px 14px rgba(101, 67, 33, 0.4)",
              lineHeight: 1.2
            }}
          >
            Qr Okut<br/>Kazan
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            
            {/* Kahve Ödül Butonu */}
            <div style={{ position: "relative", width: "100%" }}>
              {hasRewardCoffee && (
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  left: "-10px",
                  backgroundColor: "#EF4444", 
                  color: "white",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  zIndex: 10,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  animation: "bounce 2s infinite"
                }}>
                  {wallet.rewards}
                </div>
              )}
              <button 
                className="btn-secondary" 
                onClick={() => handleOpenRedeem("COFFEE")}
                style={{ 
                  width: "100%",
                  fontSize: "0.875rem", 
                  padding: "0.875rem 0",
                  opacity: hasRewardCoffee ? 1 : 0.5,
                  cursor: hasRewardCoffee ? "pointer" : "not-allowed",
                  borderColor: "var(--primary)",
                  color: "var(--primary)"
                }}
                disabled={!hasRewardCoffee}
              >
                ☕ Kahve Ödülü
              </button>
            </div>
            
            {/* Yemek Ödül Butonu */}
            <div style={{ position: "relative", width: "100%" }}>
              {hasRewardFood && (
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  left: "-10px",
                  backgroundColor: "#EF4444", 
                  color: "white",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  zIndex: 10,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  animation: "bounce 2s infinite"
                }}>
                  {wallet.foodRewards}
                </div>
              )}
              <button 
                className="btn-secondary" 
                onClick={() => handleOpenRedeem("FOOD")}
                style={{ 
                  width: "100%",
                  fontSize: "0.875rem", 
                  padding: "0.875rem 0",
                  opacity: hasRewardFood ? 1 : 0.5,
                  cursor: hasRewardFood ? "pointer" : "not-allowed",
                  borderColor: "#F59E0B",
                  color: "#F59E0B"
                }}
                disabled={!hasRewardFood}
              >
                🍔 Yemek Ödülü
              </button>
            </div>
            
          </div>
          
          <button 
            className="btn-secondary" 
            onClick={() => openModal("CAMPAIGNS")}
            style={{ fontSize: "0.875rem", padding: "0.875rem 0", width: "100%" }}
          >
            Kampanyalar
          </button>
          
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
            width: "calc(100% - 60px)",
            maxWidth: "350px",
            backgroundColor: "white",
            border: "2px solid #000",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            position: "relative",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}>
            
            {modalType !== "SUCCESS" && (
              <button onClick={closeModal} style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "none", border: "none", cursor: "pointer" }}>
                <X size={24} color="#000" />
              </button>
            )}

            {modalType === "SCAN" && (
              <>
                <h2 className="font-caveat" style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Barkod Okut</h2>
                <div style={{ width: "100%", borderRadius: "1rem", overflow: "hidden", border: "2px solid var(--primary)" }}>
                  <Scanner onScan={(result) => handleScan(result[0].rawValue)} />
                </div>
                <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  Kasiyerin gösterdiği kodu taratın.
                </p>
              </>
            )}

            {modalType === "REDEEM" && (
              <>
                <h2 className="font-caveat" style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Ödül Kodunuz</h2>
                <div style={{ padding: "1rem", background: "white", borderRadius: "1rem", border: "2px solid var(--primary)" }}>
                  {redeemToken && <QRCodeSVG value={redeemToken} size={150} />}
                </div>
                <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  Bu kodu kasiyere gösterin.
                </p>
              </>
            )}

            {modalType === "CAMPAIGNS" && (
              <>
                <h2 className="font-caveat" style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Kampanyalar</h2>
                {announcements.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxHeight: "250px", overflowY: "auto" }}>
                    {announcements.map((ann) => (
                      <div key={ann.id} style={{ padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "0.75rem", textAlign: "left" }}>
                        <h3 style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>{ann.title}</h3>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{ann.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Şu an aktif kampanya bulunmuyor.</p>
                )}
              </>
            )}

            {modalType === "SUCCESS" && (
              <>
                <div style={{
                  width: "60px", height: "60px", borderRadius: "50%",
                  backgroundColor: "var(--success)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  marginBottom: "1rem", animation: "fadeIn 0.5s ease-out"
                }}>
                  <Check size={32} color="white" strokeWidth={4} />
                </div>
                <h2 className="font-caveat" style={{ fontSize: "1.8rem", color: "var(--success)", lineHeight: 1.2 }}>
                  {successMessage}
                </h2>
              </>
            )}

          </div>
        </div>
      )}

      {/* Global animasyonlar */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}} />
    </div>
  );
}
