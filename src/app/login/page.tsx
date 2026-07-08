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
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`glass-panel fade-in ${styles.authCard}`}>
        <h1 className={styles.authTitle}>Giriş Yap</h1>
        <p className={styles.authSubtitle}>Hesabınıza erişmek için bilgilerinizi girin.</p>

        {error && <div className={styles.errorText}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className="form-label" htmlFor="phone">Telefon Numarası</label>
            <input
              id="phone"
              type="tel"
              className="form-input"
              placeholder="5551234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className="form-label" htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className={styles.authLink}>
          Hesabınız yok mu? <Link href="/register">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
