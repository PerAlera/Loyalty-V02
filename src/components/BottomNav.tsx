"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, QrCode, Clock, User, Settings, Megaphone, Users, PlusCircle } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: "home" | "qr" | "history" | "profile" | "settings" | "megaphone" | "users" | "scan" | "plus";
  isPrimary?: boolean;
}

const iconMap = {
  home: Home,
  qr: QrCode,
  history: Clock,
  profile: User,
  settings: Settings,
  megaphone: Megaphone,
  users: Users,
  scan: QrCode,
  plus: PlusCircle
};

export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      <div style={{ height: "80px" }}></div> {/* Padding for fixed nav */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-color)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "0.5rem 1rem",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        zIndex: 50
      }}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = iconMap[item.icon];
          
          if (item.isPrimary) {
            return (
              <Link key={item.name} href={item.href} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transform: "translateY(-20px)",
                textDecoration: "none"
              }}>
                <div style={{
                  backgroundColor: "var(--primary)",
                  color: "white",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 16px rgba(58, 122, 254, 0.3)"
                }}>
                  <Icon size={28} />
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>{item.name}</span>
              </Link>
            );
          }

          return (
            <Link key={item.name} href={item.href} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textDecoration: "none",
              color: isActive ? "var(--primary)" : "var(--text-secondary)"
            }}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: "12px", marginTop: "4px", fontWeight: isActive ? 600 : 500 }}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
