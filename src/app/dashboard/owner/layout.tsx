import RoleGuard from "@/components/RoleGuard";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["OWNER"]}>
      {children}
    </RoleGuard>
  );
}
