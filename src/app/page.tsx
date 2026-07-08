import Link from "next/link";
import styles from './page.module.css';

export default function Home() {
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
