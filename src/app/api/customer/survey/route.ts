import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { answer, skipped, isNewUser } = body;

    // Müşterinin storeId'si yoksa sistemdeki ilk mağazayı bul
    let storeId = null;
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { storeId: true }
    });

    if (user && user.storeId) {
      storeId = user.storeId;
    } else {
      const firstStore = await prisma.store.findFirst();
      if (firstStore) {
        storeId = firstStore.id;
      }
    }

    if (!storeId) {
      return NextResponse.json({ error: "Sistemde kayıtlı mağaza bulunamadı" }, { status: 404 });
    }

    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        userId: session.user.id,
        storeId: storeId,
        isNewUser: Boolean(isNewUser),
        answer: skipped ? null : String(answer),
        skipped: Boolean(skipped)
      }
    });

    return NextResponse.json({ success: true, surveyResponse });
  } catch (error) {
    console.error("Survey Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
