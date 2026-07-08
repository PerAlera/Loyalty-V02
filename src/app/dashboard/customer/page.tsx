"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Coffee, ChevronRight, Gift } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<{ beans: number, rewards: number } | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Patron ayarlarından gelecek, şimdilik varsayılan 10
  const requiredCoffees = 10; 

  useEffect(() => {
    fetchData();
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

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  const currentBeans = wallet?.beans || 0;
  const progress = Math.min(currentBeans, requiredCoffees);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Merhaba</div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: 0 }}>{session?.user?.name} 👋</h1>
        </div>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--surface-shadow)" }}>
          <Bell size={20} color="var(--text-primary)" />
        </div>
      </div>

      {/* Loyalty Card (Mor Tasarım) */}
      <div style={{ 
        background: "linear-gradient(135deg, var(--secondary) 0%, var(--secondary-hover) 100%)",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        color: "white",
        marginBottom: "2rem",
        boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Coffee House</h2>
            <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>Sadakat Kartı</div>
          </div>
          <Coffee size={24} opacity={0.8} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
            {progress} <span style={{ fontSize: "1rem", opacity: 0.8, fontWeight: "normal" }}>/ {requiredCoffees}</span>
          </div>
          {wallet?.rewards && wallet.rewards > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "white", color: "var(--secondary)", padding: "0.25rem 0.75rem", borderRadius: "1rem", fontSize: "0.875rem", fontWeight: "bold" }}>
              <Gift size={16} /> {wallet.rewards} Ödül
            </div>
          ) : null}
        </div>

        {/* Cup Progress Icons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ opacity: i < (progress / 2) ? 1 : 0.3 }}>
              <Coffee size={24} fill={i < (progress / 2) ? "white" : "none"} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => router.push("/dashboard/customer/qr")}
          style={{ 
            width: "100%", 
            padding: "0.875rem", 
            backgroundColor: "white", 
            color: "var(--secondary)", 
            border: "none", 
            borderRadius: "0.75rem",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer"
          }}
        >
          {wallet?.rewards && wallet.rewards > 0 ? "Ödül Kullan (QR)" : "Puan Kazan (QR Okut)"}
        </button>
      </div>

      {/* Yakındaki Kampanyalar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.125rem", margin: 0 }}>Güncel Kampanyalar</h2>
      </div>
      
      {announcements.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
          {announcements.map((ann) => (
            <div key={ann.id} className="surface-card" style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "0.75rem", backgroundColor: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Coffee size={24} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{ann.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ann.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Şu an aktif kampanya bulunmuyor.</p>
      )}

      {/* Son Ziyaretler (Kısa) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.125rem", margin: 0 }}>Hızlı Geçmiş</h2>
        <Link href="/dashboard/customer/history" style={{ fontSize: "0.875rem", color: "var(--primary)", display: "flex", alignItems: "center" }}>
          Tümünü Gör <ChevronRight size={16} />
        </Link>
      </div>
      <div className="surface-card" style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Coffee size={20} color="var(--text-primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Cüzdan Durumu</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Toplam Puanınız</div>
            </div>
          </div>
          <div style={{ fontWeight: "bold", color: "var(--success)" }}>+{wallet?.beans || 0} Puan</div>
        </div>
      </div>

    </div>
  );
}
