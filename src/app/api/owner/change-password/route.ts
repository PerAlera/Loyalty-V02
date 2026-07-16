import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Mevcut şifreyi kontrol et
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Mevcut şifreniz yanlış" }, { status: 400 });
    }

    // Yeni şifreyi hash'le ve güncelle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword }
    });

    return NextResponse.json({ message: "Şifreniz başarıyla değiştirildi" }, { status: 200 });

  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
