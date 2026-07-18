"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Image from "next/image";
import styles from "../login/login.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    password: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedSms, setAcceptedSms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { ...formData, acceptedTerms, acceptedSms };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      // Başarılı kayıt sonrası otomatik giriş yap
      const signInRes = await signIn("credentials", {
        phone: formData.phone,
        password: formData.password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className={styles.authContainer}>
      <div className={`fade-in ${styles.authCard}`}>
        <div style={{ width: "120px", height: "120px", position: "relative", margin: "0 auto 1rem auto" }}>
          <Image src="/logo.svg" alt="Jay's Cafe Logo" fill style={{ objectFit: "contain" }} priority />
        </div>
        <h1 className={styles.authTitle}>Kayıt Ol</h1>
        <p className={styles.authSubtitle}>Yeni bir Jay's Cafe hesabı oluşturun.</p>

        {error && <div className={styles.errorText}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className="form-label" htmlFor="name">Ad</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Ahmet"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className="form-label" htmlFor="surname">Soyad</label>
            <input
              id="surname"
              type="text"
              className="form-input"
              placeholder="Yılmaz"
              value={formData.surname}
              onChange={handleChange}
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
              value={formData.phone}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
            <input 
              type="checkbox" 
              id="acceptedTerms" 
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
              style={{ width: "1.2rem", height: "1.2rem", cursor: "pointer", accentColor: "var(--primary)" }}
            />
            <label htmlFor="acceptedTerms" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none" }}>
              <Link href="/kvkk" target="_blank" style={{ color: "var(--primary)", textDecoration: "underline" }}>Kullanıcı sözleşmesini ve KVKK aydınlatma metnini</Link> okudum, onaylıyorum. <span style={{ color: "var(--danger)" }}>*</span>
            </label>
          </div>

          <div className={styles.formGroup} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <input 
              type="checkbox" 
              id="acceptedSms" 
              checked={acceptedSms}
              onChange={(e) => setAcceptedSms(e.target.checked)}
              style={{ width: "1.2rem", height: "1.2rem", cursor: "pointer", accentColor: "var(--primary)" }}
            />
            <label htmlFor="acceptedSms" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none" }}>
              Kampanya ve bilgilendirme SMS'leri almak istiyorum.
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className={styles.authLink}>
          Zaten hesabınız var mı? <Link href="/login">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
