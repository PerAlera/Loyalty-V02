import RoleGuard from "@/components/RoleGuard";
import BottomNav from "@/components/BottomNav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "Ana Sayfa", href: "/dashboard/customer", icon: "home" as const },
    { name: "QR İşlem", href: "/dashboard/customer/qr", icon: "qr" as const, isPrimary: true },
    { name: "Geçmiş", href: "/dashboard/customer/history", icon: "history" as const },
    { name: "Profil", href: "/dashboard/customer/profile", icon: "profile" as const }
  ];

  return (
    <RoleGuard allowedRoles={["CUSTOMER"]}>
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        {children}
        <BottomNav items={navItems} />
      </div>
    </RoleGuard>
  );
}
