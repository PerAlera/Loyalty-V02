import React from "react";
import Link from "next/link";

export default function KvkkPage() {
  return (
    <div className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem", color: "var(--text-primary)", textAlign: "center" }}>KVKK Aydınlatma Metni</h1>
      
      <div className="surface-card" style={{ padding: "2.5rem", lineHeight: "1.8", color: "var(--text-secondary)" }}>
        <p style={{ fontWeight: "bold", marginBottom: "1rem", fontSize: "1.1rem", textAlign: "center", color: "var(--text-primary)" }}>Peralera Dijital Sadakat Sistemi Kişisel Verilerin Korunması Hakkında Aydınlatma Metni</p>
        <p style={{ marginBottom: "2rem", fontSize: "0.9rem", textAlign: "center", opacity: 0.7 }}>Son Güncelleme: 18.07.2026</p>

        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "2rem", marginBottom: "0.5rem" }}>1. Veri Sorumlusu</h2>
        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verileriniz, veri sorumlusu sıfatıyla <strong>Peralera</strong> tarafından aşağıda açıklanan kapsamda işlenmektedir.</p>
        <div style={{ marginTop: "1rem", marginBottom: "1.5rem", padding: "1.5rem", background: "var(--bg-primary)", borderRadius: "0.5rem", border: "1px solid var(--border-color)" }}>
          <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "0.5rem" }}>İletişim Bilgileri</strong>
          Marka: Peralera<br/>
          E-posta: <a href="mailto:alperen@peralera.com" style={{ color: "var(--primary)", textDecoration: "underline" }}>alperen@peralera.com</a><br/>
          Web Sitesi: <a href="https://peralera.com" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>https://peralera.com</a>
        </div>

        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "2rem", marginBottom: "0.5rem" }}>2. Hangi Verileri Topluyoruz?</h2>
        <p>Uygulamamızı kullanmanız halinde aşağıdaki kişisel veriler işlenebilir.</p>
        <ul style={{ listStyleType: "none", paddingLeft: "0", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li><strong style={{ color: "var(--text-primary)" }}>Kimlik Bilgileri:</strong> Ad, Soyad</li>
          <li><strong style={{ color: "var(--text-primary)" }}>İletişim Bilgileri:</strong> Telefon numarası</li>
          <li><strong style={{ color: "var(--text-primary)" }}>Kullanım Bilgileri:</strong> Sadakat puanları, Kazanılan ödüller, İşlem geçmişi, Kampanya katılım bilgileri, Uygulamaya giriş kayıtları</li>
          <li><strong style={{ color: "var(--text-primary)" }}>Teknik Bilgiler:</strong> IP adresi, Tarayıcı bilgisi, Cihaz bilgisi, Çerez verileri</li>
        </ul>

        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "2rem", marginBottom: "0.5rem" }}>3. Kişisel Verilerin İşlenme Amaçları</h2>
        <p>Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:</p>
        <ul style={{ listStyleType: "disc", marginLeft: "1.5rem", marginBottom: "1.5rem" }}>
          <li>Üyelik oluşturulması</li>
          <li>Dijital sadakat kartının oluşturulması</li>
          <li>Puan hesaplanması</li>
          <li>Hediye kazanımlarının yönetilmesi</li>
          <li>Kampanyaların yürütülmesi</li>
          <li>Hesap güvenliğinin sağlanması</li>
          <li>Dolandırıcılığın önlenmesi</li>
          <li>Hizmet kalitesinin artırılması</li>
          <li>Destek taleplerinin cevaplanması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        </ul>

        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "2rem", marginBottom: "0.5rem" }}>4. Hukuki Sebepler</h2>
        <p>Kişisel verileriniz KVKK'nın 5. maddesi kapsamında;</p>
        <ul style={{ listStyleType: "disc", marginLeft: "1.5rem", marginBottom: "0.5rem" }}>
          <li>Bir sözleşmenin kurulması veya ifası</li>
          <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
          <li>Veri sorumlusunun meşru menfaati</li>
        </ul>
        <p style={{ marginBottom: "1.5rem" }}>hukuki sebeplerine dayanılarak işlenmektedir.</p>

        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "2rem", marginBottom: "0.5rem" }}>5. Veriler Kimlerle Paylaşılır?</h2>
        <p>Kişisel verileriniz;</p>
        <ul style={{ listStyleType: "disc", marginLeft: "1.5rem", marginBottom: "0.5rem" }}>
          <li>Hizmeti aldığınız işletme ile</li>
          <li>Bulut altyapı sağlayıcılarıyla</li>
          <li>Kanunen yetkili kamu kurumlarıyla</li>
          <li>Mahkemeler ve resmi makamlarla</li>
        </ul>
        <p style={{ marginBottom: "1.5rem" }}>KVKK hükümlerine uygun olarak paylaşılabilir.</p>

        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "2rem", marginBottom: "0.5rem" }}>6. Veriler Ne Kadar Süre Saklanır?</h2>
        <p>Kişisel verileriniz;</p>
        <ul style={{ listStyleType: "disc", marginLeft: "1.5rem", marginBottom: "0.5rem" }}>
          <li>Hesabınız aktif olduğu sürece,</li>
          <li>İlgili mevzuatta öngörülen saklama süreleri boyunca,</li>
          <li>Olası hukuki uyuşmazlıkların çözümlenmesi amacıyla gerekli süre kadar</li>
        </ul>
        <p style={{ marginBottom: "1.5rem" }}>saklanmaktadır.</p>

        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "2rem", marginBottom: "0.5rem" }}>7. Haklarınız</h2>
        <p>KVKK'nın 11. maddesi kapsamında;</p>
        <ul style={{ listStyleType: "disc", marginLeft: "1.5rem", marginBottom: "0.5rem" }}>
          <li>Verilerinizin işlenip işlenmediğini öğrenme,</li>
          <li>İşlenen verilere erişme,</li>
          <li>Yanlış verilerin düzeltilmesini isteme,</li>
          <li>Verilerin silinmesini talep etme,</li>
          <li>İşleme faaliyetlerine itiraz etme,</li>
          <li>Zarara uğranması halinde tazminat talep etme</li>
        </ul>
        <p style={{ marginBottom: "1.5rem" }}>
          haklarına sahipsiniz.<br/><br/>
          Başvurularınızı <a href="mailto:alperen@peralera.com" style={{ color: "var(--primary)", fontWeight: "bold" }}>alperen@peralera.com</a> adresine iletebilirsiniz.
        </p>

        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "2rem", marginBottom: "0.5rem" }}>8. Güvenlik</h2>
        <p style={{ marginBottom: "1.5rem" }}>Peralera, kişisel verilerin güvenliğini sağlamak amacıyla uygun teknik ve idari tedbirleri almaktadır.</p>

        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginTop: "2rem", marginBottom: "0.5rem" }}>9. Güncellemeler</h2>
        <p style={{ marginBottom: "2rem" }}>Bu metin gerekli görüldüğünde güncellenebilir. Güncel sürüm her zaman uygulama içerisinde yayımlanacaktır.</p>
        
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/" className="btn-secondary" style={{ display: "inline-block", padding: "0.75rem 2rem", textDecoration: "none" }}>
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
