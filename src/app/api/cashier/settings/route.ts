import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CASHIER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    if (!session.user.storeId) {
      return NextResponse.json({ error: "Kasiyerin bağlı olduğu bir mağaza yok." }, { status: 400 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: session.user.storeId }
    });

    return NextResponse.json({ isFoodEnabled: settings?.isFoodEnabled ?? true });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
