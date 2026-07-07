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
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

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
        throw new Error(data.message || "Kayıt olurken bir hata oluştu");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel fade-in ${styles.formBox}`}>
        <h1 className={styles.title}>Kayıt Ol</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label>Ad</label>
              <input 
                name="name"
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label>Soyad</label>
              <input 
                name="surname"
                value={formData.surname} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Telefon Numarası</label>
            <input 
              name="phone"
              type="tel" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="5551234567"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Şifre</label>
            <input 
              name="password"
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
          </button>
        </form>
        <div className={styles.footer}>
          Zaten hesabın var mı? <Link href="/login">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
