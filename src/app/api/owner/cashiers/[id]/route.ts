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
    const cashierId = id;

    const store = await prisma.store.findUnique({ where: { id: session.user.storeId as string } });
    if (!store) return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });

    // Kasiyerin bu mağazaya ait olup olmadığını kontrol et
    const cashier = await prisma.user.findFirst({
      where: { id: cashierId, storeId: store.id, role: "CASHIER" }
    });

    if (!cashier) {
      return NextResponse.json({ error: "Kasiyer bulunamadı veya yetkiniz yok" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: cashierId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
