import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Başlık ve içerik gereklidir" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { ownerId: session.user.id } });
    if (!store) return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        storeId: store.id
      }
    });

    return NextResponse.json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
