import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // İşletme sahibinin mağazasını bul
    const store = await prisma.store.findUnique({
      where: { ownerId: session.user.id },
      include: {
        _count: {
          select: { cashiers: true }
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });
    }

    // Toplam müşteri sayısı (en az bir kez çekirdek/ödül işlemi olanlar)
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" }
    });

    // Toplam verilen ödül sayısı
    const totalRewardsData = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "REDEEM_REWARD" }
    });

    // Toplam verilen çekirdek
    const totalBeansData = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "EARN_BEAN" }
    });

    return NextResponse.json({
      cashierCount: store._count.cashiers,
      totalCustomers,
      totalRewards: totalRewardsData._sum.amount || 0,
      totalBeans: totalBeansData._sum.amount || 0,
      storeName: store.name
    });

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
