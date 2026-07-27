"use client";

import { useEffect, useState } from "react";
import { Megaphone, Trash2, Plus } from "lucide-react";

export default function OwnerAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ 
    title: "", 
    content: "",
    sendPush: false,
    target: "all", // "all" | "selected"
    selectedUserIds: [] as string[]
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [annRes, custRes] = await Promise.all([
        fetch("/api/announcements", { cache: "no-store" }),
        fetch("/api/owner/customers", { cache: "no-store" })
      ]);
      
      if (annRes.ok) {
        const data = await annRes.json();
        setAnnouncements(data.announcements || []);
      }
      if (custRes.ok) {
        const data = await custRes.json();
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnnouncement.sendPush && newAnnouncement.target === "selected" && newAnnouncement.selectedUserIds.length === 0) {
      alert("Lütfen bildirim göndermek için en az bir müşteri seçin.");
      return;
    }
    
    const res = await fetch("/api/owner/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAnnouncement)
    });
    
    if (res.ok) {
      setNewAnnouncement({ title: "", content: "", sendPush: false, target: "all", selectedUserIds: [] });
      fetchData();
      alert("Duyuru başarıyla oluşturuldu.");
    } else {
      alert("Duyuru eklenirken hata oluştu.");
    }
  };

  const toggleUserSelection = (id: string) => {
    setNewAnnouncement(prev => {
      const isSelected = prev.selectedUserIds.includes(id);
      if (isSelected) {
        return { ...prev, selectedUserIds: prev.selectedUserIds.filter(uid => uid !== id) };
      } else {
        return { ...prev, selectedUserIds: [...prev.selectedUserIds, id] };
      }
    });
  };

  const applyFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filterType = e.target.value;
    if (filterType === "all") {
      setNewAnnouncement(prev => ({ ...prev, selectedUserIds: customers.map(c => c.id) }));
      return;
    }
    
    if (filterType === "none") {
      setNewAnnouncement(prev => ({ ...prev, selectedUserIds: [] }));
      return;
    }

    const now = new Date();
    const weeks = parseInt(filterType);
    const cutoff = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
    
    const filteredIds = customers
      .filter(c => new Date(c.lastVisit) < cutoff)
      .map(c => c.id);
      
    setNewAnnouncement(prev => ({ ...prev, selectedUserIds: filteredIds }));
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/owner/announcements/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Megaphone color="var(--primary)" /> Kampanyalar & Duyurular
      </h1>

      <div className="surface-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={20} color="var(--primary)" /> Yeni Duyuru Ekle
        </h2>
        <form onSubmit={handleAddAnnouncement} style={{ display: "grid", gap: "1rem" }}>
          <input className="form-input" placeholder="Duyuru Başlığı" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} required />
          <textarea className="form-input" placeholder="İçerik detaylarını buraya yazın..." rows={3} value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} required />
          
          <div style={{ padding: "1rem", backgroundColor: "var(--bg-secondary)", borderRadius: "0.5rem", border: "1px solid var(--border-color)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "600", marginBottom: newAnnouncement.sendPush ? "1rem" : "0" }}>
              <input 
                type="checkbox" 
                checked={newAnnouncement.sendPush}
                onChange={e => setNewAnnouncement({...newAnnouncement, sendPush: e.target.checked})}
                style={{ width: "1.2rem", height: "1.2rem", accentColor: "var(--primary)" }}
              />
              Bu duyuruyu anlık bildirim (Push Notification) olarak gönder
            </label>

            {newAnnouncement.sendPush && (
              <div style={{ marginLeft: "1.7rem", marginTop: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input 
                      type="radio" 
                      name="target" 
                      value="all"
                      checked={newAnnouncement.target === "all"}
                      onChange={e => setNewAnnouncement({...newAnnouncement, target: e.target.value})}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    Tüm Müşterilere
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input 
                      type="radio" 
                      name="target" 
                      value="selected"
                      checked={newAnnouncement.target === "selected"}
                      onChange={e => setNewAnnouncement({...newAnnouncement, target: e.target.value})}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    Seçili Müşterilere
                  </label>
                </div>

                {newAnnouncement.target === "selected" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>Hızlı Seçim:</span>
                      <select onChange={applyFilter} defaultValue="none" className="form-input" style={{ padding: "0.25rem 0.5rem", width: "auto" }}>
                        <option value="none">Seçim Yapınız...</option>
                        <option value="all">Tüm Müşterileri Seç</option>
                        <option value="1">Son 1 Haftadır Gelmeyenler</option>
                        <option value="2">Son 2 Haftadır Gelmeyenler</option>
                        <option value="3">Son 3 Haftadır Gelmeyenler</option>
                        <option value="4">Son 1 Aydır Gelmeyenler</option>
                      </select>
                    </div>

                    <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "0.5rem", padding: "0.5rem", backgroundColor: "var(--bg-primary)" }}>
                      {customers.length === 0 ? <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Kayıtlı müşteri bulunamadı.</p> : null}
                    {customers.map(c => (
                      <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}>
                        <input 
                          type="checkbox"
                          checked={newAnnouncement.selectedUserIds.includes(c.id)}
                          onChange={() => toggleUserSelection(c.id)}
                          style={{ accentColor: "var(--primary)" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "500" }}>{c.name} {c.surname}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {c.phone} {c.hasPush ? "🔔 (Bildirim Açık)" : ""}
                            <span style={{ display: "block", marginTop: "0.1rem", opacity: 0.7 }}>
                              Son Ziyaret: {c.lastVisit ? new Date(c.lastVisit).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary">Müşterilere Duyur</button>
        </form>
      </div>

      <div className="surface-card">
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Aktif Duyurular</h2>
        {announcements.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>Aktif duyuru yok.</p> : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {announcements.map(ann => (
              <li key={ann.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1rem 0", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <div style={{ fontWeight: "600", color: "var(--primary)", marginBottom: "0.25rem" }}>
                    {ann.title} {ann.isPush && <span style={{ fontSize: "0.7rem", backgroundColor: "var(--primary)", color: "white", padding: "0.1rem 0.3rem", borderRadius: "1rem", marginLeft: "0.5rem" }}>Push</span>}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{ann.content}</div>
                </div>
                <button onClick={() => handleDeleteAnnouncement(ann.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", paddingLeft: "1rem" }}>
                  <Trash2 size={20} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
