"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
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
    <main className={styles.main} style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="container fade-in">
        <div className={styles.hero} style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ 
            width: "120px",
            height: "120px",
            margin: "0 auto 2rem auto",
            position: "relative"
          }}>
            <Image src="/logo.svg" alt="Jay's Cafe Logo" fill style={{ objectFit: "contain" }} priority />
          </div>
          <h1 className="font-caveat" style={{ fontSize: "3.5rem", marginBottom: "1rem", color: "var(--text-primary)", lineHeight: 1 }}>Sana Özel<br/>Sadakat Sistemi</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "3rem", fontSize: "1.125rem" }}>Kahveni iç, puanını topla, bedava kahveni kazan!</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px", margin: "0 auto" }}>
            <Link href="/login" className="btn-primary">Giriş Yap</Link>
            <Link href="/register" className="btn-secondary">Kayıt Ol</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
