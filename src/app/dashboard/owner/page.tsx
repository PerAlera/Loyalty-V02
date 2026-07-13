"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Gift, Coffee, Calendar, Clock, Activity, PieChart as PieChartIcon, BarChart2, TrendingUp, Sun } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  
  // Weekly Chart State
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(true);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchWeeklyData(weekOffset);
  }, [weekOffset]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/owner/stats");
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchWeeklyData = async (offset: number) => {
    setLoadingWeekly(true);
    try {
      const res = await fetch(`/api/owner/stats/weekly?offset=${offset}`);
      if (res.ok) setWeeklyStats(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoadingWeekly(false);
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  const COLORS = ['#654321', '#C29B73', '#E6D5C3', '#000000'];

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <div className="dashboard-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>Admin Paneli</h1>
      </div>

      {/* 1. BUGÜNÜN ÖZETİ */}
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Sun size={20} color="var(--primary)" /> Bugünün Özeti
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        
        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid var(--primary)", backgroundColor: "rgba(101, 67, 33, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Coffee size={20} /> <span style={{ fontSize: "0.875rem" }}>Bugün Dağıtılan Çekirdek</span>
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)" }}>{stats?.todayBeans || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid #F59E0B", backgroundColor: "rgba(245, 158, 11, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Users size={20} /> <span style={{ fontSize: "0.875rem" }}>Bugünkü Tekil Müşteri</span>
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#F59E0B" }}>{stats?.todayUniqueCustomers || 0}</div>
        </div>

      </div>

      {/* 2. GENEL ÖZET KARTLARI */}
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--text-secondary)" }}>Tüm Zamanların Özeti</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        
        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Toplam Müşteri</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats?.totalCustomers || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Sadık Müşteri (Geri Dönen)</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--success)" }}>
            %{stats?.returningRate || 0} <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "normal" }}>({stats?.returningCustomersCount || 0} Kişi)</span>
          </div>
        </div>

        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Verilen Ödül</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--success)" }}>{stats?.totalRewards || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Dağıtılan Çekirdek</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>{stats?.totalBeans || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>En Yoğun Gün</div>
          <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{stats?.busiestDay || "Veri Yok"}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>En Yoğun Saat</div>
          <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{stats?.busiestHour || "Veri Yok"}</div>
        </div>

      </div>

      {/* 3. GRAFİKLER BÖLÜMÜ */}
      
      {/* 3.A Bugün Saatlik Yoğunluk */}
      <div className="surface-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Activity size={24} color="var(--primary)"/> Bugünün Saatlik Yoğunluk Trendi
        </h2>
        <div style={{ width: '100%', height: 300 }}>
          {stats?.todayHourlyData && stats.todayHourlyData.length > 0 ? (
            <ResponsiveContainer>
              <LineChart data={stats.todayHourlyData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Line type="monotone" name="İşlem" dataKey="islem" stroke="#F59E0B" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
              Bugün henüz işlem yok.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
        
        {/* Haftalık Yoğunluk Dağılımı (Bar Chart) */}
        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BarChart2 size={24} color="var(--primary)"/> Haftalık Yoğunluk
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "var(--bg-primary)", padding: "0.25rem 0.5rem", borderRadius: "2rem", border: "1px solid var(--border-color)" }}>
              <button 
                onClick={() => setWeekOffset(prev => prev - 1)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem", color: "var(--text-secondary)" }}
              >
                <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{"<"}</span>
              </button>
              <span style={{ fontSize: "0.875rem", fontWeight: "bold", minWidth: "120px", textAlign: "center" }}>
                {loadingWeekly ? "Yükleniyor..." : weeklyStats?.weekLabel || "Veri Yok"}
              </span>
              <button 
                onClick={() => setWeekOffset(prev => prev + 1)}
                disabled={weekOffset >= 0}
                style={{ background: "none", border: "none", cursor: weekOffset >= 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", padding: "0.25rem", color: weekOffset >= 0 ? "var(--border-color)" : "var(--text-secondary)" }}
              >
                <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{">"}</span>
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 250, opacity: loadingWeekly ? 0.5 : 1, transition: "opacity 0.2s" }}>
            {weeklyStats?.weeklyDayData && weeklyStats.weeklyDayData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={weeklyStats.weeklyDayData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip cursor={{fill: 'rgba(101, 67, 33, 0.1)'}} />
                  <Bar dataKey="islem" name="İşlem Sayısı" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                Bu haftaya ait veri yok.
              </div>
            )}
          </div>
        </div>

        {/* Son 7 Günlük Aktivite (Çizgi Grafik) */}
        <div className="surface-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={24} color="var(--success)"/> Son 7 Günlük Performans
          </h2>
          <div style={{ width: '100%', height: 250 }}>
            {stats?.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={stats.chartData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" name="Puan" dataKey="bean" stroke="var(--primary)" strokeWidth={2} />
                  <Line type="monotone" name="Ödül" dataKey="reward" stroke="var(--success)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                Yeterli veri bulunamadı.
              </div>
            )}
          </div>
        </div>

      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem", marginTop: "2rem" }}>
        
        {/* Müşteri Demografisi (Pasta) */}
        <div className="surface-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PieChartIcon size={24} color="var(--primary)"/> Müşteri Demografisi
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

        {/* Canlı İşlem Geçmişi */}
        <div className="surface-card" style={{ padding: "1.5rem" }}>
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
  );
}
