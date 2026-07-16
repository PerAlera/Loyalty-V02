import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: session.user.id, beans: 0, rewards: 0 }
      });
    }

    // Fetch store settings for requiredCoffees and requiredFoods
    const storeSettings = await prisma.storeSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    const requiredCoffees = storeSettings?.requiredCoffees || 10;
    const requiredFoods = storeSettings?.requiredFoods || 10;

    return NextResponse.json({ wallet, requiredCoffees, requiredFoods });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
