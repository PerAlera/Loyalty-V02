"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, surname, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Şifre sıfırlama başarısız oldu.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`fade-in ${styles.authCard}`}>
        <div style={{ width: "120px", height: "120px", position: "relative", margin: "0 auto 1rem auto" }}>
          <Image src="/logo.svg" alt="Jay's Cafe Logo" fill style={{ objectFit: "contain" }} priority />
        </div>
        <p className={styles.authSubtitle}>Şifrenizi sıfırlamak için bilgilerinizi girin.</p>

        {error && <div className={styles.errorText}>{error}</div>}
        {success && <div style={{ color: "var(--primary)", backgroundColor: "rgba(101, 67, 33, 0.1)", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem", textAlign: "center", fontSize: "0.875rem" }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className="form-label" htmlFor="name">Adınız</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Adınız"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className="form-label" htmlFor="surname">Soyadınız</label>
            <input
              id="surname"
              type="text"
              className="form-input"
              placeholder="Soyadınız"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
            />
          </div>

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
            <label className="form-label" htmlFor="newPassword">Yeni Şifreniz</label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading || !!success}
          >
            {loading ? "Sıfırlanıyor..." : "Şifremi Sıfırla"}
          </button>
        </form>

        <div className={styles.authLink}>
          <Link href="/login">Giriş Sayfasına Dön</Link>
        </div>
      </div>
    </div>
  );
}
