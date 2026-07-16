"use client";

import { useEffect, useState } from "react";
import { Settings, Save, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function OwnerSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [newSettings, setNewSettings] = useState({ requiredCoffees: 10, requiredFoods: 10, profileRewardEnabled: false, profileRewardAmount: 1 });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/owner/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setNewSettings({ 
          requiredCoffees: data.settings.requiredCoffees,
          requiredFoods: data.settings.requiredFoods || 10,
          profileRewardEnabled: data.settings.profileRewardEnabled || false,
          profileRewardAmount: data.settings.profileRewardAmount || 1
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/owner/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings)
    });
    if (res.ok) {
      alert("Ayarlar başarıyla kaydedildi.");
      fetchData();
    } else {
      alert("Hata oluştu.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Yeni şifreler eşleşmiyor!");
      return;
    }
    const res = await fetch("/api/owner/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      alert(data.error || "Hata oluştu.");
    }
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Settings color="var(--primary)" /> Mağaza Ayarları
      </h1>

      <div className="surface-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Sadakat Programı Ayarları</h2>
        <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div className="form-group">
            <label className="form-label">Ücretsiz Kahve İçin Gereken Çekirdek Sayısı</label>
            <input 
              type="number" 
              min="1" 
              max="50"
              className="form-input" 
              value={newSettings.requiredCoffees} 
              onChange={e => setNewSettings({ ...newSettings, requiredCoffees: parseInt(e.target.value) })}
              required 
            />
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Müşteriler, belirlediğiniz adette çekirdek topladığında 1 adet ücretsiz kahve kazanır. (Mevcut: {settings?.requiredCoffees})
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Ücretsiz Yemek İçin Gereken Puan Sayısı</label>
            <input 
              type="number" 
              min="1" 
              max="50"
              className="form-input" 
              value={newSettings.requiredFoods} 
              onChange={e => setNewSettings({ ...newSettings, requiredFoods: parseInt(e.target.value) })}
              required 
            />
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Müşteriler, belirlediğiniz adette yemek puanı topladığında 1 adet ücretsiz yemek ödülü kazanır. (Mevcut: {settings?.requiredFoods || 10})
            </p>
          </div>

          <hr style={{ borderColor: "var(--border-color)", margin: "1rem 0" }} />

          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <input 
              type="checkbox" 
              checked={newSettings.profileRewardEnabled}
              onChange={e => setNewSettings({ ...newSettings, profileRewardEnabled: e.target.checked })}
              style={{ width: "20px", height: "20px" }}
            />
            <label className="form-label" style={{ marginBottom: 0 }}>Profil Tamamlama Ödülü Aktif</label>
          </div>
          
          {newSettings.profileRewardEnabled && (
            <div className="form-group">
              <label className="form-label">Verilecek Kahve Çekirdeği Miktarı</label>
              <input 
                type="number" 
                min="1" 
                max="10"
                className="form-input" 
                value={newSettings.profileRewardAmount} 
                onChange={e => setNewSettings({ ...newSettings, profileRewardAmount: parseInt(e.target.value) })}
                required 
              />
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                Müşteri profilini (Cinsiyet, Doğum Tarihi) doldurduğunda kazanacağı hediye çekirdek sayısı.
              </p>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
            <Save size={20} /> Ayarları Kaydet
          </button>
        </form>
      </div>

      <div className="surface-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Şifre Değiştir</h2>
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Mevcut Şifreniz</label>
            <input 
              type="password" 
              className="form-input" 
              value={passwords.currentPassword} 
              onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Yeni Şifreniz</label>
            <input 
              type="password" 
              className="form-input" 
              value={passwords.newPassword} 
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
              required 
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Yeni Şifreniz (Tekrar)</label>
            <input 
              type="password" 
              className="form-input" 
              value={passwords.confirmPassword} 
              onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required 
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-secondary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", width: "100%" }}>
            <Save size={20} /> Şifreyi Güncelle
          </button>
        </form>
      </div>

      <div className="surface-card" style={{ borderLeft: "4px solid var(--danger)" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", color: "var(--danger)" }}>Hesap İşlemleri</h2>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })} 
          className="btn-secondary" 
          style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", borderColor: "var(--danger)", color: "var(--danger)" }}
        >
          <LogOut size={20} /> Çıkış Yap
        </button>
      </div>
    </div>
  );
}
