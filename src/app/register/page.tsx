"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/login.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      // Başarılı kayıt sonrası logine yönlendir
      router.push("/login?registered=true");
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
      <div className={`glass-panel fade-in ${styles.authCard}`}>
        <h1 className={styles.authTitle}>Kayıt Ol</h1>
        <p className={styles.authSubtitle}>Yeni bir hesap oluşturun.</p>

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
