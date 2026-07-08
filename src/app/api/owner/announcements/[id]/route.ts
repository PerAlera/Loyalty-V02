import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { id } = await params;

    const store = await prisma.store.findUnique({ where: { ownerId: session.user.id } });
    if (!store) return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });

    const announcement = await prisma.announcement.findFirst({
      where: { id, storeId: store.id }
    });

    if (!announcement) {
      return NextResponse.json({ error: "Duyuru bulunamadı veya yetkiniz yok" }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
