"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Users, Gift, Coffee, Store, Calendar, Clock, Activity, PieChart as PieChartIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

  const COLORS = ['#654321', '#C29B73', '#E6D5C3', '#000000'];

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <div className="dashboard-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: "bold" }}>Sistem Analiz Merkezi</h1>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{stats?.storeName} Canlı Verileri</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: 500 }}>Hoş geldin, {session?.user?.name}</span>
          <button className="btn-secondary" onClick={() => signOut({ callbackUrl: '/' })} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", borderColor: "var(--danger)", color: "var(--danger)" }}>
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* 1. ÖZET KARTLARI */}
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Temel Göstergeler</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        
        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Users size={20} /> <span style={{ fontSize: "0.875rem" }}>Toplam Müşteri</span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text-primary)" }}>{stats?.totalCustomers || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid var(--success)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Gift size={20} /> <span style={{ fontSize: "0.875rem" }}>Verilen Ödül</span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--success)" }}>{stats?.totalRewards || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Coffee size={20} /> <span style={{ fontSize: "0.875rem" }}>Dağıtılan Çekirdek</span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>{stats?.totalBeans || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid #F59E0B" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Calendar size={20} /> <span style={{ fontSize: "0.875rem" }}>En Yoğun Gün</span>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>{stats?.busiestDay || "Veri Yok"}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid #3B82F6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Clock size={20} /> <span style={{ fontSize: "0.875rem" }}>En Yoğun Saat</span>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>{stats?.busiestHour || "Veri Yok"}</div>
        </div>

      </div>

      {/* 2. GRAFİKLER VE LİSTELER (2 Kolonlu Layout) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
        
        {/* Sol Kolon: Çizgi Grafik */}
        <div className="surface-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Activity size={24} color="var(--primary)"/> Son 7 Günlük Aktivite
          </h2>
          <div style={{ width: '100%', height: 300 }}>
            {stats?.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" name="Kazanılan Puan" dataKey="bean" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" name="Kullanılan Ödül" dataKey="reward" stroke="var(--success)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                Yeterli veri bulunamadı.
              </div>
            )}
          </div>
        </div>

        {/* Sağ Kolon: Demografi ve Son Aktiviteler */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div className="surface-card" style={{ padding: "1.5rem", flex: 1 }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <PieChartIcon size={24} color="var(--primary)"/> Müşteri Demografisi (Cinsiyet)
            </h2>
            <div style={{ width: '100%', height: 200 }}>
              {stats?.demographics && stats.demographics.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stats.demographics}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.demographics.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                  Demografik veri henüz yok.
                </div>
              )}
            </div>
          </div>

          <div className="surface-card" style={{ padding: "1.5rem", flex: 1 }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Canlı İşlem Geçmişi</h2>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {stats.recentActivities.map((act: string, idx: number) => (
                  <li key={idx} style={{ 
                    padding: "0.75rem", 
                    backgroundColor: "var(--bg-primary)", 
                    borderRadius: "0.5rem",
                    borderLeft: "4px solid var(--primary)",
                    fontSize: "0.875rem"
                  }}>
                    {act}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Henüz işlem yapılmadı.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
