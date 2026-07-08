"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Plus } from "lucide-react";

export default function OwnerCashiersPage() {
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [newCashier, setNewCashier] = useState({ name: "", surname: "", phone: "", password: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/owner/cashiers");
      if (res.ok) {
        const data = await res.json();
        setCashiers(data.cashiers || []);
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

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Users color="var(--primary)" /> Kasiyer Yönetimi
      </h1>

      <div className="surface-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={20} color="var(--primary)" /> Yeni Kasiyer Ekle
        </h2>
        <form onSubmit={handleAddCashier} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <input className="form-input" placeholder="Ad" value={newCashier.name} onChange={e => setNewCashier({...newCashier, name: e.target.value})} required />
            <input className="form-input" placeholder="Soyad" value={newCashier.surname} onChange={e => setNewCashier({...newCashier, surname: e.target.value})} required />
          </div>
          <input className="form-input" type="tel" placeholder="Telefon (Giriş için)" value={newCashier.phone} onChange={e => setNewCashier({...newCashier, phone: e.target.value})} required />
          <input className="form-input" type="text" placeholder="Şifre Belirle" value={newCashier.password} onChange={e => setNewCashier({...newCashier, password: e.target.value})} required />
          <button type="submit" className="btn-primary">Kasiyeri Ekle</button>
        </form>
      </div>

      <div className="surface-card">
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Mevcut Kasiyerler</h2>
        {cashiers.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>Henüz kasiyer eklenmemiş.</p> : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cashiers.map(cashier => (
              <li key={cashier.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>{cashier.name} {cashier.surname}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{cashier.phone}</div>
                </div>
                <button onClick={() => handleDeleteCashier(cashier.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}>
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
