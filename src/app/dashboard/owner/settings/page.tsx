"use client";

import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";

export default function OwnerSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [newSettings, setNewSettings] = useState({ requiredCoffees: 10 });
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
        setNewSettings({ requiredCoffees: data.settings.requiredCoffees });
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

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Settings color="var(--primary)" /> Mağaza Ayarları
      </h1>

      <div className="surface-card">
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
              onChange={e => setNewSettings({ requiredCoffees: parseInt(e.target.value) })}
              required 
            />
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Müşteriler, belirlediğiniz adette çekirdek topladığında 1 adet ücretsiz ödül kazanır. (Mevcut: {settings?.requiredCoffees})
            </p>
          </div>
          <button type="submit" className="btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
            <Save size={20} /> Ayarları Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}
