"use client";
import { signOut, useSession } from "next-auth/react";
import { User, Bell, Heart, Moon, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<{ beans: number } | null>(null);

  useEffect(() => {
    fetch("/api/customer/wallet").then(res => res.ok ? res.json() : null).then(data => {
      if(data) setWallet(data.wallet);
    });
  }, []);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "var(--border-color)", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={40} color="var(--text-secondary)" />
        </div>
        <h2>{session?.user?.name} {session?.user?.surname}</h2>
        <p style={{ color: "var(--text-secondary)" }}>Müşteri Hesabı</p>
      </div>

      <div className="surface-card" style={{ marginBottom: "2rem", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Toplam Puan (Çekirdek)</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--success)" }}>{wallet?.beans || 0}</div>
        </div>
        <div style={{ padding: "0.5rem 1rem", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "var(--success)", borderRadius: "1rem", fontWeight: "bold" }}>
          Aktif
        </div>
      </div>

      <div className="surface-card" style={{ padding: "0.5rem 1.5rem" }}>
        {[
          { icon: Bell, label: "Bildirimler" },
          { icon: Heart, label: "Favori Mekanlarım" },
          { icon: HelpCircle, label: "Destek" },
          { icon: Moon, label: "Tema" }
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 0", borderBottom: i < 3 ? "1px solid var(--border-color)" : "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <item.icon size={20} color="var(--text-secondary)" />
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </div>
            <span style={{ color: "var(--text-secondary)" }}>›</span>
          </div>
        ))}
      </div>

      <button className="btn-secondary" onClick={() => signOut({ callbackUrl: '/' })} style={{ width: "100%", marginTop: "2rem", color: "var(--danger)", borderColor: "var(--danger)" }}>
        Çıkış Yap
      </button>
    </div>
  );
}
