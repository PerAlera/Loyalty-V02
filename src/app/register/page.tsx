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
  const [showKvkk, setShowKvkk] = useState(false);
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
              <span onClick={() => setShowKvkk(true)} style={{ color: "var(--primary)", textDecoration: "underline" }}>Kullanıcı sözleşmesini ve KVKK aydınlatma metnini</span> okudum, onaylıyorum. <span style={{ color: "var(--danger)" }}>*</span>
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

      {/* KVKK Modal */}
      {showKvkk && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="surface-card" style={{
            width: "100%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2rem",
            position: "relative"
          }}>
            <button 
              onClick={() => setShowKvkk(false)}
              style={{
                position: "absolute", top: "1rem", right: "1rem",
                background: "none", border: "none", fontSize: "1.5rem",
                cursor: "pointer", color: "var(--text-secondary)"
              }}
            >
              &times;
            </button>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", color: "var(--text-primary)", textAlign: "center" }}>KVKK Aydınlatma Metni</h1>
            
            <div style={{ lineHeight: "1.6", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <p style={{ fontWeight: "bold", marginBottom: "1rem", fontSize: "1rem", textAlign: "center", color: "var(--text-primary)" }}>Peralera Dijital Sadakat Sistemi Kişisel Verilerin Korunması Hakkında Aydınlatma Metni</p>
              <p style={{ marginBottom: "1.5rem", textAlign: "center", opacity: 0.7 }}>Son Güncelleme: 18.07.2026</p>

              <h2 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>1. Veri Sorumlusu</h2>
              <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verileriniz, veri sorumlusu sıfatıyla <strong>Peralera</strong> tarafından aşağıda açıklanan kapsamda işlenmektedir.</p>
              <div style={{ marginTop: "1rem", marginBottom: "1.5rem", padding: "1rem", background: "var(--bg-primary)", borderRadius: "0.5rem", border: "1px solid var(--border-color)" }}>
                <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>İletişim Bilgileri</strong>
                Marka: Peralera<br/>
                E-posta: <a href="mailto:alperen@peralera.com" style={{ color: "var(--primary)" }}>alperen@peralera.com</a><br/>
                Web Sitesi: <a href="https://peralera.com" target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>https://peralera.com</a>
              </div>

              <h2 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>2. Hangi Verileri Topluyoruz?</h2>
              <p>Uygulamamızı kullanmanız halinde aşağıdaki kişisel veriler işlenebilir.</p>
              <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
                <li><strong>Kimlik Bilgileri:</strong> Ad, Soyad</li>
                <li><strong>İletişim Bilgileri:</strong> Telefon numarası</li>
                <li><strong>Kullanım Bilgileri:</strong> Sadakat puanları, Kazanılan ödüller, İşlem geçmişi, vb.</li>
                <li><strong>Teknik Bilgiler:</strong> IP adresi, Tarayıcı bilgisi, vb.</li>
              </ul>

              <h2 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>3. Kişisel Verilerin İşlenme Amaçları</h2>
              <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
                <li>Üyelik ve sadakat kartının oluşturulması</li>
                <li>Puan hesaplanması ve hediye yönetimi</li>
                <li>Kampanyaların yürütülmesi</li>
                <li>Hesap güvenliği ve dolandırıcılığın önlenmesi</li>
              </ul>

              <h2 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>4. Haklarınız</h2>
              <p>KVKK'nın 11. maddesi uyarınca veri işleme faaliyetlerimiz hakkında bilgi alma, düzeltme, silme ve itiraz etme haklarına sahipsiniz.</p>
              <p style={{ marginTop: "1rem" }}>Tüm detaylar ve başvurularınız için <a href="mailto:alperen@peralera.com" style={{ color: "var(--primary)", fontWeight: "bold" }}>alperen@peralera.com</a> üzerinden bizimle iletişime geçebilirsiniz.</p>
              
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button onClick={() => setShowKvkk(false)} className="btn-primary" style={{ padding: "0.75rem 2rem" }}>Anladım, Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
