"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard"); // we will create a dashboard later
      router.refresh();
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel fade-in ${styles.formBox}`}>
        <h1 className={styles.title}>Giriş Yap</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Telefon Numarası</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="5551234567"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Şifre</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
        <div className={styles.footer}>
          Hesabın yok mu? <Link href="/register">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
