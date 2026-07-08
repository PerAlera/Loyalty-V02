import RoleGuard from "@/components/RoleGuard";
import BottomNav from "@/components/BottomNav";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "QR Oluştur", href: "/dashboard/cashier", icon: "plus" as const, isPrimary: true },
    { name: "QR Okut", href: "/dashboard/cashier/scan", icon: "scan" as const }
  ];

  return (
    <RoleGuard allowedRoles={["CASHIER"]}>
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        {children}
        <BottomNav items={navItems} />
      </div>
    </RoleGuard>
  );
}
