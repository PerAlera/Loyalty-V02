"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hatayı konsola yazdırıyoruz (geliştirici için)
    console.error("Uygulama Hatası (Error Boundary yakaladı):", error);
  }, [error]);

  return (
    <html lang="tr">
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          backgroundColor: "var(--bg-primary)",
          textAlign: "center"
        }}>
      <div style={{ width: "100px", height: "100px", position: "relative", marginBottom: "2rem" }}>
        <Image src="/logo.svg" alt="Jay's Cafe Logo" fill style={{ objectFit: "contain" }} />
      </div>
      
      <h2 style={{ fontSize: "1.5rem", color: "var(--danger)", marginBottom: "1rem" }}>
        Güvenlik Kısıtlaması veya Hata
      </h2>
      
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", maxWidth: "400px", lineHeight: 1.5 }}>
        Cihazınızın veya tarayıcınızın güvenlik ayarları (Gizli Sekme, Uygulama İçi Tarayıcı vb.) sistemin çalışmasını engelliyor olabilir. 
        Lütfen sağ üstteki menüden veya ayarlardan <strong>"Tarayıcıda Aç"</strong> (Safari/Chrome) seçeneğini kullanın.
      </p>

      <div style={{ 
        background: "rgba(239, 68, 68, 0.1)", 
        padding: "1rem", 
        borderRadius: "0.5rem", 
        color: "var(--danger)",
        fontSize: "0.85rem",
        wordBreak: "break-all",
        maxWidth: "400px",
        marginBottom: "2rem",
        border: "1px solid var(--danger)"
      }}>
        {error.message || "Bilinmeyen Hata"}
      </div>

      <button
        onClick={() => reset()}
        className="btn-primary"
      >
        Tekrar Dene
      </button>
    </div>
      </body>
    </html>
  );
}
