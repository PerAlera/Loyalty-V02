"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from './page.module.css';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "OWNER") {
        router.push("/dashboard/owner");
      } else if (session.user.role === "CASHIER") {
        router.push("/dashboard/cashier");
      } else {
        router.push("/dashboard/customer");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <main className={styles.main}>
        <div style={{ color: "var(--text-secondary)" }}>Yükleniyor...</div>
      </main>
    );
  }

  // Sadece giriş yapmamış kullanıcılara anasayfayı göster. Giriş yapanlar useEffect ile yönlendirilecek.
  if (status === "authenticated") {
    return (
      <main className={styles.main}>
        <div style={{ color: "var(--text-secondary)" }}>Yönlendiriliyor...</div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className="container fade-in">
        <div className={`glass-panel ${styles.hero}`}>
          <h1 className={styles.title}>Loyalty App'e Hoş Geldiniz</h1>
          <p className={styles.subtitle}>Modern, hızlı ve premium dijital sadakat sistemi.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/login" className="btn-primary">Giriş Yap</Link>
            <Link href="/register" className="btn-secondary">Kayıt Ol</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
