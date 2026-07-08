import RoleGuard from "@/components/RoleGuard";
import BottomNav from "@/components/BottomNav";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "Özet", href: "/dashboard/owner", icon: "home" as const, isPrimary: true },
    { name: "Duyurular", href: "/dashboard/owner/announcements", icon: "megaphone" as const },
    { name: "Kasiyerler", href: "/dashboard/owner/cashiers", icon: "users" as const },
    { name: "Ayarlar", href: "/dashboard/owner/settings", icon: "settings" as const }
  ];

  return (
    <RoleGuard allowedRoles={["OWNER"]}>
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        {children}
        <BottomNav items={navItems} />
      </div>
    </RoleGuard>
  );
}
