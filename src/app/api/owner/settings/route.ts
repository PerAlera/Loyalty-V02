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

    const store = await prisma.store.findUnique({
      where: { ownerId: session.user.id },
      include: { settings: true }
    });

    if (!store || !store.settings) {
      return NextResponse.json({ error: "Ayarlar bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ settings: store.settings });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { requiredCoffees, requiredFoods, profileRewardEnabled, profileRewardAmount } = body;

    if (!requiredCoffees || requiredCoffees < 1 || !requiredFoods || requiredFoods < 1) {
      return NextResponse.json({ error: "Geçersiz değer" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { ownerId: session.user.id } });
    if (!store) return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });

    const updatedSettings = await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { 
        requiredCoffees: parseInt(requiredCoffees),
        requiredFoods: parseInt(requiredFoods),
        profileRewardEnabled: profileRewardEnabled ?? false,
        profileRewardAmount: profileRewardAmount ? parseInt(profileRewardAmount) : 1
      }
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
