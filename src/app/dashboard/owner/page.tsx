"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Yeni Kasiyer Formu
  const [newCashier, setNewCashier] = useState({ name: "", surname: "", phone: "", password: "" });
  const [newSettings, setNewSettings] = useState({ requiredCoffees: 10 });
  
  // Yeni Duyuru Formu
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, cashiersRes, settingsRes, announcementsRes] = await Promise.all([
        fetch("/api/owner/stats"),
        fetch("/api/owner/cashiers"),
        fetch("/api/owner/settings"),
        fetch("/api/announcements")
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (cashiersRes.ok) {
        const data = await cashiersRes.json();
        setCashiers(data.cashiers || []);
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings);
        setNewSettings({ requiredCoffees: data.settings.requiredCoffees });
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

  const handleAddCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/owner/cashiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCashier)
    });
    if (res.ok) {
      setNewCashier({ name: "", surname: "", phone: "", password: "" });
      fetchData();
    } else {
      const err = await res.json();
      alert(err.error || "Hata oluştu");
    }
  };

  const handleDeleteCashier = async (id: string) => {
    if (!confirm("Bu kasiyeri silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/owner/cashiers/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
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
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/owner/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAnnouncement)
    });
    if (res.ok) {
      setNewAnnouncement({ title: "", content: "" });
      fetchData();
    } else {
      alert("Duyuru eklenirken hata oluştu.");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/owner/announcements/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="dashboard-header">
        <h1 style={{ color: "var(--accent-color)" }}>Patron Paneli: {stats?.storeName}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>Hoş geldin, {session?.user?.name}</span>
          <button className="btn-secondary" onClick={() => signOut({ callbackUrl: '/' })} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "0.5rem" }}>Toplam Müşteri</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>{stats?.totalCustomers || 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "0.5rem" }}>Verilen Toplam Ödül</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--success)" }}>{stats?.totalRewards || 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "0.5rem" }}>Dağıtılan Çekirdek</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent-color)" }}>{stats?.totalBeans || 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "0.5rem" }}>Aktif Kasiyer</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>{stats?.cashierCount || 0}</div>
        </div>
      </div>

      <div className="grid-2">
        
        {/* Kasiyer Yönetimi */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: "1.5rem" }}>Kasiyer Yönetimi</h2>
          
          <form onSubmit={handleAddCashier} style={{ marginBottom: "2rem", display: "grid", gap: "1rem", background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "1rem" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Yeni Kasiyer Ekle</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <input className="form-input" placeholder="Ad" value={newCashier.name} onChange={e => setNewCashier({...newCashier, name: e.target.value})} required />
              <input className="form-input" placeholder="Soyad" value={newCashier.surname} onChange={e => setNewCashier({...newCashier, surname: e.target.value})} required />
            </div>
            <input className="form-input" type="tel" placeholder="Telefon (Giriş için)" value={newCashier.phone} onChange={e => setNewCashier({...newCashier, phone: e.target.value})} required />
            <input className="form-input" type="text" placeholder="Şifre Belirle" value={newCashier.password} onChange={e => setNewCashier({...newCashier, password: e.target.value})} required />
            <button type="submit" className="btn-primary">Kasiyeri Ekle</button>
          </form>

          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Mevcut Kasiyerler</h3>
            {cashiers.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>Henüz kasiyer eklenmemiş.</p> : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {cashiers.map(cashier => (
                  <li key={cashier.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: "1px solid var(--glass-border)" }}>
                    <div>
                      <div style={{ fontWeight: "bold" }}>{cashier.name} {cashier.surname}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{cashier.phone}</div>
                    </div>
                    <button onClick={() => handleDeleteCashier(cashier.id)} className="btn-secondary" style={{ color: "var(--danger)", borderColor: "var(--danger)", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                      Sil
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Mağaza Ayarları ve Duyurular */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div className="glass-panel" style={{ height: "fit-content" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Kampanya Ayarları</h2>
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Ücretsiz Kahve İçin Gereken Çekirdek Sayısı</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  className="form-input" 
                  value={newSettings.requiredCoffees} 
                  onChange={e => setNewSettings({ requiredCoffees: parseInt(e.target.value) })}
                  required 
                />
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  Müşteriler, belirlediğiniz adette çekirdek topladığında 1 adet ücretsiz ödül kazanır. (Mevcut: {settings?.requiredCoffees})
                </p>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>Ayarları Kaydet</button>
            </form>
          </div>

          <div className="glass-panel" style={{ height: "fit-content" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Duyurular & Bildirimler</h2>
            <form onSubmit={handleAddAnnouncement} style={{ marginBottom: "2rem", display: "grid", gap: "1rem", background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "1rem" }}>
              <input className="form-input" placeholder="Duyuru Başlığı" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} required />
              <textarea className="form-input" placeholder="İçerik..." rows={3} value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} required />
              <button type="submit" className="btn-primary">Müşterilere Duyur</button>
            </form>

            <div>
              {announcements.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>Aktif duyuru yok.</p> : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {announcements.map(ann => (
                    <li key={ann.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1rem", borderBottom: "1px solid var(--glass-border)" }}>
                      <div>
                        <div style={{ fontWeight: "600", color: "var(--accent-color)" }}>{ann.title}</div>
                        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{ann.content}</div>
                      </div>
                      <button onClick={() => handleDeleteAnnouncement(ann.id)} className="btn-secondary" style={{ color: "var(--danger)", borderColor: "var(--danger)", padding: "0.25rem 0.75rem", fontSize: "0.75rem", marginLeft: "1rem" }}>
                        Sil
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
