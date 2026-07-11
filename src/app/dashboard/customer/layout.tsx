import RoleGuard from "@/components/RoleGuard";
import { ReactNode } from "react";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["CUSTOMER"]}>
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        {/* We removed the BottomNav because the new design uses on-screen buttons */}
        {children}
      </div>
    </RoleGuard>
  );
}
