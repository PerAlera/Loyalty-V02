import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CASHIER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { beans, productType } = body;

    if (!beans || beans < 1) {
      return NextResponse.json({ error: "Geçersiz adet" }, { status: 400 });
    }

    const type = productType === "FOOD" ? "FOOD" : "COFFEE";

    // Rastgele benzersiz bir token string oluştur
    const tokenString = crypto.randomUUID();
    // 5 dakika geçerlilik süresi
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const qrToken = await prisma.qrToken.create({
      data: {
        token: tokenString,
        type: "EARN",
        productType: type,
        beans: parseInt(beans),
        expiresAt
      }
    });

    return NextResponse.json({ success: true, token: qrToken.token, expiresAt: qrToken.expiresAt });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
