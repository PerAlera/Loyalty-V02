import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, surname, phone, password, role } = body;

    if (!name || !surname || !phone || !password) {
      return NextResponse.json({ error: "Eksik bilgi girdiniz." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Bu telefon numarası zaten kayıtlı." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role === "OWNER" ? "OWNER" : "CUSTOMER";

    const newUser = await prisma.user.create({
      data: {
        name,
        surname,
        phone,
        passwordHash: hashedPassword,
        role: userRole,
        wallets: {
          create: { beans: 0, rewards: 0 }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Kayıt başarılı",
      user: { id: newUser.id, name: newUser.name }
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
