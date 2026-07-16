"use client";

import { signOut, useSession } from "next-auth/react";
import { User, HelpCircle, History as HistoryIcon, UserCog, X, Calendar, Edit3, Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [wallet, setWallet] = useState<{ beans: number } | null>(null);
  const [profileData, setProfileData] = useState<{ name: string, surname: string, phone: string, birthDate: string | null, gender: string | null, email: string | null, profileRewardClaimed: boolean } | null>(null);
  const [rewardSettings, setRewardSettings] = useState<{ enabled: boolean, amount: number }>({ enabled: false, amount: 1 });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [modal, setModal] = useState<"NONE" | "SUPPORT" | "ACCOUNT">("NONE");

  // Edit form state
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, profileRes] = await Promise.all([
        fetch("/api/customer/wallet"),
        fetch("/api/customer/profile")
      ]);
      
      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data.wallet);
        setRewardSettings({ enabled: data.profileRewardEnabled, amount: data.profileRewardAmount });
      }
      
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfileData(data.user);
        if (data.user.birthDate) {
          // Format Date for input[type="date"] (YYYY-MM-DD)
          const d = new Date(data.user.birthDate);
          setBirthDate(d.toISOString().split('T')[0]);
        }
        if (data.user.gender) {
          setGender(data.user.gender);
        }
        if (data.user.email) {
          setEmail(data.user.email);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: birthDate || null,
          gender: gender || null,
          email: email || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.user);
        setModal("NONE");
        alert(data.message || "Profiliniz başarıyla güncellendi!");
        fetchData(); // Refresh wallet if reward granted
      } else {
        alert("Güncelleme başarısız oldu.");
      }
    } catch (err) {
      alert("Bir hata oluştu.");
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem", position: "relative" }}>
      
      {/* Geri Dön Butonu */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button 
          onClick={() => router.push("/dashboard/customer")}
          style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1rem", padding: 0 }}
        >
          <ArrowLeft size={20} />
          Ana Ekrana Dön
        </button>
      </div>

      {/* Profil Başlığı */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "var(--border-color)", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={40} color="var(--text-secondary)" />
        </div>
        <h2>{profileData?.name || session?.user?.name} {profileData?.surname || session?.user?.surname}</h2>
        <p style={{ color: "var(--text-secondary)" }}>Müşteri Hesabı</p>
      </div>

      {/* Profil Ödülü Banner */}
      {rewardSettings.enabled && profileData && !profileData.profileRewardClaimed && (
        <div style={{ backgroundColor: "rgba(217, 119, 6, 0.1)", border: "1px solid var(--primary)", borderRadius: "1rem", padding: "1rem", marginBottom: "2rem", textAlign: "center" }}>
          <h3 style={{ color: "var(--primary)", margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>Profilini Tamamla, Kazan! 🎁</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
            Doğum tarihi, cinsiyet ve e-posta bilgilerini kaydet, anında <strong>{rewardSettings.amount} Kahve Çekirdeği</strong> hediye kazan.
          </p>
        </div>
      )}

      {/* Cüzdan Özeti */}
      <div className="surface-card" style={{ marginBottom: "2rem", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", border: "2px solid var(--primary)" }}>
        <div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Toplam Puan (Çekirdek)</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)", lineHeight: 1.2 }}>{wallet?.beans || 0}</div>
        </div>
        <div style={{ padding: "0.5rem 1rem", backgroundColor: "rgba(101, 67, 33, 0.1)", color: "var(--primary)", borderRadius: "1rem", fontWeight: "bold" }}>
          Aktif
        </div>
      </div>

      {/* Menü Öğeleri */}
      <div className="surface-card" style={{ padding: "0.5rem 1.5rem" }}>
        <div onClick={() => router.push("/dashboard/customer/history")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 0", borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <HistoryIcon size={20} color="var(--primary)" />
            <span style={{ fontWeight: 500 }}>Geçmiş İşlemlerim</span>
          </div>
          <span style={{ color: "var(--text-secondary)" }}>›</span>
        </div>

        <div onClick={() => setModal("ACCOUNT")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 0", borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <UserCog size={20} color="var(--primary)" />
            <span style={{ fontWeight: 500 }}>Hesabım</span>
          </div>
          <span style={{ color: "var(--text-secondary)" }}>›</span>
        </div>

        <div onClick={() => setModal("SUPPORT")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 0", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <HelpCircle size={20} color="var(--primary)" />
            <span style={{ fontWeight: 500 }}>Destek</span>
          </div>
          <span style={{ color: "var(--text-secondary)" }}>›</span>
        </div>
      </div>

      <button className="btn-secondary" onClick={() => signOut({ callbackUrl: '/' })} style={{ width: "100%", marginTop: "2rem", color: "var(--danger)", borderColor: "var(--danger)" }}>
        Çıkış Yap
      </button>

      {/* MODALLAR */}
      {modal !== "NONE" && (
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
            
            <button onClick={() => setModal("NONE")} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer" }}>
              <X size={24} color="#000" />
            </button>

            {/* DESTEK MODALI */}
            {modal === "SUPPORT" && (
              <>
                <HelpCircle size={48} color="var(--primary)" style={{ marginBottom: "1rem" }} />
                <h2 className="font-caveat" style={{ fontSize: "2rem", marginBottom: "1rem" }}>Bize Ulaşın</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                  Soru, görüş ve önerileriniz için aşağıdaki e-posta adresinden bize ulaşabilirsiniz.
                </p>
                <div style={{ padding: "1rem", backgroundColor: "rgba(101, 67, 33, 0.1)", borderRadius: "1rem", fontWeight: "bold", color: "var(--primary)" }}>
                  iletisim@jayscafe.com
                </div>
              </>
            )}

            {/* HESABIM MODALI */}
            {modal === "ACCOUNT" && (
              <>
                <Edit3 size={32} color="var(--primary)" style={{ marginBottom: "1rem" }} />
                <h2 className="font-caveat" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Hesap Bilgilerim</h2>
                
                <div style={{ width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Ad Soyad</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-primary)", borderRadius: "0.5rem", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                      {profileData?.name} {profileData?.surname}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Telefon Numarası</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-primary)", borderRadius: "0.5rem", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                      {profileData?.phone}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500 }}>E-Posta Adresi</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@mail.com"
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "2px solid var(--primary)", outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500 }}>Doğum Tarihi</label>
                    <input 
                      type="date" 
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "2px solid var(--primary)", outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500 }}>Cinsiyet</label>
                    <select 
                      value={gender} 
                      onChange={(e) => setGender(e.target.value)}
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "2px solid var(--primary)", outline: "none", fontFamily: "inherit", backgroundColor: "white" }}
                    >
                      <option value="">Seçiniz</option>
                      <option value="MALE">Erkek</option>
                      <option value="FEMALE">Kadın</option>
                      <option value="OTHER">Belirtmek İstemiyorum</option>
                    </select>
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={handleSaveProfile} 
                    disabled={saving}
                    style={{ marginTop: "1rem", padding: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                  >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : "Kaydet"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
