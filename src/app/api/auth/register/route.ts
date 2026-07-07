import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { phone, password, name, surname } = await req.json();

    if (!phone || !password || !name || !surname) {
      return NextResponse.json({ message: "Lütfen tüm alanları doldurun" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Bu telefon numarası zaten kayıtlı" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        name,
        surname,
        role: "CUSTOMER",
        wallet: {
          create: {
            currentBeans: 0,
            rewardsAvailable: 0
          }
        }
      }
    });

    return NextResponse.json({ message: "Kayıt başarılı", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
