import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { phone, name, surname, newPassword } = await req.json();

    if (!phone || !name || !surname || !newPassword) {
      return NextResponse.json({ error: "Eksik bilgi gönderdiniz." }, { status: 400 });
    }

    // 1. Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json({ error: "Girdiğiniz isim ve soyisim, bu telefon numarasına ait kayıtla eşleşmedi." }, { status: 404 });
    }

    // 2. Check if name and surname match exactly (case-insensitive)
    const dbName = user.name.trim().toLowerCase();
    const dbSurname = user.surname.trim().toLowerCase();
    const inputName = name.trim().toLowerCase();
    const inputSurname = surname.trim().toLowerCase();

    if (dbName !== inputName || dbSurname !== inputSurname) {
      return NextResponse.json({ error: "Girdiğiniz isim ve soyisim, bu telefon numarasına ait kayıtla eşleşmedi." }, { status: 404 });
    }

    // 3. Hash the new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword }
    });

    return NextResponse.json({ success: true, message: "Şifre başarıyla güncellendi." });

  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "İşlem sırasında bir hata oluştu." }, { status: 500 });
  }
}
