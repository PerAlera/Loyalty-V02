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
    const { token } = body;

    if (!token) return NextResponse.json({ error: "Token gerekli" }, { status: 400 });

    // Ödül (REDEEM) tokenını bul
    const qrToken = await prisma.qrToken.findUnique({
      where: { token },
      include: { user: { include: { wallets: true } } }
    });

    if (!qrToken) return NextResponse.json({ error: "Geçersiz QR Kod" }, { status: 404 });
    if (qrToken.isUsed) return NextResponse.json({ error: "Bu QR Kod zaten kullanılmış" }, { status: 400 });
    if (qrToken.expiresAt < new Date()) return NextResponse.json({ error: "Bu QR Kodun süresi dolmuş" }, { status: 400 });
    if (qrToken.type !== "REDEEM") return NextResponse.json({ error: "Bu QR Kod ödül kodu değil!" }, { status: 400 });
    if (!qrToken.userId || !qrToken.user || !qrToken.user.wallets[0]) return NextResponse.json({ error: "Kullanıcı cüzdanı bulunamadı" }, { status: 404 });

    const wallet = qrToken.user.wallets[0];

    const isFood = qrToken.productType === "FOOD";

    if (isFood && wallet.foodRewards < 1) {
      return NextResponse.json({ error: "Müşterinin yeterli ücretsiz yemek hakkı yok!" }, { status: 400 });
    }
    
    if (!isFood && wallet.rewards < 1) {
      return NextResponse.json({ error: "Müşterinin yeterli ücretsiz kahve hakkı yok!" }, { status: 400 });
    }

    // İşlemleri Transaction içinde yap
    await prisma.$transaction([
      // Tokeni kullanıldı işaretle
      prisma.qrToken.update({
        where: { id: qrToken.id },
        data: { isUsed: true }
      }),
      // Ödülü düş
      prisma.wallet.update({
        where: { id: wallet.id },
        data: isFood ? { foodRewards: wallet.foodRewards - 1 } : { rewards: wallet.rewards - 1 }
      }),
      // İşlem geçmişine ekle
      prisma.transaction.create({
        data: {
          userId: qrToken.userId,
          type: isFood ? "REDEEM_FOOD" : "REDEEM_REWARD",
          amount: 1
        }
      })
    ]);

    const rewardName = isFood ? "yemek" : "kahve";

    return NextResponse.json({ success: true, message: `Ödül başarıyla onaylandı ve müşteriden 1 adet ücretsiz ${rewardName} düşüldü.` });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
