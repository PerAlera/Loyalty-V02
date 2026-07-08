"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role && !allowedRoles.includes(session.user.role)) {
      router.push("/");
    }
  }, [session, status, router, allowedRoles]);

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ color: "var(--text-secondary)" }}>Yükleniyor...</div>
      </div>
    );
  }

  if (status === "authenticated" && allowedRoles.includes(session.user.role)) {
    return <>{children}</>;
  }

  return null;
}
