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
    const { token } = body;

    if (!token) return NextResponse.json({ error: "Token gerekli" }, { status: 400 });

    const qrToken = await prisma.qrToken.findUnique({ where: { token } });

    if (!qrToken) return NextResponse.json({ error: "Geçersiz QR Kod" }, { status: 404 });
    if (qrToken.isUsed) return NextResponse.json({ error: "Bu QR Kod zaten kullanılmış" }, { status: 400 });
    if (qrToken.expiresAt < new Date()) return NextResponse.json({ error: "Bu QR Kodun süresi dolmuş" }, { status: 400 });
    if (qrToken.type !== "EARN") return NextResponse.json({ error: "Bu QR Kod puan kazanma kodu değil!" }, { status: 400 });

    const settings = await prisma.storeSettings.findFirst();
    const requiredCoffees = settings ? settings.requiredCoffees : 10;

    let wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId: session.user.id, beans: 0, rewards: 0 } });
    }

    const beansEarned = qrToken.beans || 1;
    let newBeans = wallet.beans + beansEarned;
    let newRewards = wallet.rewards;

    while (newBeans >= requiredCoffees) {
      newBeans -= requiredCoffees;
      newRewards += 1;
    }

    await prisma.$transaction([
      prisma.qrToken.update({
        where: { id: qrToken.id },
        data: { isUsed: true, userId: session.user.id }
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { beans: newBeans, rewards: newRewards }
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "EARN_BEAN", // Her zaman kazanım olarak kaydet
          amount: beansEarned
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: `${beansEarned} çekirdek başarıyla eklendi!`,
      newBeans,
      newRewards
    });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
