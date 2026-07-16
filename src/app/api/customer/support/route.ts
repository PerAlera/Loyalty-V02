import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Mesaj boş olamaz" }, { status: 400 });
    }

    // Kullanıcı bilgilerini çek
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // SMTP ayarlarını kontrol et
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SUPPORT_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SUPPORT_EMAIL) {
      console.error("E-posta ayarları (SMTP) eksik.");
      return NextResponse.json({ error: "E-posta altyapısı yapılandırılmamış." }, { status: 500 });
    }

    // Nodemailer transporter oluştur
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465, // 465 için true, diğerleri için false
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD
      }
    });

    // E-posta içeriği
    const mailOptions = {
      from: `"Sadakat Uygulaması" <${SMTP_USER}>`,
      to: SUPPORT_EMAIL,
      subject: `Yeni Destek Talebi - ${user.name} ${user.surname}`,
      text: `Müşteri Bilgileri:\nAd Soyad: ${user.name} ${user.surname}\nTelefon: ${user.phone}\n\nMesaj:\n${message}`,
      html: `
        <h3>Yeni Destek Talebi</h3>
        <p><strong>Müşteri:</strong> ${user.name} ${user.surname}</p>
        <p><strong>Telefon:</strong> ${user.phone}</p>
        <hr />
        <h4>Mesaj:</h4>
        <p style="white-space: pre-wrap;">${message}</p>
      `
    };

    // E-postayı gönder
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Mesajınız başarıyla iletildi." });
  } catch (error) {
    console.error("Destek formu e-posta hatası:", error);
    return NextResponse.json({ error: "Mesaj gönderilirken bir hata oluştu." }, { status: 500 });
  }
}
