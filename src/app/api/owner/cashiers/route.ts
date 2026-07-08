import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Kasiyerleri Getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const store = await prisma.store.findUnique({
      where: { ownerId: session.user.id },
      include: {
        cashiers: {
          select: { id: true, name: true, surname: true, phone: true, createdAt: true }
        }
      }
    });

    if (!store) return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });

    return NextResponse.json({ cashiers: store.cashiers });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// Yeni Kasiyer Ekle
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { name, surname, phone, password } = body;

    if (!name || !surname || !phone || !password) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { ownerId: session.user.id } });
    if (!store) return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({ error: "Bu telefon numarası zaten sistemde kayıtlı." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCashier = await prisma.user.create({
      data: {
        name,
        surname,
        phone,
        passwordHash: hashedPassword,
        role: "CASHIER",
        storeId: store.id
      }
    });

    return NextResponse.json({ success: true, cashier: newCashier });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
