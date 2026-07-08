"use client";

import { useEffect, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { tr } from "date-fns/locale";
import { Coffee, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/history")
      .then(res => res.json())
      .then(data => {
        if(data.transactions) setTransactions(data.transactions);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return `Bugün, ${format(date, 'HH:mm')}`;
    if (isYesterday(date)) return `Dün, ${format(date, 'HH:mm')}`;
    return format(date, "EEEE, HH:mm", { locale: tr });
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>Geçmiş</h1>
      </div>

      {transactions.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "3rem" }}>Henüz bir işleminiz bulunmuyor.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {transactions.map((tx) => {
            const isEarn = tx.type === "EARN_BEAN";
            return (
              <div key={tx.id} className="surface-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ padding: "0.5rem", borderRadius: "50%", backgroundColor: isEarn ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)" }}>
                    <Coffee size={20} color={isEarn ? "var(--success)" : "var(--danger)"} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>Coffee House</h3>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{formatDate(tx.createdAt)}</div>
                  </div>
                </div>
                <div style={{ fontSize: "1.125rem", fontWeight: "bold", color: isEarn ? "var(--success)" : "var(--danger)" }}>
                  {isEarn ? "+" : "-"}{tx.amount}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
