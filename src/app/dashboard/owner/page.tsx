"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Gift, Coffee, Calendar, Clock, Activity, PieChart as PieChartIcon, BarChart2, TrendingUp, Sun, UserMinus } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  
  // Daily Chart State
  const [dayOffset, setDayOffset] = useState(0);
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  
  // Weekly Chart State
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(true);

  // Inactive Customers State
  const [inactiveWeeks, setInactiveWeeks] = useState(1);
  const [inactiveCustomers, setInactiveCustomers] = useState<any[]>([]);
  const [loadingInactive, setLoadingInactive] = useState(true);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchDailyData(dayOffset);
  }, [dayOffset]);

  useEffect(() => {
    fetchWeeklyData(weekOffset);
  }, [weekOffset]);

  useEffect(() => {
    fetchInactiveCustomers(inactiveWeeks);
  }, [inactiveWeeks]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/owner/stats");
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchDailyData = async (offset: number) => {
    setLoadingDaily(true);
    try {
      const res = await fetch(`/api/owner/stats/daily?offset=${offset}`);
      if (res.ok) setDailyStats(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoadingDaily(false);
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

  const fetchInactiveCustomers = async (weeksAgo: number) => {
    setLoadingInactive(true);
    try {
      const res = await fetch(`/api/owner/stats/inactive-customers?weeksAgo=${weeksAgo}`);
      if (res.ok) {
        const data = await res.json();
        setInactiveCustomers(data.inactiveCustomers || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingInactive(false);
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  const COLORS = ['#654321', '#C29B73', '#E6D5C3', '#000000'];

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <div className="dashboard-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>Admin Paneli</h1>
      </div>

      {/* 1. GÜNLÜK ÖZET */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sun size={20} color="var(--primary)" /> Günlük Özet
        </h2>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "var(--bg-primary)", padding: "0.25rem 0.5rem", borderRadius: "2rem", border: "1px solid var(--border-color)" }}>
          <button 
            onClick={() => setDayOffset(prev => prev - 1)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem", color: "var(--text-secondary)" }}
          >
            <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{"<"}</span>
          </button>
          <span style={{ fontSize: "0.875rem", fontWeight: "bold", minWidth: "100px", textAlign: "center" }}>
            {loadingDaily ? "Yükleniyor..." : dailyStats?.dayLabel || "Veri Yok"}
          </span>
          <button 
            onClick={() => setDayOffset(prev => prev + 1)}
            disabled={dayOffset >= 0}
            style={{ background: "none", border: "none", cursor: dayOffset >= 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", padding: "0.25rem", color: dayOffset >= 0 ? "var(--border-color)" : "var(--text-secondary)" }}
          >
            <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{">"}</span>
          </button>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem", opacity: loadingDaily ? 0.5 : 1, transition: "opacity 0.2s" }}>
        
        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid var(--primary)", backgroundColor: "rgba(101, 67, 33, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Coffee size={20} /> <span style={{ fontSize: "0.875rem" }}>Dağıtılan Kahve Puanı</span>
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)" }}>{dailyStats?.beans || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid #F59E0B", backgroundColor: "rgba(245, 158, 11, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Gift size={20} /> <span style={{ fontSize: "0.875rem" }}>Dağıtılan Yemek Puanı</span>
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#F59E0B" }}>{dailyStats?.foodPoints || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid var(--success)", backgroundColor: "rgba(34, 197, 94, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
            <Users size={20} /> <span style={{ fontSize: "0.875rem" }}>Tekil Ziyaretçi</span>
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--success)" }}>{dailyStats?.uniqueCustomers || 0}</div>
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

        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem", borderLeft: "3px solid var(--primary)" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Dağıtılan Kahve Puanı</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>{stats?.totalBeans || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem", borderLeft: "3px solid var(--primary)" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Verilen Kahve Ödülü</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>{stats?.totalRewards || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem", borderLeft: "3px solid #F59E0B" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Dağıtılan Yemek Puanı</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#F59E0B" }}>{stats?.totalFoodPoints || 0}</div>
        </div>

        <div className="surface-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem", borderLeft: "3px solid #F59E0B" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Verilen Yemek Ödülü</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#F59E0B" }}>{stats?.totalFoodRewards || 0}</div>
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
      
      {/* 3.A Günlük Saatlik Yoğunluk */}
      <div className="surface-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Activity size={24} color="var(--primary)"/> {dailyStats?.dayLabel || "Günlük"} Saatlik Yoğunluk Trendi
        </h2>
        <div style={{ width: '100%', height: 300, opacity: loadingDaily ? 0.5 : 1, transition: "opacity 0.2s" }}>
          {dailyStats?.hourlyData && dailyStats.hourlyData.length > 0 ? (
            <ResponsiveContainer>
              <LineChart data={dailyStats.hourlyData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Line type="monotone" name="Tekil Ziyaretçi" dataKey="islem" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
              Bu güne ait işlem yok.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
        
        {/* Haftalık Yoğunluk Dağılımı (Bar Chart) */}
        <div className="surface-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BarChart2 size={24} color="var(--primary)"/> Haftalık Ziyaretçi Yoğunluğu
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
                  <Bar dataKey="islem" name="Ziyaretçi Sayısı" fill="var(--primary)" radius={[4, 4, 0, 0]} />
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
            <TrendingUp size={24} color="var(--success)"/> Son 7 Günlük Dağılım Performansı
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
                  <Line type="monotone" name="Kahve Puanı" dataKey="bean" stroke="var(--primary)" strokeWidth={2} />
                  <Line type="monotone" name="Kahve Ödülü" dataKey="reward" stroke="var(--primary)" strokeDasharray="5 5" strokeWidth={2} />
                  <Line type="monotone" name="Yemek Puanı" dataKey="foodPoints" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" name="Yemek Ödülü" dataKey="foodRewards" stroke="#F59E0B" strokeDasharray="5 5" strokeWidth={2} />
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

      {/* 4. İNAKTİF MÜŞTERİ ANALİZİ */}
      <div className="surface-card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <UserMinus size={24} color="var(--danger)"/> İnaktif Müşteri Analizi
          </h2>
          
          <select 
            value={inactiveWeeks} 
            onChange={(e) => setInactiveWeeks(Number(e.target.value))}
            style={{ 
              padding: "0.5rem 1rem", 
              borderRadius: "0.5rem", 
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value={1}>Son 1 Haftadır Gelmeyenler</option>
            <option value={2}>Son 2 Haftadır Gelmeyenler</option>
            <option value={3}>Son 3 Haftadır Gelmeyenler</option>
            <option value={4}>Son 1 Aydır Gelmeyenler</option>
          </select>
        </div>

        {loadingInactive ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>Veriler yükleniyor...</div>
        ) : inactiveCustomers.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "1rem" }}>Müşteri Adı</th>
                  <th style={{ padding: "1rem" }}>Telefon</th>
                  <th style={{ padding: "1rem" }}>Son Ziyaret</th>
                  <th style={{ padding: "1rem" }}>Geçen Süre</th>
                </tr>
              </thead>
              <tbody>
                {inactiveCustomers.map((user: any) => {
                  const lastVisitDate = new Date(user.lastVisit);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "1rem", fontWeight: "500" }}>{user.name} {user.surname}</td>
                      <td style={{ padding: "1rem" }}>{user.phone}</td>
                      <td style={{ padding: "1rem" }}>{lastVisitDate.toLocaleDateString('tr-TR')}</td>
                      <td style={{ padding: "1rem", color: "var(--danger)", fontWeight: "bold" }}>{diffDays} gün önce</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", backgroundColor: "rgba(34, 197, 94, 0.05)", color: "var(--success)", borderRadius: "0.5rem", border: "1px solid var(--success)" }}>
            Harika! Bu kritere uyan inaktif müşteri bulunmuyor.
          </div>
        )}
      </div>

    </div>
  );
}
