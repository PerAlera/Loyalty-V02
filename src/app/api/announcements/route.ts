import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Şimdilik tek mağaza konsepti olduğu için tüm duyuruları getiriyoruz.
    // Çoklu mağaza olursa storeId'ye göre filtreleme eklenecek.
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
