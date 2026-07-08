"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from './page.module.css';

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className={styles.main}>
      <div className="container fade-in">
        <div className={`glass-panel ${styles.hero}`}>
          <h1 className={styles.title}>Loyalty App'e Hoş Geldiniz</h1>
          <p className={styles.subtitle}>Modern, hızlı ve premium dijital sadakat sistemi.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            {!session ? (
              <>
                <Link href="/login" className="btn-primary">Giriş Yap</Link>
                <Link href="/register" className="btn-secondary">Kayıt Ol</Link>
              </>
            ) : (
              <>
                {session.user.role === "OWNER" && <Link href="/dashboard/owner" className="btn-primary">Yönetici Paneli</Link>}
                {session.user.role === "CASHIER" && <Link href="/dashboard/cashier" className="btn-primary">Kasiyer Paneli</Link>}
                {session.user.role === "CUSTOMER" && <Link href="/dashboard/customer" className="btn-primary">Müşteri Paneli</Link>}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
