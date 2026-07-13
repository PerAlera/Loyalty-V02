import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const productType = body.productType === "FOOD" ? "FOOD" : "COFFEE";

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    });

    if (!wallet) {
      return NextResponse.json({ error: "Cüzdan bulunamadı" }, { status: 404 });
    }

    if (productType === "FOOD" && wallet.foodRewards < 1) {
      return NextResponse.json({ error: "Ücretsiz yemek hakkınız bulunmamaktadır." }, { status: 400 });
    }

    if (productType === "COFFEE" && wallet.rewards < 1) {
      return NextResponse.json({ error: "Ücretsiz kahve hakkınız bulunmamaktadır." }, { status: 400 });
    }

    // Rastgele benzersiz bir token string oluştur
    const tokenString = crypto.randomUUID();
    // 5 dakika geçerlilik süresi
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const qrToken = await prisma.qrToken.create({
      data: {
        token: tokenString,
        type: "REDEEM",
        productType,
        userId: session.user.id,
        expiresAt
      }
    });

    return NextResponse.json({ success: true, token: qrToken.token, expiresAt: qrToken.expiresAt });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
