"use client";

import { useEffect, useState } from "react";
import { Megaphone, Trash2, Plus } from "lucide-react";

export default function OwnerAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
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
                  <div style={{ fontWeight: "600", color: "var(--primary)", marginBottom: "0.25rem" }}>{ann.title}</div>
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
