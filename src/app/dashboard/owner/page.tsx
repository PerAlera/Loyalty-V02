"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Users, Gift, Coffee, Store } from "lucide-react";

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/owner/stats");
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <div className="dashboard-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem" }}>Patron Paneli</h1>
          <div style={{ color: "var(--text-secondary)" }}>{stats?.storeName}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: 500 }}>Hoş geldin, {session?.user?.name}</span>
          <button className="btn-secondary" onClick={() => signOut({ callbackUrl: '/' })} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            Çıkış Yap
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>İstatistikler (Özet)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
        
        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Users size={20} /> <span style={{ fontSize: "0.875rem" }}>Toplam Müşteri</span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text-primary)" }}>{stats?.totalCustomers || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Gift size={20} /> <span style={{ fontSize: "0.875rem" }}>Verilen Ödül</span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--success)" }}>{stats?.totalRewards || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Coffee size={20} /> <span style={{ fontSize: "0.875rem" }}>Dağıtılan Çekirdek</span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>{stats?.totalBeans || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Store size={20} /> <span style={{ fontSize: "0.875rem" }}>Aktif Kasiyer</span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text-primary)" }}>{stats?.cashierCount || 0}</div>
        </div>

      </div>
    </div>
  );
}
